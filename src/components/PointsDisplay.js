import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)({
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    padding: '12px 48px',
    fontSize: '1.1rem',
    borderRadius: '8px',
    textTransform: 'none',
    letterSpacing: '0.5px',
    backdropFilter: 'blur(10px)',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
    },
    '&:disabled': {
        opacity: 0.5,
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.3)',
    },
});

const RankBadge = styled(Box)({
    display: 'inline-block',
    background: 'rgba(91, 180, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#5bb4ff',
});

export const PointsDisplay = ({ points, rank, totalPlayers, timeLeft }) => {
    return (
        <Box sx={{ textAlign: 'center', py: 4, mb: 6 }}>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '4rem',
                    fontWeight: 700,
                    mb: 4,
                    color: 'white',
                }}
            >
                Your Points: {points}
            </Typography>

            <Box sx={{ mb: 3 }}>
                <RankBadge>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: '2rem',
                            fontWeight: 500,
                        }}
                    >
                        Rank: #{rank} of {totalPlayers}
                    </Typography>
                </RankBadge>
            </Box>

            <Typography
                variant="h2"
                sx={{
                    fontSize: '3.5rem',
                    color: 'white',
                    fontFamily: 'monospace',
                    mb: 4,
                    opacity: 0.9,
                }}
            >
                {timeLeft}
            </Typography>

            <StyledButton variant="contained">Claim Daily Reward</StyledButton>
        </Box>
    );
};

PointsDisplay.propTypes = {
    points: PropTypes.number.isRequired,
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
    timeLeft: PropTypes.string.isRequired,
};
