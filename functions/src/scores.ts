import * as functions from 'firebase-functions';
import { admin } from './config/firebase';
import { getWeek, getYear } from 'date-fns';

// Add options for consistent week calculation
const WEEK_OPTIONS = {
    weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6, // Monday as week start
    firstWeekContainsDate: 4 as 1 | 4, // ISO week numbering
};

// Add a helper function to ensure consistent week calculation
export const calculateWeek = (date: Date) => {
    return getWeek(date, WEEK_OPTIONS);
};

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

export const getLeaderboard = functions.https.onCall(async data => {
    try {
        const limit = data.limit || 10;
        const now = new Date();
        // Use the options for consistent week calculation
        const week = data.week || getWeek(now, WEEK_OPTIONS);
        const year = data.year || getYear(now);

        functions.logger.info('📊 Getting leaderboard:', {
            limit,
            week,
            year,
            currentDate: now.toISOString(),
            calculatedWeek: getWeek(now, WEEK_OPTIONS),
        });

        const scoresRef = admin.firestore().collection('scores');
        const snapshot = await scoresRef
            .where('weekNumber', '==', week)
            .where('yearNumber', '==', year)
            .orderBy('points', 'desc')
            .limit(limit)
            .get();

        const leaderboard = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        return {
            leaderboard,
            weekNumber: week,
            yearNumber: year,
        };
    } catch (error) {
        functions.logger.error('❌ Error getting leaderboard:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});
