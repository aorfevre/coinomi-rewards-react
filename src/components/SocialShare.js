import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTranslation } from 'react-i18next';

// Custom X (Twitter) icon component
const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Custom Discord icon component
const DiscordIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
);

export const SocialShare = ({ referralCode }) => {
    const { t } = useTranslation();
    const appUrl = window.location.origin;
    const shareText = t('shareInviteText', { appUrl, referralCode });

    const socials = [
        {
            name: 'Facebook',
            icon: <FacebookIcon />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'X',
            icon: <XIcon />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Telegram',
            icon: <TelegramIcon />,
            url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Discord',
            icon: <DiscordIcon />,
            url: `https://discord.com/channels/@me`,
        },
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon />,
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        },
    ];

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {socials.map(({ name, icon, url }) => (
                <IconButton
                    key={name}
                    onClick={() => window.open(url, '_blank')}
                    aria-label={t('shareOn', { network: name })}
                    sx={{
                        color: 'primary.main',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    {icon}
                </IconButton>
            ))}
        </Box>
    );
};

SocialShare.propTypes = {
    referralCode: PropTypes.string.isRequired,
};
