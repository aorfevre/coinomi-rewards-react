import * as functions from 'firebase-functions';
import { admin } from './config/firebase';

export const getUserRank = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const { userId } = data;
        functions.logger.info('📊 Getting rank for user:', { userId });

        const scoresRef = admin.firestore().collection('scores');

        // Get all scores ordered by points
        const allScores = await scoresRef.orderBy('points', 'desc').get();

        // Find user's position
        const userPosition = allScores.docs.findIndex(doc => doc.id === userId) + 1;
        const totalPlayers = allScores.size;

        functions.logger.info('✅ Rank calculated:', {
            userId,
            rank: userPosition,
            totalPlayers,
        });

        return {
            rank: userPosition,
            totalPlayers,
        };
    } catch (error) {
        functions.logger.error('❌ Error getting user rank:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});

export const getLeaderboard = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const limit = data.limit || 10;
        functions.logger.info('📊 Getting leaderboard:', { limit });

        const scoresRef = admin.firestore().collection('scores');
        const snapshot = await scoresRef.orderBy('points', 'desc').limit(limit).get();

        const leaderboard = await Promise.all(
            snapshot.docs.map(async doc => {
                const scoreData = doc.data();
                const userDoc = await admin.firestore().collection('users').doc(doc.id).get();
                const userData = userDoc.data() || {};

                return {
                    userId: doc.id,
                    points: scoreData.points,
                    tasksCompleted: scoreData.tasksCompleted,
                    displayName: userData.displayName || 'Anonymous',
                    walletAddress: userData.walletAddress || '',
                };
            })
        );

        functions.logger.info('✅ Leaderboard fetched:', {
            entries: leaderboard.length,
        });

        return { leaderboard };
    } catch (error) {
        functions.logger.error('❌ Error getting leaderboard:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});
