import { useState, useEffect } from 'react';
import { app, db, auth, functions } from '../config/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';

export const useFirebase = () => {
    const [isReady, setIsReady] = useState(false);
    const [telegramStatus, setTelegramStatus] = useState({
        isConnected: false,
        error: null,
    });

    useEffect(() => {
        const checkFirebase = async () => {
            try {
                // Check if all Firebase services are initialized
                if (app && db && auth && functions) {
                    // Check Telegram connection status from user data if authenticated
                    if (auth.currentUser) {
                        const userDocRef = doc(db, 'users', auth.currentUser.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            setTelegramStatus({
                                isConnected: userData.telegramConnected || false,
                                error: null,
                            });
                        }
                    }

                    setIsReady(true);
                }
            } catch (error) {
                console.error('Firebase initialization error:', error);
                setTelegramStatus(prev => ({
                    ...prev,
                    error: 'Failed to check Telegram connection status',
                }));
            }
        };

        checkFirebase();

        // Listen for auth state changes to update Telegram status
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setTelegramStatus({
                            isConnected: userData.telegramConnected || false,
                            error: null,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user Telegram status:', error);
                    setTelegramStatus(prev => ({
                        ...prev,
                        error: 'Failed to fetch Telegram connection status',
                    }));
                }
            } else {
                setTelegramStatus({
                    isConnected: false,
                    error: null,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return {
        isReady,
        db,
        auth,
        functions,
        telegramStatus,
    };
};
