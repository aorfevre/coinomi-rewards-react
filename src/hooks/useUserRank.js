import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useUserRank = userId => {
    const [rank, setRank] = useState(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Query all scores ordered by points in descending order
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef);

        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                try {
                    const scores = snapshot.docs.map(doc => ({
                        userId: doc.data().userId,
                        points: doc.data().points || 0,
                    }));

                    // Sort by points in descending order
                    scores.sort((a, b) => b.points - a.points);

                    // Find user's rank (1-based index)
                    const userRank = scores.findIndex(score => score.userId === userId) + 1;

                    setRank(userRank || null);
                    setTotalPlayers(scores.length);
                    setLoading(false);
                } catch (err) {
                    console.error('useUserRank - Error calculating rank:', err);
                    setError(err);
                    setLoading(false);
                }
            },
            error => {
                console.error('useUserRank - Error:', error);
                setError(error);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [userId]);

    return {
        rank,
        totalPlayers,
        loading,
        error,
    };
};
