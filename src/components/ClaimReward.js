import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Snackbar, Alert, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { useUserData } from '../hooks/useUserData';
import { getStreakBonus } from '../utils/streakBonus';

export const ClaimReward = ({ userId, rewardAmount = 100, multiplier = 1 }) => {
    const { t } = useTranslation();
    const [claiming, setClaiming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const { userData } = useUserData(userId);

    const finalRewardAmount = Math.floor(rewardAmount * multiplier);
    // Placeholder for USD value calculation
    const estimatedUsdValue = '~$0.00'; // This will be calculated later

    const handleClaim = async () => {
        if (claiming) return;
        setClaiming(true);
        try {
            const db = getFirestore();
            const now = new Date();
            const lastClaimTime = userData?.lastClaimTime ? new Date(userData.lastClaimTime) : null;

            // Check if this claim continues the streak
            const isStreakContinued =
                lastClaimTime && now.getTime() - lastClaimTime.getTime() < 24 * 60 * 60 * 1000;

            const newStreak = isStreakContinued ? (userData?.currentStreak || 0) + 1 : 1;

            // Calculate bonus from streak
            const streakBonus = getStreakBonus(newStreak);
            const totalMultiplier = multiplier * (1 + streakBonus);

            await updateDoc(doc(db, 'users', userId), {
                points: increment(Math.floor(rewardAmount * totalMultiplier)),
                lastClaimTime: serverTimestamp(),
                currentStreak: newStreak,
                totalClaims: increment(1),
            });

            setShowSuccess(true);
        } catch (error) {
            console.error('Error claiming reward:', error);
            setShowError(true);
        } finally {
            setClaiming(false);
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                mt: -1, // Negative margin to connect with countdown
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.04)'
                        : 'rgba(91, 180, 255, 0.04)',
                borderRadius: '0 0 16px 16px', // Rounded bottom corners only
                borderLeft: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(91, 180, 255, 0.12)'
                    }`,
                borderRight: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(91, 180, 255, 0.12)'
                    }`,
                borderBottom: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(91, 180, 255, 0.12)'
                    }`,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" color="text.primary">
                        {t('earnedReward')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                        ({estimatedUsdValue})
                    </Typography>
                </Box>

                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {t('rewardValue', { amount: finalRewardAmount })}
                </Typography>

                <Button
                    variant="contained"
                    disabled={claiming}
                    onClick={handleClaim}
                    sx={{
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem',
                        position: 'relative',
                    }}
                >
                    {claiming ? (
                        <>
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    marginLeft: '-12px',
                                }}
                            />
                            <span style={{ opacity: 0 }}>{t('claimButton')}</span>
                        </>
                    ) : (
                        t('claimButton')
                    )}
                </Button>

                <Divider sx={{ width: '100%', my: 1 }} />
            </Box>

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={() => setShowSuccess(false)}
            >
                <Alert severity="success" onClose={() => setShowSuccess(false)}>
                    {t('claimSuccess', { amount: finalRewardAmount })}
                </Alert>
            </Snackbar>

            <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)}>
                <Alert severity="error" onClose={() => setShowError(false)}>
                    {t('claimError')}
                </Alert>
            </Snackbar>
        </Box>
    );
};

ClaimReward.propTypes = {
    userId: PropTypes.string.isRequired,
    rewardAmount: PropTypes.number,
    multiplier: PropTypes.number,
};

ClaimReward.defaultProps = {
    rewardAmount: 100,
    multiplier: 1,
};
