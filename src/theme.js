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
                          main: '#4477FF',
                          light: '#6691FF',
                          dark: '#3366DD',
                      },
                      secondary: {
                          main: '#FFB443',
                          light: '#FFC670',
                          dark: '#FF9F1C',
                      },
                      background: {
                          default: '#F5F8FF',
                          paper: '#FFFFFF',
                      },
                      text: {
                          primary: '#1A1A1A',
                          secondary: 'rgba(0, 0, 0, 0.6)',
                      },
                      divider: 'rgba(0, 0, 0, 0.08)',
                      action: {
                          active: 'rgba(0, 0, 0, 0.54)',
                          hover: 'rgba(68, 119, 255, 0.04)',
                          selected: 'rgba(68, 119, 255, 0.08)',
                          disabled: 'rgba(0, 0, 0, 0.26)',
                          disabledBackground: 'rgba(0, 0, 0, 0.08)',
                      },
                  }
                : {
                      // Dark mode
                      primary: {
                          main: '#4477FF',
                          light: '#6691FF',
                          dark: '#3366DD',
                      },
                      secondary: {
                          main: '#FFB443',
                          light: '#FFC670',
                          dark: '#FF9F1C',
                      },
                      background: {
                          default: '#0A0F1F',
                          paper: '#141927',
                      },
                      text: {
                          primary: '#FFFFFF',
                          secondary: 'rgba(255, 255, 255, 0.7)',
                      },
                      divider: 'rgba(255, 255, 255, 0.08)',
                      action: {
                          active: 'rgba(255, 255, 255, 0.54)',
                          hover: 'rgba(68, 119, 255, 0.08)',
                          selected: 'rgba(68, 119, 255, 0.16)',
                          disabled: 'rgba(255, 255, 255, 0.3)',
                          disabledBackground: 'rgba(255, 255, 255, 0.08)',
                      },
                  }),
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isLight ? '#FFFFFF' : '#141927',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                            isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                        }`,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isLight ? '#FFFFFF' : '#141927',
                        '&.challenge-card': {
                            backgroundColor: isLight ? '#FFFFFF' : '#141927',
                            border: `1px solid ${
                                isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                            }`,
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                    containedPrimary: {
                        background: 'linear-gradient(45deg, #4477FF, #6691FF)',
                        boxShadow: isLight
                            ? '0 2px 8px rgba(68, 119, 255, 0.25)'
                            : '0 2px 8px rgba(68, 119, 255, 0.15)',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isLight ? '#FFFFFF' : '#141927',
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: isLight ? '#1A1A1A' : '#FFFFFF',
                    },
                },
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
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
            button: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 12,
        },
    });
};
