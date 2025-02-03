import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useWeb3 } from '../../hooks/useWeb3';
import { getERC20Contract } from '../../utils/contracts';

export const TokenSelector = ({ chainId, selectedToken, onTokenSelect }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { web3 } = useWeb3();

    const handleTokenSearch = async () => {
        if (!web3 || !tokenAddress) return;

        setLoading(true);
        setError('');

        try {
            const tokenContract = getERC20Contract(web3, tokenAddress);

            // Fetch token details
            const [name, symbol, decimals] = await Promise.all([
                tokenContract.methods.name().call(),
                tokenContract.methods.symbol().call(),
                tokenContract.methods.decimals().call(),
            ]);

            onTokenSelect({
                address: tokenAddress,
                name,
                symbol,
                decimals: parseInt(decimals),
            });
        } catch (err) {
            console.error('Error fetching token details:', err);
            setError('Invalid token address or not an ERC20 token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Token Address"
                    value={tokenAddress}
                    onChange={e => setTokenAddress(e.target.value)}
                    error={!!error}
                    helperText={error || 'Enter ERC20 token address'}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleTokenSearch}
                    disabled={loading || !tokenAddress}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Search Token'}
                </Button>
            </Box>

            {selectedToken && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="h6">Selected Token</Typography>
                    <Typography>Name: {selectedToken.name}</Typography>
                    <Typography>Symbol: {selectedToken.symbol}</Typography>
                    <Typography>Address: {selectedToken.address}</Typography>
                    <Typography>Decimals: {selectedToken.decimals}</Typography>
                </Box>
            )}
        </Box>
    );
};

TokenSelector.propTypes = {
    chainId: PropTypes.string.isRequired,
    selectedToken: PropTypes.shape({
        address: PropTypes.string,
        symbol: PropTypes.string,
        name: PropTypes.string,
        decimals: PropTypes.number,
    }),
    onTokenSelect: PropTypes.func.isRequired,
};
