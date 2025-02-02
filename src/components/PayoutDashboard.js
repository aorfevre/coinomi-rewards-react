import React, { useCallback, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Grid,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { ChainSelector } from './ChainSelector';
import { usePayouts } from '../hooks/usePayouts';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { shortenAddress } from '../utils/address';
import { formatDate, calculateWeek } from '../utils/date';
import { useWeb3 } from '../hooks/useWeb3';
import { TokenSelector } from './TokenSelector';
import { KPICard } from './KPICard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Utility function to get current week
const getCurrentWeek = () => {
    return calculateWeek(new Date());
};

// Utility function to generate week options
const generateWeekOptions = () => {
    return Array.from({ length: 53 }, (_, i) => i + 1);
};

// Utility function to generate year options (last 5 years)
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

export const PayoutDashboard = () => {
    const {
        payouts,
        loading: payoutsLoading,
        error: payoutsError,
        // fetchPayouts,
        generatePayout,
    } = usePayouts();
    const { connect, disconnect, account, chainId } = useWeb3();
    const [selectedToken, setSelectedToken] = useState(null);
    const [totalTokens, setTotalTokens] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Only fetch leaderboard when connected and pass week/year
    const {
        leaderboard,
        loading: leaderboardLoading,
        error: leaderboardError,
    } = useLeaderboard(
        account ? 1000 : 0, // Pass 1000 to get all participants when connected
        account ? selectedWeek : null,
        account ? selectedYear : null
    );

    // Calculate KPI values using leaderboard data
    const totalPoints = leaderboard?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
    const totalParticipants = leaderboard?.length || 0;
    const tokensPerPoint =
        totalTokens && totalPoints ? (parseFloat(totalTokens) / totalPoints).toFixed(6) : '0';

    const handleGeneratePayout = useCallback(async () => {
        if (!account || !selectedToken || !chainId || !totalTokens) return;
        await generatePayout(selectedToken.address, chainId, totalTokens);
    }, [account, selectedToken, chainId, generatePayout, totalTokens]);

    const handleTokenSelect = tokenInfo => {
        setSelectedToken(tokenInfo);
    };

    const handleDownloadCSV = useCallback(async () => {
        if (!leaderboard) return;

        // Create CSV content
        const headers = ['Wallet Address', 'Points', 'Token Amount'];
        const rows = leaderboard.map(participant => [
            participant.walletAddress,
            participant.points,
            (participant.points * parseFloat(tokensPerPoint)).toFixed(6),
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payout-week${selectedWeek}-${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [leaderboard, tokensPerPoint, selectedWeek, selectedYear]);

    const loading = payoutsLoading || leaderboardLoading;
    const error = payoutsError || leaderboardError;

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with connect button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4">Payout Dashboard</Typography>
                {!account ? (
                    <Button variant="contained" onClick={connect}>
                        Connect Wallet
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography>{shortenAddress(account)}</Typography>
                        <Button variant="outlined" onClick={disconnect}>
                            Disconnect
                        </Button>
                    </Box>
                )}
            </Box>

            {account && (
                <>
                    {/* Chain and Token Selection */}
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ChainSelector
                            currentChainId={chainId}
                            onChainSelect={async newChainId => {
                                if (newChainId !== chainId) {
                                    try {
                                        await connect(newChainId);
                                    } catch (error) {
                                        console.error('Failed to switch chain:', error);
                                    }
                                }
                            }}
                        />
                        <TokenSelector onTokenSelect={handleTokenSelect} />

                        {/* Week and Year Selection */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Week</InputLabel>
                                <Select
                                    value={selectedWeek}
                                    label="Week"
                                    onChange={e => setSelectedWeek(e.target.value)}
                                    size="small"
                                >
                                    {generateWeekOptions().map(week => (
                                        <MenuItem key={week} value={week}>
                                            Week {week}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Year"
                                    onChange={e => setSelectedYear(e.target.value)}
                                    size="small"
                                >
                                    {generateYearOptions().map(year => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* KPI Cards */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Total Tokens to Distribute"
                                type="number"
                                value={totalTokens}
                                onChange={e => setTotalTokens(e.target.value)}
                                InputProps={{
                                    endAdornment: selectedToken && (
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedToken.symbol}
                                        </Typography>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard title="Total Points" value={totalPoints.toLocaleString()} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard
                                title="Tokens per Point"
                                value={tokensPerPoint}
                                subtitle={selectedToken?.symbol}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard title="Total Participants" value={totalParticipants} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard
                                title="Selected Period"
                                value={`Week ${selectedWeek}`}
                                subtitle={selectedYear.toString()}
                            />
                        </Grid>
                    </Grid>

                    {/* Add Download CSV button before the table */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadCSV}
                            disabled={!leaderboard || loading}
                        >
                            Download CSV
                        </Button>
                    </Box>

                    {/* Generate Payout Button */}
                    <Box sx={{ mb: 4 }}>
                        <Button
                            variant="contained"
                            onClick={handleGeneratePayout}
                            disabled={!selectedToken || !chainId || !totalTokens}
                            fullWidth
                        >
                            Generate Payout
                        </Button>
                    </Box>

                    {/* Payouts Table - Now using leaderboard data */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Wallet Address</TableCell>
                                    <TableCell align="right">Points</TableCell>
                                    <TableCell align="right">Token Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaderboard?.map(participant => (
                                        <TableRow key={participant.walletAddress}>
                                            <TableCell>
                                                {shortenAddress(participant.walletAddress)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {participant.points?.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {(
                                                    participant.points * parseFloat(tokensPerPoint)
                                                ).toFixed(6)}
                                            </TableCell>
                                            <TableCell>
                                                {payouts?.find(p => p.wallet === participant.wallet)
                                                    ?.status || 'Pending'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(participant.lastUpdated)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};
