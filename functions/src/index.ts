import { getCustomToken } from './auth';
import { claimDailyReward, onRewardCreated } from './rewards';
import { getLeaderboard, getUserRank } from './scores';
import { fireworks } from './fireworks';

// Export the functions
export {
    claimDailyReward,
    getCustomToken,
    getLeaderboard,
    getUserRank,
    onRewardCreated,
    fireworks,
};
