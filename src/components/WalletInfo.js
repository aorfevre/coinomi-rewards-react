import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export const WalletInfo = ({ address, onThemeToggle }) => {
    const shortenAddress = addr => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                }}
            >
                {shortenAddress(address)}
            </Typography>
            <LanguageToggle />
            <ThemeToggle onToggle={onThemeToggle} />
        </Box>
    );
};

WalletInfo.propTypes = {
    address: PropTypes.string.isRequired,
    onThemeToggle: PropTypes.func.isRequired,
};
