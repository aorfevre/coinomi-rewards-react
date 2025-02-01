import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { StreakBonus } from './StreakBonus';
import PropTypes from 'prop-types';
import { useScore } from '../hooks/useScore';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../hooks/useUserData';
import { calculateMultiplier } from '../utils/multiplierCalculator';
import { RewardsSection } from './RewardsSection';

export const HomeTab = ({ userId, rank, totalPlayers, loading }) => {
    const { userData } = useUserData(userId);
    const { scoreDoc } = useScore(userId);
    const { t } = useTranslation();

    // Initial states with all required properties
    const [dailyTimeLeft, setDailyTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [weeklyTimeLeft, setWeeklyTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // eslint-disable-next-line no-unused-vars
    const [canClaimDaily, setCanClaimDaily] = useState(false);

    // Format rank display
    const formatRankDisplay = () => {
        if (loading) return '#--';
        if (!rank || !totalPlayers) return '#--';
        return `#${rank}`;
    };

    const multiplier = calculateMultiplier(userData, scoreDoc || {}, t);

    // Add timer logic to update timeLeft states
    useEffect(() => {
        const updateTimers = () => {
            const now = new Date();

            // Daily timer logic
            const nextDaily = new Date(scoreDoc?.lastClaimDaily || 0);
            nextDaily.setHours(nextDaily.getHours() + 24);
            const dailyDiff = nextDaily - now;

            if (dailyDiff <= 0) {
                setCanClaimDaily(true);
                setDailyTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setCanClaimDaily(false);
                setDailyTimeLeft({
                    hours: Math.floor(dailyDiff / (1000 * 60 * 60)),
                    minutes: Math.floor((dailyDiff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((dailyDiff % (1000 * 60)) / 1000),
                });
            }

            // Weekly timer logic - countdown to next Sunday midnight UTC
            const nextWeeklyDistribution = new Date();
            const currentDay = nextWeeklyDistribution.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

            // Calculate days until next Sunday
            const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;

            // Set to next Sunday at midnight UTC
            nextWeeklyDistribution.setUTCDate(
                nextWeeklyDistribution.getUTCDate() + daysUntilSunday
            );
            nextWeeklyDistribution.setUTCHours(0, 0, 0, 0);

            const weeklyDiff = nextWeeklyDistribution.getTime() - now.getTime();

            setWeeklyTimeLeft({
                days: Math.floor(weeklyDiff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((weeklyDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((weeklyDiff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((weeklyDiff % (1000 * 60)) / 1000),
            });
        };

        updateTimers();
        const timer = setInterval(updateTimers, 1000);

        return () => clearInterval(timer);
    }, [scoreDoc?.lastClaimDaily]);

    return (
        <Box sx={{ p: 2 }}>
            {/* Rewards Section First */}
            <RewardsSection
                canClaimDaily={canClaimDaily}
                dailyTimeLeft={dailyTimeLeft}
                weeklyTimeLeft={weeklyTimeLeft}
                sx={{ mb: 1.5 }}
            />

            {/* Stats Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                <BarChartIcon
                    sx={{
                        color: 'primary.main',
                        fontSize: '1.5rem',
                    }}
                />
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 500 }}>
                    {t('yourStatsThisWeek')}
                </Typography>
            </Box>

            {/* Stats Card */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 2,
                    mb: 1.5,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                            variant="h5"
                            color="warning.main"
                            sx={{ mb: 0.5, fontWeight: 500 }}
                        >
                            {formatRankDisplay()}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                whiteSpace: 'pre-line',
                                lineHeight: 1.2,
                            }}
                        >
                            {t('yourRank')}
                        </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                            variant="h5"
                            color="text.primary"
                            sx={{ mb: 0.5, fontWeight: 500 }}
                        >
                            {scoreDoc?.tasksCompleted || 0}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                whiteSpace: 'pre-line',
                                lineHeight: 1.2,
                            }}
                        >
                            Completed{'\n'}Tasks
                        </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                            variant="h5"
                            color="text.primary"
                            sx={{ mb: 0.5, fontWeight: 500 }}
                        >
                            {multiplier.total.toFixed(2)}x
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                whiteSpace: 'pre-line',
                                lineHeight: 1.2,
                            }}
                        >
                            Points{'\n'}multiplier
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Streak Bonus */}
            <StreakBonus
                currentStreak={scoreDoc?.currentStreak || 0}
                lastClaimDate={scoreDoc?.lastTaskTimestamp}
                sx={{
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            />
        </Box>
    );
};

HomeTab.propTypes = {
    userId: PropTypes.string.isRequired,
    userData: PropTypes.object,
    score: PropTypes.number.isRequired,
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
    loading: PropTypes.bool,
};

HomeTab.defaultProps = {
    loading: false,
};
