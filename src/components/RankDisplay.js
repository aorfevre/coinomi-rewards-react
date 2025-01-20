import { EmojiEvents } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const RankDisplay = ({ rank, totalPlayers }) => {
    const { t } = useTranslation();

    const getMedalColor = position => {
        switch (position) {
            case 1:
                return '#FFD700'; // Gold
            case 2:
                return '#C0C0C0'; // Silver
            case 3:
                return '#CD7F32'; // Bronze
            default:
                return '#718096'; // Default gray
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                padding: '12px 24px',
                backdropFilter: 'blur(10px)',
            }}
        >
            <EmojiEvents
                sx={{
                    fontSize: '2rem',
                    color: getMedalColor(rank),
                }}
            />
            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: getMedalColor(rank),
                    }}
                >
                    {t('rank')} #{rank}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                    }}
                >
                    {t('outOf')} {totalPlayers} {t('players')}
                </Typography>
            </Box>
        </Box>
    );
};

RankDisplay.propTypes = {
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
};
