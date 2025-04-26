import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
    TwitterApi,
    type TweetV2,
    type UserV2,
    type ApiV2Includes,
    type TTweetv2Expansion,
    type TTweetv2MediaField,
    type TTweetv2TweetField,
} from 'twitter-api-v2';

// Twitter API v2 Client with bearer token
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

interface UserTweetsResponse {
    user: UserV2;
    tweets: TweetV2[];
    includes?: ApiV2Includes;
}

interface ScrapMetadata {
    lastUpdated: admin.firestore.Timestamp;
    lastTweetId: string;
    totalTweetsScraped: number;
    lastExecutionStatus: 'success' | 'error';
    errorMessage?: string;
}

export const scrapKoalaTweets = async () => {
    const username = 'koalawallet';
    const maxResults = 5;

    try {
        console.log('Scraping Koala Wallet tweets ... ', twitterClient);

        // Get the last scraped tweet ID from metadata
        const db = admin.firestore();
        const metadataRef = db.collection('koala_scrap').doc('latest');
        const metadata = await metadataRef.get();
        const lastTweetId = metadata.exists ? metadata.data()?.lastTweetId : undefined;

        // First get the user ID from username
        const user = await twitterClient.v2.userByUsername(username);

        if (!user.data) {
            throw new functions.https.HttpsError('not-found', `User ${username} not found`);
        }

        // Get user's tweets with since_id if available
        const tweetOptions = {
            max_results: maxResults,
            expansions: ['attachments.media_keys', 'author_id'] as TTweetv2Expansion[],
            'tweet.fields': [
                'created_at',
                'public_metrics',
                'entities',
                'text',
            ] as TTweetv2TweetField[],
            'media.fields': ['url', 'preview_image_url', 'type'] as TTweetv2MediaField[],
            ...(lastTweetId ? { since_id: lastTweetId } : {}),
        };

        const tweets = await twitterClient.v2.userTimeline(user.data.id, tweetOptions);

        // If no new tweets, return early
        if (!tweets.data.data || tweets.data.data.length === 0) {
            console.log('No new tweets found since last scrape');
            return null;
        }

        const response: UserTweetsResponse = {
            user: user.data,
            tweets: tweets.data.data,
            includes: tweets.data.includes,
        };

        // Get a Firestore batch for atomic operations
        const batch = db.batch();

        // Store each tweet individually
        const tweetsRef = db.collection('koala_tweets');
        response.tweets.forEach(tweet => {
            const tweetDoc = tweetsRef.doc(tweet.id);
            batch.set(
                tweetDoc,
                {
                    ...tweet,
                    user: response.user,
                    media: response.includes?.media?.filter(media =>
                        tweet.attachments?.media_keys?.includes(media.media_key)
                    ),
                    scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        });

        // Update metadata
        const newMetadata: ScrapMetadata = {
            lastUpdated: admin.firestore.Timestamp.now(),
            lastTweetId: response.tweets[0]?.id || '',
            totalTweetsScraped: response.tweets.length,
            lastExecutionStatus: 'success',
        };
        batch.set(metadataRef, newMetadata);

        // Commit all the changes atomically
        await batch.commit();
        console.log(`Successfully scraped ${response.tweets.length} new tweets from ${username}`);

        return response;
    } catch (error) {
        // Update metadata with error information
        const db = admin.firestore();
        const metadataRef = db.collection('koala_scrap').doc('latest');
        const metadata: ScrapMetadata = {
            lastUpdated: admin.firestore.Timestamp.now(),
            lastTweetId: '',
            totalTweetsScraped: 0,
            lastExecutionStatus: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
        await metadataRef.set(metadata);

        console.error('Error scraping tweets:', error);
        throw new functions.https.HttpsError('internal', `Failed to scrape tweets for ${username}`);
    }
};

// Scheduled function to run every 2 minutes
export const scheduledScrapeKoalaTweets = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(async () => {
        try {
            console.log('Scraping Koala Wallet tweets');
            await scrapKoalaTweets();
        } catch (error) {
            console.error('Error in scheduled tweet scraping:', error);
            throw error;
        }
    });
