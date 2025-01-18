import { initializeApp } from 'firebase-admin/app';
import { getCustomToken } from './auth';
import { claimDailyReward, onRewardCreated } from './rewards';

// Export the functions
export { getCustomToken, claimDailyReward, onRewardCreated }; 