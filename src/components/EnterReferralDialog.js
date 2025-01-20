import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const EnterReferralDialog = ({ open, onClose, userId, onSuccess }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setError('');
            setLoading(true);

            const processReferral = httpsCallable(functions, 'processReferral');
            await processReferral({ referralCode: code.toUpperCase(), newUserId: userId });

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            console.error('Error processing referral code:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        const value = e.target.value.toUpperCase();
        if (/^[a-zA-Z0-9]*$/.test(value)) {
            setCode(value);
            setError('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('enterReferralCode')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {t('enterReferralCodeInstructions')}
                </Typography>
                <TextField
                    fullWidth
                    value={code}
                    onChange={handleChange}
                    label={t('referralCode')}
                    error={!!error}
                    helperText={error || t('referralCodeFormat')}
                    sx={{
                        '& input': {
                            textTransform: 'uppercase',
                            fontFamily: 'monospace',
                            letterSpacing: '0.1em',
                        },
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={code.length < 5 || loading}
                    variant="contained"
                    color="primary"
                >
                    {loading ? t('submitting') : t('submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EnterReferralDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
};
