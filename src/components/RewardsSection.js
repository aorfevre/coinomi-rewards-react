import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useRewards } from '../hooks/useRewards';
import { useAuth } from '../hooks/useAuth';
import { Fireworks } from './Fireworks';

export const RewardsSection = ({ weeklyTimeLeft, sx }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { loading, error, claimDailyReward, lastClaim } = useRewards(user?.uid);
    const [showFireworks, setShowFireworks] = useState(false);
    const [isClaimingDaily, setIsClaimingDaily] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const cooldownSeconds = parseInt(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS, 10);

    useEffect(() => {
        const updateTimeLeft = () => {
            // Add debug logging
            console.log('lastClaim:', lastClaim);
            console.log('cooldownSeconds:', cooldownSeconds);

            if (!lastClaim) {
                console.log('No last claim, can claim now');
                setTimeLeft(null);
                return;
            }

            const now = Date.now();
            // Ensure lastClaim is in milliseconds
            const lastClaimMs = typeof lastClaim === 'number' ? lastClaim : Date.parse(lastClaim);
            const nextClaimTime = lastClaimMs + cooldownSeconds * 1000;
            const diff = nextClaimTime - now;

            console.log('Time diff:', diff);

            if (diff <= 0) {
                console.log('Cooldown expired, can claim now');
                setTimeLeft(null);
                setIsClaimingDaily(false);
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const hours = Math.floor(diff / (1000 * 60 * 60));

            console.log('Calculated time:', { hours, minutes, seconds });
            setTimeLeft({ hours, minutes, seconds });
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [lastClaim, cooldownSeconds]);

    const canClaimDaily = !timeLeft && !loading && !isClaimingDaily;

    const formatTime = timeLeft => {
        if (!timeLeft) return '00:00:00';

        return [
            timeLeft.hours.toString().padStart(2, '0'),
            timeLeft.minutes.toString().padStart(2, '0'),
            timeLeft.seconds.toString().padStart(2, '0'),
        ].join(':');
    };

    const handleClaimDaily = async () => {
        if (!user) return;
        try {
            setIsClaimingDaily(true);
            await claimDailyReward(user.uid);
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 5000);
        } catch (err) {
            console.error('Error claiming daily reward:', err);
            setIsClaimingDaily(false);
        }
    };

    const renderDailyButton = () => {
        // Loading state
        if (loading) {
            return (
                <Button
                    variant="contained"
                    fullWidth
                    disabled
                    sx={{
                        height: 40,
                        textTransform: 'none',
                        borderRadius: 2,
                    }}
                >
                    {t('claiming')}
                </Button>
            );
        }

        // Can claim state
        if (canClaimDaily) {
            return (
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleClaimDaily}
                    sx={{
                        height: 40,
                        textTransform: 'none',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t('claimRewards')}
                </Button>
            );
        }

        // Cooldown state
        return (
            <Button
                variant="contained"
                fullWidth
                disabled
                sx={{
                    height: 40,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: 'action.disabledBackground',
                    color: 'text.secondary',
                }}
            >
                {formatTime(timeLeft)}
            </Button>
        );
    };

    return (
        <Box sx={{ mb: 1.5, ...sx }}>
            <Fireworks show={showFireworks} />
            {/* Header */}

            {/* Card */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                }}
            >
                {/* Headers */}
                <Box sx={{ display: 'flex', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 500 }}>
                        {t('daily')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 500 }}>
                        {t('weekly')}
                    </Typography>
                </Box>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ flex: 1 }}>{renderDailyButton()}</Box>

                    <Box sx={{ flex: 1 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled
                            sx={{
                                height: 40,
                                textTransform: 'none',
                                borderRadius: 2,
                                bgcolor: 'action.disabledBackground',
                                color: 'text.secondary',
                            }}
                        >
                            {formatTime(weeklyTimeLeft)}
                        </Button>
                    </Box>
                </Box>
            </Box>
            {error && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {error.message}
                </Typography>
            )}
        </Box>
    );
};

RewardsSection.propTypes = {
    weeklyTimeLeft: PropTypes.shape({
        days: PropTypes.number.isRequired,
        hours: PropTypes.number.isRequired,
        minutes: PropTypes.number.isRequired,
        seconds: PropTypes.number.isRequired,
    }).isRequired,
    sx: PropTypes.object,
};
