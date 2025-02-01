import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

export const PrivacyDisclaimer = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: theme => theme.palette.background.paper,
                borderRadius: 4,
                p: 3,
                mb: 3,
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.08)'
                            : 'rgba(255, 255, 255, 0.08)'
                    }`,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                position: 'relative',
            }}
        >
            <IconButton
                onClick={() => setIsVisible(false)}
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    color: theme =>
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.54)'
                            : 'rgba(255, 255, 255, 0.54)',
                }}
                aria-label="close"
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <ShieldIcon
                    sx={{
                        fontSize: 28,
                        color: theme =>
                            theme.palette.mode === 'light'
                                ? theme.palette.primary.main
                                : theme.palette.primary.light,
                    }}
                />
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: theme => theme.palette.text.primary,
                        }}
                    >
                        {t('privacyTitle', 'Coinomi does not collect personal data')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme => theme.palette.text.secondary,
                            lineHeight: 1.5,
                        }}
                    >
                        {t(
                            'privacyDescription',
                            'A third-party system securely manages points and social linking.'
                        )}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
