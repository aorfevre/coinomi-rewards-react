import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useBatches = ({ weekNumber, yearNumber }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setLoading(true);
                setError(null);

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

                setBatches(groupedBatches);
            } catch (error) {
                console.error('Error fetching batches:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (weekNumber && yearNumber) {
            fetchBatches();
        }
    }, [weekNumber, yearNumber]);

    return {
        batches,
        loading,
        error,
    };
};
