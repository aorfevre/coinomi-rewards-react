import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaderboard } from './Leaderboard';
import { Profile } from './Profile';
import { Rules } from './Rules';
import { Tasks } from './Tasks';

const CustomTabPanel = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

export const TabPanel = ({ userId }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', mt: 6 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="game tabs"
                    centered
                    sx={{
                        '& .MuiTab-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: 'primary.main',
                            },
                        },
                    }}
                >
                    <Tab label={t('leaderboard')} />
                    <Tab label={t('tasks')} />
                    <Tab label={t('rules')} />
                    <Tab label={t('profile')} />
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <Leaderboard />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
                <Tasks userId={userId} />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={2}>
                <Rules />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={3}>
                <Profile userId={userId} />
            </CustomTabPanel>
        </Box>
    );
};

TabPanel.propTypes = {
    userId: PropTypes.string.isRequired,
};
