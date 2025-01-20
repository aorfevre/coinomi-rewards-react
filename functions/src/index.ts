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
