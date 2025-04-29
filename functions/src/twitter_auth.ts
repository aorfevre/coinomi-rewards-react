import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TwitterApi } from 'twitter-api-v2';

// Initialize Twitter client for OAuth
const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
});

// Generate Twitter Auth URL
export const generateTwitterAuthUrl = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        // Get the original URL parameters from the request
        const { originalParams } = data || {};

        const { url, state, codeVerifier } = twitterClient.generateOAuth2AuthLink(
            process.env.TWITTER_CALLBACK_URL!,
            { scope: ['tweet.read', 'users.read', 'like.write', 'tweet.write', 'follows.write'] }
        );

        // Store the state and code verifier in Firestore, along with original params
        const stateDoc = admin.firestore().collection('twitter_auth_states').doc(state);
        await stateDoc.set({
            codeVerifier,
            createdAt: new Date().toISOString(),
            userId: context.auth.uid,
            originalParams: originalParams || {},
        });
        console.log('Twitter auth URL generated', { url });
        return { url };
    } catch (error) {
        console.error('Error generating Twitter auth URL:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to generate Twitter authentication URL'
        );
    }
});

// Handle Twitter OAuth callback
export const twitterAuthCallback = functions.https.onRequest(async (req, res) => {
    const { state, code } = req.query;

    if (!state || !code) {
        res.status(400).send('Missing state or code');
        return;
    }
    console.log('state', state);
    console.log('code', code);
    try {
        // Retrieve the stored state and code verifier
        const stateDoc = await admin
            .firestore()
            .collection('twitter_auth_states')
            .doc(state as string)
            .get();

        if (!stateDoc.exists) {
            res.status(400).send('Invalid state parameter');
            return;
        }

        const { codeVerifier, userId } = stateDoc.data()!;

        // Exchange the code for access token
        const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
            code: code as string,
            codeVerifier,
            redirectUri: process.env.TWITTER_CALLBACK_URL!,
        });

        // Create a new client with the access token to fetch user profile
        const userClient = new TwitterApi(accessToken);
        const userProfile = await userClient.v2.me({
            'user.fields': ['id', 'name', 'username', 'profile_image_url'],
        });

        // Store the tokens and user profile in Firestore
        const twitterAuthData: any = {
            accessToken,
            updatedAt: new Date().toISOString(),
            twitterUserProfile: userProfile.data,
        };
        if (refreshToken) {
            twitterAuthData.refreshToken = refreshToken;
        }

        await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .set(
                {
                    twitterConnected: true,
                    twitter: {
                        twitterHandle: userProfile.data.username,
                        twitterId: userProfile.data.id,
                        twitterName: userProfile.data.name,
                        twitterProfileImage: userProfile.data.profile_image_url,
                        twitterToken: twitterAuthData,
                    },
                },
                { merge: true }
            );

        // Also store in twitter_auth collection
        await admin
            .firestore()
            .collection('twitter_auth')
            .doc(userId)
            .set(twitterAuthData, { merge: true });

        // Clean up the state document
        await stateDoc.ref.delete();

        // Redirect to the success page
        res.redirect(`${process.env.FRONTEND_URL}/twitter-auth-success`);
    } catch (error) {
        console.error('Error in Twitter auth callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/twitter-auth-error`);
    }
});

export const disconnectTwitter = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    try {
        // Remove Twitter info from users collection
        await admin.firestore().collection('users').doc(userId).set(
            {
                twitterConnected: false,
            },
            { merge: true }
        );
        // Remove from twitter_auth collection
        return { success: true };
    } catch (error) {
        console.error('Error disconnecting Twitter:', error);
        throw new functions.https.HttpsError('internal', 'Failed to disconnect Twitter');
    }
});
