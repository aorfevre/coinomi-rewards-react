import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useScore = (userId) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(
            doc(db, 'scores', userId),
            doc => {
                setScore(doc.exists() ? doc.data()?.points || 0 : 0);
                setLoading(false);
            },
            err => {
                console.error('Error fetching score:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch score'));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { score, loading, error };
}; 