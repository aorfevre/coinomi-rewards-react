import React from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { getTheme } from './theme';
import { PointsDisplay } from './components/PointsDisplay';
import { Leaderboard } from './components/Leaderboard';

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () => getTheme(prefersDarkMode ? 'dark' : 'light'),
        [prefersDarkMode]
    );

    // Get token from query params - will be used later for authentication
    // const params = new URLSearchParams(window.location.search);
    // const token = params.get('token');

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                className="min-h-screen"
                sx={{
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}
            >
                <Box className="container mx-auto px-4 py-8">
                    <PointsDisplay points={100} rank={1} totalPlayers={1} timeLeft="23h 50m 24s" />
                    <Leaderboard />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
