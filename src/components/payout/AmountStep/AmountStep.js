import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, CircularProgress } from '@mui/material';
import { useWeb3 } from '../../../hooks/useWeb3';
import { Contract, formatUnits } from 'ethers';
import { ERC20_ABI } from '../../../constants/abis';

export const AmountStep = ({ totalTokens, setTotalTokens, tokensPerPoint, selectedToken }) => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const { provider, account } = useWeb3();

    useEffect(() => {
        const fetchBalance = async () => {
            console.log('=== AmountStep Status ===');
            console.log('Wallet status:', {
                providerAvailable: !!provider,
                currentAccount: account,
                networkInfo: await provider?.getNetwork(),
                hasEthereum: !!window.ethereum,
            });

            if (!provider || !account || !selectedToken?.address) {
                console.log('Missing requirements:', {
                    hasProvider: !!provider,
                    hasAccount: !!account,
                    tokenAddress: selectedToken?.address,
                    walletAddress: account,
                    ethereumInjected: !!window.ethereum,
                });
                console.log('========================');
                return;
            }

            setLoading(true);
            try {
                console.log('Fetching balance for:', {
                    walletAddress: account,
                    tokenAddress: selectedToken.address,
                    tokenDecimals: selectedToken.decimals,
                });

                const tokenContract = new Contract(selectedToken.address, ERC20_ABI, provider);
                const rawBalance = await tokenContract.balanceOf(account);
                console.log('Raw balance:', rawBalance.toString());

                const formattedBalance = formatUnits(rawBalance, selectedToken.decimals);
                console.log('Formatted balance:', {
                    raw: rawBalance.toString(),
                    decimals: selectedToken.decimals,
                    formatted: formattedBalance,
                });

                setBalance(formattedBalance);
            } catch (err) {
                console.error('Error fetching token balance:', {
                    error: err.message,
                    tokenAddress: selectedToken.address,
                    account,
                });
                setBalance(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [provider, account, selectedToken]);

    const handleMaxClick = () => {
        if (balance) {
            setTotalTokens(balance.toString());
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Set Amount
            </Typography>

            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                }}
            >
                <TextField
                    label="Total Tokens"
                    value={totalTokens}
                    onChange={e => setTotalTokens(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        ml: 1.5,
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: 'action.selected',
                                        borderRadius: 1,
                                        fontWeight: 'medium',
                                        mb: 0.5,
                                    }}
                                >
                                    {selectedToken?.symbol || 'Tokens'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {loading ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontWeight: 'medium' }}
                                            >
                                                Balance: {Number(balance).toLocaleString()}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'primary.main',
                                                    fontWeight: 'medium',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        textDecoration: 'underline',
                                                    },
                                                }}
                                                onClick={handleMaxClick}
                                            >
                                                Max
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        ),
                        style: {
                            fontSize: '2rem',
                        },
                    }}
                    fullWidth
                    sx={{
                        '& .MuiInputBase-root': {
                            p: 2,
                            fontSize: '2rem',
                        },
                        '& .MuiInputBase-input': {
                            fontSize: '2rem',
                        },
                    }}
                />
            </Box>

            <Typography variant="body2" color="text.secondary">
                Each point will be worth {tokensPerPoint} {selectedToken?.symbol || 'tokens'}
            </Typography>
        </Box>
    );
};

AmountStep.propTypes = {
    totalTokens: PropTypes.string.isRequired,
    setTotalTokens: PropTypes.func.isRequired,
    tokensPerPoint: PropTypes.string.isRequired,
    selectedToken: PropTypes.shape({
        address: PropTypes.string.isRequired,
        symbol: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        decimals: PropTypes.number.isRequired,
    }),
};
