import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';

export const UserKPI = ({ userData }) => {
    const { t } = useTranslation();

    const kpis = [
        {
            icon: <WhatshotIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
            label: t('currentStreak'),
            value: userData?.currentStreak || 0,
            unit: t('days'),
        },
        {
            icon: <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} />,
            label: t('multiplier'),
            value: (userData?.multiplier || 1).toFixed(2),
            unit: 'x',
        },
        {
            icon: <StarIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
            label: t('totalClaims'),
            value: userData?.totalClaims || 0,
            unit: t('times'),
        },
    ];

    return (
        <Grid container spacing={2}>
            {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={4} key={index}>
                    <Paper
                        sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bgcolor: theme =>
                                theme.palette.mode === 'light'
                                    ? 'rgba(25, 118, 210, 0.04)'
                                    : 'rgba(91, 180, 255, 0.04)',
                            border: theme =>
                                `1px solid ${
                                    theme.palette.mode === 'light'
                                        ? 'rgba(25, 118, 210, 0.12)'
                                        : 'rgba(91, 180, 255, 0.12)'
                                }`,
                        }}
                    >
                        {kpi.icon}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {kpi.label}
                        </Typography>
                        <Typography variant="h4" color="text.primary" sx={{ mt: 1 }}>
                            {kpi.value}
                            <Typography
                                component="span"
                                variant="h6"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                            >
                                {kpi.unit}
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

UserKPI.propTypes = {
    userData: PropTypes.object,
};
