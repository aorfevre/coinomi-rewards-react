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
                        minHeight: { xs: '48px', sm: '64px' },
                        fontSize: { xs: '0', sm: '1rem' },
                        '& .MuiTab-iconWrapper': {
                            marginBottom: { xs: 0, sm: 1 },
                        },
                        '& .MuiTab-labelIcon': {
                            minHeight: { xs: '48px', sm: '64px' },
                        },
                    },
                }}
            >
                <Tab
                    icon={<HomeIcon />}
                    label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('home')}</Box>}
                    value="home"
                    iconPosition="start"
                />
                <Tab
                    icon={<EmojiEventsIcon />}
                    label={
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('leaderboard')}</Box>
                    }
                    value="leaderboard"
                    iconPosition="start"
                />
                <Tab
                    icon={<AssignmentIcon />}
                    label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('tasks')}</Box>}
                    value="tasks"
                    iconPosition="start"
                />
                <Tab
                    icon={<GroupAddIcon />}
                    label={
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('referrals')}</Box>
                    }
                    value="referrals"
                    iconPosition="start"
                />
                <Tab
                    icon={<AccountCircleIcon />}
                    label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('profile')}</Box>}
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
