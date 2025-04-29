import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTranslation } from 'react-i18next';

export const TwitterAuthSuccess = () => {
    const { t } = useTranslation();

    const handleContinue = () => {
        // Close the popup window
        window.close();
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 3,
                }}
            >
                <TwitterIcon
                    sx={{
                        fontSize: 64,
                        color: '#1DA1F2',
                        mb: 2,
                    }}
                />
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('twitterAuthSuccessTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {t('twitterAuthSuccessMessage')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleContinue}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                    }}
                >
                    {t('continueToApp')}
                </Button>
            </Box>
        </Container>
    );
};
