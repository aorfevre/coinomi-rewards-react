import { useState, useEffect } from 'react';
import { calculateTimeLeft, formatTime } from '../utils/time';
import { useRewards } from '../hooks/useRewards';
import { useAuth } from '../hooks/useAuth';

const CLAIM_COOLDOWN = 24 * 60 * 60; // 24 hours in seconds

export function DailyReward() {
    const { user } = useAuth();
    const { loading, error, claimDailyReward, lastClaim } = useRewards(user?.uid);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!lastClaim) return;

        const timer = setInterval(() => {
            const timeRemaining = calculateTimeLeft(lastClaim, CLAIM_COOLDOWN);
            setTimeLeft(timeRemaining);
        }, 1000);

        return () => clearInterval(timer);
    }, [lastClaim]);

    const handleClaim = async () => {
        if (timeLeft > 0 || !user) return;
        await claimDailyReward(user.uid);
    };

    return (
        <div className="claim-container">
            <div className="countdown">{formatTime(timeLeft)}</div>
            <button
                onClick={handleClaim}
                disabled={timeLeft > 0 || loading || !user}
                className={`claim-button ${timeLeft > 0 || !user ? 'disabled' : ''}`}
            >
                {loading ? 'Claiming...' : 'Claim Daily Reward'}
            </button>
            {error && <div className="error-message">{error.message}</div>}
        </div>
    );
}
