import { createTheme } from '@mui/material/styles';

export const getTheme = mode =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#5bb4ff' : '#1976d2',
            },
            background: {
                default: mode === 'dark' ? '#121212' : '#ffffff',
                paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        textTransform: 'none',
                        borderRadius: '8px',
                        ...(theme.palette.mode === 'dark' && {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                            },
                        }),
                    }),
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        ...(theme.palette.mode === 'dark' && {
                            backgroundImage: 'none',
                        }),
                    }),
                },
            },
        },
    });
