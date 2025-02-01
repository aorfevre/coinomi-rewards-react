import React from 'react';
import { useTranslation } from 'react-i18next';
import { languageNames } from '../i18n/translations/index.js';
import { Box, MenuItem, Menu, IconButton } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { styled } from '@mui/material/styles';

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: theme.palette.background.paper,
        maxWidth: '100%',
        width: '300px', // Reduced width for mobile
        maxHeight: '70vh',
    },
    '& .MuiList-root': {
        padding: theme.spacing(1),
    },
    '& .MuiMenuItem-root': {
        minHeight: '48px', // Taller for better touch targets
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(0.5),
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.selected': {
            backgroundColor: theme.palette.action.selected,
        },
    },
}));

export function LanguageToggle() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageSelect = languageCode => {
        const targetLanguage = languageCode === 'pt' ? 'pt-BR' : languageCode;
        i18n.changeLanguage(targetLanguage);
        handleClose();

        // Update URL with selected language
        const url = new URL(window.location.href);
        url.searchParams.set('lang', targetLanguage);
        window.history.replaceState({}, '', url);
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="large"
                aria-controls={open ? 'language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ color: 'inherit' }}
            >
                <TranslateIcon />
            </IconButton>
            <StyledMenu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'language-button',
                }}
            >
                {Object.entries(languageNames).map(([code, name]) => (
                    <MenuItem
                        key={code}
                        onClick={() => handleLanguageSelect(code)}
                        className={i18n.language === code ? 'selected' : ''}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        {name}
                    </MenuItem>
                ))}
            </StyledMenu>
        </Box>
    );
}
