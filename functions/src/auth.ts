import * as functions from 'firebase-functions';
import { admin } from './config/firebase';

export const getCustomToken = functions.https.onCall(async data => {
    try {
        const walletAddress = data.walletAddress;
        functions.logger.info('Processing request for wallet:', { walletAddress });

        if (!walletAddress) {
            functions.logger.warn('No wallet address provided');
            throw new functions.https.HttpsError('invalid-argument', 'Wallet address is required');
        }

        const uid = walletAddress.toLowerCase().replace('0x', '');
        functions.logger.info('Sanitized UID:', { uid });

        let userRecord;
        try {
            userRecord = await admin.auth().getUser(uid);
            functions.logger.info('Found existing user:', { uid });
        } catch (error) {
            userRecord = await admin.auth().createUser({
                uid,
                displayName: walletAddress,
            });
            functions.logger.info('Created new user:', { uid });
        }

        const customToken = await admin.auth().createCustomToken(uid);
        functions.logger.info('Generated token successfully');

        return {
            customToken,
            uid: userRecord.uid,
            displayName: userRecord.displayName,
        };
    } catch (error) {
        functions.logger.error('Error occurred:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});
