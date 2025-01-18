/**
 * @typedef {Object} User
 * @property {Date|null} lastClaim - The timestamp of user's last claim
 * @property {number} totalPoints - Total points accumulated by the user
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} userId - The unique identifier of the user
 * @property {number} points - Total points accumulated
 * @property {number} tasksCompleted - Number of tasks completed
 * @property {number} multiplier - Current point multiplier
 */

/**
 * @typedef {Object} RankData
 * @property {number|null} rank - User's current rank
 * @property {number} totalPlayers - Total number of players
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error state if any
 */

/**
 * @typedef {Object} RewardData
 * @property {string} userId - The user ID
 * @property {string} timestamp - Timestamp of the reward
 * @property {string} type - Type of reward (e.g., 'daily')
 */ 