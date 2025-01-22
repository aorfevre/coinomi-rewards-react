import React from 'react';
import { useTranslation } from 'react-i18next';
import { languageNames } from '../i18n/translations/index.js';
import { Box, MenuItem, Menu, IconButton } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { styled } from '@mui/material/styles';

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: theme.palette.background.paper,
        width: '600px', // Increased width to accommodate 3 columns
        maxHeight: '80vh',
    },
    '& .MuiList-root': {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
        padding: theme.spacing(1),
        gap: theme.spacing(1),
    },
    '& .MuiMenuItem-root': {
        minHeight: '40px',
        borderRadius: theme.shape.borderRadius,
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
        console.log('Attempting to change language to:', languageCode);

        // If it's a generic 'pt' request, use 'pt-BR' as default
        const targetLanguage = languageCode === 'pt' ? 'pt-BR' : languageCode;

        console.log('Current language resources:', i18n.options.resources);
        console.log('Available languages:', Object.keys(i18n.options.resources));

        i18n.changeLanguage(targetLanguage, err => {
            if (err) {
                console.error('Error changing language:', err);
            } else {
                console.log('Language successfully changed to:', targetLanguage);
                console.log('New language direction:', i18n.dir());
            }
        });

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
                sx={{ color: 'text.primary' }}
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
                        onClick={() => {
                            console.log('Language menu item clicked:', code);
                            handleLanguageSelect(code);
                        }}
                        className={i18n.language === code ? 'selected' : ''}
                        sx={{
                            justifyContent: 'flex-start',
                            width: '100%',
                            px: 2,
                        }}
                    >
                        {name}
                    </MenuItem>
                ))}
            </StyledMenu>
        </Box>
    );
}
