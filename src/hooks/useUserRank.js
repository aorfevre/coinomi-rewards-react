import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const useUserRank = userId => {
    const [rank, setRank] = useState(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchRank = async () => {
            try {
                const getRank = httpsCallable(functions, 'getUserRank');
                const result = await getRank({ userId });
                const { rank, totalPlayers } = result.data;

                setRank(rank);
                setTotalPlayers(totalPlayers);
            } catch (err) {
                console.error('❌ Error fetching rank:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRank();
    }, [userId]);

    return { rank, totalPlayers, loading, error };
};
