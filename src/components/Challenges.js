import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PropTypes from 'prop-types';
import { useUserData } from '../hooks/useUserData';

export const Challenges = ({ userId }) => {
    const { userData, loading } = useUserData(userId);
    const telegramConnected = userData.telegramConnected;
    console.log('🔥 Challenges - userData:', userData);
    const handleTelegramClick = () => {
        const botName = process.env.REACT_APP_TELEGRAM_BOT_NAME;
        if (!botName) {
            console.error('Telegram bot name not configured');
            return;
        }

        const telegramUrl = `https://t.me/${botName}?start=${userId}`;
        console.log('Opening Telegram URL:', telegramUrl, 'with userId:', userId);

        const width = 550;
        const height = 470;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
            telegramUrl,
            'telegram-auth',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    };

    if (loading) {
        return <Box sx={{ mt: 4 }}>Loading...</Box>;
    }

    return (
        <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'normal' }}>
                Challenges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 400,
                        bgcolor: telegramConnected
                            ? 'rgba(46, 125, 50, 0.6)'
                            : 'rgba(30, 30, 30, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TelegramIcon
                                sx={{
                                    mr: 1.5,
                                    color: telegramConnected ? '#4caf50' : '#0088cc',
                                    fontSize: '2rem',
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 'normal',
                                    color: 'white',
                                }}
                            >
                                Telegram Challenge
                            </Typography>
                            {telegramConnected && (
                                <CheckCircleIcon
                                    sx={{
                                        ml: 'auto',
                                        color: '#4caf50',
                                        fontSize: '2rem',
                                    }}
                                />
                            )}
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '1.1rem',
                                lineHeight: 1.4,
                            }}
                        >
                            {telegramConnected
                                ? '🎉 Congratulations! You are now receiving a permanent 10% bonus on all rewards!'
                                : 'Link your Telegram account to get a permanent 10% bonus on all rewards!'}
                        </Typography>
                        {!telegramConnected && (
                            <Button
                                variant="contained"
                                onClick={handleTelegramClick}
                                startIcon={<TelegramIcon />}
                                fullWidth
                                sx={{
                                    bgcolor: '#0088cc',
                                    '&:hover': {
                                        bgcolor: '#0077b3',
                                    },
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                }}
                            >
                                Connect with Telegram
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

Challenges.propTypes = {
    userId: PropTypes.string.isRequired,
};
