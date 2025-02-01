import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export const TabMenu = ({ currentTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: theme =>
                    theme.palette.mode === 'light'
                        ? '#F8F8F8' // Light grey background
                        : 'rgba(20, 25, 39, 0.95)', // Dark mode background
                backdropFilter: 'blur(10px)',
                borderTop: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.08)'
                            : 'rgba(255, 255, 255, 0.08)'
                    }`,
                paddingBottom: 'env(safe-area-inset-bottom)', // For iPhone notch
                paddingTop: 1,
            }}
        >
            <Tabs
                value={currentTab}
                onChange={(e, newValue) => onTabChange(newValue)}
                variant="fullWidth"
                sx={{
                    minHeight: 72,
                    '& .MuiTabs-flexContainer': {
                        justifyContent: 'space-around',
                        height: 72,
                    },
                    '& .MuiTab-root': {
                        minHeight: 72,
                        minWidth: 'auto',
                        padding: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: theme =>
                            theme.palette.mode === 'light'
                                ? 'rgba(0, 0, 0, 0.6)'
                                : 'rgba(255, 255, 255, 0.6)',
                        '&.Mui-selected': {
                            color: theme =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.primary.main
                                    : theme.palette.primary.light,
                        },
                        '& .MuiTab-iconWrapper': {
                            marginBottom: '6px',
                        },
                    },
                    '& .MuiTabs-indicator': {
                        display: 'none',
                    },
                }}
            >
                <Tab icon={<HomeIcon sx={{ fontSize: 24 }} />} label={t('home')} value="home" />
                <Tab
                    icon={<MilitaryTechIcon sx={{ fontSize: 24 }} />}
                    label={t('challenges')}
                    value="challenges"
                />
                <Tab
                    icon={<EmojiEventsIcon sx={{ fontSize: 24 }} />}
                    label={t('leaderboard')}
                    value="leaderboard"
                />
                <Tab
                    icon={<AssignmentIcon sx={{ fontSize: 24 }} />}
                    label={t('tasks')}
                    value="tasks"
                />
                <Tab
                    icon={<GroupAddIcon sx={{ fontSize: 24 }} />}
                    label={t('referrals')}
                    value="referrals"
                />
            </Tabs>
        </Paper>
    );
};

TabMenu.propTypes = {
    currentTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};
