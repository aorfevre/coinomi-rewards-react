import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, CircularProgress, Typography, InputAdornment } from '@mui/material';
import { Contract } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import PropTypes from 'prop-types';

const ERC20_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
];

export const TokenSelector = ({ onTokenSelect }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { getProvider, account } = useWeb3();

    const validateAndLoadToken = useCallback(
        async address => {
            // Clear previous error first
            setError('');

            // Basic address format validation
            if (!address) return;
            if (address.length !== 42) return;
            if (!address.startsWith('0x')) return;
            if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
                setError('Invalid address format');
                onTokenSelect(null);
                return;
            }

            setLoading(true);
            try {
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                // Try to create contract instance
                let tokenContract;
                try {
                    tokenContract = new Contract(address, ERC20_ABI, provider);
                } catch (error) {
                    setError('Invalid token address format');
                    onTokenSelect(null);
                    setLoading(false);
                    return;
                }

                // Get token details
                try {
                    const [name, symbol, decimals, balance] = await Promise.all([
                        tokenContract.name(),
                        tokenContract.symbol(),
                        tokenContract.decimals(),
                        tokenContract.balanceOf(account),
                    ]);

                    onTokenSelect({
                        address,
                        name,
                        symbol,
                        decimals,
                        balance: balance.toString(),
                    });
                    setError('');
                } catch (error) {
                    setError('Address is not a valid ERC20 token');
                    onTokenSelect(null);
                }
            } catch (error) {
                console.error('Error loading token:', error);
                setError('Invalid token address or not an ERC20 token');
                onTokenSelect(null);
            } finally {
                setLoading(false);
            }
        },
        [getProvider, account, onTokenSelect]
    );

    // Debounce the validation
    useEffect(() => {
        const timer = setTimeout(() => {
            validateAndLoadToken(tokenAddress);
        }, 500);

        return () => clearTimeout(timer);
    }, [tokenAddress, validateAndLoadToken]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                fullWidth
                label="Token Address"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                error={!!error}
                helperText={error}
                placeholder="0x..."
                InputProps={{
                    endAdornment: loading && (
                        <InputAdornment position="end">
                            <CircularProgress size={20} />
                        </InputAdornment>
                    ),
                }}
            />
            <Typography variant="caption" color="text.secondary">
                Enter any ERC20 token address to load its details
            </Typography>
        </Box>
    );
};

TokenSelector.propTypes = {
    onTokenSelect: PropTypes.func.isRequired,
};
