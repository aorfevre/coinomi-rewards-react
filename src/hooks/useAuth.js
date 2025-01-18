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
        console.log('🔄 useAuth - Effect triggered with wallet:', walletAddress);

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            console.log('⚠️ useAuth - Invalid wallet address:', walletAddress);
            setLoading(false);
            return;
        }

        const signIn = async () => {
            try {
                console.log('🔑 useAuth - Getting custom token for wallet:', walletAddress);

                // Use httpsCallable instead of fetch
                const getCustomToken = httpsCallable(functions, 'getCustomToken');
                console.log('📤 useAuth - Calling getCustomToken function');

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

                console.log('📥 useAuth - Received response:', {
                    hasCustomToken: !!result.data.customToken,
                    uid: result.data.uid,
                    displayName: result.data.displayName,
                });

                const { customToken } = result.data;
                if (!customToken) {
                    throw new Error('No token received from server');
                }

                // Sign in with the custom token
                console.log('🔓 useAuth - Signing in with custom token');
                const userCredential = await signInWithCustomToken(auth, customToken);
                console.log('✅ useAuth - Sign in successful:', {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                });

                setUser(userCredential.user);

                // Store user data in Firestore
                const userRef = doc(db, 'users', userCredential.user.uid);
                console.log('💾 useAuth - Storing user data in Firestore');

                await setDoc(
                    userRef,
                    {
                        walletAddress,
                        lastSignIn: new Date(),
                    },
                    { merge: true }
                );
                console.log('✨ useAuth - User data stored successfully');
            } catch (err) {
                console.error('❌ useAuth - Authentication error:', {
                    message: err.message,
                    code: err.code,
                    stack: err.stack,
                    details: err.details,
                });
                setError(err instanceof Error ? err : new Error('Authentication failed'));
            } finally {
                console.log('🏁 useAuth - Authentication process completed');
                setLoading(false);
            }
        };

        signIn();
    }, [walletAddress]);

    // Log state changes
    useEffect(() => {
        console.log('📊 useAuth - State updated:', {
            isLoading: loading,
            hasError: !!error,
            isAuthenticated: !!user,
            userId: user?.uid,
        });
    }, [loading, error, user]);

    return { loading, error, user };
};
