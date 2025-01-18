export const calculateTimeLeft = (lastClaim, cooldownPeriod) => {
    if (!lastClaim) return 0;

    const now = new Date().getTime();
    const lastClaimTime = lastClaim.getTime();
    const timeLeft = lastClaimTime + cooldownPeriod * 1000 - now;

    return Math.max(0, timeLeft);
};

export const formatTime = milliseconds => {
    if (milliseconds <= 0) return 'Ready to claim!';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
};
