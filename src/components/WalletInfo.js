import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const StyledWalletButton = styled(Button)({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
    },
});

const truncateAddress = address => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const WalletInfo = ({ address }) => {
    return (
        <StyledWalletButton>
            <AccountBalanceWalletIcon />
            <Typography
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                }}
            >
                {truncateAddress(address)}
            </Typography>
        </StyledWalletButton>
    );
};

WalletInfo.propTypes = {
    address: PropTypes.string.isRequired,
};
