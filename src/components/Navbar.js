import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../hooks/useAuth';
import { useScore } from '../hooks/useScore';
import { shortenAddress } from '../utils/address';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import PropTypes from 'prop-types';

export const Navbar = ({ onThemeToggle }) => {
    const { user } = useAuth();
    const { scoreDoc } = useScore(user?.uid);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeToggleAndClose = () => {
        onThemeToggle();
        handleClose();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 2,
                bgcolor: theme => (theme.palette.mode === 'dark' ? '#0E244D' : 'primary.main'),
                color: 'white',
                height: '160px',
                flexDirection: 'column',
                position: 'relative',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
            }}
        >
            {/* Top Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: 0,
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
                    <MenuItem>
                        <ThemeToggle onToggle={handleThemeToggleAndClose} />
                    </MenuItem>
                    <MenuItem>
                        <LanguageToggle />
                    </MenuItem>
                </Menu>
            </Box>

            {/* Points Card */}
            <Box
                sx={{
                    bgcolor: theme =>
                        theme.palette.mode === 'dark' ? '#000000' : 'background.paper',
                    borderRadius: 4,
                    py: 2,
                    px: 3,
                    width: '100%',
                    maxWidth: '90%',
                    position: 'absolute',
                    top: '45%',
                    left: '50%',
                    transform: 'translate(-50%, -10%)',
                    boxShadow: theme =>
                        theme.palette.mode === 'dark'
                            ? '0px 4px 12px rgba(0, 0, 0, 0.25)'
                            : '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 1,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: theme => (theme.palette.mode === 'dark' ? 'white' : 'text.primary'),
                        mb: 0.5,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        lineHeight: 1,
                    }}
                >
                    {scoreDoc?.points?.toFixed(2) || '0.00'}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.5)'
                                : 'text.secondary',
                        opacity: theme => (theme.palette.mode === 'dark' ? 0.8 : 1),
                        lineHeight: 1.2,
                    }}
                >
                    Points available
                </Typography>
            </Box>
        </Box>
    );
};

Navbar.propTypes = {
    onThemeToggle: PropTypes.func.isRequired,
};
