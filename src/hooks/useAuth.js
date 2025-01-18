import { useEffect, useState } from 'react';
import { auth, db, functions } from '../config/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ethers } from 'ethers';
import { httpsCallable } from 'firebase/functions';

export const useAuth = walletAddress => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log(user ? 'User is signed in:' : 'User is signed out', user);
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return;
        }

        const signIn = async () => {
            try {
                console.log('🔑 Getting custom token for wallet:', walletAddress);

                // Use httpsCallable instead of fetch
                const getCustomToken = httpsCallable(functions, 'getCustomToken');
                const result = await getCustomToken({ walletAddress });
                const { customToken } = result.data;

                console.log('✅ Received token response');

                if (!customToken) {
                    throw new Error('No token received from server');
                }

                // Sign in with the custom token
                const userCredential = await signInWithCustomToken(auth, customToken);
                console.log('👤 Sign in successful:', userCredential);

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
                console.log('💾 User data stored in Firestore');
            } catch (err) {
                console.error('❌ Auth error:', err);
                setError(err instanceof Error ? err : new Error('Authentication failed'));
                setLoading(false);
            }
        };

        signIn();
    }, [walletAddress]);

    return { loading, error, user };
};
