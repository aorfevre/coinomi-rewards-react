import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { languageNames } from '../i18n/translations/index';

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

    // Convert languageNames object to array format for MenuItem mapping
    const languages = Object.entries(languageNames).map(([code, name]) => ({
        code,
        name,
    }));

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
