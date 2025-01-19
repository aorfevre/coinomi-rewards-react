import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { CLAIM_COOLDOWN_MS } from '../config/env';
import { useRewards } from '../hooks/useRewards';
import { useScore } from '../hooks/useScore';
import { Countdown } from './Countdown';
import { RankDisplay } from './RankDisplay';
import { TabPanel } from './TabPanel';
import { Fireworks } from './Fireworks';
import { Challenges } from './Challenges';

export const PointsDisplay = ({ points, rank, totalPlayers, userId }) => {
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
                            {claimLoading ? 'Claiming...' : 'Claim Daily Reward'}
                        </Button>
                    </Box>

                    {rank && totalPlayers && (
                        <RankDisplay rank={rank} totalPlayers={totalPlayers} />
                    )}

                    <Challenges userId={userId} />

                    <TabPanel userId={userId} />
                </Box>
            </Box>
        </>
    );
};

PointsDisplay.propTypes = {
    points: PropTypes.number.isRequired,
    rank: PropTypes.number,
    totalPlayers: PropTypes.number,
    userId: PropTypes.string.isRequired,
};
