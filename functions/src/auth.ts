import * as functions from 'firebase-functions';
import { auth } from './config/firebase';

export const getCustomToken = functions.https.onCall(async data => {
    try {
        const walletAddress = data.walletAddress;
        functions.logger.info('📥 Processing request for wallet:', { walletAddress });

        if (!walletAddress) {
            functions.logger.warn('❌ No wallet address provided');
            throw new functions.https.HttpsError('invalid-argument', 'Wallet address is required');
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
        });

        return {
            customToken,
            uid: userRecord.uid,
            displayName: userRecord.displayName,
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
