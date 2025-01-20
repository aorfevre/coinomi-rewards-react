import { Box, Typography, List, ListItem, ListItemText, Card } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useTranslation } from 'react-i18next';

export const Rules = () => {
    const { t } = useTranslation();

    const rules = [
        {
            title: t('dailyRewardsTitle'),
            icon: <TimerIcon sx={{ color: '#2196f3' }} />,
            items: t('dailyRewardsRules', { returnObjects: true }),
        },
        {
            title: t('multiplierBonusesTitle'),
            icon: <StarIcon sx={{ color: '#4caf50' }} />,
            items: t('multiplierBonusesRules', { returnObjects: true }),
        },
        {
            title: t('leaderboardTitle'),
            icon: <EmojiEventsIcon sx={{ color: '#ffd700' }} />,
            items: t('leaderboardRules', { returnObjects: true }),
        },
        {
            title: t('boostEarningsTitle'),
            icon: <TelegramIcon sx={{ color: '#0088cc' }} />,
            items: t('boostEarningsRules', { returnObjects: true }),
        },
    ];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'normal' }}>
                {t('howItWorks')}
            </Typography>

            <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                {t('welcomeMessage')}
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
