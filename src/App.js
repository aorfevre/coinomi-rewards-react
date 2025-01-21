import { Box, CssBaseline, ThemeProvider, CircularProgress, Container } from '@mui/material';
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
import { ReferralTab } from './components/ReferralTab';
import { ErrorPage } from './components/ErrorPage';
import { ChallengesTab } from './components/ChallengesTab';

function App() {
    const { t } = useTranslation();
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => getTheme(mode), [mode]);
    const [currentTab, setCurrentTab] = React.useState('home');

    // Get token from query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    const { user, loading: authLoading, error: authError } = useAuth(token);
    const { score } = useScore(user?.uid);
    const { rank, totalPlayers, loading: rankLoading } = useUserRank(user?.uid);

    const handleThemeToggle = () => {
        setMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'));
    };

    // Wrap error and loading states with ThemeProvider
    const renderWithTheme = content => (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {content}
        </ThemeProvider>
    );

    if (!token) {
        return renderWithTheme(
            <ErrorPage
                title={t('authRequired')}
                message={t('pleaseAddtoken')}
                showHomeButton={false}
                icon={ErrorOutlineIcon}
            />
        );
    }

    if (authLoading) {
        return renderWithTheme(
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
                <LogoDevIcon
                    sx={{
                        fontSize: 48,
                        color: '#5bb4ff',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { opacity: 1, transform: 'scale(1)' },
                            '50%': { opacity: 0.7, transform: 'scale(0.95)' },
                            '100%': { opacity: 1, transform: 'scale(1)' },
                        },
                    }}
                />
                <CircularProgress size={24} thickness={4} sx={{ color: '#5bb4ff' }} />
            </Box>
        );
    }

    if (authError) {
        return renderWithTheme(
            <ErrorPage
                title={t('authFailed')}
                message={authError.message || t('authenticationError')}
                showHomeButton={true}
                showRetryButton={true}
                icon={ErrorOutlineIcon}
            />
        );
    }

    if (!user) {
        return renderWithTheme(
            <ErrorPage
                title={t('noUserFound')}
                message={t('userNotFoundMessage')}
                showHomeButton={true}
                icon={ErrorOutlineIcon}
            />
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
                {currentTab === 'tasks' && <Tasks userId={user?.uid} />}
                {currentTab === 'referrals' && <ReferralTab userId={user?.uid} />}
                {currentTab === 'challenges' && <ChallengesTab userId={user?.uid} />}

                <FireworksButton />
            </Container>
        </ThemeProvider>
    );
}

export default App;
