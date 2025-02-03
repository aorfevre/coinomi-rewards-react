import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';
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
    totalParticipants,
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
                            color="error" // Changed to error for red color
                            sx={{
                                minWidth: 150,
                                display: { xs: 'none', md: 'flex' }, // Hide on mobile
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
                <Tab label={`PARTICIPANTS (${totalParticipants || 0})`} />
                <Tab label={`PAYOUTS (${payouts?.length || 0})`} />
            </Tabs>

            {/* Participants Table */}
            {activeTab === 0 && (
                <>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Wallet Address</TableCell>
                                    <TableCell align="right">Points</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leaderboard?.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.walletAddress}</TableCell>
                                        <TableCell align="right">{entry.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Load More Button */}
                    {hasMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onLoadMore}
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} />}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </Button>
                        </Box>
                    )}
                </>
            )}
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
    onGenerateTest: PropTypes.func,
    chainId: PropTypes.string,
    activeTab: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
    kpiData: PropTypes.shape({
        totalParticipants: PropTypes.number,
        totalPoints: PropTypes.number,
        tokensPerPoint: PropTypes.number,
        totalTokens: PropTypes.number,
    }).isRequired,
    totalParticipants: PropTypes.number,
    hasMore: PropTypes.bool,
    onLoadMore: PropTypes.func,
    loading: PropTypes.bool,
    isSepoliaNetwork: PropTypes.bool,
};

PayoutContent.defaultProps = {
    leaderboard: [],
    leaderboardLoading: false,
    payouts: [],
    payoutsLoading: false,
    chainId: '',
    totalParticipants: 0,
    hasMore: false,
    onLoadMore: () => {},
    loading: false,
    onGenerateTest: () => {},
    isSepoliaNetwork: false,
};
