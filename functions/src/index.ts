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
import { createPayout } from './payouts';
import { generateFakeScores } from './scores';

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

export const createFakeScores = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        return await generateFakeScores(data);
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to generate fake scores');
    }
});
