import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const ThemeToggle = ({ onToggle }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        // Check URL for theme parameter
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');

        if (themeParam && ['light', 'dark'].includes(themeParam)) {
            if (themeParam !== theme.palette.mode) {
                onToggle();
            }
        }
    }, [onToggle, theme.palette.mode]); // Run once on mount

    const handleThemeToggle = () => {
        // Update URL when theme changes
        const url = new URL(window.location.href);
        const newTheme = theme.palette.mode === 'dark' ? 'light' : 'dark';
        url.searchParams.set('theme', newTheme);
        window.history.replaceState({}, '', url);

        onToggle();
    };

    return (
        <IconButton
            onClick={handleThemeToggle}
            color="inherit"
            title={theme.palette.mode === 'dark' ? t('lightMode') : t('darkMode')}
        >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    );
};

ThemeToggle.propTypes = {
    onToggle: PropTypes.func.isRequired,
};
