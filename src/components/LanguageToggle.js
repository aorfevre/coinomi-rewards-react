import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { GB, FR, BR, TR, CN, VN, PH } from 'country-flag-icons/react/3x2';

export const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageSelect = lang => {
        i18n.changeLanguage(lang);
        handleClose();
    };

    const languages = [
        { code: 'en', label: 'English', Icon: GB },
        { code: 'fr', label: 'Français', Icon: FR },
        { code: 'pt', label: 'Português', Icon: BR },
        { code: 'tr', label: 'Türkçe', Icon: TR },
        { code: 'zh', label: '中文', Icon: CN },
        { code: 'vi', label: 'Tiếng Việt', Icon: VN },
        { code: 'fil', label: 'Filipino', Icon: PH },
    ];

    return (
        <>
            <IconButton
                onClick={handleClick}
                color="inherit"
                sx={{
                    color: theme =>
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.87)'
                            : 'rgba(255, 255, 255, 0.87)',
                    '&:hover': {
                        bgcolor: theme =>
                            theme.palette.mode === 'light'
                                ? 'rgba(0, 0, 0, 0.04)'
                                : 'rgba(255, 255, 255, 0.08)',
                    },
                }}
            >
                <LanguageIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 180,
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            '&:hover': {
                                bgcolor: theme =>
                                    theme.palette.mode === 'light'
                                        ? 'rgba(0, 0, 0, 0.04)'
                                        : 'rgba(255, 255, 255, 0.08)',
                            },
                        },
                    },
                }}
            >
                {languages.map(({ code, label, Icon }) => (
                    <MenuItem
                        key={code}
                        onClick={() => handleLanguageSelect(code)}
                        selected={i18n.language === code}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Icon style={{ width: 24, height: 24 }} />
                        </ListItemIcon>
                        <ListItemText primary={label} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
