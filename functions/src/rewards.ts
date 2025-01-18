import { admin } from './config/firebase';
import * as functions from 'firebase-functions';

interface UserScore {
    points: number;
    tasksCompleted: number;
    multiplier: number;
}

export const claimDailyReward = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const userId = data.userId;
        functions.logger.info('Processing daily reward claim for user:', { userId });

        // Check last claim
        const rewardsRef = admin.firestore().collection('rewards');
        const lastClaimQuery = await rewardsRef
            .where('userId', '==', userId)
            .where('type', '==', 'daily')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!lastClaimQuery.empty) {
            const lastClaim = lastClaimQuery.docs[0].data();
            const lastClaimTime = new Date(lastClaim.timestamp);
            const now = new Date();
            const hoursSinceLastClaim =
                (now.getTime() - lastClaimTime.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastClaim < 24) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Daily reward already claimed',
                    {
                        nextClaimTime: new Date(
                            lastClaimTime.getTime() + 24 * 60 * 60 * 1000
                        ).toISOString(),
                    }
                );
            }
        }

        const rewardRef = await rewardsRef.add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'daily',
        });

        return {
            success: true,
            rewardId: rewardRef.id,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        functions.logger.error('Error claiming daily reward:', { error });
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Internal server error'
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
                const userScoreRef = admin.firestore().collection('scores').doc(userId);

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
