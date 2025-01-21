/**
 * Calculates the total multiplier based on user's bonuses
 * @param {Object} userData - User data containing bonus flags
 * @param {number} currentStreak - Current streak count
 * @param {Function} t - Translation function
 * @returns {Object} Total multiplier and breakdown
 */
export const calculateMultiplier = (userData, scoreDoc, t) => {
    const baseMultiplier = 1;
    const telegramBonus = userData?.telegramConnected ? 0.1 : 0; // 10% bonus
    const emailBonus = userData?.emailConnected ? 0.1 : 0; // 10% bonus
    const lastClaimDate = scoreDoc?.lastTaskTimestamp;
    // Calculate if streak is still active (within 24 hours of last claim)
    const isStreakActive =
        lastClaimDate &&
        new Date().getTime() - new Date(lastClaimDate).getTime() <
            2 * Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) * 1000;

    if (!isStreakActive) {
        scoreDoc.currentStreak = 0;
    }

    const streakBonus = Math.min(scoreDoc.currentStreak * 0.02, 0.1); // 2% per day, max 10%

    const totalMultiplier = baseMultiplier + telegramBonus + emailBonus + streakBonus;

    const breakdown = {
        base: baseMultiplier,
        telegram: telegramBonus,
        email: emailBonus,
        streak: streakBonus,
    };

    // Create tooltip text showing multiplier breakdown
    const breakdownText = [
        `${t('baseMultiplier')}: ${breakdown.base}x`,
        userData?.telegramConnected && `${t('telegramBonus')}: +${breakdown.telegram * 100}%`,
        userData?.emailConnected && `${t('emailBonus')}: +${breakdown.email * 100}%`,
        breakdown.streak > 0 && `${t('streakBonus')}: +${breakdown.streak * 100}%`,
    ]
        .filter(Boolean)
        .join('\n');

    return {
        total: totalMultiplier,
        breakdown,
        breakdownText,
    };
};
