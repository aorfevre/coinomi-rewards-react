import React from 'react';
import { Box, Typography, Card, CircularProgress } from '@mui/material';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useTranslation } from 'react-i18next';
export const Leaderboard = () => {
    const shortenAddress = addr => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const { leaderboard, loading, error } = useLeaderboard(10);
    const { t } = useTranslation();

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
        <Box>
            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    textAlign: 'center',
                    color: 'text.primary',
                }}
            >
                {t('weeklyTopPlayers')}
            </Typography>

            <Typography
                variant="subtitle1"
                sx={{
                    mb: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                }}
            >
                {t('rankingsReset')}
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {leaderboard.map((entry, index) => (
                        <Card
                            key={entry.id}
                            sx={{
                                bgcolor: theme =>
                                    theme.palette.mode === 'light'
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'rgba(30, 30, 30, 0.8)',
                                border: theme =>
                                    `1px solid ${
                                        theme.palette.mode === 'light'
                                            ? 'rgba(0, 0, 0, 0.12)'
                                            : 'rgba(255, 255, 255, 0.12)'
                                    }`,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: theme =>
                                                index < 3
                                                    ? theme.palette.mode === 'light'
                                                        ? '#f4b619'
                                                        : '#ffd700'
                                                    : 'text.primary',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        #{index + 1}
                                    </Typography>
                                    <Typography sx={{ color: 'text.primary' }}>
                                        {shortenAddress(entry.id)}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.primary',
                                        fontWeight: 'medium',
                                    }}
                                >
                                    {entry.points} {t('points')}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};
