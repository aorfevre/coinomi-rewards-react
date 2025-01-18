import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useScore = userId => {
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scoreDoc, setScoreDoc] = useState(null);

    useEffect(() => {
        if (!userId) {
            console.log('useScore - Waiting for authentication');
            return;
        }

        console.log('useScore - Starting subscription for userId:', userId);
        setLoading(true);

        // Query scores collection where userId matches
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, where('userId', '==', userId));

        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                if (snapshot.empty) {
                    console.log('useScore - No score found for user');
                    setScore(0);
                    setScoreDoc(null);
                } else {
                    const doc = snapshot.docs[0].data();
                    console.log('useScore - Received score data:', doc);
                    setScore(doc.points || 0);
                    setScoreDoc(doc);
                }
                setLoading(false);
            },
            error => {
                console.error('useScore - Error:', error);
                setError(error);
                setLoading(false);
            }
        );

        return () => {
            console.log('useScore - Cleaning up subscription');
            unsubscribe();
        };
    }, [userId]);

    return {
        score: userId ? score : 0,
        loading,
        error,
        scoreDoc,
    };
};
