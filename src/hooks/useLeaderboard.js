import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const useLeaderboard = (limit = 10, week = null, year = null) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            // Don't fetch if limit is 0
            if (limit === 0) {
                setLoading(false);
                setLeaderboard([]);
                return;
            }

            try {
                const getLeaderboard = httpsCallable(functions, 'getLeaderboard');
                const result = await getLeaderboard({ limit, week, year });
                setLeaderboard(result.data.leaderboard || []);
            } catch (err) {
                console.error('❌ Error fetching leaderboard:', err);
                setError(err);
                setLeaderboard([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [limit, week, year]); // Add week and year to dependencies

    return { leaderboard, loading, error };
};
