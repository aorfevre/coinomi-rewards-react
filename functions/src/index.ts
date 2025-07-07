import './config/firebase'; // Import this first to ensure Firebase is initialized
import { getCustomToken } from './auth';
import { claimDailyReward, onRewardCreated, checkRewardsMissingWeekNumber } from './rewards';
import {
    analyzeRewardsForMigration,
    previewMigrationUpdates,
    executeMigrationUpdates,
} from './migrateRewardsData';
import { getLeaderboard, getUserRank } from './scores';
import { telegramWebhook } from './telegramBot';
import {
    getUserReferralCode,
    getCountReferrals,
    processReferral,
    updateReferralCode,
    onReferralUpdate,
} from './referrals';
import { verifyScoresVsRewards, displayVerificationResults } from './verifyScoresVsRewards';
import { updateScoresFromRewards, displayUpdateResults } from './updateScoresFromRewards';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { createPayout } from './payouts';
import { generateFakeScores } from './scores';
import { createBatches, updateBatchStatus } from './batches';
import { scrapKoalaTweets, scheduledScrapeKoalaTweets } from './twitter_scraper';
import { generateTwitterAuthUrl, twitterAuthCallback, disconnectTwitter } from './twitter_auth';
import { likeTweet, retweetTweet, skipTweet, followKoalaWallet } from './twitter_actions';
import { getKPIStats } from './getKPIStats';

// Export the functions
export {
    claimDailyReward,
    getCustomToken,
    getLeaderboard,
    getUserRank,
    onRewardCreated,
    telegramWebhook,
    getUserReferralCode,
    getCountReferrals,
    processReferral,
    updateReferralCode,
    onReferralUpdate,
    createBatches,
    updateBatchStatus,
    scrapKoalaTweets,
    scheduledScrapeKoalaTweets,
    generateTwitterAuthUrl,
    twitterAuthCallback,
    likeTweet,
    retweetTweet,
    skipTweet,
    followKoalaWallet,
    disconnectTwitter,
    getKPIStats,
    checkRewardsMissingWeekNumber,
    analyzeRewardsForMigration,
    previewMigrationUpdates,
    executeMigrationUpdates,
    verifyScoresVsRewards,
    displayVerificationResults,
    updateScoresFromRewards,
    displayUpdateResults,
};

setTimeout(() => {
    // executeMigrationUpdates();
    // verifyScoresVsRewards();
    // updateScoresFromRewards();
}, 5000);

export const recordPayout = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        return await createPayout(data);
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to record payout');
    }
});

export const createFakeScores = functions.https.onCall(async data => {
    try {
        return await generateFakeScores(data);
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to generate fake scores');
    }
});

export const displayVerificationResultsCallable = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        // Capture console output
        const originalLog = console.log;
        const logs: string[] = [];

        console.log = (...args: any[]) => {
            logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        await displayVerificationResults();

        // Restore original console.log
        console.log = originalLog;

        return {
            success: true,
            logs: logs.join('\n'),
            message: 'Verification completed successfully',
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to display verification results');
    }
});

export const verifyScoresVsRewardsHttp = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only GET requests are supported',
        });
        return;
    }

    try {
        console.log('🔍 HTTP request received for scores vs rewards verification...');

        const results = await verifyScoresVsRewards();

        // Return structured JSON response
        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            weekNumber: 28,
            yearNumber: 2025,
            summary: {
                totalUsers: results.totalUsers,
                matchingUsers: results.matchingUsers,
                mismatchedUsers: results.mismatchedUsers,
                totalDiscrepancy: results.totalDiscrepancy,
                averageDiscrepancy: Math.round(results.averageDiscrepancy),
                breakdown: results.summary,
            },
            errors: results.errors.slice(0, 50).map(error => ({
                ...error,
                oldScore: error.scorePoints,
                newScore: error.rewardsSum,
                scoreDifference: error.scorePoints - error.rewardsSum,
                oldScoreData: error.oldScoreData,
                rewardsData: error.rewardsData,
                detailedRewards:
                    error.rewardsData?.map(reward => ({
                        type: reward.type,
                        points: reward.points,
                        weekNumber: reward.weekNumber,
                        yearNumber: reward.yearNumber,
                        userId: reward.userId,
                    })) || [],
            })),
            topDiscrepancies: results.errors
                .sort((a, b) => b.difference - a.difference)
                .slice(0, 10)
                .map(error => ({
                    userId: error.userId,
                    difference: error.difference,
                    oldScore: error.scorePoints,
                    newScore: error.rewardsSum,
                    scoreDifference: error.scorePoints - error.rewardsSum,
                    rewardCount: error.rewardCount,
                    oldScoreData: error.oldScoreData,
                    detailedRewards:
                        error.rewardsData?.map(reward => ({
                            type: reward.type,
                            points: reward.points,
                            weekNumber: reward.weekNumber,
                            yearNumber: reward.yearNumber,
                            userId: reward.userId,
                        })) || [],
                })),
            message: 'Verification completed successfully',
        });
    } catch (error) {
        console.error('❌ Error in HTTP verification endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});

export const updateScoresFromRewardsHttp = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Only allow POST requests for safety
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
            message: 'Only POST requests are supported for score updates',
        });
        return;
    }

    try {
        console.log('🔄 HTTP request received for score update...');

        const results = await updateScoresFromRewards();

        // Return structured JSON response
        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            weekNumber: 28,
            yearNumber: 2025,
            summary: {
                totalUsers: results.totalUsers,
                updatedUsers: results.updatedUsers,
                skippedUsers: results.skippedUsers,
                totalScoreDifference: results.totalScoreDifference,
                averageScoreDifference: Math.round(results.averageScoreDifference),
                breakdown: results.summary,
            },
            updates: results.results
                .filter(r => r.updated)
                .slice(0, 50)
                .map(update => ({
                    userId: update.userId,
                    oldScore: update.oldScore,
                    newScore: update.newScore,
                    scoreDifference: update.scoreDifference,
                    rewardCount: update.rewardCount,
                    rewardTypes: update.rewardTypes,
                })),
            topChanges: results.results
                .filter(r => r.updated)
                .sort((a, b) => Math.abs(b.scoreDifference) - Math.abs(a.scoreDifference))
                .slice(0, 10)
                .map(update => ({
                    userId: update.userId,
                    oldScore: update.oldScore,
                    newScore: update.newScore,
                    scoreDifference: update.scoreDifference,
                    rewardCount: update.rewardCount,
                })),
            message: 'Score update completed successfully',
        });
    } catch (error) {
        console.error('❌ Error in HTTP score update endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});

interface TwitterRewardPayload {
    telegramId: string;
    walletAddress: string;
    campaign: string;
    tweetUrl: string;
    taskType: string;
    rewardAmount: string;
    timestamp?: string;
}

export const twitterRewardWebhook = functions.https.onRequest(async (req, res) => {
    // Check if method is POST
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        // Validate request body
        const payload = req.body as TwitterRewardPayload;
        const { telegramId, walletAddress, campaign, tweetUrl, taskType, timestamp, rewardAmount } =
            payload;

        // Basic validation
        if (!telegramId || !walletAddress || !campaign || !tweetUrl || !taskType || !rewardAmount) {
            res.status(400).json({
                error: 'Missing required fields',
                required: [
                    'telegramId',
                    'walletAddress',
                    'campaign',
                    'tweetUrl',
                    'taskType',
                    'rewardAmount',
                ],
            });
            return;
        }

        // Validate wallet address format
        if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            res.status(400).json({ error: 'Invalid wallet address format' });
            return;
        }

        const now = new Date();
        // Create reward record
        const rewardData = {
            telegramId,
            walletAddress,
            campaign,
            tweetUrl,
            taskType,
            timestamp: timestamp || now.toISOString(),
            rewardAmount,
            status: 'pending' as const,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Store in Firestore
        const docRef = await admin.firestore().collection('twitterRewards').add(rewardData);

        // Return success response
        res.status(200).json({
            success: true,
            rewardId: docRef.id,
            message: 'Twitter reward recorded successfully',
        });
    } catch (error) {
        console.error('Error processing twitter reward:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
