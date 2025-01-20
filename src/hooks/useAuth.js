import { ethers } from 'ethers';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { auth, db, functions } from '../config/firebase';

export const useAuth = walletAddress => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            setLoading(false);
            return;
        }

        const signIn = async () => {
            try {
                const getCustomToken = httpsCallable(functions, 'getCustomToken');

                const result = await getCustomToken({ walletAddress }).catch(error => {
                    console.error('🚨 getCustomToken error:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        functionName: 'getCustomToken',
                        region: error.region,
                        requestUrl: error.requestUrl,
                    });
                    throw error;
                });

                const { customToken } = result.data;
                if (!customToken) {
                    throw new Error('No token received from server');
                }

                const userCredential = await signInWithCustomToken(auth, customToken);

                setUser(userCredential.user);

                // Store user data in Firestore
                const userRef = doc(db, 'users', userCredential.user.uid);

                await setDoc(
                    userRef,
                    {
                        walletAddress,
                        lastSignIn: new Date(),
                    },
                    { merge: true }
                );
            } catch (err) {
                console.error('❌ useAuth - Authentication error:', {
                    message: err.message,
                    code: err.code,
                    stack: err.stack,
                    details: err.details,
                });
                setError(err instanceof Error ? err : new Error('Authentication failed'));
            } finally {
                setLoading(false);
            }
        };

        signIn();
    }, [walletAddress]);

    return { loading, error, user };
};
