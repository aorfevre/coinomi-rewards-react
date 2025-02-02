import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Box, CircularProgress, Typography, InputAdornment } from '@mui/material';
import { isValidAddress } from '../utils/validation';
import { validateToken } from '../utils/token';
import { useWeb3 } from '../hooks/useWeb3';

export const TokenSelector = ({ onTokenSelect }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokenInfo, setTokenInfo] = useState(null);
    const { getProvider, account } = useWeb3();

    const handleTokenAddressChange = async event => {
        const address = event.target.value;
        setTokenAddress(address);
        setError(null);
        setTokenInfo(null);

        if (!address) return;

        if (!isValidAddress(address)) {
            setError('Invalid address format');
            return;
        }

        setLoading(true);
        try {
            const provider = getProvider();
            const tokenData = await validateToken(address, provider, account);

            if (tokenData.isValid) {
                setTokenInfo(tokenData);
                onTokenSelect(tokenData);
            } else {
                setError(tokenData.error);
            }
        } catch (err) {
            setError('Failed to validate token');
            console.error('Token validation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '600px', maxWidth: '100%' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter token contract address"
                    value={tokenAddress}
                    onChange={handleTokenAddressChange}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    Token:
                                </Typography>
                            </InputAdornment>
                        ),
                        endAdornment: loading && (
                            <InputAdornment position="end">
                                <CircularProgress size={16} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                        },
                    }}
                />
                {tokenInfo && (
                    <Box
                        sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {tokenInfo.name}
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 0.5 }}
                                >
                                    ({tokenInfo.symbol})
                                </Typography>
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                Balance:
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {tokenInfo.formattedBalance}
                            </Typography>
                        </Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                bgcolor: 'action.hover',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                            }}
                        >
                            {tokenInfo.decimals} decimals
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

TokenSelector.propTypes = {
    onTokenSelect: PropTypes.func.isRequired,
};
