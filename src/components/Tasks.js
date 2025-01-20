import { Box, CircularProgress, Typography } from '@mui/material';
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
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                {t('completedTasks')}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <Typography variant="subtitle1" color="primary">
                        {t('dailyRewardsClaimed')}
                    </Typography>
                    <Typography variant="h6">
                        {scoreDoc?.tasksCompleted || 0} {t('times')}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('recentActivity')}
                    </Typography>
                    {rewards.length === 0 ? (
                        <Typography color="text.secondary">{t('noRewardsClaimed')}</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {rewards.map(reward => (
                                <Box
                                    key={reward.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" color="primary">
                                            {reward.type === 'daily'
                                                ? t('dailyReward')
                                                : reward.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(reward.timestamp), 'PPp')}
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle1">
                                        +{reward.points} {t('points')}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

Tasks.propTypes = {
    userId: PropTypes.string.isRequired,
};
