import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useRewardHistory = userId => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            console.log('useRewardHistory - No userId provided');
            setLoading(false);
            return;
        }

        console.log('useRewardHistory - Starting subscription for userId:', userId);
        setLoading(true);

        const rewardsRef = collection(db, 'rewards');
        const q = query(rewardsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                try {
                    const rewardsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp,
                    }));

                    console.log('useRewardHistory - Rewards fetched:', rewardsList.length);
                    setRewards(rewardsList);
                    setLoading(false);
                } catch (err) {
                    console.error('useRewardHistory - Error processing rewards:', err);
                    setError(err);
                    setLoading(false);
                }
            },
            error => {
                console.error('useRewardHistory - Subscription error:', error);
                setError(error);
                setLoading(false);
            }
        );

        return () => {
            console.log('useRewardHistory - Cleaning up subscription');
            unsubscribe();
        };
    }, [userId]);

    return {
        rewards,
        loading,
        error,
    };
};
