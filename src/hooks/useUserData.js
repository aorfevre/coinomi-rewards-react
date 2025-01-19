import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from './useFirebase';

export const useUserData = userId => {
    const [userData, setUserData] = useState({ telegramConnected: false });
    const [loading, setLoading] = useState(true);
    const { isReady, db } = useFirebase();

    useEffect(() => {
        if (!isReady || !userId) return;

        const userRef = doc(db, 'users', userId);

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            userRef,
            doc => {
                if (doc.exists()) {
                    setUserData(doc.data());
                } else {
                    setUserData({ telegramConnected: false });
                }
                setLoading(false);
            },
            error => {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, isReady, db]);

    return { userData, loading };
};
