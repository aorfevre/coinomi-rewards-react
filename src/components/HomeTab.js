import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { StreakBonus } from './StreakBonus';
import PropTypes from 'prop-types';
import { useScore } from '../hooks/useScore';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../hooks/useUserData';
import { calculateMultiplier } from '../utils/multiplierCalculator';

export const HomeTab = ({ userId, rank, totalPlayers, loading }) => {
    const { userData } = useUserData(userId);
    const { scoreDoc } = useScore(userId);
    const { t } = useTranslation();

    // Format rank display
    const formatRankDisplay = () => {
        if (loading) return '#--';
        if (!rank || !totalPlayers) return '#--';
        return `#${rank}`;
    };

    const multiplier = calculateMultiplier(userData, scoreDoc || {}, t);

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
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

            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
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
