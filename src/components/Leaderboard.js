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
import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { shortenAddress } from '../utils/address';
import { getWeek } from 'date-fns';

// Utility function to get current week number
const getCurrentWeek = () => {
    const now = new Date();
    return getWeek(now, {
        weekStartsOn: 1,
        firstWeekContainsDate: 4,
    });
};

// Utility functions for week/year options
const generateWeekOptions = () => {
    return Array.from({ length: 53 }, (_, i) => i + 1);
};

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

export const Leaderboard = () => {
    const { t } = useTranslation();
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const {
        entries: leaderboard,
        loading,
        error,
    } = useLeaderboard({
        weekNumber: selectedWeek,
        yearNumber: selectedYear,
    }); // Limit to 6 entries for the homepage
    console.log('leaderboard', leaderboard, selectedWeek, selectedYear);
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t('errorLoading')}: {error.message}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {t('leaderboard')}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {t('topPerformers')}
                </Typography>
            </Box>

            {/* Period Selection */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>{t('week')}</InputLabel>
                    <Select
                        value={selectedWeek}
                        label={t('week')}
                        onChange={e => setSelectedWeek(e.target.value)}
                    >
                        {generateWeekOptions().map(week => (
                            <MenuItem key={week} value={week}>
                                {t('week')} {week}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>{t('year')}</InputLabel>
                    <Select
                        value={selectedYear}
                        label={t('year')}
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
                            <TableCell>{t('rank')}</TableCell>
                            <TableCell>{t('player')}</TableCell>
                            <TableCell align="right">{t('points')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : leaderboard?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    {t('noPlayersYet')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            leaderboard.map((entry, index) => (
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
