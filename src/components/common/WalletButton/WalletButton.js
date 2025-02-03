import React, { useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useWeb3 } from '../../../hooks/useWeb3';
import { shortenAddress } from '../../../utils/address';

export const WalletButton = () => {
    const { web3, account, connect, disconnect } = useWeb3();

    useEffect(() => {
        console.log('=== WalletButton Status ===');
        console.log('Connection:', {
            isConnected: !!account,
            walletAddress: account,
            hasWeb3: !!web3,
            provider: web3?.currentProvider?.constructor?.name,
        });
        console.log('Web3 Details:', {
            web3Version: web3?.version,
            isInjected: !!window.ethereum,
            networkId: web3?.currentProvider?.networkVersion,
            chainId: web3?.currentProvider?.chainId,
        });
        console.log('========================');
    }, [web3, account]);

    const handleConnect = async () => {
        console.log('Attempting to connect wallet...');
        try {
            await connect();
            console.log('Wallet connected successfully');
        } catch (err) {
            console.error('Wallet connection failed:', err);
        }
    };

    if (!account) {
        return (
            <Button variant="outlined" onClick={handleConnect} color="primary">
                Connect Wallet
            </Button>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
                variant="outlined"
                onClick={disconnect}
                color="primary"
                sx={{ textTransform: 'none' }}
            >
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                    {shortenAddress(account)}
                </Typography>
                Disconnect
            </Button>
        </Box>
    );
};
