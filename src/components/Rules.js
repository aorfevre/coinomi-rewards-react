import { Box, Typography } from '@mui/material';

export const Rules = () => {
    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                How It Works
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography>
                    Welcome to Coinomi Rewards! Earn points by completing various tasks and climb
                    the leaderboard.
                </Typography>
                <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        Daily Rewards
                    </Typography>
                    <Typography>
                        • Claim your daily reward every 24 hours
                        <br />
                        • Each claim gives you 100 points
                        <br />• Points are multiplied based on your multiplier
                    </Typography>
                </Box>
                {/* Add more rules sections here */}
            </Box>
        </Box>
    );
};
