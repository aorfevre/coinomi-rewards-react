import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';

const DISCLAIMER_STORAGE_KEY = 'privacy_disclaimer_closed';

export const PrivacyDisclaimer = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check localStorage on component mount
        const isClosed = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
        if (isClosed) {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        // Store in localStorage and hide disclaimer
        localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                mt: 2,
                mb: 2,
                position: 'relative',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                }}
                aria-label="close"
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ShieldIcon
                    sx={{
                        color: 'primary.main',
                        fontSize: 32,
                    }}
                />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {t('privacyTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('privacyDescription')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
