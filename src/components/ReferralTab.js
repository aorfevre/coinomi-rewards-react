import React from 'react';
import {
    Box,
    Typography,
    Card,
    TextField,
    Snackbar,
    CircularProgress,
    Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReferral } from '../hooks/useReferral';
import { EditReferralDialog } from './EditReferralDialog';
import { EnterReferralDialog } from './EnterReferralDialog';
import { useUserData } from '../hooks/useUserData';
import { SocialShare } from './SocialShare';

export const ReferralTab = ({ userId }) => {
    const { t } = useTranslation();
    const { userData } = useUserData(userId);
    const [showCopied, setShowCopied] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [enterReferralOpen, setEnterReferralOpen] = React.useState(false);
    const { referralCode, referralCount, loading, error, refresh, hasReferrer } =
        useReferral(userId);

    const handleCopy = () => {
        navigator.clipboard.writeText(userData?.referralCode || '');
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{t('errorLoading')}</Typography>
            </Box>
        );
    }

    const renderReferralCodeSection = () => (
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
                fullWidth
                value={referralCode || ''}
                InputProps={{
                    readOnly: true,
                    sx: {
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-input': {
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            letterSpacing: '0.1em',
                        },
                    },
                }}
            />
            <Button
                variant="contained"
                onClick={handleCopy}
                startIcon={<ContentCopyIcon />}
                sx={{
                    minWidth: 120,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                }}
            >
                {t('copy')}
            </Button>
        </Box>
    );

    return (
        <Box sx={{ p: 2 }}>
            {/* Have a Referral Code section */}
            {!hasReferrer && (
                <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {t('haveReferralCode')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('enterReferralCodePrompt')}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setEnterReferralOpen(true)}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        }}
                    >
                        {t('enterCode')}
                    </Button>
                </Card>
            )}
            <Typography variant="h5" sx={{ mb: 4 }}>
                {t('referYourFriends')}
            </Typography>

            {/* Your Referral Code section */}
            <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {t('yourReferralCode')}
                </Typography>

                {renderReferralCodeSection()}

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {t('shareVia')}:
                </Typography>

                <SocialShare referralCode={referralCode} />

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 3, textAlign: 'center' }}
                >
                    {t('youHaveReferred', { count: referralCount })}
                </Typography>
            </Card>

            <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('howItWorks')}:
                </Typography>

                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {t('referralSteps', { returnObjects: true }).map((step, index) => (
                        <Typography
                            component="li"
                            key={index}
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            {step}
                        </Typography>
                    ))}
                </Box>
            </Card>

            <Snackbar
                open={showCopied}
                autoHideDuration={2000}
                onClose={() => setShowCopied(false)}
                message={t('linkCopied')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            <EditReferralDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                userId={userId}
                onSuccess={refresh}
            />

            <EnterReferralDialog
                open={enterReferralOpen}
                onClose={() => setEnterReferralOpen(false)}
                userId={userId}
                onSuccess={refresh}
            />
        </Box>
    );
};

ReferralTab.propTypes = {
    userId: PropTypes.string.isRequired,
};
