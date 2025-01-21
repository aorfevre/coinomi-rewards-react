import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Challenges } from './Challenges';

export const ChallengesTab = ({ userId, onTabChange }) => {
    return (
        <Box sx={{ mt: 4 }}>
            <Challenges userId={userId} onTabChange={onTabChange} />
        </Box>
    );
};

ChallengesTab.propTypes = {
    userId: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};
