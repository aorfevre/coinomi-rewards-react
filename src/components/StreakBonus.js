import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export const StreakBonus = ({ currentStreak = 0, lastClaimDate }) => {
    const { t } = useTranslation();
    const maxDays = 5;
    const dailyBonus = 2;
    const finalBonus = 10;

    // Calculate if streak is still active (within 24 hours of last claim)
    const isStreakActive =
        lastClaimDate &&
        new Date().getTime() - new Date(lastClaimDate).getTime() < 24 * 60 * 60 * 1000;

    // Calculate current bonus
    const getCurrentBonus = () => {
        if (!isStreakActive) return 0;
        if (currentStreak >= maxDays) return dailyBonus * (maxDays - 1) + finalBonus;
        return currentStreak * dailyBonus;
    };

    const renderDayIndicator = day => {
        if (day < currentStreak) {
            return (
                <Tooltip title={t('streakComplete')}>
                    <CheckCircleIcon
                        sx={{
                            color: 'success.main',
                            fontSize: 24,
                        }}
                    />
                </Tooltip>
            );
        }

        if (day === currentStreak && isStreakActive) {
            return (
                <Tooltip title={t('streakToday')}>
                    <LocalFireDepartmentIcon
                        sx={{
                            color: 'warning.main',
                            fontSize: 24,
                            animation: 'flame 1.5s ease-in-out infinite',
                            '@keyframes flame': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                            },
                        }}
                    />
                </Tooltip>
            );
        }

        if (day === currentStreak && !isStreakActive) {
            return (
                <Tooltip title={t('streakLost')}>
                    <CancelIcon
                        sx={{
                            color: 'error.main',
                            fontSize: 24,
                        }}
                    />
                </Tooltip>
            );
        }

        return (
            <Tooltip title={t('streakNext')}>
                <CircleIcon
                    sx={{
                        color: 'text.disabled',
                        fontSize: 24,
                    }}
                />
            </Tooltip>
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                p: 2,
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(91, 180, 255, 0.08)',
                borderRadius: 2,
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.2)'
                            : 'rgba(91, 180, 255, 0.2)'
                    }`,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h6" color="text.primary">
                    {t('streakBonus')}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {t('streakBonusValue', { percent: getCurrentBonus() })}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                }}
            >
                {[...Array(maxDays)].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        {renderDayIndicator(index)}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {index === maxDays - 1 ? `+${finalBonus}%` : `+${dailyBonus}%`}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                {t('streakDescription')}
            </Typography>
        </Box>
    );
};

StreakBonus.propTypes = {
    currentStreak: PropTypes.number,
    lastClaimDate: PropTypes.string,
};

StreakBonus.defaultProps = {
    currentStreak: 0,
    lastClaimDate: null,
};
