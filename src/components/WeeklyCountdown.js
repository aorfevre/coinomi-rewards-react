import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import { useTranslation } from 'react-i18next';

const getNextSundayMidnightUTC = () => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    // If today is Sunday, go to next week
    const daysUntilNextSunday = 7 - dayOfWeek || 7;
    const nextSunday = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + daysUntilNextSunday,
            0,
            0,
            0,
            0
        )
    );
    console.log(
        '[WeeklyCountdown] now:',
        now.toISOString(),
        'dayOfWeek:',
        dayOfWeek,
        'daysUntilNextSunday:',
        daysUntilNextSunday,
        'nextSunday:',
        nextSunday.toISOString()
    );
    return nextSunday;
};

const calculateTimeLeft = () => {
    const now = new Date();
    const endOfWeek = getNextSundayMidnightUTC();
    const difference = endOfWeek - now;
    console.log('[WeeklyCountdown] difference (ms):', difference);
    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

export const WeeklyCountdown = () => {
    const { t } = useTranslation();
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
                background: theme =>
                    theme.palette.mode === 'light'
                        ? 'linear-gradient(to right, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))'
                        : 'linear-gradient(to right, rgba(91, 180, 255, 0.1), rgba(91, 180, 255, 0.05))',
                borderRadius: '8px',
                mb: 3,
                boxShadow: 'none',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TimerIcon sx={{ color: theme => theme.palette.primary.main }} />
                <Typography sx={{ color: theme => theme.palette.text.primary }}>
                    {t('weeklyRewards')}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 1,
                }}
            >
                {[
                    { value: timeLeft.days, label: t('days') },
                    { value: timeLeft.hours, label: t('hours') },
                    { value: timeLeft.minutes, label: t('minutes') },
                    { value: timeLeft.seconds, label: t('seconds') },
                ].map((item, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: theme => theme.palette.primary.main,
                                fontWeight: 'bold',
                            }}
                        >
                            {String(item.value).padStart(2, '0')}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme => theme.palette.text.secondary,
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
