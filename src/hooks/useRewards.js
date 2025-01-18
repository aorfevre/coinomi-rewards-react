import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5001/coinomi-rewards/us-central1';

export const useRewards = userId => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastClaim, setLastClaim] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchLastClaim = async () => {
            try {
                const rewardsRef = collection(db, 'rewards');
                const lastClaimQuery = query(
                    rewardsRef,
                    where('userId', '==', userId),
                    where('type', '==', 'daily'),
                    orderBy('timestamp', 'desc'),
                    limit(1)
                );

                const querySnapshot = await getDocs(lastClaimQuery);
                if (!querySnapshot.empty) {
                    const lastClaimData = querySnapshot.docs[0].data();
                    setLastClaim(new Date(lastClaimData.timestamp));
                }
            } catch (err) {
                console.error('Error fetching last claim:', err);
            }
        };

        fetchLastClaim();
    }, [userId]);

    const claimDailyReward = async userId => {
        try {
            console.log('Claiming daily reward for user:', userId);
            setLoading(true);
            setError(null);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const rewardsRef = collection(db, 'rewards');
            const recentClaimQuery = query(
                rewardsRef,
                where('userId', '==', userId),
                where('type', '==', 'daily'),
                where('timestamp', '>=', today),
                orderBy('timestamp', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(recentClaimQuery);
            if (!querySnapshot.empty) {
                throw new Error('Daily reward already claimed today');
            }

            const response = await fetch(`${API_URL}/claimDailyReward`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to claim daily reward');
            }

            const data = await response.json();
            await setLastClaim(new Date(data.timestamp));
            console.log('Daily reward claimed successfully:', data);

            return data;
        } catch (err) {
            console.error('Error claiming daily reward:', err);
            setError(err instanceof Error ? err : new Error('Failed to claim reward'));
            throw err;
        } finally {
            console.log('Setting loading to false');
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        claimDailyReward,
        lastClaim,
    };
};
