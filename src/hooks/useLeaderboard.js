import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const useLeaderboard = (limit = 10) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const getLeaderboard = httpsCallable(functions, 'getLeaderboard');
                const result = await getLeaderboard({ limit });
                console.log('Leaderboard data:', result.data); // Debug log
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
    }, [limit]);

    return { leaderboard, loading, error };
};
