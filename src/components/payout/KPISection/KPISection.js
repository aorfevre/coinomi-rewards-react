import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import { KPICard } from '../../common/KPICard/KPICard';

export const KPISection = ({ totalParticipants, totalPoints, tokensPerPoint, totalTokens }) => {
    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Total Participants" value={totalParticipants} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Total Points" value={totalPoints?.toLocaleString()} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Tokens per Point" value={tokensPerPoint} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Total Tokens" value={totalTokens} />
            </Grid>
        </Grid>
    );
};

KPISection.propTypes = {
    totalParticipants: PropTypes.number.isRequired,
    totalPoints: PropTypes.number.isRequired,
    tokensPerPoint: PropTypes.string.isRequired,
    totalTokens: PropTypes.string.isRequired,
};
