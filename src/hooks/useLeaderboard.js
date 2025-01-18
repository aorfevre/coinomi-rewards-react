import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useLeaderboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const scoresRef = collection(db, 'scores');
        const leaderboardQuery = query(scoresRef, orderBy('points', 'desc'), limit(10));

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            leaderboardQuery,
            snapshot => {
                const leaderboardData = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    userId: doc.id,
                }));
                setLeaders(leaderboardData);
                setLoading(false);
            },
            err => {
                console.error('Error fetching leaderboard:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch leaderboard'));
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { leaders, loading, error };
} 