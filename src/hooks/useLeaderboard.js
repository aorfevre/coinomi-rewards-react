import { useState, useEffect, useCallback } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';

export const useLeaderboard = (limit, weekNumber, yearNumber) => {
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const functions = getFunctions();
            const getLeaderboardFn = httpsCallable(functions, 'getLeaderboard');
            const result = await getLeaderboardFn({ limit, week: weekNumber, year: yearNumber });
            setLeaderboard(result.data.leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setError(error);
            setLeaderboard([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }, [limit, weekNumber, yearNumber]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return {
        leaderboard,
        loading,
        error,
        refetch: fetchLeaderboard,
    };
};
