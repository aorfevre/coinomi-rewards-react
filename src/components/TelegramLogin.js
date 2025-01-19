import { Box, Typography, Link } from '@mui/material';
import PropTypes from 'prop-types';

export const TelegramLogin = ({ userId }) => {
    return (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Connect your Telegram account to get a 10% bonus on rewards!
            </Typography>
            <Typography variant="body1">To connect your account:</Typography>
            <Typography variant="body1" component="div" sx={{ mt: 1 }}>
                1. Open our Telegram bot:{' '}
                <Link
                    href={`https://t.me/${process.env.REACT_APP_TELEGRAM_BOT_NAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    @{process.env.REACT_APP_TELEGRAM_BOT_NAME}
                </Link>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
                2. Send the command: <code>/link {userId}</code>
            </Typography>
        </Box>
    );
};

TelegramLogin.propTypes = {
    userId: PropTypes.string.isRequired,
};
