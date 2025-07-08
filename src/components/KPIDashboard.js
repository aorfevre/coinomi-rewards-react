import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { Box, Grid, Typography, CircularProgress, Tooltip } from '@mui/material';
import { KPICard } from './KPICard';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

function EngagementBarChart({ data }) {
    const max = Math.max(...data.map(e => e.count), 1);
    return (
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 120, mt: 2, mb: 2 }}>
            {data.map((e, i) => (
                <Tooltip key={i} title={`${e.day}: ${e.count}`} arrow>
                    <Box
                        sx={{
                            width: 24,
                            height: `${(e.count / max) * 100}%`,
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            transition: 'height 0.3s',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ color: 'white', fontSize: 12, mb: 0.5 }}
                        >
                            {e.count > 0 ? e.count : ''}
                        </Typography>
                    </Box>
                </Tooltip>
            ))}
        </Box>
    );
}

EngagementBarChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            day: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
        })
    ).isRequired,
};

const TYPE_COLORS = {
    twitter_like: '#1976d2',
    daily: '#43a047',
    'referral-bonus': '#fbc02d',
    'new-referral': '#e53935',
    twitter_retweet: '#8e24aa',
};

function shortenAddress(addr) {
    if (typeof addr === 'string') {
        // If it's a Twitter handle, just return
        if (addr.startsWith('@')) return addr;
        // 0x-prefixed Ethereum address
        if (addr.startsWith('0x') && addr.length === 42) {
            return addr.slice(0, 6) + '...' + addr.slice(-4);
        }
        // 40-char hex string (userId or wallet)
        if (/^[0-9a-fA-F]{40}$/.test(addr)) {
            return addr.slice(0, 4) + '...' + addr.slice(-4);
        }
    }
    return addr;
}

export default function KPIDashboard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        twitterConnected: 0,
        telegramConnected: 0,
        emailConnected: 0,
        recentRegistrations: 0,
        activeUsers: 0,
        activeUsersByScore: 0,
        totalTasks: 0,
        avgTasks: 0,
        engagement: [],
        totalRewards: 0,
        totalPoints: 0,
        topUser: '',
        engagementByType: [],
    });

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            setError(null);
            try {
                const getKPIStats = httpsCallable(functions, 'getKPIStats');
                const result = await getKPIStats();
                setStats(result.data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    if (error) return <Box sx={{ color: 'error.main', textAlign: 'center', mt: 8 }}>{error}</Box>;

    return (
        <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
                {t('kpiDashboard', 'Tableau de bord KPI')}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                    <KPICard title={t('totalUsers', 'Utilisateurs')} value={stats.totalUsers} />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('twitterConnected', 'Twitter connecté')}
                        value={stats.twitterConnected}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('telegramConnected', 'Telegram connecté')}
                        value={stats.telegramConnected}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('emailConnected', 'Email connecté')}
                        value={stats.emailConnected}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('recentRegistrations', 'Inscriptions 7j')}
                        value={stats.recentRegistrations}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('activeUsers', 'Actifs 7j (profil)')}
                        value={stats.activeUsers}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('activeUsersByScore', 'Actifs 7j (activité)')}
                        value={stats.activeUsersByScore}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard title={t('totalTasks', 'Tâches totales')} value={stats.totalTasks} />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('totalRewards', 'Récompenses totales')}
                        value={stats.totalRewards}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <KPICard
                        title={t('totalPoints', 'Points distribués')}
                        value={stats.totalPoints}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <KPICard
                        title={t('topUser', 'Top utilisateur (7j)')}
                        value={shortenAddress(stats.topUser)}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 6 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('engagementByType', 'Engagement par type de récompense (7j)')}
                </Typography>
                <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.engagementByType}
                            margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar
                                dataKey="twitter_like"
                                stackId="a"
                                fill={TYPE_COLORS.twitter_like}
                                name="Like Twitter"
                            />
                            <Bar
                                dataKey="daily"
                                stackId="a"
                                fill={TYPE_COLORS.daily}
                                name="Daily"
                            />
                            <Bar
                                dataKey="referral-bonus"
                                stackId="a"
                                fill={TYPE_COLORS['referral-bonus']}
                                name="Referral Bonus"
                            />
                            <Bar
                                dataKey="new-referral"
                                stackId="a"
                                fill={TYPE_COLORS['new-referral']}
                                name="New Referral"
                            />
                            <Bar
                                dataKey="twitter_retweet"
                                stackId="a"
                                fill={TYPE_COLORS.twitter_retweet}
                                name="Retweet Twitter"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Box>
    );
}
