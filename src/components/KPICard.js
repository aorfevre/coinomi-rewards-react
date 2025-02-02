import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper } from '@mui/material';

export const KPICard = ({ title, value, subtitle }) => {
    return (
        <Paper
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Paper>
    );
};

KPICard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
};
