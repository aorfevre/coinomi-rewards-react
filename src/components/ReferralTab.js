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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReferral } from '../hooks/useReferral';
import { EditReferralDialog } from './EditReferralDialog';

export const ReferralTab = ({ userId }) => {
    const { t } = useTranslation();
    const [showCopied, setShowCopied] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const { referralCode, referralCount, loading, error, refresh } = useReferral(userId);

    const referralLink = `${window.location.origin}?ref=${referralCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setShowCopied(true);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
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

            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {t('howReferralWorks')}
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
                <ul>
                    {t('referralSteps', { returnObjects: true }).map((step, index) => (
                        <li key={index} style={{ marginBottom: '8px' }}>
                            {step}
                        </li>
                    ))}
                </ul>
            </Typography>

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
        </Box>
    );
};

ReferralTab.propTypes = {
    userId: PropTypes.string.isRequired,
};
