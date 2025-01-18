import React, { useState } from 'react';
import { Fab } from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { Fireworks } from './Fireworks';

export const FireworksButton = () => {
    const [showFireworks, setShowFireworks] = useState(false);

    const handleClick = () => {
        setShowFireworks(true);
        // Auto-hide fireworks after 10 seconds
        setTimeout(() => setShowFireworks(false), 5000);
    };

    return (
        <>
            <Fireworks show={showFireworks} />
            <Fab
                color="primary"
                aria-label="fireworks"
                onClick={handleClick}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
            >
                <CelebrationIcon />
            </Fab>
        </>
    );
};
