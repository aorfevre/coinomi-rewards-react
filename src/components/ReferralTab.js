import React from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Tooltip,
    IconButton,
    Snackbar,
    CircularProgress,
    Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EditIcon from '@mui/icons-material/Edit';
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

    const handleEditSuccess = () => {
        refresh();
        setShowCopied(true);
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

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
                {t('referralProgram')}
            </Typography>

            {!hasReferrer && (
                <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('haveReferralCode')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('enterReferralCodePrompt')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setEnterReferralOpen(true)}
                    >
                        {t('enterCode')}
                    </Button>
                </Paper>
            )}

            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: theme =>
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.04)'
                            : 'rgba(91, 180, 255, 0.04)',
                    border: theme =>
                        `1px solid ${
                            theme.palette.mode === 'light'
                                ? 'rgba(25, 118, 210, 0.12)'
                                : 'rgba(91, 180, 255, 0.12)'
                        }`,
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('yourReferralCode')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            value={referralCode || ''}
                            InputProps={{
                                readOnly: true,
                                sx: {
                                    bgcolor: 'background.paper',
                                    fontFamily: 'monospace',
                                    fontSize: '1.2rem',
                                    letterSpacing: '0.1em',
                                },
                            }}
                        />
                        <Tooltip title={t('copyToClipboard')} placement="top">
                            <IconButton onClick={handleCopy} color="primary">
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('editReferralCode')} placement="top">
                            <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <SocialShare referralCode={referralCode} />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                    }}
                >
                    <PeopleAltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h6" color="primary">
                            {referralCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('totalReferrals')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('howReferralWorks')}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
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

                <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('referralRewards')}
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                    {t('referralBonuses', { returnObjects: true }).map((bonus, index) => (
                        <Typography
                            component="li"
                            key={index}
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            {bonus}
                        </Typography>
                    ))}
                </Box>
            </Paper>

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
                onSuccess={handleEditSuccess}
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
