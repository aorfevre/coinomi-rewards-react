import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

export const PayoutsTab = () => {
    return (
        <Typography variant="h6" sx={{ mt: 2 }}>
            Payouts History (Coming Soon)
        </Typography>
    );
};

PayoutsTab.propTypes = {
    payouts: PropTypes.array,
};

PayoutsTab.defaultProps = {
    payouts: [],
};
