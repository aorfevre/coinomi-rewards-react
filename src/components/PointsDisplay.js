import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useRewards } from '../hooks/useRewards';
import { useScore } from '../hooks/useScore';
import { Countdown } from './Countdown';

export const PointsDisplay = ({ points, rank, totalPlayers, userId }) => {
    const { claimDailyReward, loading: claimLoading } = useRewards();
    const { scoreDoc } = useScore(userId);
    const [canClaim, setCanClaim] = useState(false);

    const getNextClaimTime = () => {
        const lastClaimTime = new Date(scoreDoc?.lastTaskTimestamp || 0);
        return new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000);
    };

    useEffect(() => {
        if (scoreDoc?.lastTaskTimestamp) {
            const nextClaimTime = getNextClaimTime();
            setCanClaim(new Date() >= nextClaimTime);
        }
    }, [scoreDoc]);

    const handleCountdownComplete = () => {
        setCanClaim(true);
    };

    const handleClaim = async () => {
        if (!canClaim) return;
        await claimDailyReward(userId);
        setCanClaim(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                px: 2,
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
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '3rem', sm: '4rem' },
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    Your Points: {points}
                </Typography>

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
                            Daily Reward Available!
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
                                Next Claim Available In:
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
                        disabled={claimLoading || !canClaim}
                        sx={{
                            bgcolor: canClaim ? 'primary.main' : 'action.disabledBackground',
                            color: 'white',
                            padding: '12px 32px',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            width: '100%',
                            maxWidth: '300px',
                            mt: 2,
                            '&:hover': {
                                bgcolor: canClaim ? 'primary.dark' : 'action.disabledBackground',
                            },
                            opacity: canClaim ? 1 : 0.7,
                        }}
                    >
                        {claimLoading ? 'Claiming...' : 'Claim Daily Reward'}
                    </Button>
                </Box>

                {rank && totalPlayers && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            textAlign: 'center',
                        }}
                    >
                        Rank: {rank} / {totalPlayers}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

PointsDisplay.propTypes = {
    points: PropTypes.number.isRequired,
    rank: PropTypes.number,
    totalPlayers: PropTypes.number,
    userId: PropTypes.string.isRequired,
};
