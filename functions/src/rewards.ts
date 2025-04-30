import * as functions from 'firebase-functions';
import { db } from './config/firebase';
import { getWeek, getYear } from 'date-fns';
import { updateUserCurrentMultiplier } from './auth';

// Add the consistent week options
const WEEK_OPTIONS = {
    weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    firstWeekContainsDate: 4 as 1 | 4,
};

interface UserScore {
    userId: string;
    points: number;
    tasksCompleted: number;
    tasksCompletedOverall: number;
    tasksCompletedClaimed: number;
    tasksCompletedClaimedOverall: number;
    multiplier: number;
    lastTaskTimestamp?: string;
    lastUpdated?: string;
    currentStreak?: number;
    weekNumber?: number;
    yearNumber?: number;
    walletAddress?: string;
}

// Utility function for streak bonus calculation
export function getStreakBonus(scoreDoc: FirebaseFirestore.DocumentSnapshot, now: Date): number {
    const lastClaimDate = new Date(scoreDoc.data()?.lastTaskTimestamp);
    const isStreakActive =
        lastClaimDate &&
        now.getTime() - lastClaimDate.getTime() <
            2 * Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) * 1000;
    const currentStreak = isStreakActive ? scoreDoc.data()?.currentStreak || 0 : 0;
    if (!currentStreak || currentStreak < 1) return 0;
    return currentStreak >= 5 ? 0.2 : currentStreak * 0.02;
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
        await updateUserCurrentMultiplier(userId);
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

        // get the current multiplier
        const currentMultiplier = userData?.currentMultiplier || 1;
        const scoreDoc = await db.collection('scores').doc(userId).get();
        const now = new Date();
        const streakBonus = getStreakBonus(scoreDoc, now);
        const basePoints = 100;
        const totalPoints = Math.round(basePoints * (currentMultiplier * (1 + streakBonus)));

        // Add reward document with week and year
        const rewardRef = await db.collection('rewards').add({
            userId,
            points: totalPoints,
            basePoints,
            multiplier: currentMultiplier,
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

            await updateUserCurrentMultiplier(userId);

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
                tasksCompletedOverall: 0,
                tasksCompletedClaimed: 0,
                tasksCompletedClaimedOverall: 0,
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

            // count total tasks completed by the user in the current week
            const tasksCompleted = await db
                .collection('tasks')
                .where('userId', '==', userId)
                .where('weekNumber', '==', getWeek(new Date(), WEEK_OPTIONS))
                .where('yearNumber', '==', getYear(new Date()))
                .count()
                .get();

            // count total tasks completed overall
            const tasksCompletedOverall = await db
                .collection('tasks')
                .where('userId', '==', userId)
                .count()
                .get();

            // count only claimed tasks completed (weekly / overall)
            const tasksCompletedClaimed = await db
                .collection('tasks')
                .where('userId', '==', userId)
                .where('weekNumber', '==', getWeek(new Date(), WEEK_OPTIONS))
                .where('yearNumber', '==', getYear(new Date()))
                .count()
                .get();

            const tasksCompletedClaimedOverall = await db
                .collection('tasks')
                .where('userId', '==', userId)
                .count()
                .get();

            const insertScore: UserScore = {
                userId,
                points: 0,
                tasksCompleted: tasksCompleted.data()?.count || 0,
                tasksCompletedOverall: tasksCompletedOverall.data()?.count || 0,
                tasksCompletedClaimed: tasksCompletedClaimed.data()?.count || 0,
                tasksCompletedClaimedOverall: tasksCompletedClaimedOverall.data()?.count || 0,
                multiplier: 1,
                lastTaskTimestamp: timestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                currentStreak:
                    isStreakActive && currentData.currentStreak ? currentData.currentStreak : 0,
                weekNumber: getWeek(new Date(), WEEK_OPTIONS),
                yearNumber: getYear(new Date()),
                walletAddress: rewardData?.walletAddress,
            };
            if (type === 'daily') {
                // Calculate new points with multiplier
                const pointsToAdd = points;

                insertScore.points = currentData.points + pointsToAdd || 0;
                insertScore.tasksCompleted = currentData.tasksCompleted + 1 || 0;
                insertScore.tasksCompletedOverall = currentData.tasksCompletedOverall + 1 || 0;
                insertScore.tasksCompletedClaimed = currentData.tasksCompletedClaimed + 1 || 0;
                insertScore.tasksCompletedClaimedOverall =
                    currentData.tasksCompletedClaimedOverall + 1 || 0;
                insertScore.multiplier = currentData.multiplier || 1;
                insertScore.currentStreak =
                    isStreakActive && currentData.currentStreak ? currentData.currentStreak + 1 : 1;

                const userScoreRef = db.collection('scores').doc(userId);
                await userScoreRef.set(insertScore, { merge: true });
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
                insertScore.tasksCompletedOverall = currentData.tasksCompletedOverall + 1 || 0;
                insertScore.tasksCompletedClaimedOverall =
                    currentData.tasksCompletedClaimedOverall + 1 || 0;

                await userScoreRef.set(insertScore, { merge: true });
            } else if (type === 'twitter_like') {
                const userScoreRef = db.collection('scores').doc(userId);
                const scoreDoc = await userScoreRef.get();
                const currentData = scoreDoc.exists ? (scoreDoc.data() as UserScore) : defaultData;
                const pointsToAdd = points;
                insertScore.points = currentData.points + pointsToAdd || 0;
                insertScore.tasksCompletedOverall = currentData.tasksCompletedOverall + 1 || 0;
                insertScore.tasksCompletedClaimedOverall =
                    currentData.tasksCompletedClaimedOverall + 1 || 0;

                await userScoreRef.set(insertScore, { merge: true });
            } else if (type === 'twitter_retweet') {
                const userScoreRef = db.collection('scores').doc(userId);
                const scoreDoc = await userScoreRef.get();
                const currentData = scoreDoc.exists ? (scoreDoc.data() as UserScore) : defaultData;
                const pointsToAdd = points;
                insertScore.points = currentData.points + pointsToAdd || 0;
                insertScore.tasksCompletedOverall = currentData.tasksCompletedOverall + 1 || 0;
                insertScore.tasksCompletedClaimedOverall =
                    currentData.tasksCompletedClaimedOverall + 1 || 0;

                await userScoreRef.set(insertScore, { merge: true });
            }
        } catch (error) {
            functions.logger.error('Error updating user score:', { error });
            throw error;
        }
    });

/**
 * Helper to create a Twitter reward (like/retweet) with all bonuses and week/year fields
 */
export async function setTwitterReward({
    userId,
    tweetId,
    basePoints,
    type,
}: {
    userId: string;
    tweetId: string;
    basePoints: number;
    type: 'twitter_like' | 'twitter_retweet';
}) {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const now = new Date();

    const multiplier = userData?.currentMultiplier || 1;
    const scoreDoc = await db.collection('scores').doc(userId).get();
    const streakBonus = getStreakBonus(scoreDoc, now);

    // No streak bonus for Twitter actions (unless you want to add it)
    // Get week/year
    const weekNumber = getWeek(now, WEEK_OPTIONS);
    const yearNumber = getYear(now);

    // Calculate total points
    const totalPoints = Math.round(basePoints * multiplier * (1 + streakBonus));

    // Add reward document
    const rewardRef = await db.collection('rewards').add({
        userId,
        tweetId,
        points: totalPoints,
        basePoints,
        multiplier,
        timestamp: now.toISOString(),
        type,
        weekNumber,
        yearNumber,
        walletAddress: userData?.walletAddress,
    });
    return rewardRef;
}
