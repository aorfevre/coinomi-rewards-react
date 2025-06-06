import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CLAIM_COOLDOWN_MS } from '../config/env';
import { useRewards } from '../hooks/useRewards';
import { useScore } from '../hooks/useScore';
import { Countdown } from './Countdown';
import { Fireworks } from './Fireworks';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const RankCard = ({ rank, totalPlayers }) => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(91, 180, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: 'fit-content',
                minWidth: '250px',
                height: '100%',
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(91, 180, 255, 0.12)'
                    }`,
            }}
        >
            <Box
                sx={{
                    bgcolor: 'rgba(255, 223, 0, 0.1)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <EmojiEventsIcon
                    sx={{
                        color: theme => (theme.palette.mode === 'light' ? '#f4b619' : '#ffd700'),
                        fontSize: 28,
                    }}
                />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: theme =>
                                theme.palette.mode === 'light' ? '#f4b619' : '#ffd700',
                            fontWeight: 'bold',
                        }}
                    >
                        #{rank}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: theme => theme.palette.text.primary,
                            fontWeight: 'medium',
                        }}
                    >
                        {t('rank')}
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme => theme.palette.text.secondary,
                        fontSize: '0.875rem',
                    }}
                >
                    {t('outOf')} {totalPlayers} {t('players')}
                </Typography>
            </Box>
        </Box>
    );
};

const MultiplierCard = ({ multiplier }) => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? 'rgba(76, 175, 80, 0.08)'
                        : 'rgba(76, 175, 80, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: 'fit-content',
                minWidth: '250px',
                height: '100%',
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(76, 175, 80, 0.12)'
                            : 'rgba(76, 175, 80, 0.12)'
                    }`,
            }}
        >
            <Box
                sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <StarIcon
                    sx={{
                        color: theme => (theme.palette.mode === 'light' ? '#2e7d32' : '#4caf50'),
                        fontSize: 28,
                    }}
                />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: theme =>
                                theme.palette.mode === 'light' ? '#2e7d32' : '#4caf50',
                            fontWeight: 'bold',
                        }}
                    >
                        {multiplier}x
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: theme => theme.palette.text.primary,
                            fontWeight: 'medium',
                        }}
                    >
                        {t('multiplier')}
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme => theme.palette.text.secondary,
                        fontSize: '0.875rem',
                    }}
                >
                    {t('bonusPointsMultiplier')}
                </Typography>
            </Box>
        </Box>
    );
};

export const PointsDisplay = ({ userId }) => {
    const { t } = useTranslation();
    const { claimDailyReward, loading: claimLoading } = useRewards(userId);
    const { scoreDoc } = useScore(userId);
    const [canClaim, setCanClaim] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);

    const getNextClaimTime = useCallback(() => {
        const lastClaimTime = new Date(scoreDoc?.lastTaskTimestamp || 0);
        return new Date(lastClaimTime.getTime() + CLAIM_COOLDOWN_MS);
    }, [scoreDoc]);

    useEffect(() => {
        if (scoreDoc?.lastTaskTimestamp) {
            const nextClaimTime = getNextClaimTime();
            setCanClaim(new Date() >= nextClaimTime);
        }
    }, [scoreDoc, getNextClaimTime]);

    const handleCountdownComplete = () => {
        setCanClaim(true);
    };

    const handleClaim = async () => {
        try {
            await claimDailyReward(userId);
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 5000);
        } catch (error) {
            console.error('Failed to claim reward:', error);
        }
    };

    return (
        <>
            <Fireworks show={showFireworks} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    px: 2,
                    py: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                            maxWidth: '400px',
                        }}
                    >
                        {canClaim ? (
                            <Typography
                                variant="h4"
                                sx={{
                                    color: 'primary.main',
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}
                            >
                                {t('dailyRewardAvailable')}
                            </Typography>
                        ) : (
                            <>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                        textAlign: 'center',
                                    }}
                                >
                                    {t('nextClaimAvailable')}
                                </Typography>
                                <Countdown
                                    targetDate={getNextClaimTime()}
                                    onComplete={handleCountdownComplete}
                                    variant="h3"
                                    color="text.primary"
                                />
                            </>
                        )}

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleClaim}
                            disabled={!canClaim || claimLoading}
                            sx={{
                                bgcolor: canClaim ? 'primary.main' : 'action.disabledBackground',
                                color: 'white',
                                padding: '12px 32px',
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                width: '100%',
                                maxWidth: '300px',
                                mt: 2,
                                '&:hover': {
                                    bgcolor: canClaim
                                        ? 'primary.dark'
                                        : 'action.disabledBackground',
                                },
                                opacity: canClaim ? 1 : 0.7,
                            }}
                        >
                            {claimLoading ? t('claiming') : t('claimDailyReward')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

PointsDisplay.propTypes = {
    points: PropTypes.number.isRequired,
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
};

RankCard.propTypes = {
    rank: PropTypes.number.isRequired,
    totalPlayers: PropTypes.number.isRequired,
};

MultiplierCard.propTypes = {
    multiplier: PropTypes.number.isRequired,
};
