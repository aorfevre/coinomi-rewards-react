import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useRewards } from '../hooks/useRewards';
import { useScore } from '../hooks/useScore';
import { CLAIM_COOLDOWN_MS } from '../config/env';
import { Fireworks } from './Fireworks';

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

export const CountdownSection = ({ userId }) => {
    const { t } = useTranslation();
    const { claimDailyReward, loading: claimLoading } = useRewards(userId);
    const { scoreDoc } = useScore(userId);
    const [canClaim, setCanClaim] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [dailyTimeLeft, setDailyTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [countdownStartTime, setCountdownStartTime] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);

    const getNextClaimTime = useCallback(() => {
        const lastClaimTime = new Date(countdownStartTime || scoreDoc?.lastTaskTimestamp || 0);
        return new Date(lastClaimTime.getTime() + CLAIM_COOLDOWN_MS);
    }, [countdownStartTime, scoreDoc]);

    // Initialize and update timer
    const updateTimeLeft = useCallback(() => {
        if (!scoreDoc?.lastTaskTimestamp || isTransitioning) return;

        const now = new Date().getTime();
        const nextClaim = getNextClaimTime().getTime();
        const timeLeft = nextClaim - now;

        if (timeLeft < -1000) {
            setIsTransitioning(true);

            // Clear any existing timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Set final state
            setCanClaim(true);
            setDailyTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            setCountdownStartTime(null);
            setIsTransitioning(false);
        } else {
            setCanClaim(false);
            setDailyTimeLeft(formatTimeLeft(Math.max(0, timeLeft)));
        }
    }, [getNextClaimTime, scoreDoc, isTransitioning]);

    // Initial setup when scoreDoc changes and no countdown is running
    useEffect(() => {
        if (scoreDoc?.lastTaskTimestamp && !countdownStartTime && !isTransitioning) {
            setCountdownStartTime(scoreDoc.lastTaskTimestamp);
            updateTimeLeft();
        }
    }, [scoreDoc, updateTimeLeft, countdownStartTime, isTransitioning]);

    // Timer effect
    useEffect(() => {
        if (!canClaim && countdownStartTime && !isTransitioning) {
            updateTimeLeft(); // Initial update
            timerRef.current = setInterval(updateTimeLeft, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };
        }
    }, [canClaim, countdownStartTime, updateTimeLeft, isTransitioning]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const handleClaim = async () => {
        try {
            setIsTransitioning(true);
            await claimDailyReward(userId);
            setShowFireworks(true);
            setCountdownStartTime(new Date().toISOString());
            updateTimeLeft();
            setTimeout(() => {
                setShowFireworks(false);
                setIsTransitioning(false);
            }, 5000);
        } catch (error) {
            setIsTransitioning(false);
            console.error('Failed to claim reward:', error);
        }
    };

    const formatTimeLeft = milliseconds => {
        if (milliseconds <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
    };

    return (
        <>
            <Fireworks show={showFireworks} />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {/* Daily Reward Section */}
                <Paper
                    sx={{
                        flex: 1,
                        p: 2,
                        background: theme =>
                            theme.palette.mode === 'light'
                                ? 'linear-gradient(to right, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))'
                                : 'linear-gradient(to right, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                        borderRadius: '8px',
                        boxShadow: 'none',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                        }}
                    >
                        <CalendarTodayIcon sx={{ color: theme => theme.palette.success.main }} />
                        <Typography sx={{ color: theme => theme.palette.text.primary }}>
                            {t('dailyReward')}
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
                        {canClaim ? (
                            <Button
                                variant="contained"
                                onClick={handleClaim}
                                disabled={claimLoading}
                                sx={{
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    py: 1.5,
                                    px: 4,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        bgcolor: 'success.dark',
                                    },
                                }}
                            >
                                {claimLoading ? t('claiming') : t('claimDailyReward')}
                            </Button>
                        ) : (
                            [
                                { value: dailyTimeLeft.hours, label: t('hours') },
                                { value: dailyTimeLeft.minutes, label: t('minutes') },
                                { value: dailyTimeLeft.seconds, label: t('seconds') },
                            ].map((item, index) => (
                                <Box key={index} sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: theme => theme.palette.success.main,
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
                            ))
                        )}
                    </Box>
                </Paper>

                {/* Weekly Countdown Section */}
                <Paper
                    sx={{
                        flex: 1,
                        p: 2,
                        background: theme =>
                            theme.palette.mode === 'light'
                                ? 'linear-gradient(to right, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))'
                                : 'linear-gradient(to right, rgba(91, 180, 255, 0.1), rgba(91, 180, 255, 0.05))',
                        borderRadius: '8px',
                        boxShadow: 'none',
                    }}
                >
                    <WeeklyCountdownContent />
                </Paper>
            </Box>
        </>
    );
};

CountdownSection.propTypes = {
    userId: PropTypes.string.isRequired,
};

// Extracted from WeeklyCountdown.js
const WeeklyCountdownContent = () => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
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
        </>
    );
};
