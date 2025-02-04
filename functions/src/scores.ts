import * as functions from 'firebase-functions';
import { admin } from './config/firebase';
import { getWeek, getYear } from 'date-fns';
import { db } from './config/firebase';

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
        const now = new Date();
        const week = data.week || getWeek(now, WEEK_OPTIONS);
        const year = data.year || getYear(now);

        // Add pagination parameters
        const pageSize = data.pageSize || 100; // Default page size
        const lastDocId = data.lastDocId; // For pagination

        functions.logger.info('📊 Getting leaderboard:', {
            week,
            year,
            currentDate: now.toISOString(),
            calculatedWeek: getWeek(now, WEEK_OPTIONS),
            pageSize,
            lastDocId,
        });

        const scoresRef = admin.firestore().collection('scores');
        let query = scoresRef
            .where('weekNumber', '==', week)
            .where('yearNumber', '==', year)
            .orderBy('points', 'desc');

        // If lastDocId is provided, start after that document
        if (lastDocId) {
            const lastDoc = await scoresRef.doc(lastDocId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        // Apply page size
        query = query.limit(pageSize);

        const snapshot = await query.get();

        const leaderboard = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        // Get total participant count for the week
        const totalSnapshot = await scoresRef
            .where('weekNumber', '==', week)
            .where('yearNumber', '==', year)
            .count()
            .get();

        return {
            leaderboard,
            weekNumber: week,
            yearNumber: year,
            totalParticipants: totalSnapshot.data().count,
            lastDocId: snapshot.docs[snapshot.docs.length - 1]?.id,
            hasMore: snapshot.docs.length === pageSize,
        };
    } catch (error) {
        functions.logger.error('❌ Error getting leaderboard:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
        );
    }
});

export const generateFakeScores = async (data: { week: number; year: number }) => {
    const { week, year } = data;
    const scoresRef = db.collection('scores');
    const batch = db.batch();

    const generateValidFormatAddress = () => {
        const randomBytes = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256));
        const addressBytes = randomBytes.map(b => b.toString(16).padStart(2, '0')).join('');
        return `0x${addressBytes}`.toLowerCase();
    };

    // Generate points with a more realistic distribution
    const generatePoints = () => {
        // Base points between 100-1000
        const basePoints = Math.floor(Math.random() * 900) + 100;

        // 30% chance of getting bonus points (100-500)
        const bonusPoints = Math.random() < 0.3 ? Math.floor(Math.random() * 400) + 100 : 0;

        // 10% chance of getting high activity points (500-2000)
        const activityPoints = Math.random() < 0.1 ? Math.floor(Math.random() * 1500) + 500 : 0;

        return basePoints + bonusPoints + activityPoints;
    };

    // Generate 1000 fake entries
    for (let i = 0; i < 10; i++) {
        const points = generatePoints();
        const walletAddress = generateValidFormatAddress();

        const docRef = scoresRef.doc();
        batch.set(docRef, {
            points,
            walletAddress,
            weekNumber: week,
            yearNumber: year,
            source: 'fake',
            createdAt: new Date().toISOString(),
        });
    }

    await batch.commit();
    return { success: true };
};
