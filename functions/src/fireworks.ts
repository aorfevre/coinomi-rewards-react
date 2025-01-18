import * as functions from 'firebase-functions';
import { db } from './config/firebase';

export const fireworks = functions.https.onCall(async (data, context) => {
    try {
        // Create a new fireworks event
        const fireworksRef = await db.collection('fireworks').add({
            timestamp: new Date().toISOString(),
            userId: context.auth?.uid || 'anonymous',
            status: 'triggered',
        });

        functions.logger.info('🎆 Fireworks triggered!', {
            fireworksId: fireworksRef.id,
            userId: context.auth?.uid,
        });

        return {
            success: true,
            fireworksId: fireworksRef.id,
            message: 'Fireworks triggered successfully!',
        };
    } catch (error) {
        functions.logger.error('❌ Error triggering fireworks:', error);
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});
