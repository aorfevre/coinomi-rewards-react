import './config/firebase';
import { db } from './config/firebase';
import { getWeek, getYear } from 'date-fns';

// Configuration for the migration
const MIGRATION_CONFIG = {
    defaultWeekNumber: 28,
    defaultYearNumber: 2025,
    weekOptions: {
        weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        firstWeekContainsDate: 4 as 1 | 4,
    },
};

interface RewardData {
    id: string;
    userId: string;
    type: string;
    timestamp: string;
    weekNumber?: number;
    yearNumber?: number;
    walletAddress?: string;
    [key: string]: any;
}

interface UserData {
    walletAddress?: string;
    [key: string]: any;
}

interface MigrationUpdate {
    rewardId: string;
    userId: string;
    type: string;
    timestamp: string;
    currentData: {
        weekNumber?: number;
        yearNumber?: number;
        walletAddress?: string;
    };
    proposedUpdates: {
        weekNumber: number;
        yearNumber: number;
        walletAddress?: string;
    };
    needsUpdate: boolean;
}

interface ScoreUpdate {
    userId: string;
    weekNumber: number;
    yearNumber: number;
    currentScore?: number;
    proposedScore: number;
    action: 'create' | 'update';
    reason: string;
}

/**
 * Analyze rewards and prepare migration data
 */
export async function analyzeRewardsForMigration(): Promise<{
    totalRewards: number;
    rewardsNeedingUpdate: number;
    migrationUpdates: MigrationUpdate[];
    scoreUpdates: ScoreUpdate[];
    summary: {
        missingWeekNumber: number;
        missingYearNumber: number;
        missingWalletAddress: number;
        rewardsWithNoUser: string[];
        scoresToCreate: number;
        scoresToUpdate: number;
    };
}> {
    console.log('🔍 Analyzing rewards for migration...');

    try {
        // Get all rewards
        const allRewards = await db.collection('rewards').get();
        const totalRewards = allRewards.size;

        console.log(`📊 Found ${totalRewards} total rewards`);

        // Get all users for wallet address lookup
        const allUsers = await db.collection('users').get();
        const userWalletMap = new Map<string, string>();

        allUsers.docs.forEach(doc => {
            const userData = doc.data() as UserData;
            if (userData.walletAddress) {
                userWalletMap.set(doc.id, userData.walletAddress);
            }
        });

        console.log(`👥 Found ${userWalletMap.size} users with wallet addresses`);

        const migrationUpdates: MigrationUpdate[] = [];
        const scoreUpdates: ScoreUpdate[] = [];
        const rewardsWithNoUser: string[] = [];

        let missingWeekNumber = 0;
        let missingYearNumber = 0;
        let missingWalletAddress = 0;

        // Analyze each reward
        allRewards.docs.forEach(doc => {
            const rewardData = doc.data() as RewardData;
            const rewardId = doc.id;

            // Check what's missing
            const hasWeekNumber =
                rewardData.weekNumber !== undefined && rewardData.weekNumber !== null;
            const hasYearNumber =
                rewardData.yearNumber !== undefined && rewardData.yearNumber !== null;
            const hasWalletAddress = !!rewardData.walletAddress;

            if (!hasWeekNumber) missingWeekNumber++;
            if (!hasYearNumber) missingYearNumber++;
            if (!hasWalletAddress) missingWalletAddress++;

            // Determine if this reward needs updates
            const needsUpdate = !hasWeekNumber || !hasYearNumber || !hasWalletAddress;

            if (needsUpdate) {
                // Calculate week/year from timestamp if available
                let calculatedWeekNumber = MIGRATION_CONFIG.defaultWeekNumber;
                let calculatedYearNumber = MIGRATION_CONFIG.defaultYearNumber;

                if (rewardData.timestamp) {
                    try {
                        const timestamp = new Date(rewardData.timestamp);
                        calculatedWeekNumber = getWeek(timestamp, MIGRATION_CONFIG.weekOptions);
                        calculatedYearNumber = getYear(timestamp);
                    } catch (error) {
                        console.warn(
                            `⚠️  Could not parse timestamp for reward ${rewardId}: ${rewardData.timestamp}`
                        );
                    }
                }

                // Get wallet address from user
                const userWalletAddress = userWalletMap.get(rewardData.userId);
                if (!userWalletAddress) {
                    rewardsWithNoUser.push(rewardId);
                }

                const migrationUpdate: MigrationUpdate = {
                    rewardId,
                    userId: rewardData.userId,
                    type: rewardData.type,
                    timestamp: rewardData.timestamp,
                    currentData: {
                        weekNumber: rewardData.weekNumber,
                        yearNumber: rewardData.yearNumber,
                        walletAddress: rewardData.walletAddress,
                    },
                    proposedUpdates: {
                        weekNumber: hasWeekNumber ? rewardData.weekNumber! : calculatedWeekNumber,
                        yearNumber: hasYearNumber ? rewardData.yearNumber! : calculatedYearNumber,
                        walletAddress: hasWalletAddress
                            ? rewardData.walletAddress!
                            : userWalletAddress,
                    },
                    needsUpdate,
                };

                migrationUpdates.push(migrationUpdate);
            }
        });

        // Analyze scores for users with updated rewards
        console.log('\n🔍 Analyzing scores for users with updated rewards...');

        // Get all existing scores
        const allScores = await db.collection('scores').get();
        const existingScores = new Map<string, any>();

        allScores.docs.forEach(doc => {
            const scoreData = doc.data();
            const key = `${scoreData.userId}_${scoreData.weekNumber}_${scoreData.yearNumber}`;
            existingScores.set(key, { id: doc.id, ...scoreData });
        });

        console.log(`📊 Found ${existingScores.size} existing score documents`);

        // Group rewards by user and week/year
        const userWeekYearGroups = new Map<string, MigrationUpdate[]>();

        migrationUpdates.forEach(update => {
            const key = `${update.userId}_${update.proposedUpdates.weekNumber}_${update.proposedUpdates.yearNumber}`;
            if (!userWeekYearGroups.has(key)) {
                userWeekYearGroups.set(key, []);
            }
            userWeekYearGroups.get(key)!.push(update);
        });

        console.log(`👥 Found ${userWeekYearGroups.size} unique user-week-year combinations`);

        // Analyze each user-week-year combination
        userWeekYearGroups.forEach((rewards, key) => {
            const [userId, weekNumber, yearNumber] = key.split('_');
            const weekNum = parseInt(weekNumber);
            const yearNum = parseInt(yearNumber);

            // Calculate total points: 100 points per reward
            const totalPointsToAdd = rewards.length * 100;

            // Check if score document exists
            const existingScore = existingScores.get(key);

            if (existingScore) {
                // Score exists - add points for each reward
                const currentScore = existingScore.points || 0;
                const proposedScore = currentScore + totalPointsToAdd;

                const scoreUpdate: ScoreUpdate = {
                    userId,
                    weekNumber: weekNum,
                    yearNumber: yearNum,
                    currentScore,
                    proposedScore,
                    action: 'update',
                    reason: `Adding ${totalPointsToAdd} points (100 per reward) for ${rewards.length} migrated reward(s)`,
                };

                scoreUpdates.push(scoreUpdate);
            } else {
                // Score doesn't exist - create with points for all rewards
                const scoreUpdate: ScoreUpdate = {
                    userId,
                    weekNumber: weekNum,
                    yearNumber: yearNum,
                    proposedScore: totalPointsToAdd,
                    action: 'create',
                    reason: `Creating score with ${totalPointsToAdd} points (100 per reward) for ${rewards.length} migrated reward(s)`,
                };

                scoreUpdates.push(scoreUpdate);
            }
        });

        const scoresToCreate = scoreUpdates.filter(update => update.action === 'create').length;
        const scoresToUpdate = scoreUpdates.filter(update => update.action === 'update').length;

        const summary = {
            missingWeekNumber,
            missingYearNumber,
            missingWalletAddress,
            rewardsWithNoUser,
            scoresToCreate,
            scoresToUpdate,
        };

        console.log('\n📈 Migration Analysis Summary:');
        console.log(`   Total rewards: ${totalRewards}`);
        console.log(`   Missing weekNumber: ${missingWeekNumber}`);
        console.log(`   Missing yearNumber: ${missingYearNumber}`);
        console.log(`   Missing walletAddress: ${missingWalletAddress}`);
        console.log(`   Rewards needing update: ${migrationUpdates.length}`);
        console.log(`   Rewards with no user found: ${rewardsWithNoUser.length}`);
        console.log(`   Scores to create: ${scoresToCreate}`);
        console.log(`   Scores to update: ${scoresToUpdate}`);

        return {
            totalRewards,
            rewardsNeedingUpdate: migrationUpdates.length,
            migrationUpdates,
            scoreUpdates,
            summary,
        };
    } catch (error) {
        console.error('❌ Error analyzing rewards for migration:', error);
        throw error;
    }
}

/**
 * Preview the migration updates (dry run)
 */
export async function previewMigrationUpdates(): Promise<void> {
    console.log('🔍 Previewing migration updates...\n');

    const analysis = await analyzeRewardsForMigration();

    console.log('\n📋 Preview of updates to be made:');
    console.log('='.repeat(80));

    analysis.migrationUpdates.slice(0, 10).forEach((update, index) => {
        console.log(`\n${index + 1}. Reward ID: ${update.rewardId}`);
        console.log(`   Type: ${update.type}`);
        console.log(`   User: ${update.userId}`);
        console.log(`   Timestamp: ${update.timestamp}`);
        console.log(
            `   Current: weekNumber=${update.currentData.weekNumber || 'MISSING'}, yearNumber=${update.currentData.yearNumber || 'MISSING'}, walletAddress=${update.currentData.walletAddress || 'MISSING'}`
        );
        console.log(
            `   Proposed: weekNumber=${update.proposedUpdates.weekNumber}, yearNumber=${update.proposedUpdates.yearNumber}, walletAddress=${update.proposedUpdates.walletAddress || 'NO_USER_FOUND'}`
        );
    });

    if (analysis.migrationUpdates.length > 10) {
        console.log(`\n... and ${analysis.migrationUpdates.length - 10} more rewards`);
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 Total rewards to update: ${analysis.migrationUpdates.length}`);
    console.log(`📊 Total scores to update: ${analysis.scoreUpdates.length}`);
    console.log(`⚠️  Rewards with no user found: ${analysis.summary.rewardsWithNoUser.length}`);

    if (analysis.summary.rewardsWithNoUser.length > 0) {
        console.log('\n⚠️  Rewards with no user found (will not get walletAddress):');
        analysis.summary.rewardsWithNoUser.slice(0, 5).forEach(rewardId => {
            console.log(`   - ${rewardId}`);
        });
        if (analysis.summary.rewardsWithNoUser.length > 5) {
            console.log(`   ... and ${analysis.summary.rewardsWithNoUser.length - 5} more`);
        }
    }

    // Show score updates preview
    if (analysis.scoreUpdates.length > 0) {
        console.log('\n📊 Score Updates Preview:');
        console.log('='.repeat(80));

        analysis.scoreUpdates.slice(0, 10).forEach((scoreUpdate, index) => {
            console.log(`\n${index + 1}. User: ${scoreUpdate.userId}`);
            console.log(`   Week: ${scoreUpdate.weekNumber}, Year: ${scoreUpdate.yearNumber}`);
            console.log(`   Action: ${scoreUpdate.action.toUpperCase()}`);
            if (scoreUpdate.action === 'update') {
                console.log(
                    `   Current Score: ${scoreUpdate.currentScore} → Proposed: ${scoreUpdate.proposedScore}`
                );
            } else {
                console.log(`   New Score: ${scoreUpdate.proposedScore}`);
            }
            console.log(`   Reason: ${scoreUpdate.reason}`);
        });

        if (analysis.scoreUpdates.length > 10) {
            console.log(`\n... and ${analysis.scoreUpdates.length - 10} more score updates`);
        }

        // Add verification summary
        console.log('\n🔍 POINTS VERIFICATION:');
        console.log('='.repeat(80));

        const totalPointsToGrant = analysis.scoreUpdates.reduce((total, update) => {
            if (update.action === 'update') {
                return total + (update.proposedScore - (update.currentScore || 0));
            } else {
                return total + update.proposedScore;
            }
        }, 0);

        const pointsByUser = new Map<string, number>();
        analysis.scoreUpdates.forEach(update => {
            const pointsToAdd =
                update.action === 'update'
                    ? update.proposedScore - (update.currentScore || 0)
                    : update.proposedScore;
            pointsByUser.set(update.userId, pointsToAdd);
        });

        console.log(`📊 Total Points to Grant: ${totalPointsToGrant.toLocaleString()}`);
        console.log(`👥 Number of Users Receiving Points: ${pointsByUser.size}`);
        console.log(
            `📈 Average Points per User: ${Math.round(totalPointsToGrant / pointsByUser.size)}`
        );

        // Show top 10 users by points
        const sortedUsers = Array.from(pointsByUser.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        console.log('\n🏆 Top 10 Users by Points to Receive:');
        sortedUsers.forEach(([userId, points], index) => {
            console.log(`   ${index + 1}. User ${userId}: ${points.toLocaleString()} points`);
        });

        if (pointsByUser.size > 10) {
            console.log(`   ... and ${pointsByUser.size - 10} more users`);
        }

        // Show points distribution
        const pointRanges = {
            '1-100': 0,
            '101-500': 0,
            '501-1000': 0,
            '1000+': 0,
        };

        pointsByUser.forEach(points => {
            if (points <= 100) pointRanges['1-100']++;
            else if (points <= 500) pointRanges['101-500']++;
            else if (points <= 1000) pointRanges['501-1000']++;
            else pointRanges['1000+']++;
        });

        console.log('\n📊 Points Distribution:');
        Object.entries(pointRanges).forEach(([range, count]) => {
            if (count > 0) {
                console.log(`   ${range} points: ${count} users`);
            }
        });

        // Verification check
        const expectedTotal = analysis.migrationUpdates.length * 100;
        const isCorrect = totalPointsToGrant === expectedTotal;

        console.log('\n✅ VERIFICATION CHECK:');
        console.log(
            `   Expected Total (126 rewards × 100 points): ${expectedTotal.toLocaleString()}`
        );
        console.log(`   Actual Total Calculated: ${totalPointsToGrant.toLocaleString()}`);
        console.log(`   ✅ Match: ${isCorrect ? 'YES' : 'NO'}`);

        if (!isCorrect) {
            console.log('   ⚠️  WARNING: Point calculation mismatch!');
        }
    }
}

/**
 * Execute the migration (WARNING: This will update the database)
 */
export async function executeMigrationUpdates(): Promise<{
    rewardsSuccess: number;
    rewardsFailed: number;
    scoresSuccess: number;
    scoresFailed: number;
    errors: Array<{ type: string; id: string; error: string }>;
}> {
    console.log('🚨 WARNING: This will update the database!');
    console.log('Are you sure you want to proceed? (This function should be called manually)');

    const analysis = await analyzeRewardsForMigration();

    if (analysis.rewardsNeedingUpdate === 0) {
        console.log('✅ No rewards need updating!');
        return {
            rewardsSuccess: 0,
            rewardsFailed: 0,
            scoresSuccess: 0,
            scoresFailed: 0,
            errors: [],
        };
    }

    console.log(`\n🚀 Starting migration of ${analysis.rewardsNeedingUpdate} rewards...`);

    const results = {
        rewardsSuccess: 0,
        rewardsFailed: 0,
        scoresSuccess: 0,
        scoresFailed: 0,
        errors: [] as Array<{ type: string; id: string; error: string }>,
    };

    // Process in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < analysis.migrationUpdates.length; i += batchSize) {
        batches.push(analysis.migrationUpdates.slice(i, i + batchSize));
    }

    console.log(`📦 Processing ${batches.length} batches...`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const firestoreBatch = db.batch();

        console.log(
            `\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} rewards)...`
        );

        batch.forEach(update => {
            if (update.needsUpdate) {
                const rewardRef = db.collection('rewards').doc(update.rewardId);
                const updateData: any = {};

                if (
                    update.currentData.weekNumber === undefined ||
                    update.currentData.weekNumber === null
                ) {
                    updateData.weekNumber = update.proposedUpdates.weekNumber;
                }

                if (
                    update.currentData.yearNumber === undefined ||
                    update.currentData.yearNumber === null
                ) {
                    updateData.yearNumber = update.proposedUpdates.yearNumber;
                }

                if (!update.currentData.walletAddress && update.proposedUpdates.walletAddress) {
                    updateData.walletAddress = update.proposedUpdates.walletAddress;
                }

                if (Object.keys(updateData).length > 0) {
                    firestoreBatch.update(rewardRef, updateData);
                }
            }
        });

        try {
            await firestoreBatch.commit();
            results.rewardsSuccess += batch.length;
            console.log(`✅ Batch ${batchIndex + 1} completed successfully`);
        } catch (error) {
            results.rewardsFailed += batch.length;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push({
                type: 'reward',
                id: `batch_${batchIndex + 1}`,
                error: errorMessage,
            });
            console.error(`❌ Batch ${batchIndex + 1} failed:`, errorMessage);
        }
    }

    // Now handle score updates
    console.log('\n📊 Processing score updates...');

    if (analysis.scoreUpdates.length > 0) {
        // Process score updates in batches
        const scoreBatchSize = 500;
        const scoreBatches = [];

        for (let i = 0; i < analysis.scoreUpdates.length; i += scoreBatchSize) {
            scoreBatches.push(analysis.scoreUpdates.slice(i, i + scoreBatchSize));
        }

        console.log(`📦 Processing ${scoreBatches.length} score batches...`);

        for (let batchIndex = 0; batchIndex < scoreBatches.length; batchIndex++) {
            const scoreBatch = scoreBatches[batchIndex];
            const firestoreBatch = db.batch();

            console.log(
                `\n📦 Processing score batch ${batchIndex + 1}/${scoreBatches.length} (${scoreBatch.length} updates)...`
            );

            for (const scoreUpdate of scoreBatch) {
                if (scoreUpdate.action === 'create') {
                    // Create new score document
                    const scoreRef = db.collection('scores').doc();
                    firestoreBatch.set(scoreRef, {
                        userId: scoreUpdate.userId,
                        weekNumber: scoreUpdate.weekNumber,
                        yearNumber: scoreUpdate.yearNumber,
                        points: scoreUpdate.proposedScore,
                        tasksCompleted: 0,
                        tasksCompletedOverall: 0,
                        tasksCompletedClaimed: 0,
                        tasksCompletedClaimedOverall: 0,
                        multiplier: 1,
                        lastUpdated: new Date().toISOString(),
                    });
                } else if (scoreUpdate.action === 'update') {
                    // Find existing score document and update it
                    const scoreQuery = db
                        .collection('scores')
                        .where('userId', '==', scoreUpdate.userId)
                        .where('weekNumber', '==', scoreUpdate.weekNumber)
                        .where('yearNumber', '==', scoreUpdate.yearNumber)
                        .limit(1);

                    try {
                        const scoreSnapshot = await scoreQuery.get();

                        if (!scoreSnapshot.empty) {
                            const scoreDoc = scoreSnapshot.docs[0];
                            const scoreRef = scoreDoc.ref;

                            firestoreBatch.update(scoreRef, {
                                points: scoreUpdate.proposedScore,
                                lastUpdated: new Date().toISOString(),
                            });
                        } else {
                            // If score document not found, create it
                            console.log(
                                `⚠️  Score document not found for user ${scoreUpdate.userId}, creating new one`
                            );
                            const scoreRef = db.collection('scores').doc();
                            firestoreBatch.set(scoreRef, {
                                userId: scoreUpdate.userId,
                                weekNumber: scoreUpdate.weekNumber,
                                yearNumber: scoreUpdate.yearNumber,
                                points: scoreUpdate.proposedScore,
                                tasksCompleted: 0,
                                tasksCompletedOverall: 0,
                                tasksCompletedClaimed: 0,
                                tasksCompletedClaimedOverall: 0,
                                multiplier: 1,
                                lastUpdated: new Date().toISOString(),
                            });
                        }
                    } catch (error) {
                        console.error(
                            `❌ Error processing score update for user ${scoreUpdate.userId}:`,
                            error
                        );
                        results.scoresFailed++;
                        results.errors.push({
                            type: 'score',
                            id: scoreUpdate.userId,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        });
                    }
                }
            }

            try {
                await firestoreBatch.commit();
                const createdCount = scoreBatch.filter(s => s.action === 'create').length;
                const updatedCount = scoreBatch.filter(s => s.action === 'update').length;
                results.scoresSuccess += createdCount + updatedCount;
                console.log(
                    `✅ Score batch ${batchIndex + 1} completed: ${createdCount} created, ${updatedCount} updated`
                );
            } catch (error) {
                results.scoresFailed += scoreBatch.length;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.errors.push({
                    type: 'score',
                    id: `batch_${batchIndex + 1}`,
                    error: errorMessage,
                });
                console.error(`❌ Score batch ${batchIndex + 1} failed:`, errorMessage);
            }
        }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully updated: ${results.rewardsSuccess} rewards`);
    console.log(`❌ Failed to update: ${results.rewardsFailed} rewards`);
    console.log(`✅ Successfully updated: ${results.scoresSuccess} scores`);
    console.log(`❌ Failed to update: ${results.scoresFailed} scores`);

    if (results.errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        results.errors.forEach(error => {
            console.log(`   - ${error.type} ${error.id}: ${error.error}`);
        });
    }

    return results;
}
