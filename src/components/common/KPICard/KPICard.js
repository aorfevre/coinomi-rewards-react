import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

export const KPICard = ({ title, value }) => {
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

KPICard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
