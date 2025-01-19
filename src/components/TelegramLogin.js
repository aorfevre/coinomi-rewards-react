import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const TelegramLogin = ({ userId, onSuccess }) => {
    const handleTelegramAuth = useCallback(
        async user => {
            try {
                const linkTelegramAccount = httpsCallable(functions, 'linkTelegramAccount');
                const result = await linkTelegramAccount({
                    userId,
                    telegramData: user,
                });

                if (result.data.success) {
                    onSuccess?.(result.data);
                }
            } catch (error) {
                console.error('Failed to link Telegram account:', error);
            }
        },
        [userId, onSuccess]
    );

    useEffect(() => {
        // Load Telegram widget script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_NAME);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-userpic', 'false');
        script.setAttribute('data-onauth', 'window.onTelegramAuth(user)');
        script.async = true;

        document.body.appendChild(script);

        // Add global callback
        window.onTelegramAuth = handleTelegramAuth;

        return () => {
            document.body.removeChild(script);
            delete window.onTelegramAuth;
        };
    }, [handleTelegramAuth]);

    return (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Connect your Telegram account to get a 10% bonus on rewards!
            </Typography>
            <div id="telegram-login-btn"></div>
        </Box>
    );
};

TelegramLogin.propTypes = {
    userId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
};
