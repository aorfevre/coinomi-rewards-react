import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box } from '@mui/material';
import { ParticipantsTable } from '../ParticipantsTable';
import { PayoutsTable } from '../PayoutsTable';

const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: 2 }}>
        {value === index && children}
    </Box>
);

export const PayoutTabs = ({
    leaderboard,
    leaderboardLoading,
    payouts,
    payoutsLoading,
    activeTab,
    onTabChange,
}) => {
    return (
        <>
            <Tabs value={activeTab} onChange={onTabChange}>
                <Tab label={`Participants (${leaderboard?.length || 0})`} />
                <Tab label={`Payouts (${payouts?.length || 0})`} />
            </Tabs>
            <TabPanel value={activeTab} index={0}>
                <ParticipantsTable participants={leaderboard} loading={leaderboardLoading} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <PayoutsTable payouts={payouts} loading={payoutsLoading} />
            </TabPanel>
        </>
    );
};

PayoutTabs.propTypes = {
    leaderboard: PropTypes.array,
    leaderboardLoading: PropTypes.bool,
    payouts: PropTypes.array,
    payoutsLoading: PropTypes.bool,
    activeTab: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
};

TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
};
