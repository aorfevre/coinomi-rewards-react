import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export const ThemeToggle = ({ onToggle }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <IconButton
            onClick={onToggle}
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
