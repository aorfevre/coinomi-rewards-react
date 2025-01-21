import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { StatsCard } from './StatsCard';
import { useTranslation } from 'react-i18next';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useScore } from '../hooks/useScore';

export const UserKPI = ({ userId }) => {
    const { t } = useTranslation();
    const { scoreDoc } = useScore(userId);

    const stats = [
        {
            icon: WorkHistoryIcon,
            coloredTitle: `${scoreDoc?.tasksCompleted || 0}`,
            title: '',
            subtitle: t('completedTasks'),
            color: '#FF9800',
            bgColor: '#2d1f1a',
        },
        {
            icon: EmojiEventsIcon,
            coloredTitle: `${scoreDoc?.points || 0}`,
            title: '',
            subtitle: t('points'),
            color: '#FFD700',
            bgColor: '#1a1f2e',
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
                <StatsCard
                    key={index}
                    icon={stat.icon}
                    coloredTitle={stat.coloredTitle}
                    title={stat.title}
                    subtitle={stat.subtitle}
                    color={stat.color}
                    bgColor={stat.bgColor}
                    tooltip={stat.tooltip}
                    sx={{ height: '100%' }}
                />
            ))}
        </Box>
    );
};

UserKPI.propTypes = {
    userId: PropTypes.string.isRequired,
};
