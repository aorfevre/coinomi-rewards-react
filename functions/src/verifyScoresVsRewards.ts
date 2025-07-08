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

interface VerificationResult {
    userId: string;
    scorePoints: number;
    rewardsSum: number;
    difference: number;
    rewardCount: number;
    rewardTypes: string[];
    isMatch: boolean;
    oldScoreData?: ScoreData;
    rewardsData?: RewardData[];
    scoreDifference?: number;
    oldScore?: number;
    newScore?: number;
}

interface VerificationSummary {
    totalUsers: number;
    matchingUsers: number;
    mismatchedUsers: number;
    totalDiscrepancy: number;
    averageDiscrepancy: number;
    errors: VerificationResult[];
    summary: {
        perfectMatches: number;
        smallDiscrepancies: number; // 1-10 points
        mediumDiscrepancies: number; // 11-50 points
        largeDiscrepancies: number; // 51+ points
        missingRewards: number; // score exists but no rewards
        missingScores: number; // rewards exist but no score
    };
}

/**
 * Verify that scores match the sum of rewards for week 28, year 2025
 */
export async function verifyScoresVsRewards(): Promise<VerificationSummary> {
    console.log('🔍 Starting verification of scores vs rewards for week 28, year 2025...\n');

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
        const scoresMap = new Map<string, ScoreData>();
        const rewardsByUser = new Map<string, RewardData[]>();

        // Process scores
        scoresSnapshot.docs.forEach(doc => {
            const scoreData = doc.data() as ScoreData;
            scoresMap.set(scoreData.userId, scoreData);
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

        // Verify each user
        const results: VerificationResult[] = [];
        const allUserIds = new Set([...scoresMap.keys(), ...rewardsByUser.keys()]);

        console.log(`\n🔍 Verifying ${allUserIds.size} unique users...`);

        allUserIds.forEach(userId => {
            const scoreData = scoresMap.get(userId);
            const userRewards = rewardsByUser.get(userId) || [];

            if (scoreData && userRewards.length > 0) {
                // User has both score and rewards - verify they match
                const scorePoints = scoreData.points || 0;
                const rewardsSum = userRewards.reduce(
                    (sum, reward) => sum + (reward.points || 0),
                    0
                );
                const difference = Math.abs(scorePoints - rewardsSum);
                const isMatch = difference === 0;

                const result: VerificationResult = {
                    userId,
                    scorePoints,
                    rewardsSum,
                    difference,
                    rewardCount: userRewards.length,
                    rewardTypes: [...new Set(userRewards.map(r => r.type))],
                    isMatch,
                    oldScoreData: scoreData,
                    rewardsData: userRewards,
                    scoreDifference: scorePoints - rewardsSum,
                    oldScore: scorePoints,
                    newScore: rewardsSum,
                };

                results.push(result);
            } else if (scoreData && userRewards.length === 0) {
                // User has score but no rewards
                const result: VerificationResult = {
                    userId,
                    scorePoints: scoreData.points || 0,
                    rewardsSum: 0,
                    difference: scoreData.points || 0,
                    rewardCount: 0,
                    rewardTypes: [],
                    isMatch: false,
                    oldScoreData: scoreData,
                    rewardsData: [],
                    scoreDifference: scoreData.points || 0,
                    oldScore: scoreData.points || 0,
                    newScore: 0,
                };

                results.push(result);
            } else if (!scoreData && userRewards.length > 0) {
                // User has rewards but no score
                const rewardsSum = userRewards.reduce(
                    (sum, reward) => sum + (reward.points || 0),
                    0
                );
                const result: VerificationResult = {
                    userId,
                    scorePoints: 0,
                    rewardsSum,
                    difference: rewardsSum,
                    rewardCount: userRewards.length,
                    rewardTypes: [...new Set(userRewards.map(r => r.type))],
                    isMatch: false,
                    oldScoreData: undefined,
                    rewardsData: userRewards,
                    scoreDifference: -rewardsSum,
                    oldScore: 0,
                    newScore: rewardsSum,
                };

                results.push(result);
            }
        });

        // Calculate summary statistics
        const matchingUsers = results.filter(r => r.isMatch).length;
        const mismatchedUsers = results.filter(r => !r.isMatch).length;
        const totalDiscrepancy = results.reduce((sum, r) => sum + r.difference, 0);
        const averageDiscrepancy = mismatchedUsers > 0 ? totalDiscrepancy / mismatchedUsers : 0;

        const errors = results.filter(r => !r.isMatch);

        const summary = {
            perfectMatches: matchingUsers,
            smallDiscrepancies: errors.filter(r => r.difference <= 10).length,
            mediumDiscrepancies: errors.filter(r => r.difference > 10 && r.difference <= 50).length,
            largeDiscrepancies: errors.filter(r => r.difference > 50).length,
            missingRewards: errors.filter(r => r.rewardCount === 0 && r.scorePoints > 0).length,
            missingScores: errors.filter(r => r.scorePoints === 0 && r.rewardCount > 0).length,
        };

        const verificationSummary: VerificationSummary = {
            totalUsers: results.length,
            matchingUsers,
            mismatchedUsers,
            totalDiscrepancy,
            averageDiscrepancy,
            errors,
            summary,
        };

        return verificationSummary;
    } catch (error) {
        console.error('❌ Error during verification:', error);
        throw error;
    }
}

/**
 * Display detailed verification results
 */
export async function displayVerificationResults(): Promise<void> {
    console.log('🔍 Verifying scores vs rewards for week 28, year 2025...\n');

    const results = await verifyScoresVsRewards();

    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log('='.repeat(80));
    console.log(`👥 Total Users Analyzed: ${results.totalUsers}`);
    console.log(`✅ Perfect Matches: ${results.matchingUsers}`);
    console.log(`❌ Mismatches: ${results.mismatchedUsers}`);
    console.log(`📈 Total Discrepancy: ${results.totalDiscrepancy.toLocaleString()} points`);
    console.log(`📊 Average Discrepancy: ${Math.round(results.averageDiscrepancy)} points`);

    console.log('\n📋 DISCREPANCY BREAKDOWN:');
    console.log(`   🎯 Perfect Matches: ${results.summary.perfectMatches} users`);
    console.log(
        `   ⚠️  Small Discrepancies (1-10 points): ${results.summary.smallDiscrepancies} users`
    );
    console.log(
        `   ⚠️  Medium Discrepancies (11-50 points): ${results.summary.mediumDiscrepancies} users`
    );
    console.log(
        `   🚨 Large Discrepancies (51+ points): ${results.summary.largeDiscrepancies} users`
    );
    console.log(
        `   ❌ Missing Rewards (score but no rewards): ${results.summary.missingRewards} users`
    );
    console.log(
        `   ❌ Missing Scores (rewards but no score): ${results.summary.missingScores} users`
    );

    if (results.errors.length > 0) {
        console.log('\n🚨 DETAILED ERRORS:');
        console.log('='.repeat(80));

        // Sort errors by discrepancy (largest first)
        const sortedErrors = results.errors.sort((a, b) => b.difference - a.difference);

        sortedErrors.slice(0, 20).forEach((error, index) => {
            console.log(`\n${index + 1}. User: ${error.userId}`);
            console.log(`   Old Score: ${error.oldScore?.toLocaleString() || 'N/A'}`);
            console.log(
                `   New Score (from rewards): ${error.newScore?.toLocaleString() || 'N/A'}`
            );
            console.log(
                `   Score Difference: ${error.scoreDifference?.toLocaleString() || 'N/A'} points`
            );
            console.log(`   Reward Count: ${error.rewardCount}`);
            console.log(`   Reward Types: ${error.rewardTypes.join(', ') || 'None'}`);

            // Show detailed score data
            if (error.oldScoreData) {
                console.log('   📊 Score Document Data:');
                console.log(
                    `      - Points: ${error.oldScoreData.points?.toLocaleString() || 'N/A'}`
                );
                console.log(`      - Week: ${error.oldScoreData.weekNumber || 'N/A'}`);
                console.log(`      - Year: ${error.oldScoreData.yearNumber || 'N/A'}`);
                console.log(`      - User ID: ${error.oldScoreData.userId || 'N/A'}`);
            } else {
                console.log('   📊 Score Document: MISSING');
            }

            // Show detailed rewards data
            if (error.rewardsData && error.rewardsData.length > 0) {
                console.log(`   🎁 Rewards Data (${error.rewardsData.length} rewards):`);
                error.rewardsData.forEach((reward, rewardIndex) => {
                    console.log(`      ${rewardIndex + 1}. Type: ${reward.type || 'N/A'}`);
                    console.log(`         - Points: ${reward.points?.toLocaleString() || 'N/A'}`);
                    console.log(`         - Week: ${reward.weekNumber || 'N/A'}`);
                    console.log(`         - Year: ${reward.yearNumber || 'N/A'}`);
                    console.log(`         - User ID: ${reward.userId || 'N/A'}`);
                });
            } else {
                console.log('   🎁 Rewards Data: NONE FOUND');
            }

            if (error.rewardCount === 0 && error.oldScore && error.oldScore > 0) {
                console.log('   🚨 ISSUE: Has score but no rewards!');
            } else if (error.oldScore === 0 && error.rewardCount > 0) {
                console.log('   🚨 ISSUE: Has rewards but no score!');
            } else {
                console.log('   🚨 ISSUE: Score and rewards do not match!');
            }
        });

        if (results.errors.length > 20) {
            console.log(`\n... and ${results.errors.length - 20} more errors`);
        }

        // Show top discrepancies
        const topDiscrepancies = sortedErrors.slice(0, 10);
        console.log('\n🏆 TOP 10 LARGEST DISCREPANCIES:');
        topDiscrepancies.forEach((error, index) => {
            console.log(
                `   ${index + 1}. User ${error.userId}: ${error.difference.toLocaleString()} points difference`
            );
        });

        // Show users with missing data
        const missingRewards = results.errors.filter(e => e.rewardCount === 0 && e.scorePoints > 0);
        const missingScores = results.errors.filter(e => e.scorePoints === 0 && e.rewardCount > 0);

        if (missingRewards.length > 0) {
            console.log('\n❌ USERS WITH SCORES BUT NO REWARDS:');
            missingRewards.slice(0, 10).forEach((error, index) => {
                console.log(
                    `   ${index + 1}. User ${error.userId}: ${error.scorePoints.toLocaleString()} points`
                );
            });
            if (missingRewards.length > 10) {
                console.log(`   ... and ${missingRewards.length - 10} more`);
            }
        }

        if (missingScores.length > 0) {
            console.log('\n❌ USERS WITH REWARDS BUT NO SCORES:');
            missingScores.slice(0, 10).forEach((error, index) => {
                console.log(
                    `   ${index + 1}. User ${error.userId}: ${error.rewardsSum.toLocaleString()} points in rewards`
                );
            });
            if (missingScores.length > 10) {
                console.log(`   ... and ${missingScores.length - 10} more`);
            }
        }
    } else {
        console.log('\n🎉 ALL USERS HAVE MATCHING SCORES AND REWARDS!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Verification completed!');
}

/**
 * Get all scores where walletAddress is undefined
 */
export async function getScoresWithoutWalletAddress(): Promise<any[]> {
    const snapshot = await db.collection('scores').get();
    const scores = snapshot.docs
        .filter(doc => !doc.data().walletAddress)
        .map(doc => ({ id: doc.id, ...doc.data() }));
    let count = 0;
    // if length is greater than 0, we shall check if there is another score that exists for that userId and weekNumber
    // if there is, we shall update the score with the walletAddress
    // if there is not, we shall delete the score
    scores.forEach(async (score: any) => {
        const userId = score.userId;
        const weekNumber = score.weekNumber;
        const yearNumber = score.yearNumber;
        const scores = await db
            .collection('scores')
            .where('userId', '==', userId)
            .where('weekNumber', '==', weekNumber)
            .where('yearNumber', '==', yearNumber)
            .get();
        if (scores.docs.length === 2) {
            count++;
            console.log('count', count);

            // delete the score with the walletAddress
            // await db.collection('scores').doc(score.id).delete();
        }
        // if (scores.empty) {
        //     await db.collection('scores').doc(score.id).delete();
        // } else {
        //     // update the score with the walletAddress
        //     await db.collection('scores').doc(score.id).update({
        //         walletAddress: scores.docs[0].data().walletAddress,
        //     });
        // }
    });
    return scores;
}
