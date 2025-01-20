import { createTheme } from '@mui/material/styles';

export const getTheme = mode => {
    const isLight = mode === 'light';

    return createTheme({
        palette: {
            mode,
            ...(isLight
                ? {
                      // Light mode
                      primary: {
                          main: '#1976d2',
                          light: '#42a5f5',
                          dark: '#1565c0',
                      },
                      secondary: {
                          main: '#9c27b0',
                          light: '#ba68c8',
                          dark: '#7b1fa2',
                      },
                      background: {
                          default: '#f5f5f5',
                          paper: '#ffffff',
                      },
                      text: {
                          primary: '#1a1a1a',
                          secondary: 'rgba(0, 0, 0, 0.7)',
                      },
                      divider: 'rgba(0, 0, 0, 0.12)',
                      action: {
                          active: 'rgba(0, 0, 0, 0.54)',
                          hover: 'rgba(0, 0, 0, 0.04)',
                          selected: 'rgba(0, 0, 0, 0.08)',
                          disabled: 'rgba(0, 0, 0, 0.26)',
                          disabledBackground: 'rgba(0, 0, 0, 0.12)',
                      },
                  }
                : {
                      // Dark mode
                      primary: {
                          main: '#5bb4ff',
                          light: '#82c6ff',
                          dark: '#4090cc',
                      },
                      secondary: {
                          main: '#ce93d8',
                          light: '#f3e5f5',
                          dark: '#ab47bc',
                      },
                      background: {
                          default: '#0a0a0a',
                          paper: '#1a1a1a',
                      },
                      text: {
                          primary: '#ffffff',
                          secondary: 'rgba(255, 255, 255, 0.7)',
                      },
                      divider: 'rgba(255, 255, 255, 0.12)',
                      action: {
                          active: 'rgba(255, 255, 255, 0.54)',
                          hover: 'rgba(255, 255, 255, 0.08)',
                          selected: 'rgba(255, 255, 255, 0.16)',
                          disabled: 'rgba(255, 255, 255, 0.3)',
                          disabledBackground: 'rgba(255, 255, 255, 0.12)',
                      },
                  }),
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isLight
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(30, 30, 30, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                            isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
                        }`,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isLight
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(30, 30, 30, 0.8)',
                        '&.challenge-card': {
                            backgroundColor: isLight
                                ? 'rgba(255, 255, 255, 0.95)'
                                : 'rgba(30, 30, 30, 0.95)',
                            border: `1px solid ${
                                isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
                            }`,
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: isLight ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                    },
                },
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '3rem',
                fontWeight: 700,
            },
            h4: {
                fontWeight: 600,
            },
            h5: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 8,
        },
    });
};
