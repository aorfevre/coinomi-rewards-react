import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { StatsCard } from './StatsCard';
import { useTranslation } from 'react-i18next';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useScore } from '../hooks/useScore';
import { useTheme } from '@mui/material/styles';

export const UserKPI = ({ userId }) => {
    const { t } = useTranslation();
    const { scoreDoc } = useScore(userId);
    const theme = useTheme();

    const stats = [
        {
            icon: WorkHistoryIcon,
            coloredTitle: `${scoreDoc?.tasksCompleted || 0}`,
            title: '',
            subtitle: t('completedTasks'),
            color: '#FF9800',
            bgColor:
                theme.palette.mode === 'dark'
                    ? '#2d1f1a'
                    : 'linear-gradient(145deg, rgba(255, 248, 240, 1), rgba(255, 237, 213, 1))',
        },
        {
            icon: EmojiEventsIcon,
            coloredTitle: `${scoreDoc?.points || 0}`,
            title: '',
            subtitle: t('points'),
            color: '#FFD700',
            bgColor:
                theme.palette.mode === 'dark'
                    ? '#1a1f2e'
                    : 'linear-gradient(145deg, rgba(255, 250, 230, 1), rgba(255, 243, 191, 1))',
        },
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                },
                gap: 2,
            }}
        >
            {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} sx={{ height: '100%' }} />
            ))}
        </Box>
    );
};

UserKPI.propTypes = {
    userId: PropTypes.string.isRequired,
};
