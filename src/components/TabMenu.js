import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export const TabMenu = ({ currentTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
                value={currentTab}
                onChange={(e, newValue) => onTabChange(newValue)}
                variant="fullWidth"
                sx={{
                    '& .MuiTab-root': {
                        minHeight: 64,
                        fontSize: '1rem',
                    },
                }}
            >
                <Tab icon={<HomeIcon />} label={t('home')} value="home" iconPosition="start" />
                <Tab
                    icon={<EmojiEventsIcon />}
                    label={t('leaderboard')}
                    value="leaderboard"
                    iconPosition="start"
                />
                <Tab
                    icon={<AssignmentIcon />}
                    label={t('tasks')}
                    value="tasks"
                    iconPosition="start"
                />
                <Tab
                    icon={<GroupAddIcon />}
                    label={t('referrals')}
                    value="referrals"
                    iconPosition="start"
                />
                <Tab
                    icon={<AccountCircleIcon />}
                    label={t('profile')}
                    value="profile"
                    iconPosition="start"
                />
            </Tabs>
        </Box>
    );
};

TabMenu.propTypes = {
    currentTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};
