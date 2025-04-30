import * as functions from 'firebase-functions';
import { auth, db } from './config/firebase';

// Utility function to update the user's current multiplier
export async function updateUserCurrentMultiplier(uid: string): Promise<void> {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (userData) {
        let currentMultiplier = userData.baseMultiplier || 1;
        if (userData.twitterConnected === true) {
            currentMultiplier += 0.1;
        }
        if (userData.telegramConnected === true) {
            currentMultiplier += 0.1;
        }
        if (userData.emailConnected === true) {
            currentMultiplier += 0.1;
        }
        if (userData.twitter && userData.twitter.followTwitter === true) {
            currentMultiplier += 0.1;
        }
        await db.collection('users').doc(uid).update({
            currentMultiplier: currentMultiplier,
        });
    }
}

export const getCustomToken = functions
    .runWith({
        enforceAppCheck: false, // Don't require App Check
        ingressSettings: 'ALLOW_ALL', // Allow all incoming requests
    })
    .https.onCall(async data => {
        try {
            const walletAddress = data.walletAddress;
            const coinomiId = data.coinomiId;
            functions.logger.info('📥 Processing request for wallet:', { walletAddress });

            if (!walletAddress) {
                functions.logger.warn('❌ No wallet address provided');
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'Wallet address is required'
                );
            }
            if (!coinomiId) {
                functions.logger.warn('❌ No coinomiId provided');
                throw new functions.https.HttpsError('invalid-argument', 'Coinomi ID is required');
            }

            const uid = walletAddress.toLowerCase().replace('0x', '');
            functions.logger.info('🔍 Sanitized UID:', { uid });

            let userRecord;
            try {
                userRecord = await auth.getUser(uid);
                functions.logger.info('👤 Found existing user:', { uid });
            } catch (error) {
                userRecord = await auth.createUser({
                    uid,
                    displayName: walletAddress,
                });
                functions.logger.info('✨ Created new user:', { uid });
            }

            const customToken = await auth.createCustomToken(uid);

            // Add detailed token logging
            functions.logger.info('🎫 Generated custom token:', {
                tokenLength: customToken.length,
                tokenPrefix: customToken.substring(0, 20) + '...',
                tokenSuffix: '...' + customToken.substring(customToken.length - 20),
                uid,
                displayName: userRecord.displayName,
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime,
                },
                coinomiId,
            });

            // set the current multiplier of the user
            await updateUserCurrentMultiplier(uid);
            return {
                customToken,
                uid: userRecord.uid,
                displayName: userRecord.displayName,
                coinomiId,
            };
        } catch (error) {
            functions.logger.error('❌ Error occurred:', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
            });
            throw new functions.https.HttpsError(
                'internal',
                error instanceof Error ? error.message : 'Internal server error'
            );
        }
    });
