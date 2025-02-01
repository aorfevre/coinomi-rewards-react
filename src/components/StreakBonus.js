import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export const StreakBonus = ({ currentStreak = 0, lastClaimDate }) => {
    const { t } = useTranslation();
    const maxDays = 5;
    const dailyBonus = 2;
    const finalBonus = 2;

    // Calculate if streak is still active (within 24 hours of last claim)
    const isStreakActive =
        lastClaimDate &&
        new Date().getTime() - new Date(lastClaimDate).getTime() <
            2 * Number(process.env.REACT_APP_CLAIM_COOLDOWN_SECONDS) * 1000;

    if (!isStreakActive) {
        currentStreak = 0;
    }

    // Calculate current bonus
    const getCurrentBonus = () => {
        if (!isStreakActive) return 0;
        if (currentStreak >= maxDays) return dailyBonus * (maxDays - 1) + finalBonus;
        return currentStreak * dailyBonus;
    };

    const renderDayIndicator = day => {
        const isCompleted = day < currentStreak;
        const isActive = day === currentStreak && isStreakActive;
        // const isFailed = day === currentStreak && !isStreakActive;
        // const isUpcoming = day > currentStreak;

        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 4,
                    bgcolor: theme =>
                        isCompleted || isActive
                            ? theme.palette.mode === 'light'
                                ? 'rgba(255, 180, 67, 0.3)'
                                : 'rgba(255, 180, 67, 0.2)'
                            : theme.palette.mode === 'light'
                              ? 'rgba(0, 0, 0, 0.08)'
                              : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 1,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                        bgcolor: 'warning.main',
                        borderRadius: 1,
                        transition: 'width 0.3s ease-in-out',
                    },
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Tooltip
                        title={
                            isCompleted
                                ? t('streakComplete')
                                : isActive
                                  ? t('streakToday')
                                  : t('streakNext')
                        }
                    >
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: theme =>
                                    isCompleted
                                        ? theme.palette.warning.main
                                        : theme.palette.mode === 'light'
                                          ? 'rgba(0, 0, 0, 0.08)'
                                          : 'rgba(255, 255, 255, 0.08)',
                                color: theme =>
                                    isCompleted
                                        ? '#FFF'
                                        : theme.palette.mode === 'light'
                                          ? 'rgba(0, 0, 0, 0.38)'
                                          : 'rgba(255, 255, 255, 0.38)',
                            }}
                        >
                            ✓
                        </Box>
                    </Tooltip>
                </Box>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.08)'
                            : 'rgba(255, 255, 255, 0.08)'
                    }`,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                }}
            >
                <ShowChartIcon
                    sx={{
                        color: theme =>
                            theme.palette.mode === 'light'
                                ? theme.palette.primary.main
                                : theme.palette.primary.light,
                    }}
                />
                <Typography variant="h6" color="text.primary">
                    {t('streakBonus')}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: theme =>
                            theme.palette.mode === 'light'
                                ? theme.palette.warning.main
                                : theme.palette.warning.light,
                        ml: 'auto',
                    }}
                >
                    +{getCurrentBonus()}%
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${maxDays}, 1fr)`,
                    gap: 1,
                    mb: 2,
                }}
            >
                {[...Array(maxDays)].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        {renderDayIndicator(index)}
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                mt: 2,
                            }}
                        >
                            +{index === maxDays - 1 ? finalBonus : dailyBonus}%
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                    display: 'block',
                    textAlign: 'center',
                }}
            >
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
