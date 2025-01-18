import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useScore = userId => {
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('useScore - Subscribing to score updates for userId:', userId);
        if (!userId) {
            console.log('useScore - No userId provided');
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(
            userRef,
            doc => {
                const userData = doc.data();
                console.log('useScore - Received user data:', userData);
                setScore(userData?.points || 0);
                setLoading(false);
            },
            err => {
                console.error('useScore - Error fetching score:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            console.log('useScore - Unsubscribing from score updates');
            unsubscribe();
        };
    }, [userId]);

    return { score, loading, error };
};
