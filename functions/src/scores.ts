import * as functions from 'firebase-functions';
import { admin } from './config/firebase';
import { getWeek, getYear } from 'date-fns';

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
        const now = new Date();
        const currentWeek = getWeek(now);
        const currentYear = getYear(now);

        functions.logger.info('📊 Getting leaderboard:', {
            limit,
            week: currentWeek,
            year: currentYear,
        });

        const scoresRef = admin.firestore().collection('scores');
        const snapshot = await scoresRef
            .where('weekNumber', '==', currentWeek)
            .where('yearNumber', '==', currentYear)
            .orderBy('points', 'desc')
            .limit(limit)
            .get();

        const leaderboard = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        return {
            leaderboard,
            weekNumber: currentWeek,
            yearNumber: currentYear,
        };
    } catch (error) {
        functions.logger.error('❌ Error getting leaderboard:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});
