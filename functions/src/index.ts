import './config/firebase'; // Import this first to ensure Firebase is initialized
import { getCustomToken } from './auth';
import { claimDailyReward, onRewardCreated } from './rewards';
import { getLeaderboard, getUserRank } from './scores';
import { telegramWebhook } from './telegramBot';
import {
    getUserReferralCode,
    getCountReferrals,
    processReferral,
    updateReferralCode,
    onReferralUpdate,
} from './referrals';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { createPayout } from './payouts';
import { generateFakeScores } from './scores';
import { createBatches, updateBatchStatus } from './batches';
import { scrapKoalaTweets, scheduledScrapeKoalaTweets } from './twitter_scraper';
import { generateTwitterAuthUrl, twitterAuthCallback, disconnectTwitter } from './twitter_auth';
import {
    likeTweet,
    retweetTweet,
    skipTweet,
    followKoalaWallet,
    followPartnerWallet,
    visitPartnerWebsite,
} from './twitter_actions';

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
    followPartnerWallet,
    disconnectTwitter,
    visitPartnerWebsite,
};

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
