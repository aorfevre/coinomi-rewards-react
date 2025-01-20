import React from 'react';
import { Box, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';

export const PrivacyDisclaimer = () => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(91, 180, 255, 0.08)',
                borderRadius: '16px',
                p: 2.5,
                mb: 3,
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.2)'
                            : 'rgba(91, 180, 255, 0.2)'
                    }`,
                boxShadow: theme =>
                    theme.palette.mode === 'light'
                        ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                        : '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: theme =>
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.7)'
                            : 'rgba(255, 255, 255, 0.9)',
                }}
            >
                <ShieldIcon
                    sx={{
                        fontSize: 24,
                        color: theme =>
                            theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
                    }}
                />
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 500,
                        lineHeight: 1.5,
                    }}
                >
                    {t('privacyDisclaimer')}
                </Typography>
            </Box>
        </Box>
    );
};
