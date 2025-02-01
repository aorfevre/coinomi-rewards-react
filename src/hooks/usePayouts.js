import { useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';

export const usePayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generatePayout = async (token, chainId) => {
        try {
            setLoading(true);
            const generatePayoutFunction = httpsCallable(functions, 'generatePayout');
            await generatePayoutFunction({ token, chainId });
            await fetchPayouts(); // Refresh the list
        } catch (err) {
            console.error('Error generating payout:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayouts = async () => {
        setLoading(true);
        setError(null);

        try {
            const payoutsRef = collection(db, 'payouts');
            const q = query(payoutsRef, orderBy('timestamp', 'desc'));

            const querySnapshot = await getDocs(q);
            const payoutData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setPayouts(payoutData);
        } catch (err) {
            console.error('Error fetching payouts:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { payouts, loading, error, fetchPayouts, generatePayout };
};
