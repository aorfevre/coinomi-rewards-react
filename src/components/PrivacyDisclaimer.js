import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

export const PrivacyDisclaimer = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 4,
                p: 3,
                mb: 2,
                position: 'relative',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                maxWidth: '360px',
                mx: 'auto',
            }}
        >
            <IconButton
                onClick={() => setIsVisible(false)}
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    color: 'text.secondary',
                    padding: 0.5,
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ShieldIcon
                    sx={{
                        color: 'primary.main',
                        fontSize: 24,
                        mt: 0.5,
                    }}
                />
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: '1.1rem',
                            lineHeight: 1.2,
                        }}
                    >
                        {t('privacyTitle')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.4,
                            fontSize: '0.95rem',
                        }}
                    >
                        {t('privacyDescription')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
