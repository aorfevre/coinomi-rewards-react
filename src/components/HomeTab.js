import React from 'react';
import { Box } from '@mui/material';
import { StreakBonus } from './StreakBonus';
import { PointsDisplay } from './PointsDisplay';
import PropTypes from 'prop-types';
import { useScore } from '../hooks/useScore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { StatsCard } from './StatsCard';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../hooks/useUserData';
import { calculateMultiplier } from '../utils/multiplierCalculator';
import { UserKPI } from './UserKPI';

export const HomeTab = ({ userId, score, rank, totalPlayers }) => {
    const { userData } = useUserData(userId);
    const { scoreDoc } = useScore(userId);
    const { t } = useTranslation();

    const multiplier = calculateMultiplier(userData, scoreDoc || {}, t);
    const formattedMultiplier = `${multiplier.total.toFixed(2)}x`;

    // Use the breakdown text directly from the calculator
    const multiplierBreakdown = multiplier.breakdownText;

    return (
        <Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mb: 4,
                }}
            >
                <StatsCard
                    icon={EmojiEventsIcon}
                    coloredTitle={`#${rank}`}
                    title={t('rank')}
                    subtitle={`${t('outOf')} ${totalPlayers} ${t('players')}`}
                    color="#FFD700"
                    bgColor="#1a1f2e"
                />
                <StatsCard
                    icon={StarIcon}
                    coloredTitle={formattedMultiplier}
                    title={t('multiplier')}
                    subtitle={t('bonusPointsMultiplier')}
                    color="#4CAF50"
                    bgColor="#1a2e1f"
                    tooltip={multiplierBreakdown}
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <UserKPI userId={userId} />
            </Box>

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
