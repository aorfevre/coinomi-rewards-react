import { getCustomToken } from './auth';
import { claimDailyReward, onRewardCreated } from './rewards';
import { getLeaderboard, getUserRank } from './scores';
import { telegramWebhook } from './telegramBot';

// Export the functions
export {
    claimDailyReward,
    getCustomToken,
    getLeaderboard,
    getUserRank,
    onRewardCreated,
    telegramWebhook,
};
