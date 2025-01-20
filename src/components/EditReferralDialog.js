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

export const EditReferralDialog = ({ open, onClose, userId, onSuccess }) => {
    const { t } = useTranslation();
    const [newCode, setNewCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setError('');
            setLoading(true);

            const updateReferralCode = httpsCallable(functions, 'updateReferralCode');
            const result = await updateReferralCode({ userId, newCode });

            onSuccess(result.data.referralCode);
            onClose();
        } catch (err) {
            console.error('Error updating referral code:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        const value = e.target.value.toUpperCase();
        if (/^[a-zA-Z0-9]*$/.test(value)) {
            setNewCode(value);
            setError('');
        }
    };

    const isValid = newCode.length >= 5;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('editReferralCode')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {t('editReferralCodeInstructions')}
                </Typography>
                <TextField
                    fullWidth
                    value={newCode}
                    onChange={handleChange}
                    label={t('newReferralCode')}
                    error={!!error}
                    helperText={error || t('referralCodeRequirements')}
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
                    disabled={!isValid || loading}
                    variant="contained"
                    color="primary"
                >
                    {loading ? t('updating') : t('update')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditReferralDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
};
