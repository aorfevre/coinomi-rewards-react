import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export const Countdown = ({ targetDate, onComplete, variant = 'h3', color = 'text.primary' }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                if (!isComplete) {
                    setIsComplete(true);
                    onComplete?.();
                }
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial calculation

        return () => clearInterval(timer);
    }, [targetDate, onComplete, isComplete]);

    if (isComplete) {
        return null; // Hide countdown when complete
    }

    return (
        <Typography
            variant={variant}
            color={color}
            sx={{
                fontWeight: 'bold',
                fontSize: '2.5rem',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
            }}
        >
            {timeLeft}
        </Typography>
    );
};

Countdown.propTypes = {
    targetDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
    ]).isRequired,
    onComplete: PropTypes.func,
    variant: PropTypes.string,
    color: PropTypes.string,
};
