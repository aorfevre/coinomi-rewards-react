import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { isAddress } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/coinomi-rewards/us-central1';

export const useAuth = (walletAddress) => {
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
        if (!walletAddress || !isAddress(walletAddress)) {
            return;
        }

        const signIn = async () => {
            try {
                console.log('Fetching custom token for wallet:', walletAddress);

                const response = await fetch(
                    `${API_URL}/getCustomToken?walletAddress=${encodeURIComponent(walletAddress)}`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to get authentication token');
                }

                const data = await response.json();
                console.log('Received token response:', data);

                if (!data.customToken) {
                    throw new Error('No token received from server');
                }

                // Sign in with the custom token
                const userCredential = await signInWithCustomToken(auth, data.customToken);
                console.log('Sign in successful:', userCredential);

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
                console.log('User data stored in Firestore');
            } catch (err) {
                console.error('Auth error:', err);
                setError(err instanceof Error ? err : new Error('Authentication failed'));
                setLoading(false);
            }
        };

        signIn();
    }, [walletAddress]);

    return { loading, error, user };
}; 