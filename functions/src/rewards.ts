import * as functions from 'firebase-functions';
import { db } from './config/firebase';
import { getWeek, getYear } from 'date-fns';

// Add the consistent week options
const WEEK_OPTIONS = {
    weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    firstWeekContainsDate: 4 as 1 | 4,
};

interface UserScore {
    userId: string;
    points: number;
    tasksCompleted: number;
    multiplier: number;
    lastTaskTimestamp?: string;
    lastUpdated?: string;
    currentStreak?: number;
    weekNumber?: number;
    yearNumber?: number;
    walletAddress?: string;
}

export const claimDailyReward = functions.https.onCall(async (data, context) => {
    console.log('🔥 claimDailyReward - data:', data);
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId;
    functions.logger.info('Processing daily reward claim for user:', { userId });

    try {
        // Run these queries in parallel
        const [lastClaimQuery, userDoc] = await Promise.all([
            db
                .collection('rewards')
                .where('userId', '==', userId)
                .where('type', '==', 'daily')
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get(),
            db.collection('users').doc(userId).get(),
        ]);

        if (!lastClaimQuery.empty) {
            const lastClaim = lastClaimQuery.docs[0].data();
            const lastClaimTime = new Date(lastClaim.timestamp);
            const now = new Date();
            const secondsSinceLastClaim = (now.getTime() - lastClaimTime.getTime()) / 1000;

            const claimCooldownSeconds =
                Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) || 86400;

            if (secondsSinceLastClaim < claimCooldownSeconds) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Daily reward already claimed'
                );
            }
        }

        // Get user data to check for Telegram and email bonuses
        const userData = userDoc.data();

        // Calculate bonus multiplier
        const telegramBonus = userData?.telegramConnected ? 0.1 : 0; // 10% bonus
        const twitterBonus = userData?.twitterConnected ? 0.1 : 0; // 10% bonus
        const emailBonus = userData?.emailConnected ? 0.1 : 0; // 10% bonus
        const basePoints = 100;

        // check if the user has a streak bonus
        // get his score doc
        const scoreDoc = await db.collection('scores').doc(userId).get();
        // check if the streak is still valid
        const lastClaimDate = new Date(scoreDoc.data()?.lastTaskTimestamp);
        const now = new Date();
        const isStreakActive =
            lastClaimDate &&
            now.getTime() - lastClaimDate.getTime() <
                2 * Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) * 1000;

        const streakBonusValue = isStreakActive ? scoreDoc.data()?.currentStreak || 0 : 0;
        const streakBonus = streakBonusValue * 0.02;

        const totalPoints = Math.round(
            basePoints * (1 + telegramBonus + twitterBonus + emailBonus + streakBonus)
        );

        // Add reward document with week and year
        const rewardRef = await db.collection('rewards').add({
            userId,
            points: totalPoints,
            basePoints,
            telegramBonus: userData?.telegramConnected ? 0.1 : 0,
            twitterBonus: userData?.twitterConnected ? 0.1 : 0,
            emailBonus: userData?.emailConnected ? 0.1 : 0,
            streakBonus: streakBonus,
            timestamp: now.toISOString(),
            type: 'daily',
            weekNumber: getWeek(now, WEEK_OPTIONS),
            yearNumber: getYear(now),
            walletAddress: userData?.walletAddress,
        });

        // Update referral reward to include week and year if exists
        if (userData?.referredBy) {
            await db.collection('rewards').add({
                userId: userData.referredBy,
                basePoints: totalPoints,
                points: Math.round(totalPoints * 0.1),
                multiplier: 0.1,
                type: 'referral-bonus',
                timestamp: now.toISOString(),
                rewardId: rewardRef.id,
                weekNumber: getWeek(now, WEEK_OPTIONS),
                yearNumber: getYear(now),
                walletAddress: userData?.walletAddress,
            });
        }

        functions.logger.info('Daily reward claimed successfully', {
            userId,
            rewardId: rewardRef.id,
            points: totalPoints,
        });

        return {
            success: true,
            points: totalPoints,
            timestamp: new Date().toISOString(),
            rewardId: rewardRef.id,
        };
    } catch (error) {
        functions.logger.error('Error claiming daily reward:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Failed to claim reward'
        );
    }
});

export const onRewardCreated = functions.firestore
    .document('rewards/{rewardId}')
    .onCreate(async snapshot => {
        try {
            const rewardData = snapshot.data();
            console.log('🔥 onRewardCreated - rewardData:', rewardData);
            const { userId, type, timestamp, points } = rewardData;

            if (!userId) {
                functions.logger.error('No userId found in reward document');
                return;
            }
            const userScoreRef = db
                .collection('scores')
                .where('userId', '==', userId)
                .where('weekNumber', '==', getWeek(new Date(), WEEK_OPTIONS))
                .where('yearNumber', '==', getYear(new Date()))
                .limit(1);

            const scoreSnapshot = await userScoreRef.get();
            const defaultData: UserScore = {
                userId,
                points: 0,
                tasksCompleted: 0,
                multiplier: 1,
            };
            const currentData = !scoreSnapshot.empty
                ? (scoreSnapshot.docs[0].data() as UserScore)
                : defaultData;

            const lastClaimDate = currentData.lastTaskTimestamp
                ? new Date(currentData.lastTaskTimestamp)
                : false;
            const now = new Date();
            const isStreakActive =
                lastClaimDate &&
                now.getTime() - lastClaimDate.getTime() <
                    2 * Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) * 1000;

            // Get current score or create new one

            const insertScore: UserScore = {
                userId,
                points: 0,
                tasksCompleted: 0,
                multiplier: 1,
                lastTaskTimestamp: timestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                currentStreak:
                    isStreakActive && currentData.currentStreak ? currentData.currentStreak + 1 : 1,
                weekNumber: getWeek(new Date(), WEEK_OPTIONS),
                yearNumber: getYear(new Date()),
                walletAddress: rewardData?.walletAddress,
            };
            if (type === 'daily') {
                // Calculate new points with multiplier
                const pointsToAdd = points;

                insertScore.points = currentData.points + pointsToAdd || 0;
                insertScore.tasksCompleted = currentData.tasksCompleted + 1 || 0;
                insertScore.multiplier = currentData.multiplier || 1;

                // Create or update score document
                if (!scoreSnapshot.empty) {
                    await db
                        .collection('scores')
                        .doc(scoreSnapshot.docs[0].id)
                        .set(insertScore, { merge: true });
                } else {
                    await db.collection('scores').add(insertScore);
                }
            } else if (type === 'new-referral') {
                const userScoreRef = db.collection('scores').doc(userId);
                const scoreDoc = await userScoreRef.get();
                const currentData = scoreDoc.exists ? (scoreDoc.data() as UserScore) : defaultData;
                const pointsToAdd = 100;
                insertScore.points = currentData.points + pointsToAdd || 0;
                await userScoreRef.set(insertScore, { merge: true });
            } else if (type === 'referral-bonus') {
                const userScoreRef = db.collection('scores').doc(userId);
                const scoreDoc = await userScoreRef.get();
                const currentData = scoreDoc.exists ? (scoreDoc.data() as UserScore) : defaultData;
                const pointsToAdd = points;
                insertScore.points = currentData.points + pointsToAdd || 0;

                await userScoreRef.set(insertScore, { merge: true });
            }
        } catch (error) {
            functions.logger.error('Error updating user score:', { error });
            throw error;
        }
    });
