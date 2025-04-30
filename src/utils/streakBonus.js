// Utility to calculate streak bonus
export function getStreakBonus(currentStreak) {
    if (!currentStreak || currentStreak < 1) return 0;
    return currentStreak >= 5 ? 0.2 : currentStreak * 0.02;
}
