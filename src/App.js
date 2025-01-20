import { Box, CssBaseline, ThemeProvider, Typography, CircularProgress } from '@mui/material';
import React from 'react';
import { PointsDisplay } from './components/PointsDisplay';
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

function App() {
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => getTheme(mode), [mode]);

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
                            Authentication Required
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
                            Authenticating
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
                        Please wait while we verify your wallet
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
                        Authentication failed. Please try again.
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                className="min-h-screen relative"
                sx={{
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}
            >
                <WeeklyCountdown />
                <WalletInfo address={token} onThemeToggle={handleThemeToggle} />
                <Box className="container mx-auto px-4 py-8">
                    <PointsDisplay
                        points={authLoading ? 0 : score}
                        rank={rankLoading ? 1 : rank}
                        totalPlayers={rankLoading ? 1 : totalPlayers}
                        userId={user?.uid}
                    />
                </Box>
            </Box>
            <FireworksButton />
        </ThemeProvider>
    );
}

export default App;
