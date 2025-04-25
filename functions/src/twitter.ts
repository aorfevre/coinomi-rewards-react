import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';
import { TwitterApi, type TweetV2, type ApiV2Includes } from 'twitter-api-v2';
import { scrapKoalaTweets } from './twitter_scraper';

// Twitter API v2 Client with bearer token
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// OAuth2 client for user authentication
const oauth2Client = new OAuth2Client(
    process.env.TWITTER_CLIENT_ID!,
    process.env.TWITTER_CLIENT_SECRET!,
    process.env.TWITTER_CALLBACK_URL!
);

// Generate a random state parameter
const generateState = () => {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
};

// Store state in Firestore to prevent CSRF attacks
const storeState = async (state: string, userId: string) => {
    const stateRef = admin.firestore().collection('twitter_states').doc(state);
    await stateRef.set({
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        used: false,
    });
};

// Verify and consume state
const verifyState = async (state: string) => {
    const stateRef = admin.firestore().collection('twitter_states').doc(state);
    const stateDoc = await stateRef.get();

    if (!stateDoc.exists || stateDoc.data()?.used) {
        return null;
    }

    await stateRef.update({ used: true });
    return stateDoc.data()?.userId;
};

interface SearchTweetsRequest {
    query: string;
    maxResults?: number;
}

interface GetTweetDetailsRequest {
    tweetId: string;
}

interface TweetResponse {
    tweet: TweetV2;
    includes?: ApiV2Includes;
}

interface SearchTweetsResponse {
    tweets: TweetV2[];
    includes?: ApiV2Includes;
}

// Function to scrape tweets by username
export const scrapeUserTweets = functions.https.onCall(async request => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    return scrapKoalaTweets();
});

// Function to search tweets by hashtag or keyword
export const searchTweets = functions.https.onCall(async request => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { query, maxResults = 10 } = request.data as SearchTweetsRequest;

    if (!query) {
        throw new functions.https.HttpsError('invalid-argument', 'Search query is required');
    }

    try {
        const tweets = await twitterClient.v2.search(query, {
            max_results: maxResults,
            expansions: ['attachments.media_keys', 'author_id'],
            'tweet.fields': ['created_at', 'public_metrics', 'entities', 'author_id'],
            'user.fields': ['username', 'name', 'profile_image_url'],
            'media.fields': ['url', 'preview_image_url', 'type'],
        });

        const response: SearchTweetsResponse = {
            tweets: tweets.data.data,
            includes: tweets.data.includes,
        };

        return response;
    } catch (error) {
        console.error('Error searching tweets:', error);
        throw new functions.https.HttpsError('internal', 'Failed to search tweets');
    }
});

// Function to get tweet details by ID
export const getTweetDetails = functions.https.onCall(async request => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { tweetId } = request.data as GetTweetDetailsRequest;

    if (!tweetId) {
        throw new functions.https.HttpsError('invalid-argument', 'Tweet ID is required');
    }

    try {
        const tweet = await twitterClient.v2.singleTweet(tweetId, {
            expansions: ['attachments.media_keys', 'author_id'],
            'tweet.fields': ['created_at', 'public_metrics', 'entities', 'author_id'],
            'user.fields': ['username', 'name', 'profile_image_url'],
            'media.fields': ['url', 'preview_image_url', 'type'],
        });

        const response: TweetResponse = {
            tweet: tweet.data,
            includes: tweet.includes,
        };

        return response;
    } catch (error) {
        console.error('Error getting tweet details:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get tweet details');
    }
});

export const twitterAuth = functions.https.onRequest(async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        res.status(400).send('Missing userId parameter');
        return;
    }

    // Generate and store state parameter
    const state = generateState();
    await storeState(state, userId as string);

    // Generate Twitter OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['tweet.read', 'users.read'],
        state: state,
    });

    res.redirect(authUrl);
});

export const twitterCallback = functions.https.onRequest(async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        res.status(400).send('Missing required parameters');
        return;
    }

    try {
        // Verify state parameter
        const userId = await verifyState(state as string);
        if (!userId) {
            res.status(400).send('Invalid state parameter');
            return;
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code as string);

        // Store tokens in Firestore
        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.update({
            twitterConnected: true,
            twitterTokens: tokens,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Close popup with success message
        res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ type: 'TWITTER_AUTH_SUCCESS' }, '*');
                        window.close();
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Twitter auth error:', error);
        res.status(500).send('Authentication failed');
    }
});
