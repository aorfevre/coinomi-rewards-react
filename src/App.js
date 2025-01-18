import { useAuth } from './hooks/useAuth';
import { useScore } from './hooks/useScore';
import { useUserRank } from './hooks/useUserRank';
import './App.css';
import { DailyReward } from './components/DailyReward';
import { Leaderboard } from './components/Leaderboard';

function App() {
    // Get token from query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    const { user, loading: authLoading, error: authError } = useAuth(token || undefined);
    const { score, loading: scoreLoading } = useScore(user?.uid);
    const { rank, totalPlayers, loading: rankLoading } = useUserRank(user?.uid);

    if (authLoading) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Loading...</h1>
                </header>
            </div>
        );
    }

    if (authError || !token) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Authentication Required</h1>
                    <div className="error-message">
                        {authError
                            ? authError.message
                            : 'Please provide a valid authentication token in the URL'}
                    </div>
                </header>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Coinomi Rewards</h1>

                <div className="points-container">
                    <h2>Your Points: {scoreLoading ? '...' : score}</h2>
                    {!rankLoading && rank && (
                        <div className="rank-info">
                            Rank: #{rank} of {totalPlayers}
                        </div>
                    )}
                </div>

                <DailyReward />
            </header>
            <main>
                <Leaderboard />
            </main>
        </div>
    );
}

export default App;
