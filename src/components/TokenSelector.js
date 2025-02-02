import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
    Card,
    Grid,
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useTokenValidation } from '../hooks/useTokenValidation';
import { formatUnits } from 'ethers';

export const TokenSelector = ({ onSelect, chainId }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const { token, loading, error, validateToken } = useTokenValidation(chainId);

    const handleTokenAddressChange = async value => {
        setTokenAddress(value);
        if (value.length === 42) {
            // Valid Ethereum address length
            const tokenInfo = await validateToken(value);
            if (tokenInfo) {
                onSelect(tokenInfo);
            }
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            handleTokenAddressChange(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const formatBalance = (balance, decimals) => {
        try {
            return formatUnits(balance, decimals);
        } catch (error) {
            console.error('Error formatting balance:', error);
            return '0';
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Token"
                    placeholder="Enter token contract address"
                    value={tokenAddress}
                    onChange={e => handleTokenAddressChange(e.target.value)}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton onClick={handlePaste} size="small">
                                    <ContentPasteIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: loading && (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {token && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {token.name} ({token.symbol})
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Decimals
                                </Typography>
                                <Typography variant="body1">{token.decimals}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Your Balance
                                </Typography>
                                <Typography variant="body1">
                                    {formatBalance(token.balance, token.decimals)} {token.symbol}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>
            )}
        </Box>
    );
};

TokenSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    chainId: PropTypes.string.isRequired,
};
