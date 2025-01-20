import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';

const calculateTimeLeft = () => {
    const now = new Date();
    const endOfWeek = new Date();

    // Set to next Sunday midnight UTC
    endOfWeek.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()));
    endOfWeek.setUTCHours(0, 0, 0, 0);

    const difference = endOfWeek - now;

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

export const WeeklyCountdown = () => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Paper
            sx={{
                p: 2,
                background:
                    'linear-gradient(to right, rgba(91, 180, 255, 0.1), rgba(91, 180, 255, 0.05))',
                borderRadius: '8px',
                mb: 3,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TimerIcon sx={{ color: '#5bb4ff' }} />
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Weekly rewards in:
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 1,
                    color: '#5bb4ff',
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#5bb4ff', fontWeight: 'bold' }}>
                        {timeLeft.days}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        days
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#5bb4ff', fontWeight: 'bold' }}>
                        {String(timeLeft.hours).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        hours
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#5bb4ff', fontWeight: 'bold' }}>
                        {String(timeLeft.minutes).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        mins
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#5bb4ff', fontWeight: 'bold' }}>
                        {String(timeLeft.seconds).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        secs
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};
