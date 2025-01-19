import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { db, functions } from '../config/firebase';

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
                console.error('❌ Error fetching last claim:', err);
            }
        };

        fetchLastClaim();
    }, [userId]);

    const claimDailyReward = async () => {
        if (!userId) {
            throw new Error('User ID is required to claim reward');
        }

        try {
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

            const claimDailyReward = httpsCallable(functions, 'claimDailyReward');
            const result = await claimDailyReward({ userId });
            const data = result.data;

            await setLastClaim(new Date(data.timestamp));

            return data;
        } catch (err) {
            console.error('❌ Error claiming daily reward:', err);
            setError(err instanceof Error ? err : new Error('Failed to claim reward'));
            throw err;
        } finally {
            console.log('⏳ Setting loading to false');
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
