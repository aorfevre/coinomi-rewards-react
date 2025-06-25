import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TwitterApi } from 'twitter-api-v2';
import { setTwitterReward } from './rewards';

// Helper to get user's Twitter access token from Firestore
async function getUserTwitterToken(userId: string) {
    const doc = await admin.firestore().collection('twitter_auth').doc(userId).get();
    if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Twitter auth not found');
    const data = doc.data();
    if (!data?.accessToken) throw new functions.https.HttpsError('not-found', 'No access token');
    return data.accessToken;
}

// Like a tweet
export const likeTweet = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tweetId } = data;
    if (!tweetId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing tweetId');
    }
    try {
        const accessToken = await getUserTwitterToken(context.auth.uid);
        const userClient = new TwitterApi(accessToken);
        const me = await userClient.v2.me();
        await userClient.v2.like(me.data.id, tweetId);
        // Add reward entry using helper
        await setTwitterReward({
            userId: context.auth.uid,
            tweetId,
            basePoints: 50,
            type: 'twitter_like',
        });
        return { success: true };
    } catch (error) {
        console.error('Error liking tweet:', error);
        throw new functions.https.HttpsError('internal', 'Failed to like tweet');
    }
});

// Retweet a tweet (without quote)
export const retweetTweet = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tweetId } = data;
    if (!tweetId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing tweetId');
    }
    try {
        const accessToken = await getUserTwitterToken(context.auth.uid);
        const userClient = new TwitterApi(accessToken);
        const me = await userClient.v2.me();
        await userClient.v2.retweet(me.data.id, tweetId);
        // Add reward entry using helper
        await setTwitterReward({
            userId: context.auth.uid,
            tweetId,
            basePoints: 50,
            type: 'twitter_retweet',
        });
        return { success: true };
    } catch (error) {
        console.error('Error retweeting tweet:', error);
        throw new functions.https.HttpsError('internal', 'Failed to retweet tweet');
    }
});

// Store a tweet skip action
export const skipTweet = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { tweetId } = data;
    if (!tweetId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing tweetId');
    }

    try {
        // Get the tweet data to store its creation date
        const tweetDoc = await admin.firestore().collection('koala_tweets').doc(tweetId).get();
        if (!tweetDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Tweet not found');
        }
        const tweetData = tweetDoc.data();

        // Store the skip action
        await admin
            .firestore()
            .collection('tweet_skips')
            .add({
                userId: context.auth.uid,
                tweetId: tweetId,
                createdAt: new Date().toISOString(),
                tweetCreatedAt: tweetData?.created_at || null,
            });

        return { success: true };
    } catch (error) {
        console.error('Error storing tweet skip:', error);
        throw new functions.https.HttpsError('internal', 'Failed to store tweet skip');
    }
});

// Follow KoalaWallet on Twitter
export const followKoalaWallet = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const accessToken = await getUserTwitterToken(context.auth.uid);
        const userClient = new TwitterApi(accessToken);
        // KoalaWallet Twitter user ID (replace with the actual user ID if you have it)
        const koalaWalletUserId = '3030973751'; // Example: @coinomiWallet
        const me = await userClient.v2.me();
        await userClient.v2.follow(me.data.id, koalaWalletUserId);

        // Update user document to mark Twitter follow as completed
        await admin
            .firestore()
            .collection('users')
            .doc(context.auth.uid)
            .set(
                {
                    twitter: {
                        followTwitter: true,
                    },
                },
                { merge: true }
            );

        return { success: true };
    } catch (error) {
        console.error('Error following KoalaWallet:', error);
        throw new functions.https.HttpsError('internal', 'Failed to follow KoalaWallet');
    }
});

// Follow BravoReadyGames on Twitter
export const followPartnerWallet = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const accessToken = await getUserTwitterToken(context.auth.uid);
        const userClient = new TwitterApi(accessToken);
        // BravoReadyGames Twitter user ID
        const partnerUserId = '1551703533619134464'; // @BravoReadyGames
        const me = await userClient.v2.me();
        await userClient.v2.follow(me.data.id, partnerUserId);

        // Update user document to mark Twitter follow as completed
        await admin
            .firestore()
            .collection('users')
            .doc(context.auth.uid)
            .set(
                {
                    twitter: {
                        followPartnerTwitter: true,
                    },
                },
                { merge: true }
            );

        return { success: true };
    } catch (error) {
        console.error('Error following BravoReadyGames:', error);
        throw new functions.https.HttpsError('internal', 'Failed to follow BravoReadyGames');
    }
});

export const getUserByHandle = async (handle: string) => {
    if (!handle) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing handle');
    }
    try {
        // Create a client with the bearer token (no need for user auth)
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

        // Get user information
        const user = await client.v2.userByUsername(handle, {
            'user.fields': [
                'id',
                'name',
                'username',
                'profile_image_url',
                'description',
                'public_metrics',
                'created_at',
                'verified',
            ],
        });

        if (!user.data) {
            throw new functions.https.HttpsError('not-found', `User @${handle} not found`);
        }
        console.log(user.data);
        return {
            id: user.data.id,
            name: user.data.name,
            username: user.data.username,
            profileImageUrl: user.data.profile_image_url,
            description: user.data.description,
            metrics: user.data.public_metrics,
            createdAt: user.data.created_at,
            verified: user.data.verified,
        };
    } catch (error) {
        console.error('Error getting user by handle:', error);
        throw new functions.https.HttpsError('internal', `Failed to get user @${handle}`);
    }
};

// setTimeout(() => {
//     getUserByHandle('coinomiWallet');
// }, 1000);
