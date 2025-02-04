import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Tab, Tabs } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { WeekYearSelector } from '../common/WeekYearSelector';
import { KPISection } from './KPISection';
import { LeaderboardTab } from './LeaderboardTab';
import { PayoutsTab } from './PayoutsTab/PayoutsTab';
import { BatchesTab } from './BatchesTab/BatchesTab';

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
    hasMore,
    onLoadMore,
    loading,
    onGenerateTest,
    isSepoliaNetwork,
}) => {
    // Add debug logging
    console.log('PayoutContent render:', { isSepoliaNetwork });

    return (
        <Box>
            {/* Week/Year selector and buttons */}
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isSepoliaNetwork && (
                        <Button
                            variant="outlined"
                            onClick={onGenerateTest}
                            color="error"
                            sx={{
                                minWidth: 150,
                                display: { xs: 'none', md: 'flex' },
                                borderColor: theme => theme.palette.error.main,
                                color: theme => theme.palette.error.main,
                                '&:hover': {
                                    borderColor: theme => theme.palette.error.dark,
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                },
                            }}
                        >
                            Generate Test Data
                        </Button>
                    )}
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadCSV}>
                        DOWNLOAD CSV
                    </Button>
                </Box>
            </Box>

            {/* KPI Section */}
            <Box sx={{ mb: 4 }}>
                <KPISection {...kpiData} />
            </Box>

            {/* Tabs and content */}
            <Tabs value={activeTab} onChange={onTabChange}>
                <Tab label="Leaderboard" />
                <Tab label="Payouts" />
                <Tab label="Batches" />
            </Tabs>

            {activeTab === 0 && (
                <LeaderboardTab
                    leaderboard={leaderboard}
                    hasMore={hasMore}
                    onLoadMore={onLoadMore}
                    loading={loading}
                />
            )}
            {activeTab === 1 && <PayoutsTab payouts={payouts} />}
            {activeTab === 2 && <BatchesTab weekNumber={selectedWeek} yearNumber={selectedYear} />}
        </Box>
    );
};

PayoutContent.propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    onWeekChange: PropTypes.func.isRequired,
    leaderboard: PropTypes.arrayOf(PropTypes.object),
    payouts: PropTypes.arrayOf(PropTypes.object),
    onDownloadCSV: PropTypes.func.isRequired,
    onGenerateTest: PropTypes.func,
    activeTab: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
    kpiData: PropTypes.shape({
        totalParticipants: PropTypes.number,
        totalPoints: PropTypes.number,
        tokensPerPoint: PropTypes.number,
        totalTokens: PropTypes.number,
    }).isRequired,
    hasMore: PropTypes.bool,
    onLoadMore: PropTypes.func,
    loading: PropTypes.bool,
    isSepoliaNetwork: PropTypes.bool,
};

PayoutContent.defaultProps = {
    leaderboard: [],
    payouts: [],
    hasMore: false,
    onLoadMore: () => {},
    loading: false,
    onGenerateTest: () => {},
    isSepoliaNetwork: false,
};
