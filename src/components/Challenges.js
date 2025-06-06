import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    Typography,
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import PropTypes from 'prop-types';
import { useUserData } from '../hooks/useUserData';
import { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import DialogContentText from '@mui/material/DialogContentText';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ChallengeCard } from './ChallengeCard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

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

export const Challenges = ({ userId, onTabChange }) => {
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

    const handleReferralClick = () => {
        onTabChange('referrals');
    };

    const handleTwitterAuth = async () => {
        try {
            // Get current URL parameters
            const currentUrl = new URL(window.location.href);
            const originalParams = {};
            currentUrl.searchParams.forEach((value, key) => {
                originalParams[key] = value;
            });

            const functions = getFunctions();
            const generateAuthUrl = httpsCallable(functions, 'generateTwitterAuthUrl');
            const result = await generateAuthUrl({ originalParams });

            const { url } = result.data;
            const width = 600;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            window.open(
                url,
                'twitter-auth',
                `width=${width},height=${height},left=${left},top=${top}`
            );
        } catch (error) {
            console.error('Error generating Twitter auth URL:', error);
            // You might want to show an error message to the user here
        }
    };

    if (loading) {
        return <Box sx={{ mt: 4 }}>{t('loading')}</Box>;
    }

    return (
        <Box sx={{ mt: 4, width: '100%' }}>
            {/* <Box sx={{ mb: 4 }}>
                <ClaimReward
                    userId={userId}
                    rewardAmount={100}
                    multiplier={userData?.multiplier || 1}
                />
            </Box> */}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ChallengeCard
                    icon={TwitterIcon}
                    title={t('twitterChallenge')}
                    description={
                        userData.twitterConnected ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    src={userData.twitter?.twitterProfileImage}
                                    sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    @{userData.twitter?.twitterHandle}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    sx={{ ml: 1, minWidth: 0, px: 1, fontSize: 12 }}
                                    onClick={async () => {
                                        const functions = getFunctions();
                                        const disconnectTwitter = httpsCallable(
                                            functions,
                                            'disconnectTwitter'
                                        );
                                        await disconnectTwitter();
                                        window.location.reload();
                                    }}
                                >
                                    Disconnect
                                </Button>
                            </Box>
                        ) : (
                            t('twitterPrompt')
                        )
                    }
                    isCompleted={userData.twitterConnected}
                    buttonText={t('connectTwitter')}
                    onAction={handleTwitterAuth}
                    color="#1DA1F2"
                    buttonStartIcon={<TwitterIcon />}
                />

                {/* Follow KoalaWallet Challenge */}
                <ChallengeCard
                    icon={TwitterIcon}
                    title={t('followKoalaWalletChallenge')}
                    description={t('followKoalaWalletChallenge')}
                    buttonText={
                        userData.twitterConnected
                            ? t('followKoalaWalletChallenge')
                            : t('connectTwitter')
                    }
                    onAction={async () => {
                        if (!userData.twitterConnected) {
                            await handleTwitterAuth();
                        } else {
                            const functions = getFunctions();
                            const followKoalaWallet = httpsCallable(functions, 'followKoalaWallet');
                            try {
                                await followKoalaWallet();
                            } catch (err) {
                                console.error('Failed to follow KoalaWallet:', err);
                            }
                        }
                    }}
                    color="#1DA1F2"
                    buttonStartIcon={<TwitterIcon />}
                    isCompleted={userData.twitter?.followTwitter}
                />

                <ChallengeCard
                    icon={TelegramIcon}
                    title={t('telegramChallenge')}
                    description={telegramConnected ? t('telegramSuccess') : t('telegramPrompt')}
                    isCompleted={telegramConnected}
                    buttonText={t('connectTelegram')}
                    onAction={handleTelegramClick}
                    color="#0088cc"
                    buttonStartIcon={<TelegramIcon />}
                />

                <ChallengeCard
                    icon={EmailIcon}
                    title={t('emailChallenge')}
                    description={
                        userData.emailConnected
                            ? t('emailChallengeSuccess')
                            : t('emailChallengePrompt')
                    }
                    isCompleted={userData.emailConnected}
                    buttonText={t('shareEmail')}
                    onAction={() => setOpenEmailDialog(true)}
                    color="#1976d2"
                    buttonStartIcon={<EmailIcon />}
                />

                <ChallengeCard
                    icon={GroupAddIcon}
                    title={t('referralChallenge')}
                    description={t('referralChallengePrompt')}
                    buttonText={t('startReferring')}
                    onAction={handleReferralClick}
                    completed={userData?.referralCount > 0}
                    successMessage={t('referralSuccess')}
                />
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
    onTabChange: PropTypes.func.isRequired,
};
