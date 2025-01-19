import { useState, useEffect } from 'react';
import { app, db, auth, functions } from '../config/firebase';

export const useFirebase = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkFirebase = async () => {
            try {
                // Simpler initialization check
                if (app && db && auth && functions) {
                    setIsReady(true);
                }
            } catch (error) {
                console.error('Firebase initialization error:', error);
            }
        };

        checkFirebase();
    }, []);

    return { isReady, db, auth, functions };
};
