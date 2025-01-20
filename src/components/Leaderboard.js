import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useLeaderboard } from '../hooks/useLeaderboard';

const LeaderboardItem = styled(Paper)(({ rank }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background:
        rank === 0
            ? 'linear-gradient(to right, rgba(255, 196, 0, 0.2), rgba(255, 196, 0, 0.1))'
            : rank === 1
              ? 'linear-gradient(to right, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.1))'
              : 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    borderRadius: '8px',
    marginBottom: '0.5rem',
}));

export const Leaderboard = () => {
    const { leaderboard, loading, error } = useLeaderboard(10);

    if (loading) return <Box sx={{ textAlign: 'center', p: 4 }}>Loading leaderboard...</Box>;

    if (error)
        return (
            <Box sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>
                Error loading leaderboard
            </Box>
        );

    if (!leaderboard?.length)
        return <Box sx={{ textAlign: 'center', p: 4 }}>No entries in leaderboard yet</Box>;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                    variant="h2"
                    sx={{
                        color: '#5bb4ff',
                        fontSize: '2rem',
                        fontWeight: 500,
                    }}
                >
                    Weekly Top Players
                </Typography>
                <Tooltip title="Rankings reset every Sunday at midnight UTC">
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            color: 'rgba(255, 255, 255, 0.6)',
                            mt: 1,
                        }}
                    >
                        <CalendarTodayIcon fontSize="small" />
                        This Week's Leaderboard
                    </Typography>
                </Tooltip>
            </Box>

            {leaderboard.map((entry, index) => (
                <LeaderboardItem key={entry.userId} rank={index}>
                    <Typography sx={{ width: 40, color: 'white' }}>{index + 1}</Typography>

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            sx={{
                                fontFamily: 'monospace',
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            {entry.walletAddress.substring(0, 6)}...
                            {entry.walletAddress.substring(entry.walletAddress.length - 4)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography sx={{ color: '#5bb4ff', fontWeight: 500 }}>
                            {entry.points}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'rgba(255, 255, 255, 0.6)',
                            }}
                        >
                            <StarIcon fontSize="small" />
                            <span>{entry.multiplier}x</span>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'rgba(255, 255, 255, 0.6)',
                            }}
                        >
                            <GpsFixedIcon fontSize="small" />
                            <span>{entry.tasksCompleted}</span>
                        </Box>
                    </Box>
                </LeaderboardItem>
            ))}
        </Box>
    );
};
