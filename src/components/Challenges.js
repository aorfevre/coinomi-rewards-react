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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { userData, loading } = useUserData(userId);
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleEmailSubmit = async () => {
        if (!emailRegex.test(email)) {
            setEmailError(t('enterValidEmail'));
            return;
        }

        try {
            const db = getFirestore();
            await updateDoc(doc(db, 'users', userId), {
                email: email,
                emailConnected: true,
            });
            setOpenEmailDialog(false);
        } catch (error) {
            console.error('Error saving email:', error);
            setEmailError(t('errorSavingEmail'));
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
        return <Box sx={{ mt: 4 }}>{t('loading')}</Box>;
    }

    return (
        <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: 'text.primary' }}>
                {t('challenges')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card
                    sx={{
                        bgcolor: theme =>
                            theme.palette.mode === 'light'
                                ? 'rgba(25, 118, 210, 0.04)'
                                : 'rgba(91, 180, 255, 0.04)',
                        border: theme =>
                            `1px solid ${
                                theme.palette.mode === 'light'
                                    ? 'rgba(25, 118, 210, 0.12)'
                                    : 'rgba(91, 180, 255, 0.12)'
                            }`,
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <TelegramIcon sx={{ color: '#0088cc', fontSize: 32 }} />
                            <Typography variant="h6" sx={{ color: 'text.primary' }}>
                                {t('telegramChallenge')}
                            </Typography>
                        </Box>

                        {telegramConnected ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon sx={{ color: 'success.main' }} />
                                <Typography sx={{ color: 'text.primary' }}>
                                    {t('telegramSuccess')}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                                    {t('telegramPrompt')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleTelegramClick}
                                    startIcon={<TelegramIcon />}
                                    sx={{
                                        bgcolor: '#0088cc',
                                        '&:hover': { bgcolor: '#0077b3' },
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {t('connectTelegram')}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        bgcolor: theme =>
                            theme.palette.mode === 'light'
                                ? 'rgba(76, 175, 80, 0.04)'
                                : 'rgba(76, 175, 80, 0.04)',
                        border: theme =>
                            `1px solid ${
                                theme.palette.mode === 'light'
                                    ? 'rgba(76, 175, 80, 0.12)'
                                    : 'rgba(76, 175, 80, 0.12)'
                            }`,
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmailIcon
                                sx={{
                                    mr: 1.5,
                                    color: userData.emailConnected
                                        ? theme =>
                                              theme.palette.mode === 'light' ? '#2e7d32' : '#4caf50'
                                        : theme =>
                                              theme.palette.mode === 'light'
                                                  ? '#1565c0'
                                                  : '#1976d2',
                                    fontSize: '2rem',
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 'normal',
                                    color: 'text.primary',
                                }}
                            >
                                {t('emailChallenge')}
                            </Typography>
                            {userData.emailConnected && (
                                <CheckCircleIcon
                                    sx={{
                                        ml: 'auto',
                                        color: theme =>
                                            theme.palette.mode === 'light' ? '#2e7d32' : '#4caf50',
                                        fontSize: '2rem',
                                    }}
                                />
                            )}
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                color: 'text.secondary',
                                fontSize: '1.1rem',
                                lineHeight: 1.4,
                            }}
                        >
                            {console.log('Translation key:', 'emailChallengePrompt')}
                            {console.log('Translation value:', t('emailChallengePrompt'))}
                            {userData.emailConnected
                                ? t('emailChallengeSuccess')
                                : t('emailChallengePrompt')}
                        </Typography>
                        {!userData.emailConnected && (
                            <Button
                                variant="contained"
                                onClick={() => setOpenEmailDialog(true)}
                                startIcon={<EmailIcon />}
                                fullWidth
                                sx={{
                                    bgcolor: theme =>
                                        theme.palette.mode === 'light' ? '#1976d2' : '#2196f3',
                                    '&:hover': {
                                        bgcolor: theme =>
                                            theme.palette.mode === 'light' ? '#1565c0' : '#1976d2',
                                    },
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                }}
                            >
                                {t('shareEmail')}
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
                <StyledDialogTitle>{t('connectYourEmail')}</StyledDialogTitle>
                <DialogContent sx={{ pb: 3, pt: 2 }}>
                    <DialogContentText
                        sx={{
                            mb: 3,
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        {t('emailBonus')}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('emailAddress')}
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
                                color: 'text.primary',
                            },
                            '& .MuiInputLabel-root': {
                                color: 'text.secondary',
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
                        {t('emailPrivacy')}
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
                        {t('cancel')}
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
                        {t('connectEmail')}
                    </Button>
                </DialogActions>
            </StyledDialog>
        </Box>
    );
};

Challenges.propTypes = {
    userId: PropTypes.string.isRequired,
};
