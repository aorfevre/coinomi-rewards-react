import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useRewards } from '../hooks/useRewards';
import { useAuth } from '../hooks/useAuth';
import { Fireworks } from './Fireworks';

export const RewardsSection = ({ canClaimDaily, dailyTimeLeft, weeklyTimeLeft, sx }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { loading, error, claimDailyReward } = useRewards(user?.uid);
    const [showFireworks, setShowFireworks] = React.useState(false);

    const formatTime = timeLeft => {
        // Ensure all values exist with defaults
        const days = timeLeft?.days ?? 0;
        const hours = timeLeft?.hours ?? 0;
        const minutes = timeLeft?.minutes ?? 0;
        const seconds = timeLeft?.seconds ?? 0;

        // For daily timer, we only show HH:MM:SS
        if (!timeLeft.days) {
            return [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0'),
            ].join(':');
        }

        // For weekly timer, we show DD:HH:MM:SS
        return [
            days.toString().padStart(2, '0'),
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0'),
        ].join(':');
    };

    const handleClaimDaily = async () => {
        if (!user) return;
        try {
            await claimDailyReward(user.uid);
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 2000);
        } catch (err) {
            console.error('Error claiming daily reward:', err);
        }
    };

    return (
        <Box sx={{ mb: 1.5, ...sx }}>
            {showFireworks && <Fireworks />}
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                <CalendarTodayIcon
                    sx={{
                        color: 'primary.main',
                        fontSize: '1.5rem',
                    }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {t('rewards')}
                </Typography>
            </Box>

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
                    <Box sx={{ flex: 1 }}>
                        {canClaimDaily ? (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleClaimDaily}
                                disabled={loading}
                                sx={{
                                    height: 40,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {loading ? t('claiming') : t('claimRewards')}
                            </Button>
                        ) : (
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
                                {formatTime(dailyTimeLeft)}
                            </Button>
                        )}
                    </Box>

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
    canClaimDaily: PropTypes.bool.isRequired,
    dailyTimeLeft: PropTypes.shape({
        hours: PropTypes.number.isRequired,
        minutes: PropTypes.number.isRequired,
        seconds: PropTypes.number.isRequired,
    }).isRequired,
    weeklyTimeLeft: PropTypes.shape({
        days: PropTypes.number.isRequired,
        hours: PropTypes.number.isRequired,
        minutes: PropTypes.number.isRequired,
        seconds: PropTypes.number.isRequired,
    }).isRequired,
    sx: PropTypes.object,
};
