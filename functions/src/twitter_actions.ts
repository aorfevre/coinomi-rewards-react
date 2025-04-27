import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TwitterApi } from 'twitter-api-v2';

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
        console.log('accessToken ==>', accessToken);
        console.log('tweetId ==>', tweetId);
        const userClient = new TwitterApi(accessToken);
        console.log('userClient ==>', userClient);
        const me = await userClient.v2.me();
        console.log('me ==>', me.data.id, tweetId);
        await userClient.v2.like(me.data.id, tweetId);
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
        return { success: true };
    } catch (error) {
        console.error('Error retweeting tweet:', error);
        throw new functions.https.HttpsError('internal', 'Failed to retweet tweet');
    }
});
