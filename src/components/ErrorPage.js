import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

export const ErrorPage = ({
    title,
    message,
    showHomeButton = true,
    showRetryButton = false,
    onRetry,
    icon: Icon,
    customAction,
}) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                gap: 3,
                p: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    textAlign: 'center',
                }}
            >
                {Icon && (
                    <Icon
                        sx={{
                            fontSize: 64,
                            color: 'error.main',
                            animation: 'shake 0.5s ease-in-out',
                            '@keyframes shake': {
                                '0%, 100%': { transform: 'translateX(0)' },
                                '20%, 60%': { transform: 'translateX(-5px)' },
                                '40%, 80%': { transform: 'translateX(5px)' },
                            },
                        }}
                    />
                )}
                <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 500 }}>
                    {title}
                </Typography>
                {message && (
                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400 }}>
                        {message}
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                {showHomeButton && (
                    <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        onClick={() => (window.location.href = '/')}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('backToHome')}
                    </Button>
                )}
                {showRetryButton && (
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={onRetry}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('retry')}
                    </Button>
                )}
                {customAction && (
                    <Button
                        variant="contained"
                        onClick={customAction.onClick}
                        sx={{ borderRadius: 2 }}
                    >
                        {customAction.label}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

ErrorPage.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    showHomeButton: PropTypes.bool,
    showRetryButton: PropTypes.bool,
    onRetry: PropTypes.func,
    icon: PropTypes.elementType,
    customAction: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    }),
};
