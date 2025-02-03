import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';

export const FeedbackSnackbar = ({ open, message, severity, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={10000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
                '& .MuiAlert-root': {
                    width: '100%',
                    minWidth: '300px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '& .MuiAlert-message': {
                        fontSize: '1rem',
                    },
                },
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                elevation={6}
                sx={{
                    backgroundColor: theme => {
                        switch (severity) {
                            case 'success':
                                return theme.palette.success.main;
                            case 'error':
                                return theme.palette.error.main;
                            case 'info':
                                return theme.palette.info.main;
                            default:
                                return theme.palette.primary.main;
                        }
                    },
                    color: 'white',
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

FeedbackSnackbar.propTypes = {
    open: PropTypes.bool.isRequired,
    message: PropTypes.string,
    severity: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
    onClose: PropTypes.func.isRequired,
};
