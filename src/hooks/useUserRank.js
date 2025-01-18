import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useUserRank = userId => {
    const [rank, setRank] = useState(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('useUserRank - Starting rank calculation for userId:', userId);
        if (!userId) {
            console.log('useUserRank - No userId provided');
            setLoading(false);
            return;
        }

        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('points', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                console.log('useUserRank - Received users snapshot');
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log('useUserRank - Total users:', users.length);
                setTotalPlayers(users.length);

                const userIndex = users.findIndex(user => user.id === userId);
                console.log('useUserRank - User index in leaderboard:', userIndex);

                if (userIndex !== -1) {
                    setRank(userIndex + 1);
                } else {
                    console.log('useUserRank - User not found in leaderboard');
                    setRank(null);
                }
                setLoading(false);
            },
            err => {
                console.error('useUserRank - Error calculating rank:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            console.log('useUserRank - Unsubscribing from users updates');
            unsubscribe();
        };
    }, [userId]);

    return { rank, totalPlayers, loading, error };
};
