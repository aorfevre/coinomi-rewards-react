import { ethers } from 'ethers';
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { auth, db, functions } from '../config/firebase';

export const useAuth = walletAddress => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setUser(user);
                setUserId(user.uid);
            } else {
                setUser(null);
                setUserId(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle wallet authentication
    useEffect(() => {
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return;
        }

        let isMounted = true;
        setLoading(true);

        const signIn = async () => {
            try {
                const getCustomToken = httpsCallable(functions, 'getCustomToken');
                const result = await getCustomToken({ walletAddress });
                const { customToken } = result.data;

                if (!customToken) {
                    throw new Error('No token received from server');
                }

                const userCredential = await signInWithCustomToken(auth, customToken);
                const uid = userCredential.user.uid;

                const userRef = doc(db, 'users', uid);
                await setDoc(
                    userRef,
                    {
                        walletAddress,
                        lastSignIn: new Date(),
                    },
                    { merge: true }
                );
            } catch (err) {
                console.error('❌ useAuth - Authentication error:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Authentication failed'));
                }
            }
        };

        signIn();

        return () => {
            isMounted = false;
        };
    }, [walletAddress]);

    return { loading, error, user, userId };
};
