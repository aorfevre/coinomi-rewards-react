import { useEffect, useState } from 'react';
import { isValidAddress } from '../utils/validation';

export const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get token from URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            console.error('❌ useAuth - No token provided');
            return;
        }

        // Clean the token (remove any whitespace, etc)
        const cleanToken = token.trim();

        if (!isValidAddress(cleanToken)) {
            console.error('❌ useAuth - Invalid wallet address:', cleanToken);
            return;
        }

        // If valid address, set the user
        setUser({
            uid: cleanToken,
            walletAddress: cleanToken,
        });
    }, []);

    return { user };
};
