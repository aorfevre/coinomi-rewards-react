import './config/firebase';
import { db } from './config/firebase';

interface ScoreData {
    userId: string;
    points: number;
    weekNumber: number;
    yearNumber: number;
    [key: string]: any;
}

interface RewardData {
    userId: string;
    points: number;
    weekNumber: number;
    yearNumber: number;
    type: string;
    [key: string]: any;
}

interface UpdateResult {
    userId: string;
    oldScore: number;
    newScore: number;
    scoreDifference: number;
    rewardCount: number;
    rewardTypes: string[];
    updated: boolean;
    error?: string;
}

interface UpdateSummary {
    totalUsers: number;
    updatedUsers: number;
    skippedUsers: number;
    totalScoreDifference: number;
    averageScoreDifference: number;
    results: UpdateResult[];
    summary: {
        perfectMatches: number;
        scoreIncreased: number;
        scoreDecreased: number;
        noChange: number;
        errors: number;
    };
}

/**
 * Update scores based on the sum of rewards for week 28, year 2025
 */
export async function updateScoresFromRewards(): Promise<UpdateSummary> {
    console.log('🔄 Starting score update based on rewards for week 28, year 2025...\n');

    try {
        // Get all scores for week 28, year 2025
        const scoresSnapshot = await db
            .collection('scores')
            .where('weekNumber', '==', 28)
            .where('yearNumber', '==', 2025)
            .get();

        console.log(`📊 Found ${scoresSnapshot.size} score documents for week 28, year 2025`);

        // Get all rewards for week 28, year 2025
        const rewardsSnapshot = await db
            .collection('rewards')
            .where('weekNumber', '==', 28)
            .where('yearNumber', '==', 2025)
            .get();

        console.log(`🎁 Found ${rewardsSnapshot.size} reward documents for week 28, year 2025`);

        // Create maps for easy lookup
        const scoresMap = new Map<string, { docId: string; data: ScoreData }>();
        const rewardsByUser = new Map<string, RewardData[]>();

        // Process scores
        scoresSnapshot.docs.forEach(doc => {
            const scoreData = doc.data() as ScoreData;
            scoresMap.set(scoreData.userId, { docId: doc.id, data: scoreData });
        });

        // Process rewards
        rewardsSnapshot.docs.forEach(doc => {
            const rewardData = doc.data() as RewardData;
            if (!rewardsByUser.has(rewardData.userId)) {
                rewardsByUser.set(rewardData.userId, []);
            }
            rewardsByUser.get(rewardData.userId)!.push(rewardData);
        });

        console.log(`👥 Found ${scoresMap.size} unique users with scores`);
        console.log(`👥 Found ${rewardsByUser.size} unique users with rewards`);

        // Process each user
        const results: UpdateResult[] = [];
        const batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500;

        console.log(`\n🔄 Processing ${scoresMap.size} users...`);

        for (const [userId, scoreInfo] of scoresMap) {
            const userRewards = rewardsByUser.get(userId) || [];
            const oldScore = scoreInfo.data.points || 0;
            const newScore = userRewards.reduce((sum, reward) => sum + (reward.points || 0), 0);
            const scoreDifference = newScore - oldScore;

            const result: UpdateResult = {
                userId,
                oldScore,
                newScore,
                scoreDifference,
                rewardCount: userRewards.length,
                rewardTypes: [...new Set(userRewards.map(r => r.type))],
                updated: false,
            };

            // Only update if there's a difference
            if (Math.abs(scoreDifference) > 0) {
                try {
                    const scoreRef = db.collection('scores').doc(scoreInfo.docId);
                    batch.update(scoreRef, { points: newScore });
                    result.updated = true;
                    batchCount++;

                    // Commit batch if it reaches the limit
                    if (batchCount >= BATCH_SIZE) {
                        await batch.commit();
                        console.log(`✅ Committed batch of ${batchCount} updates`);
                        batchCount = 0;
                    }
                } catch (error) {
                    result.error = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ Error updating score for user ${userId}:`, error);
                }
            }

            results.push(result);
        }

        // Commit any remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Committed final batch of ${batchCount} updates`);
        }

        // Calculate summary statistics
        const updatedUsers = results.filter(r => r.updated).length;
        const skippedUsers = results.filter(r => !r.updated && !r.error).length;
        const totalScoreDifference = results.reduce(
            (sum, r) => sum + Math.abs(r.scoreDifference),
            0
        );
        const averageScoreDifference = updatedUsers > 0 ? totalScoreDifference / updatedUsers : 0;

        const summary = {
            perfectMatches: results.filter(r => r.scoreDifference === 0).length,
            scoreIncreased: results.filter(r => r.scoreDifference > 0).length,
            scoreDecreased: results.filter(r => r.scoreDifference < 0).length,
            noChange: results.filter(r => r.scoreDifference === 0).length,
            errors: results.filter(r => r.error).length,
        };

        const updateSummary: UpdateSummary = {
            totalUsers: results.length,
            updatedUsers,
            skippedUsers,
            totalScoreDifference,
            averageScoreDifference,
            results,
            summary,
        };

        return updateSummary;
    } catch (error) {
        console.error('❌ Error during score update:', error);
        throw error;
    }
}

/**
 * Display detailed update results
 */
export async function displayUpdateResults(): Promise<void> {
    console.log('🔄 Updating scores based on rewards for week 28, year 2025...\n');

    const results = await updateScoresFromRewards();

    console.log('\n📊 UPDATE SUMMARY:');
    console.log('='.repeat(80));
    console.log(`👥 Total Users Processed: ${results.totalUsers}`);
    console.log(`✅ Updated Users: ${results.updatedUsers}`);
    console.log(`⏭️  Skipped Users (no change): ${results.skippedUsers}`);
    console.log(
        `📈 Total Score Difference: ${results.totalScoreDifference.toLocaleString()} points`
    );
    console.log(
        `📊 Average Score Difference: ${Math.round(results.averageScoreDifference)} points`
    );

    console.log('\n📋 UPDATE BREAKDOWN:');
    console.log(`   🎯 Perfect Matches (no change): ${results.summary.perfectMatches} users`);
    console.log(`   📈 Score Increased: ${results.summary.scoreIncreased} users`);
    console.log(`   📉 Score Decreased: ${results.summary.scoreDecreased} users`);
    console.log(`   ❌ Errors: ${results.summary.errors} users`);

    if (results.updatedUsers > 0) {
        console.log('\n🔄 DETAILED UPDATES:');
        console.log('='.repeat(80));

        // Sort by absolute score difference (largest first)
        const sortedUpdates = results.results
            .filter((r: UpdateResult) => r.updated)
            .sort(
                (a: UpdateResult, b: UpdateResult) =>
                    Math.abs(b.scoreDifference) - Math.abs(a.scoreDifference)
            );

        sortedUpdates.slice(0, 20).forEach((update: UpdateResult, index: number) => {
            console.log(`\n${index + 1}. User: ${update.userId}`);
            console.log(`   Old Score: ${update.oldScore.toLocaleString()}`);
            console.log(`   New Score: ${update.newScore.toLocaleString()}`);
            console.log(
                `   Difference: ${update.scoreDifference > 0 ? '+' : ''}${update.scoreDifference.toLocaleString()} points`
            );
            console.log(`   Reward Count: ${update.rewardCount}`);
            console.log(`   Reward Types: ${update.rewardTypes.join(', ') || 'None'}`);
        });

        if (sortedUpdates.length > 20) {
            console.log(`\n... and ${sortedUpdates.length - 20} more updates`);
        }

        // Show top increases and decreases
        const topIncreases = sortedUpdates
            .filter((u: UpdateResult) => u.scoreDifference > 0)
            .slice(0, 5);
        const topDecreases = sortedUpdates
            .filter((u: UpdateResult) => u.scoreDifference < 0)
            .slice(0, 5);

        if (topIncreases.length > 0) {
            console.log('\n📈 TOP 5 SCORE INCREASES:');
            topIncreases.forEach((update: UpdateResult, index: number) => {
                console.log(
                    `   ${index + 1}. User ${update.userId}: +${update.scoreDifference.toLocaleString()} points`
                );
            });
        }

        if (topDecreases.length > 0) {
            console.log('\n📉 TOP 5 SCORE DECREASES:');
            topDecreases.forEach((update: UpdateResult, index: number) => {
                console.log(
                    `   ${index + 1}. User ${update.userId}: ${update.scoreDifference.toLocaleString()} points`
                );
            });
        }
    } else {
        console.log('\n🎉 NO UPDATES NEEDED - ALL SCORES ARE ALREADY CORRECT!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Score update completed!');
}
