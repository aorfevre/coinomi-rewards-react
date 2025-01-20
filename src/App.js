import {
    Box,
    CssBaseline,
    ThemeProvider,
    Typography,
    CircularProgress,
    Container,
} from '@mui/material';
import React from 'react';
import { WalletInfo } from './components/WalletInfo';
import { useAuth } from './hooks/useAuth';
import { useScore } from './hooks/useScore';
import { useUserRank } from './hooks/useUserRank';
import { getTheme } from './theme';
import { FireworksButton } from './components/FireworksButton';
import { WeeklyCountdown } from './components/WeeklyCountdown';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './i18n/i18n';
import { useTranslation } from 'react-i18next';
import { PrivacyDisclaimer } from './components/PrivacyDisclaimer';
import { TabMenu } from './components/TabMenu';
import { HomeTab } from './components/HomeTab';
import { Leaderboard } from './components/Leaderboard';
import { Tasks } from './components/Tasks';
import { Profile } from './components/Profile';
import { ReferralTab } from './components/ReferralTab';

function App() {
    const { t } = useTranslation();
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => getTheme(mode), [mode]);
    const [currentTab, setCurrentTab] = React.useState('home');

    // Get token from query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log('App - Token from URL:', token);

    const { user, loading: authLoading, error: authError } = useAuth(token);
    const { score } = useScore(user?.uid);
    const { rank, totalPlayers, loading: rankLoading } = useUserRank(user?.uid);

    console.log('App - Authenticated user:', user?.uid);
    console.log('App - Current score:', score);
    console.log('App - Current rank:', rank);
    console.log('App - Total players:', totalPlayers);

    const handleThemeToggle = () => {
        setMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'));
    };

    if (!token) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
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
                        <ErrorOutlineIcon
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
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'error.main',
                                fontWeight: 500,
                            }}
                        >
                            {t('authRequired')}
                        </Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    if (authLoading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <LogoDevIcon
                            sx={{
                                fontSize: 48,
                                color: '#5bb4ff',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%': {
                                        opacity: 1,
                                        transform: 'scale(1)',
                                    },
                                    '50%': {
                                        opacity: 0.7,
                                        transform: 'scale(0.95)',
                                    },
                                    '100%': {
                                        opacity: 1,
                                        transform: 'scale(1)',
                                    },
                                },
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500,
                            }}
                        >
                            {t('authenticating')}
                        </Typography>
                    </Box>
                    <CircularProgress
                        size={24}
                        thickness={4}
                        sx={{
                            color: '#5bb4ff',
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            textAlign: 'center',
                            maxWidth: 300,
                            mt: 2,
                        }}
                    >
                        {t('verifyWallet')}
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    if (authError) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    className="min-h-screen flex items-center justify-center"
                    sx={{
                        bgcolor: 'background.default',
                        color: 'text.primary',
                    }}
                >
                    <Typography variant="h5" sx={{ color: 'error.main' }}>
                        {t('authFailed')}
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <PrivacyDisclaimer />
                <WeeklyCountdown />
                <WalletInfo address={token} onThemeToggle={handleThemeToggle} />

                <TabMenu currentTab={currentTab} onTabChange={setCurrentTab} />

                {currentTab === 'home' && (
                    <HomeTab
                        userId={user?.uid}
                        userData={user}
                        score={score}
                        rank={rankLoading ? 1 : rank}
                        totalPlayers={rankLoading ? 1 : totalPlayers}
                        loading={rankLoading}
                    />
                )}
                {currentTab === 'leaderboard' && <Leaderboard />}
                {currentTab === 'tasks' && <Tasks />}
                {currentTab === 'profile' && <Profile userId={user?.uid} />}
                {currentTab === 'referrals' && (
                    <ReferralTab
                        userId={user?.uid}
                        affiliatesCount={user?.affiliatesCount || 0}
                        userData={user}
                    />
                )}

                <FireworksButton />
            </Container>
        </ThemeProvider>
    );
}

export default App;
