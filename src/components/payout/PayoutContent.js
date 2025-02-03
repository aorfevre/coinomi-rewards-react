import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Tab, Tabs } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { WeekYearSelector } from '../common/WeekYearSelector';
import { KPISection } from './KPISection';

export const PayoutContent = ({
    selectedWeek,
    selectedYear,
    onWeekChange,
    leaderboard,
    payouts,
    onDownloadCSV,
    activeTab,
    onTabChange,
    kpiData,
}) => {
    return (
        <Box>
            {/* Week/Year selector and Download button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <WeekYearSelector
                    selectedWeek={selectedWeek}
                    selectedYear={selectedYear}
                    onChange={onWeekChange}
                />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadCSV}>
                    DOWNLOAD CSV
                </Button>
            </Box>

            {/* KPI Section */}
            <Box sx={{ mb: 4 }}>
                <KPISection {...kpiData} />
            </Box>

            {/* Tabs and content */}
            <Tabs value={activeTab} onChange={onTabChange}>
                <Tab label={`PARTICIPANTS (${leaderboard?.length || 0})`} />
                <Tab label={`PAYOUTS (${payouts?.length || 0})`} />
            </Tabs>
            {/* ... rest of the component ... */}
        </Box>
    );
};

PayoutContent.propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    onWeekChange: PropTypes.func.isRequired,
    leaderboard: PropTypes.arrayOf(PropTypes.object),
    leaderboardLoading: PropTypes.bool,
    payouts: PropTypes.arrayOf(PropTypes.object),
    payoutsLoading: PropTypes.bool,
    onDownloadCSV: PropTypes.func.isRequired,
    onGenerateTest: PropTypes.func.isRequired,
    chainId: PropTypes.string,
    activeTab: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
    kpiData: PropTypes.shape({
        totalParticipants: PropTypes.number,
        totalPoints: PropTypes.number,
        tokensPerPoint: PropTypes.number,
        totalTokens: PropTypes.number,
    }).isRequired,
};

PayoutContent.defaultProps = {
    leaderboard: [],
    leaderboardLoading: false,
    payouts: [],
    payoutsLoading: false,
    chainId: '',
};
