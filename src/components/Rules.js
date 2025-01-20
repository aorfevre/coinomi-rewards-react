import { Box, Typography, List, ListItem, ListItemText, Card } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TelegramIcon from '@mui/icons-material/Telegram';

export const Rules = () => {
    const rules = [
        {
            title: 'Daily Rewards',
            icon: <TimerIcon sx={{ color: '#2196f3' }} />,
            items: [
                'Claim your daily reward every 24 hours',
                'Each claim gives you 100 points',
                'Points are multiplied based on your multiplier',
            ],
        },
        {
            title: 'Multiplier Bonuses',
            icon: <StarIcon sx={{ color: '#4caf50' }} />,
            items: [
                'Start with a 1x multiplier',
                'Connect Telegram for +10% bonus',
                'Verify email for +10% bonus',
                'Bonuses stack for maximum rewards',
            ],
        },
        {
            title: 'Leaderboard',
            icon: <EmojiEventsIcon sx={{ color: '#ffd700' }} />,
            items: [
                'Compete with other players',
                'Rankings update in real-time',
                'Top players earn special rewards',
            ],
        },
        {
            title: 'Boost Your Earnings',
            icon: <TelegramIcon sx={{ color: '#0088cc' }} />,
            items: [
                'Complete challenges to earn bonuses',
                'Join our Telegram community',
                'Stay active to maximize your rewards',
            ],
        },
    ];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'normal' }}>
                How It Works
            </Typography>

            <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                Welcome to Coinomi Rewards! Earn points by completing various tasks and climb the
                leaderboard.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {rules.map((section, index) => (
                    <Card
                        key={index}
                        sx={{
                            bgcolor: 'rgba(30, 30, 30, 0.6)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            p: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                            {section.icon}
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                {section.title}
                            </Typography>
                        </Box>
                        <List dense>
                            {section.items.map((item, itemIndex) => (
                                <ListItem key={itemIndex}>
                                    <ListItemText
                                        primary={item}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};
