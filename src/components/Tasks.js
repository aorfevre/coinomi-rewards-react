import { Box, CircularProgress, Typography, Card } from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRewardHistory } from '../hooks/useRewardHistory';
import { useScore } from '../hooks/useScore';
import PropTypes from 'prop-types';

export const Tasks = ({ userId }) => {
    const { t } = useTranslation();
    const { scoreDoc } = useScore(userId);
    const { rewards, loading: rewardsLoading } = useRewardHistory(userId);

    if (rewardsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                {t('completedTasks')}
            </Typography>

            {/* Daily Rewards Claimed Card */}
            <Card
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    bgcolor: theme =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'background.paper',
                    boxShadow: 'none',
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: theme => theme.palette.primary.main,
                        mb: 1,
                        fontWeight: 400,
                    }}
                >
                    {t('dailyRewardsClaimed')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {scoreDoc?.tasksCompleted || 0} {t('times')}
                </Typography>
            </Card>

            {/* Recent Activity Section */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                    {t('recentActivity')}
                </Typography>

                {rewards.length === 0 ? (
                    <Typography color="text.secondary">{t('noRewardsClaimed')}</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {rewards.map(reward => (
                            <Card
                                key={reward.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: theme =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.03)'
                                            : 'background.paper',
                                    boxShadow: 'none',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                color: theme => theme.palette.primary.main,
                                                fontWeight: 500,
                                                mb: 0.5,
                                            }}
                                        >
                                            {reward.type === 'daily'
                                                ? t('dailyReward')
                                                : reward.type}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {format(
                                                new Date(reward.timestamp),
                                                'MMM d, yyyy, h:mm a'
                                            )}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            color: theme => theme.palette.primary.main,
                                            fontWeight: 500,
                                        }}
                                    >
                                        +{reward.points} {t('points')}
                                    </Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

Tasks.propTypes = {
    userId: PropTypes.string.isRequired,
};
