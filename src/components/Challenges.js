import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PropTypes from 'prop-types';
import { useUserData } from '../hooks/useUserData';
import { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import DialogContentText from '@mui/material/DialogContentText';
import { styled } from '@mui/material/styles';

// Add styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(2),
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '1.5rem',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    paddingBottom: theme.spacing(1),
}));

export const Challenges = ({ userId }) => {
    const { userData, loading } = useUserData(userId);
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleEmailSubmit = async () => {
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        try {
            const db = getFirestore();
            await updateDoc(doc(db, 'users', userId), {
                email: email,
                emailConnected: true,
            });
            setOpenEmailDialog(false);
            // You might want to refresh userData here
        } catch (error) {
            console.error('Error saving email:', error);
            setEmailError('Failed to save email. Please try again.');
        }
    };

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
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}
            >
                <Card
                    sx={{
                        flex: '1 1 300px',
                        maxWidth: '400px',
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

                <Card
                    sx={{
                        flex: '1 1 300px',
                        maxWidth: '400px',
                        bgcolor: userData.emailConnected
                            ? 'rgba(46, 125, 50, 0.6)'
                            : 'rgba(30, 30, 30, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmailIcon
                                sx={{
                                    mr: 1.5,
                                    color: userData.emailConnected ? '#4caf50' : '#1976d2',
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
                                Email Challenge
                            </Typography>
                            {userData.emailConnected && (
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
                            {userData.emailConnected
                                ? '🎉 Congratulations! You are now receiving a permanent 10% bonus on all rewards!'
                                : 'Share your email to get a permanent 10% bonus on all rewards!'}
                        </Typography>
                        {!userData.emailConnected && (
                            <Button
                                variant="contained"
                                onClick={() => setOpenEmailDialog(true)}
                                startIcon={<EmailIcon />}
                                fullWidth
                                sx={{
                                    bgcolor: '#1976d2',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                    },
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                }}
                            >
                                Share Email
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <StyledDialog
                open={openEmailDialog}
                onClose={() => setOpenEmailDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <StyledDialogTitle>Connect Your Email</StyledDialogTitle>
                <DialogContent sx={{ pb: 3, pt: 2 }}>
                    <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
                        �� Get a permanent 10% bonus on all rewards by connecting your email!
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            setEmailError('');
                        }}
                        error={!!emailError}
                        helperText={emailError}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '16.5px 14px',
                            },
                        }}
                        placeholder="your.email@example.com"
                    />
                    <DialogContentText
                        variant="caption"
                        sx={{
                            mt: 2,
                            display: 'block',
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        We&apos;ll only use your email for important updates and rewards
                        notifications.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
                    <Button
                        onClick={() => setOpenEmailDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEmailSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            textTransform: 'none',
                            fontSize: '1rem',
                            bgcolor: '#1976d2',
                            '&:hover': {
                                bgcolor: '#1565c0',
                            },
                        }}
                    >
                        Connect Email
                    </Button>
                </DialogActions>
            </StyledDialog>
        </Box>
    );
};

Challenges.propTypes = {
    userId: PropTypes.string.isRequired,
};
