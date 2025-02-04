import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTokenPayout } from './useTokenPayout';
import { useWeb3 } from './useWeb3';

export const useBatches = ({ weekNumber, yearNumber }) => {
    const [batches, setBatches] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { checkAllowance } = useTokenPayout();
    const { account } = useWeb3();

    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            setError(null);
            try {
                const batchesRef = collection(db, 'batches');
                const q = query(
                    batchesRef,
                    where('weekNumber', '==', weekNumber),
                    where('yearNumber', '==', yearNumber),
                    orderBy('timestamp', 'desc')
                );

                const snapshot = await getDocs(q);
                const batchesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Group by payoutId and sort by batch number
                const groupedBatches = batchesData.reduce((acc, batch) => {
                    if (!acc[batch.payoutId]) {
                        acc[batch.payoutId] = [];
                    }
                    acc[batch.payoutId].push(batch);
                    return acc;
                }, {});

                // Sort batches within each payoutId
                Object.values(groupedBatches).forEach(payoutBatches => {
                    payoutBatches.sort((a, b) => a.number - b.number);
                });

                // For each payout, check allowance
                if (account) {
                    for (const payoutId in groupedBatches) {
                        const payoutBatches = groupedBatches[payoutId];
                        if (payoutBatches.length > 0) {
                            const firstBatch = payoutBatches[0];
                            const tokenAddress = firstBatch.token?.address;
                            const totalTokens = firstBatch.totalTokens;

                            if (tokenAddress && totalTokens) {
                                const hasAllowance = await checkAllowance(
                                    tokenAddress,
                                    account,
                                    totalTokens
                                );
                                // Add allowance status to the payout data
                                payoutBatches.forEach(batch => {
                                    batch.hasAllowance = hasAllowance;
                                });
                            }
                        }
                    }
                }

                setBatches(groupedBatches);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching batches:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (weekNumber && yearNumber) {
            fetchBatches();
        }
    }, [weekNumber, yearNumber, account, checkAllowance]);

    return { batches, loading, error };
};
