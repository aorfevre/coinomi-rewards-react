import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../hooks/useAuth';
import { useScore } from '../hooks/useScore';
import { shortenAddress } from '../utils/address';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const Navbar = () => {
    const { user } = useAuth();
    const { scoreDoc } = useScore(user?.uid);
    const { t, i18n } = useTranslation();
    const [mode, setMode] = useLocalStorage('theme', 'light');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeToggle = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
        handleClose();
    };

    const handleLanguageChange = lang => {
        i18n.changeLanguage(lang);
        handleClose();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                height: '160px',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Top Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: 4,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 28 }} />
                    <Typography variant="h6">Rewards</Typography>
                </Box>

                <Box
                    onClick={handleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 30,
                        py: 1,
                        px: 2,
                        gap: 0.5,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                    }}
                >
                    <Typography variant="body2" sx={{ color: 'white' }}>
                        {shortenAddress(user?.walletAddress)}
                    </Typography>
                    <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleThemeToggle}>
                        {mode === 'dark' ? (
                            <LightModeIcon sx={{ mr: 1 }} />
                        ) : (
                            <DarkModeIcon sx={{ mr: 1 }} />
                        )}
                        {t('darkMode')}
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('en')}>
                        <TranslateIcon sx={{ mr: 1 }} />
                        English
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('es')}>
                        <TranslateIcon sx={{ mr: 1 }} />
                        Español
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('fr')}>
                        <TranslateIcon sx={{ mr: 1 }} />
                        Français
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('ar')}>
                        <TranslateIcon sx={{ mr: 1 }} />
                        العربية
                    </MenuItem>
                </Menu>
            </Box>

            {/* Points Card */}
            <Box
                sx={{
                    bgcolor: 'white',
                    borderRadius: 4,
                    p: 3,
                    width: '100%',
                    maxWidth: '90%',
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5,
                    }}
                >
                    {scoreDoc?.points?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Points available
                </Typography>
            </Box>
        </Box>
    );
};
