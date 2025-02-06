import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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
    Chip,
    CircularProgress,
    Alert,
    Button,
    LinearProgress,
} from '@mui/material';
import { useBatches } from '../../../hooks/useBatches';
import { useTokenPayout } from '../../../hooks/useTokenPayout';
import { useWeb3, CHAIN_CONFIGS } from '../../../hooks/useWeb3';
import { updateBatchStatus } from '../../../config/firebase';

const statusColors = {
    todo: 'warning',
    processing: 'info',
    done: 'success',
    cancelled: 'error',
};

const StatusChip = ({ status }) => (
    <Chip
        label={status}
        color={statusColors[status]}
        size="small"
        sx={{ textTransform: 'capitalize' }}
    />
);

const PayoutInfo = ({
    payout,
    onApprove,
    allowanceLoading,
    hasAllowance,
    account,
    onDisperse,
    dispersing,
}) => {
    const { payoutId, totalTokens, token, processedBatches, totalBatches, chainId } = payout;
    const progress = (processedBatches / totalBatches) * 100;
    const isCompleted = processedBatches === totalBatches;
    const { chainId: currentChainId, switchChain } = useWeb3();

    // Get chain name from CHAIN_CONFIGS
    const chainName = CHAIN_CONFIGS[chainId]?.chainName || 'Unknown Network';
    const isCorrectChain = currentChainId === chainId;

    const handleChainSwitch = async () => {
        try {
            await switchChain(chainId);
        } catch (error) {
            console.error('Failed to switch chain:', error);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                }}
            >
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Payout ID: {payoutId}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Tokens: {totalTokens} {token.symbol}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                        }}
                    >
                        Token Address: {token.address}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        Network: {chainName} ({chainId})
                    </Typography>
                </Box>
                {!isCompleted && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {!isCorrectChain ? (
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={handleChainSwitch}
                                sx={{ minWidth: 150 }}
                            >
                                Switch to {chainName}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    onClick={onApprove}
                                    disabled={!account || hasAllowance || allowanceLoading}
                                    sx={{ minWidth: 150 }}
                                >
                                    {allowanceLoading ? (
                                        <CircularProgress size={24} />
                                    ) : hasAllowance ? (
                                        'Approved'
                                    ) : !account ? (
                                        'Connect Wallet'
                                    ) : (
                                        'Approve Tokens'
                                    )}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={onDisperse}
                                    disabled={!hasAllowance || dispersing}
                                    sx={{ minWidth: 150 }}
                                >
                                    {dispersing ? <CircularProgress size={24} /> : 'Bulk Disperse'}
                                </Button>
                            </>
                        )}
                    </Box>
                )}
            </Box>
            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        Progress: {processedBatches} of {totalBatches} batches processed
                    </Typography>
                    <Chip
                        label={isCompleted ? 'Completed' : 'In Progress'}
                        color={isCompleted ? 'success' : 'warning'}
                        size="small"
                    />
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 1 }}
                />
            </Box>
        </Paper>
    );
};

export const BatchesTab = ({ weekNumber, yearNumber }) => {
    const { batches, loading, error, refetch } = useBatches({ weekNumber, yearNumber });
    const {
        checkAllowance,
        approveToken,
        loading: allowanceLoading,
        disperseTokens,
    } = useTokenPayout();
    const { account } = useWeb3();
    const [hasAllowance, setHasAllowance] = useState({}); // Track allowance per payout
    const [dispersing, setDispersing] = useState(false);

    const payoutsData = useMemo(() => {
        if (!Object.keys(batches).length) return [];

        return Object.entries(batches).map(([payoutId, payoutBatches]) => ({
            payoutId,
            totalTokens: payoutBatches[0]?.totalTokens || '0',
            token: payoutBatches[0]?.token || {},
            processedBatches: payoutBatches.filter(b => b.status === 'processed').length,
            totalBatches: payoutBatches.length,
            batches: payoutBatches,
            chainId: payoutBatches[0]?.chainId,
        }));
    }, [batches]);

    // Check allowance for all payouts
    React.useEffect(() => {
        const checkTokenAllowances = async () => {
            const allowances = {};
            for (const payout of payoutsData) {
                if (payout.token?.address && account) {
                    const allowance = await checkAllowance(
                        payout.token.address,
                        account,
                        payout.totalTokens
                    );
                    allowances[payout.payoutId] = allowance;
                }
            }
            setHasAllowance(allowances);
        };

        checkTokenAllowances();
    }, [payoutsData, checkAllowance, account]);

    const handleApprove = async payout => {
        if (!payout?.token?.address || !payout?.totalTokens) {
            console.error('Missing token address or amount');
            return;
        }

        if (!account) {
            console.error('No wallet connected');
            return;
        }

        const success = await approveToken(payout.token.address, payout.totalTokens);

        if (success) {
            const newAllowance = await checkAllowance(
                payout.token.address,
                account,
                payout.totalTokens
            );
            setHasAllowance(prev => ({
                ...prev,
                [payout.payoutId]: newAllowance,
            }));
        }
    };

    const handleDisperse = async payout => {
        if (!payout || !account || !hasAllowance[payout.payoutId]) return;

        setDispersing(true);
        try {
            const pendingBatches = batches[payout.payoutId]?.filter(b => b.status === 'todo') || [];

            for (const batch of pendingBatches) {
                try {
                    const hash = await disperseTokens(
                        payout.token.address,
                        batch.participants,
                        batch.amountsDecimals,
                        batch
                    );

                    if (hash) {
                        try {
                            await updateBatchStatus({
                                payoutId: batch.payoutId,
                                batchNumber: batch.number,
                                hash,
                            });
                            await refetch();
                        } catch (updateError) {
                            console.error('Failed to update backend:', updateError);
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error processing batch:', error);
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error('Error in bulk disperse:', error);
        } finally {
            setDispersing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error loading batches: {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {payoutsData.map(payout => (
                <Box key={payout.payoutId} sx={{ mb: 4 }}>
                    <PayoutInfo
                        payout={payout}
                        onApprove={() => handleApprove(payout)}
                        allowanceLoading={allowanceLoading}
                        hasAllowance={hasAllowance[payout.payoutId]}
                        account={account}
                        onDisperse={() => handleDisperse(payout)}
                        dispersing={dispersing}
                    />

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Batch #</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Tokens</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Transaction</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {batches[payout.payoutId]?.map(batch => {
                                    const batchTokens = batch.amounts.reduce(
                                        (sum, amount) => sum + Number(amount),
                                        0
                                    );
                                    const token = batch.token || {};

                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell>{batch.number}</TableCell>
                                            <TableCell>{batch.size}</TableCell>
                                            <TableCell>
                                                {batchTokens.toFixed(6)} {token.symbol}
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip status={batch.status} />
                                            </TableCell>
                                            <TableCell>
                                                {batch.hash ? (
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${batch.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {batch.hash.slice(0, 8)}...
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Box>
    );
};

BatchesTab.propTypes = {
    weekNumber: PropTypes.number.isRequired,
    yearNumber: PropTypes.number.isRequired,
};

StatusChip.propTypes = {
    status: PropTypes.oneOf(['todo', 'processing', 'done', 'cancelled']).isRequired,
};

PayoutInfo.propTypes = {
    payout: PropTypes.shape({
        payoutId: PropTypes.string.isRequired,
        totalTokens: PropTypes.string.isRequired,
        token: PropTypes.shape({
            address: PropTypes.string.isRequired,
            symbol: PropTypes.string.isRequired,
        }).isRequired,
        processedBatches: PropTypes.number.isRequired,
        totalBatches: PropTypes.number.isRequired,
        chainId: PropTypes.string,
    }).isRequired,
    onApprove: PropTypes.func.isRequired,
    allowanceLoading: PropTypes.bool.isRequired,
    hasAllowance: PropTypes.bool.isRequired,
    account: PropTypes.string,
    onDisperse: PropTypes.func.isRequired,
    dispersing: PropTypes.bool.isRequired,
};
