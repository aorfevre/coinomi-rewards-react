import React from 'react';
import { Box } from '@mui/material';
import { StreakBonus } from './StreakBonus';
import { PointsDisplay } from './PointsDisplay';
import PropTypes from 'prop-types';
import { useScore } from '../hooks/useScore';

export const HomeTab = ({ userId, score, rank, totalPlayers }) => {
    const { scoreDoc } = useScore(userId);
    return (
        <Box>
            <StreakBonus
                currentStreak={scoreDoc?.currentStreak || 0}
                lastClaimDate={scoreDoc?.lastTaskTimestamp}
            />

            <Box sx={{ my: 4 }}>
                <PointsDisplay
                    points={score}
                    rank={rank}
                    totalPlayers={totalPlayers}
                    userId={userId}
                />
            </Box>
        </Box>
    );
};

HomeTab.propTypes = {
    userId: PropTypes.string.isRequired,
    userData: PropTypes.object,
    score: PropTypes.number.isRequired,
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
    loading: PropTypes.bool,
};

HomeTab.defaultProps = {
    loading: false,
};
