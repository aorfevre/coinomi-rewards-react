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
