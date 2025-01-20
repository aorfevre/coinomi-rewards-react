import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useReferral = userId => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [referralCount, setReferralCount] = useState(0);
    const [hasReferrer, setHasReferrer] = useState(false);

    const fetchReferralData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get user data including referral info
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            setHasReferrer(!!userData?.referredBy);

            // Get or create referral code
            const getUserReferralCode = httpsCallable(functions, 'getUserReferralCode');
            const codeResult = await getUserReferralCode({ userId });
            setReferralCode(codeResult.data.referralCode);

            // Get referral count
            const getCountReferrals = httpsCallable(functions, 'getCountReferrals');
            const countResult = await getCountReferrals({ userId });
            setReferralCount(countResult.data.count);
        } catch (err) {
            console.error('Error fetching referral data:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    return {
        referralCode,
        referralCount,
        loading,
        error,
        refresh: fetchReferralData, // Expose refresh function
        hasReferrer,
    };
};
