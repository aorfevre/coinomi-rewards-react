import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

export const ThemeToggle = ({ onToggle, sx }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <IconButton
            onClick={onToggle}
            color="inherit"
            sx={{
                ...sx,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'rotate(30deg)',
                },
            }}
            aria-label="toggle theme"
        >
            {isDarkMode ? <LightMode sx={{ fontSize: 24 }} /> : <DarkMode sx={{ fontSize: 24 }} />}
        </IconButton>
    );
};

ThemeToggle.propTypes = {
    onToggle: PropTypes.func.isRequired,
    sx: PropTypes.object,
};
