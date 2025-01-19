import * as functions from 'firebase-functions';
import { db } from './config/firebase';

interface UserScore {
    points: number;
    tasksCompleted: number;
    multiplier: number;
    lastTaskTimestamp?: string;
    lastUpdated?: string;
}

export const claimDailyReward = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId;
    functions.logger.info('Processing daily reward claim for user:', { userId });

    try {
        // Check last claim
        const lastClaimQuery = await db
            .collection('rewards')
            .where('userId', '==', userId)
            .where('type', '==', 'daily')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

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

        // Get user data to check for Telegram bonus
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // Calculate bonus multiplier
        const telegramBonus = userData?.telegramConnected ? 1.1 : 1.0; // 10% bonus
        const basePoints = 100;
        const totalPoints = Math.floor(basePoints * telegramBonus);

        // Add reward document
        const rewardRef = await db.collection('rewards').add({
            userId,
            points: totalPoints,
            basePoints,
            telegramBonus: userData?.telegramConnected ? 0.1 : 0,
            timestamp: new Date().toISOString(),
            type: 'daily',
        });

        // Update user score
        const userScoreRef = db.collection('scores').doc(userId);
        await db.runTransaction(async transaction => {
            const scoreDoc = await transaction.get(userScoreRef);
            const currentData = scoreDoc.exists
                ? (scoreDoc.data() as UserScore)
                : {
                      points: 0,
                      tasksCompleted: 0,
                      multiplier: 1,
                  };

            transaction.set(
                userScoreRef,
                {
                    userId,
                    points: (currentData?.points || 0) + totalPoints,
                    tasksCompleted: (currentData?.tasksCompleted || 0) + 1,
                    multiplier: currentData?.multiplier || 1,
                    lastTaskTimestamp: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                },
                { merge: true }
            );
        });

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
    .onCreate(async (snapshot, context) => {
        try {
            const rewardData = snapshot.data();
            const { userId, type, timestamp } = rewardData;

            if (!userId) {
                functions.logger.error('No userId found in reward document');
                return;
            }

            if (type === 'daily') {
                const userScoreRef = db.collection('scores').doc(userId);

                // Get current score or create new one
                const scoreDoc = await userScoreRef.get();
                const defaultData: UserScore = {
                    points: 0,
                    tasksCompleted: 0,
                    multiplier: 1,
                };
                const currentData = scoreDoc.exists ? (scoreDoc.data() as UserScore) : defaultData;

                // Calculate new points with multiplier
                const pointsToAdd = 100 * currentData.multiplier;

                await userScoreRef.set(
                    {
                        userId,
                        points: currentData.points + pointsToAdd,
                        tasksCompleted: currentData.tasksCompleted + 1,
                        multiplier: currentData.multiplier,
                        lastTaskTimestamp: timestamp || new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                    },
                    { merge: true }
                );
            }
        } catch (error) {
            functions.logger.error('Error updating user score:', { error });
            throw error;
        }
    });
