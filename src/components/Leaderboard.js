import React, { useState } from 'react';
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { shortenAddress } from '../utils/address';
import { getWeek } from 'date-fns';

// Utility function to get current week number (same as in PayoutDashboard)
const getCurrentWeek = () => {
    const now = new Date();
    return getWeek(now, {
        weekStartsOn: 1,
        firstWeekContainsDate: 4,
    });
};

// Utility functions for week/year options (same as in PayoutDashboard)
const generateWeekOptions = () => {
    return Array.from({ length: 53 }, (_, i) => i + 1);
};

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

export const Leaderboard = () => {
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { leaderboard, loading, error } = useLeaderboard(10, selectedWeek, selectedYear);

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error loading leaderboard: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Leaderboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Top performers for the selected period
                </Typography>
            </Box>

            {/* Period Selection */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Week</InputLabel>
                    <Select
                        value={selectedWeek}
                        label="Week"
                        onChange={e => setSelectedWeek(e.target.value)}
                    >
                        {generateWeekOptions().map(week => (
                            <MenuItem key={week} value={week}>
                                Week {week}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        label="Year"
                        onChange={e => setSelectedYear(e.target.value)}
                    >
                        {generateYearOptions().map(year => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Wallet</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            leaderboard?.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{shortenAddress(entry.walletAddress)}</TableCell>
                                    <TableCell align="right">
                                        {entry.points?.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
