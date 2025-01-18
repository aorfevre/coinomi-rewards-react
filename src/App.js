import { Box, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import React from 'react';
import { PointsDisplay } from './components/PointsDisplay';
import { WalletInfo } from './components/WalletInfo';
import { useAuth } from './hooks/useAuth';
import { useScore } from './hooks/useScore';
import { useUserRank } from './hooks/useUserRank';
import { getTheme } from './theme';

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
                    className="min-h-screen flex items-center justify-center"
                    sx={{
                        bgcolor: 'background.default',
                        color: 'text.primary',
                    }}
                >
                    <Typography variant="h5" sx={{ color: 'error.main' }}>
                        Please provide a valid authentication token in the URL
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    if (authLoading) {
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
                    <Typography>Authenticating...</Typography>
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
        </ThemeProvider>
    );
}

export default App;
