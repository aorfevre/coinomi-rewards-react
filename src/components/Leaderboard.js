import { useLeaderboard } from '../hooks/useLeaderboard';

export function Leaderboard() {
    const { leaders, loading, error } = useLeaderboard();

    if (loading) {
        return (
            <div className="leaderboard-container">
                <div className="loading-spinner">Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-container">
                <div className="error-message">Error: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Top Players</h2>
            <div className="leaderboard-list">
                {leaders.map((entry, index) => (
                    <div
                        key={entry.userId}
                        className={`leaderboard-entry ${index < 3 ? `top-${index + 1}` : ''}`}
                    >
                        <div className="rank-container">
                            <div className="rank">{index + 1}</div>
                        </div>
                        <div className="player-info">
                            <div className="wallet-address">
                                {entry.userId.slice(0, 6)}...{entry.userId.slice(-4)}
                            </div>
                            <div className="stats">
                                <span className="tasks">🎯 {entry.tasksCompleted}</span>
                                <span className="multiplier">✨ {entry.multiplier}x</span>
                            </div>
                        </div>
                        <div className="points">{entry.points.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
} 