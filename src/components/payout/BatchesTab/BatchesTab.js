import React, { useMemo } from 'react';
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
import { useWeb3 } from '../../../hooks/useWeb3';
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

const PayoutInfo = ({ payout, onApprove, allowanceLoading, hasAllowance, account }) => {
    const { payoutId, totalTokens, token, processedBatches, totalBatches } = payout;
    const progress = (processedBatches / totalBatches) * 100;
    const status = processedBatches === totalBatches ? 'Completed' : 'In Progress';

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
                </Box>
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
            </Box>
            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        Progress: {processedBatches} of {totalBatches} batches processed
                    </Typography>
                    <Chip
                        label={status}
                        color={status === 'Completed' ? 'success' : 'warning'}
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
    const { batches, loading, error } = useBatches({ weekNumber, yearNumber });
    const { checkAllowance, approveToken, loading: allowanceLoading } = useTokenPayout();
    const { account } = useWeb3();

    const payoutData = useMemo(() => {
        if (!Object.keys(batches).length) return null;

        const payoutId = Object.keys(batches)[0];
        const payoutBatches = batches[payoutId];
        const totalBatches = payoutBatches.length;
        const processedBatches = payoutBatches.filter(b => b.status === 'done').length;

        return {
            payoutId,
            totalTokens: payoutBatches[0]?.totalTokens || '0',
            token: payoutBatches[0]?.token || {},
            processedBatches,
            totalBatches,
            hasAllowance: false, // Will be updated by checkAllowance
        };
    }, [batches]);

    // Check allowance when payout data is available
    React.useEffect(() => {
        if (payoutData?.token?.address && account) {
            checkAllowance(payoutData.token.address, account, payoutData.totalTokens).then(
                hasAllowance => {
                    payoutData.hasAllowance = hasAllowance;
                }
            );
        }
    }, [payoutData, checkAllowance, account]);

    const handleApprove = async () => {
        if (!payoutData?.token?.address || !payoutData?.totalTokens) {
            console.error('Missing token address or amount');
            return;
        }

        const success = await approveToken(payoutData.token.address, payoutData.totalTokens);

        if (success) {
            // Recheck allowance after successful approval
            const newAllowance = await checkAllowance(
                payoutData.token.address,
                account,
                payoutData.totalTokens
            );
            payoutData.hasAllowance = newAllowance;
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

    const payoutIds = Object.keys(batches);

    if (payoutIds.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No batches found for Week {weekNumber}, {yearNumber}
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {payoutData && (
                <PayoutInfo
                    payout={payoutData}
                    onApprove={handleApprove}
                    allowanceLoading={allowanceLoading}
                    hasAllowance={payoutData.hasAllowance}
                    account={account}
                />
            )}

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
                        {Object.values(batches)[0]?.map(batch => {
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
    }).isRequired,
    onApprove: PropTypes.func.isRequired,
    allowanceLoading: PropTypes.bool.isRequired,
    hasAllowance: PropTypes.bool.isRequired,
    account: PropTypes.string,
};
