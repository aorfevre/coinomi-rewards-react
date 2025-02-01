import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useTranslation } from 'react-i18next';

export const Leaderboard = () => {
    const shortenAddress = addr => {
        if (!addr) return '';
        return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
    };

    const { leaderboard, loading, error } = useLeaderboard(10);
    const { t } = useTranslation();

    if (loading) return <Box sx={{ textAlign: 'center', p: 4 }}>{t('loading')}</Box>;

    if (error)
        return (
            <Box sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>{t('errorLoading')}</Box>
        );

    if (!leaderboard?.length) return <Box sx={{ textAlign: 'center', p: 4 }}>{t('noEntries')}</Box>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
                {t('weeklyTopPlayers')}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('rankingsReset')}
            </Typography>

            {/* Header row */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 80px',
                    gap: 2,
                    mb: 2,
                    px: 2,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {t('rank')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('player')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                    {t('score')}
                </Typography>
            </Box>

            {/* Leaderboard entries */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {leaderboard.map((entry, index) => (
                    <Box
                        key={entry.id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 80px',
                            gap: 2,
                            p: 2,
                            bgcolor: theme =>
                                theme.palette.mode === 'dark' ? '#1e1e1e' : 'background.paper',
                            borderRadius: 2,
                            alignItems: 'center',
                            '& > *': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#1976d2',
                                fontWeight: 500,
                                fontSize: '1rem',
                            }}
                        >
                            {index + 1}
                        </Typography>
                        <Typography
                            sx={{
                                color: 'text.primary',
                                fontSize: '0.9rem',
                            }}
                        >
                            {shortenAddress(entry.id)}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#1976d2',
                                textAlign: 'right',
                                fontWeight: 500,
                                fontSize: '1.25rem',
                            }}
                        >
                            {entry.points}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
