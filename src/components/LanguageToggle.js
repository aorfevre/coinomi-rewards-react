import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

export const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = lang => {
        i18n.changeLanguage(lang);
        handleClose();
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'pt', name: 'Português' },
        { code: 'fr', name: 'Français' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'zh', name: '中文' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'fil', name: 'Filipino' },
    ];

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: 'text.primary',
                }}
                aria-label="change language"
            >
                <TranslateIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                    },
                }}
            >
                {languages.map(lang => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        selected={i18n.language === lang.code}
                        sx={{
                            minWidth: 120,
                            justifyContent: 'center',
                        }}
                    >
                        {lang.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
