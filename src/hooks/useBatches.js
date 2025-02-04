import { useState, useEffect, useCallback } from 'react';
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

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching batches with params:', {
                weekNumber,
                yearNumber,
                weekNumberType: typeof weekNumber,
                yearNumberType: typeof yearNumber,
            });

            const batchesRef = collection(db, 'batches');
            const q = query(
                batchesRef,
                where('weekNumber', '==', Number(weekNumber)),
                where('yearNumber', '==', Number(yearNumber)),
                orderBy('number', 'asc')
            );

            const snapshot = await getDocs(q);
            console.log('Found batches:', {
                totalDocs: snapshot.size,
                docs: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })),
            });

            const batchesData = {};

            snapshot.forEach(doc => {
                const batch = { id: doc.id, ...doc.data() };
                console.log('Processing batch:', batch);
                if (!batchesData[batch.payoutId]) {
                    batchesData[batch.payoutId] = [];
                }
                batchesData[batch.payoutId].push(batch);
            });

            console.log('Grouped batches:', batchesData);

            // Sort batches within each payoutId
            for (const payoutId in batchesData) {
                batchesData[payoutId].sort((a, b) => a.number - b.number);
            }

            // Check allowance for each payout if account is connected
            if (account) {
                for (const payoutId in batchesData) {
                    const payoutBatches = batchesData[payoutId];
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
                            // Add allowance status to all batches in this payout
                            payoutBatches.forEach(batch => {
                                batch.hasAllowance = hasAllowance;
                            });
                        }
                    }
                }
            }

            setBatches(batchesData);
            setError(null);
        } catch (err) {
            console.error('Error fetching batches:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [weekNumber, yearNumber, account, checkAllowance]);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    return { batches, loading, error, refetch: fetchBatches };
};
