import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
        handleClose();
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                        color: 'rgba(255, 255, 255, 0.9)',
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
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                    },
                }}
            >
                <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
                <MenuItem onClick={() => changeLanguage('pt')}>Português</MenuItem>
            </Menu>
        </>
    );
};
