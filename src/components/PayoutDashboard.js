import React, { useCallback, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material';
import { ChainSelector } from './ChainSelector';
import { usePayouts } from '../hooks/usePayouts';
import { shortenAddress } from '../utils/address';
import { formatDate } from '../utils/date';
import { useWeb3 } from '../hooks/useWeb3';
import { TokenSelector } from './TokenSelector';

export const PayoutDashboard = () => {
    const { payouts, loading, error, fetchPayouts, generatePayout } = usePayouts();
    const { connect, disconnect, account, chainId } = useWeb3();
    const [selectedToken, setSelectedToken] = useState(null);

    // const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);

    React.useMemo(() => {
        fetchPayouts();
    }, []);

    const handleGeneratePayout = useCallback(async () => {
        if (!account || !selectedToken || !chainId) return;
        await generatePayout(selectedToken.address, chainId);
    }, [account, selectedToken, chainId, generatePayout]);

    const handleTokenSelect = tokenInfo => {
        setSelectedToken(tokenInfo);
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error loading payouts: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4">Payout Dashboard</Typography>
                {!account ? (
                    <Button variant="contained" onClick={connect}>
                        Connect Wallet
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography>{shortenAddress(account)}</Typography>
                        <Button variant="outlined" onClick={disconnect}>
                            Disconnect
                        </Button>
                    </Box>
                )}
            </Box>

            {account && (
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ChainSelector
                        currentChainId={chainId}
                        onChainSelect={async newChainId => {
                            if (newChainId !== chainId) {
                                try {
                                    await connect(newChainId);
                                } catch (error) {
                                    console.error('Failed to switch chain:', error);
                                }
                            }
                        }}
                    />

                    <TokenSelector onTokenSelect={handleTokenSelect} />

                    <Button
                        variant="contained"
                        onClick={handleGeneratePayout}
                        disabled={!selectedToken || !chainId}
                    >
                        Generate Payout
                    </Button>
                </Box>
            )}

            {/* Payouts table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Wallet Address</TableCell>
                            <TableCell>Points</TableCell>
                            <TableCell>USD Value</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts?.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell>{shortenAddress(payout.walletAddress)}</TableCell>
                                    <TableCell>{payout.points.toFixed(2)}</TableCell>
                                    <TableCell>${payout.usdValue.toFixed(2)}</TableCell>
                                    <TableCell>{payout.status}</TableCell>
                                    <TableCell>{formatDate(payout.timestamp)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
