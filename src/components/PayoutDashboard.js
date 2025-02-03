import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
    Grid,
    Select,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    Card,
    TextField,
    InputAdornment,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
import { ChainSelector } from './ChainSelector';
import { TokenSelector } from './TokenSelector';
import { KPICard } from './KPICard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useWeb3 } from '../hooks/useWeb3';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { shortenAddress } from '../utils/address';
import { calculateWeek } from '../utils/date';
import { formatUnits, parseUnits } from 'ethers';
import PropTypes from 'prop-types';
import { CHAIN_CONFIGS } from '../hooks/useWeb3';
import { CHAIN_ICONS } from './ChainSelector';
import { Contract } from 'ethers';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Link } from '@mui/material';

const steps = ['Select Chain', 'Select Token', 'Set Amount', 'Process Batches'];

// Define prop types for the token object
const TokenPropType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    decimals: PropTypes.number.isRequired,
});

// Add prop types for the leaderboard participant
const ParticipantPropType = PropTypes.shape({
    walletAddress: PropTypes.string.isRequired,
    points: PropTypes.number.isRequired,
});

// ERC20 ABI for allowance and approve functions
const ERC20_ABI = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
];

// First, define BatchesStep component and its PropTypes
const BatchesStep = ({ batches, onProcessBatch, loading, error }) => (
    <Box>
        <Typography variant="h6" gutterBottom>
            Process Batches
        </Typography>
        {batches.map(batch => (
            <Card key={batch.id} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1">Batch #{batch.batchNumber}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {batch.wallets.length} participants
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="body2">Status: {batch.status}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button
                            variant="contained"
                            onClick={() => onProcessBatch(batch)}
                            disabled={batch.status === 'done' || loading}
                            fullWidth
                        >
                            {loading ? 'Processing...' : 'Process Batch'}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        ))}
        {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        )}
    </Box>
);

BatchesStep.propTypes = {
    batches: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            batchNumber: PropTypes.number.isRequired,
            wallets: PropTypes.arrayOf(PropTypes.string).isRequired,
            status: PropTypes.string.isRequired,
        })
    ).isRequired,
    onProcessBatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
};

// Then define StepContent component that uses BatchesStep
const StepContent = ({
    step,
    chainId,
    selectedToken,
    totalTokens,
    setSelectedToken,
    setTotalTokens,
    leaderboard,
    tokensPerPoint,
    onChainSelect,
    selectedWeek,
    selectedYear,
    batches,
    batchStatus,
    onProcessBatch,
}) => {
    switch (step) {
        case 0:
            return (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Select Chain
                    </Typography>
                    <ChainSelector currentChainId={chainId} onChainSelect={onChainSelect} />
                </Box>
            );
        case 1:
            return (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Select Token
                    </Typography>
                    <TokenSelector
                        chainId={chainId}
                        selectedToken={selectedToken}
                        onTokenSelect={setSelectedToken}
                    />
                </Box>
            );
        case 2:
            return (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Set Amount
                    </Typography>
                    <TextField
                        fullWidth
                        label="Total Tokens to Distribute"
                        type="number"
                        value={totalTokens}
                        onChange={e => setTotalTokens(e.target.value)}
                        InputProps={{
                            endAdornment: selectedToken && (
                                <InputAdornment position="end">
                                    {selectedToken.symbol}
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                    <DisperseButtons
                        chainId={chainId}
                        selectedToken={selectedToken}
                        totalTokens={totalTokens}
                        leaderboard={leaderboard}
                        tokensPerPoint={tokensPerPoint}
                        selectedWeek={selectedWeek}
                        selectedYear={selectedYear}
                    />
                </Box>
            );
        case 3:
            return (
                <BatchesStep
                    batches={batches}
                    onProcessBatch={onProcessBatch}
                    loading={batchStatus.preparing}
                    error={batchStatus.error}
                />
            );
        default:
            return null;
    }
};

StepContent.propTypes = {
    step: PropTypes.number.isRequired,
    chainId: PropTypes.string,
    selectedToken: TokenPropType,
    totalTokens: PropTypes.string,
    setSelectedToken: PropTypes.func.isRequired,
    setTotalTokens: PropTypes.func.isRequired,
    leaderboard: PropTypes.array,
    tokensPerPoint: PropTypes.string,
    onChainSelect: PropTypes.func.isRequired,
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    batches: BatchesStep.propTypes.batches,
    batchStatus: PropTypes.shape({
        preparing: PropTypes.bool.isRequired,
        error: PropTypes.string,
    }),
    onProcessBatch: PropTypes.func.isRequired,
};

const StepSummary = ({ step, chainId, selectedToken, totalTokens }) => {
    const chainConfig = CHAIN_CONFIGS[chainId];

    return (
        <Box sx={{ mt: 1 }}>
            {step > 0 && chainConfig && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <img
                        src={CHAIN_ICONS[chainConfig.icon]}
                        alt={chainConfig.chainName}
                        style={{ width: 20, height: 20 }}
                    />
                    <Typography variant="body2">
                        Chain: {chainConfig.chainName} ({chainConfig.nativeCurrency.symbol})
                    </Typography>
                </Box>
            )}
            {step > 1 && selectedToken && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2">
                        Token: {selectedToken.name} ({selectedToken.symbol})
                        <br />
                        Balance: {formatUnits(selectedToken.balance, selectedToken.decimals)}{' '}
                        {selectedToken.symbol}
                    </Typography>
                </Box>
            )}
            {step > 2 && totalTokens && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                        Amount to distribute: {totalTokens} {selectedToken?.symbol}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

StepSummary.propTypes = {
    step: PropTypes.number.isRequired,
    chainId: PropTypes.string,
    selectedToken: TokenPropType,
    totalTokens: PropTypes.string,
};

// Add prop types for the DisperseButtons component
const DisperseButtons = ({
    chainId,
    selectedToken,
    totalTokens,
    leaderboard,
    tokensPerPoint,
    selectedWeek,
    selectedYear,
}) => {
    const [loading, setLoading] = useState(false);
    const [allowance, setAllowance] = useState('0');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const { getProvider, account } = useWeb3();

    // Check allowance when component mounts or when relevant props change
    useEffect(() => {
        const checkAllowance = async () => {
            if (!selectedToken?.address || !chainId || !account) return;

            try {
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const tokenContract = new Contract(selectedToken.address, ERC20_ABI, provider);
                const disperseAddress = CHAIN_CONFIGS[chainId].disperseContract;

                const currentAllowance = await tokenContract.allowance(account, disperseAddress);
                setAllowance(currentAllowance.toString());
            } catch (error) {
                console.error('Error checking allowance:', error);
            }
        };

        checkAllowance();
    }, [chainId, selectedToken, getProvider, account]);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        console.log('Showing snackbar:', { message, severity });
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleApprove = async () => {
        if (!selectedToken?.address || !chainId || !account) return;

        setLoading(true);
        try {
            const provider = getProvider();
            if (!provider) throw new Error('No provider available');

            const signer = await provider.getSigner();
            const tokenContract = new Contract(selectedToken.address, ERC20_ABI, signer);
            const disperseAddress = CHAIN_CONFIGS[chainId].disperseContract;

            // Convert totalTokens to proper decimal places
            const amount = parseUnits(totalTokens, selectedToken.decimals);

            const tx = await tokenContract.approve(disperseAddress, amount);
            await tx.wait();

            // Refresh allowance
            const newAllowance = await tokenContract.allowance(account, disperseAddress);
            setAllowance(newAllowance.toString());

            showSnackbar(`Successfully approved ${totalTokens} ${selectedToken.symbol}`);
        } catch (error) {
            console.error('Error approving tokens:', error);
            showSnackbar(`Failed to approve tokens: ${error.message || 'Unknown error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDisperse = async () => {
        if (!selectedToken?.address || !chainId || !leaderboard?.length || !account) return;

        setLoading(true);
        try {
            const provider = getProvider();
            if (!provider) throw new Error('No provider available');

            const signer = await provider.getSigner();
            const disperseContract = new Contract(
                CHAIN_CONFIGS[chainId].disperseContract,
                ['function disperseToken(address token, address[] recipients, uint256[] values)'],
                signer
            );

            const recipients = leaderboard.map(p => p.walletAddress);
            const values = leaderboard.map(p => {
                const amount =
                    (BigInt(p.points) * BigInt(parseFloat(tokensPerPoint) * 1e6)) / BigInt(1e6);
                return parseUnits(amount.toString(), selectedToken.decimals).toString();
            });

            const tx = await disperseContract.disperseToken(
                selectedToken.address,
                recipients,
                values
            );
            const receipt = await tx.wait();

            // Record the payout in Firebase
            const functions = getFunctions();
            const recordPayout = httpsCallable(functions, 'recordPayout');
            await recordPayout({
                weekNumber: selectedWeek,
                yearNumber: selectedYear,
                timestamp: Date.now(),
                transactionHash: receipt.hash,
                chainId,
                tokenAddress: selectedToken.address,
                tokenSymbol: selectedToken.symbol,
                tokenAmount: totalTokens,
            });

            showSnackbar(
                `Successfully dispersed ${totalTokens} ${selectedToken.symbol} to ${recipients.length} recipients`
            );
        } catch (error) {
            console.error('Error dispersing tokens:', error);
            showSnackbar(`Failed to disperse tokens: ${error.message || 'Unknown error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const needsAllowance =
        BigInt(allowance) < parseUnits(totalTokens || '0', selectedToken?.decimals || 18);

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleApprove}
                    disabled={loading || !needsAllowance}
                >
                    {loading ? <CircularProgress size={24} /> : 'Approve Tokens'}
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleDisperse}
                    disabled={loading || needsAllowance}
                >
                    {loading ? <CircularProgress size={24} /> : 'Disperse Tokens'}
                </Button>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={10000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    '& .MuiAlert-root': {
                        width: '100%',
                        minWidth: '300px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '& .MuiAlert-message': {
                            fontSize: '1rem',
                        },
                    },
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    elevation={6}
                    sx={{
                        backgroundColor: theme => {
                            switch (snackbar.severity) {
                                case 'success':
                                    return theme.palette.success.main;
                                case 'error':
                                    return theme.palette.error.main;
                                case 'info':
                                    return theme.palette.info.main;
                                default:
                                    return theme.palette.primary.main;
                            }
                        },
                        color: 'white',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

DisperseButtons.propTypes = {
    chainId: PropTypes.string.isRequired,
    selectedToken: PropTypes.shape({
        address: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        symbol: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired,
        decimals: PropTypes.number.isRequired,
    }),
    totalTokens: PropTypes.string.isRequired,
    leaderboard: PropTypes.arrayOf(ParticipantPropType),
    tokensPerPoint: PropTypes.string.isRequired,
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
};

// Update PayoutsTable component to remove unused props
const PayoutsTable = ({ payouts, loading }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Token</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Transaction</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <CircularProgress size={24} />
                            </TableCell>
                        </TableRow>
                    ) : payouts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No payouts found for this period
                            </TableCell>
                        </TableRow>
                    ) : (
                        payouts.map(payout => (
                            <TableRow key={payout.id}>
                                <TableCell>
                                    {new Date(payout.timestamp).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{payout.tokenSymbol}</TableCell>
                                <TableCell align="right">{payout.tokenAmount}</TableCell>
                                <TableCell>
                                    <Link
                                        href={`https://sepolia.etherscan.io/tx/${payout.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {shortenAddress(payout.transactionHash)}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Update PropTypes for PayoutsTable
PayoutsTable.propTypes = {
    payouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            timestamp: PropTypes.number.isRequired,
            tokenSymbol: PropTypes.string.isRequired,
            tokenAmount: PropTypes.string.isRequired,
            transactionHash: PropTypes.string.isRequired,
        })
    ).isRequired,
    loading: PropTypes.bool.isRequired,
};

// Add this helper function at the top level
const adjustWeekAndYear = (currentWeek, currentYear, increment) => {
    if (increment) {
        // Moving forward
        if (currentWeek === 53) {
            return { week: 1, year: currentYear + 1 };
        }
        return { week: currentWeek + 1, year: currentYear };
    } else {
        // Moving backward
        if (currentWeek === 1) {
            return { week: 53, year: currentYear - 1 };
        }
        return { week: currentWeek - 1, year: currentYear };
    }
};

// Update the TabWithBadge component
const TabWithBadge = ({ label, count }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', position: 'relative', pr: 3 }}>
        {label}
        <Badge
            badgeContent={count}
            color="primary"
            sx={{
                '& .MuiBadge-badge': {
                    right: -16,
                    top: -8,
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    fontSize: '0.75rem',
                    backgroundColor: '#1976d2',
                    color: 'white',
                },
            }}
        />
    </Box>
);

TabWithBadge.propTypes = {
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
};

export const PayoutDashboard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { connect, disconnect, account, chainId, switchChain, getProvider } = useWeb3();
    const [selectedToken, setSelectedToken] = useState(null);
    const [totalTokens, setTotalTokens] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(calculateWeek(new Date()));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState(0);
    const [payouts, setPayouts] = useState([]);
    const [payoutsLoading, setPayoutsLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [batches, setBatches] = useState([]);
    const [batchStatus, setBatchStatus] = useState({
        preparing: false,
        error: null,
    });

    const {
        entries: leaderboard,
        loading: leaderboardLoading,
        loadMore,
        refetchLeaderboard,
        lastDocId,
    } = useLeaderboard(selectedWeek, 100);

    // Calculate KPI values
    const totalPoints = leaderboard?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
    const tokensPerPoint =
        totalTokens && totalPoints ? (parseFloat(totalTokens) / totalPoints).toFixed(6) : '0';

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Add effect to fetch payouts
    useEffect(() => {
        const fetchPayouts = async () => {
            setPayoutsLoading(true);
            try {
                const db = getFirestore();
                const payoutsRef = collection(db, 'payouts');
                const q = query(
                    payoutsRef,
                    where('weekNumber', '==', selectedWeek),
                    where('yearNumber', '==', selectedYear),
                    orderBy('timestamp', 'desc')
                );

                const snapshot = await getDocs(q);
                setPayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching payouts:', error);
            } finally {
                setPayoutsLoading(false);
            }
        };

        fetchPayouts();
    }, [selectedWeek, selectedYear]);

    const handleNext = useCallback(() => {
        if (activeStep === 2) {
            // Create batches when moving from step 2 to 3
            setBatchStatus(prev => ({ ...prev, preparing: true, error: null }));
            try {
                // Create batches logic here
                setActiveStep(prev => prev + 1);
            } catch (error) {
                console.error('Error creating batches:', error);
                setBatchStatus(prev => ({ ...prev, error: error.message }));
                showSnackbar('Failed to create batches', 'error');
            } finally {
                setBatchStatus(prev => ({ ...prev, preparing: false }));
            }
        } else {
            setActiveStep(prev => prev + 1);
        }
    }, [activeStep, showSnackbar]);

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleDownloadCSV = useCallback(async () => {
        if (!leaderboard) return;

        try {
            console.log('Starting CSV download process...');
            showSnackbar('Preparing CSV download...', 'info');

            // Fetch all participants recursively
            let allParticipants = [...leaderboard];
            let currentLastDocId = lastDocId;
            let remainingCount = leaderboard.length - allParticipants.length;

            console.log('Starting pagination loop...');

            // Keep fetching while we haven't got all participants
            while (remainingCount > 0) {
                console.log('Fetching next page...', {
                    currentCount: allParticipants.length,
                    remainingCount,
                    currentLastDocId,
                });

                showSnackbar(
                    `Fetching participants: ${allParticipants.length}/${leaderboard.length}...`,
                    'info'
                );

                const nextPage = await refetchLeaderboard({
                    pageSize: 1000,
                    lastDocId: currentLastDocId,
                    week: selectedWeek,
                    year: selectedYear,
                    isForDownload: true, // Add this flag
                });

                if (!nextPage?.leaderboard?.length) {
                    console.log('No more participants received, breaking loop');
                    break;
                }

                allParticipants = [...allParticipants, ...nextPage.leaderboard];
                currentLastDocId = nextPage.lastDocId;
                remainingCount = leaderboard.length - allParticipants.length;

                console.log('Updated pagination state:', {
                    totalCollected: allParticipants.length,
                    remainingCount,
                    currentLastDocId,
                });
            }

            console.log('Finished collecting participants:', {
                finalCount: allParticipants.length,
                expectedTotal: leaderboard.length,
            });

            // Create CSV content
            const headers = ['Wallet Address', 'Points', 'Token Amount'];
            const rows = allParticipants.map(participant => [
                participant.walletAddress,
                participant.points,
                (participant.points * parseFloat(tokensPerPoint)).toFixed(6),
            ]);

            console.log('Created CSV content:', {
                headerCount: headers.length,
                rowCount: rows.length,
            });

            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `payout-week${selectedWeek}-${selectedYear}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('CSV file created and download triggered');

            showSnackbar(
                `Successfully downloaded CSV with ${allParticipants.length} participants`,
                'success'
            );
        } catch (error) {
            console.error('Error in CSV download process:', error);
            showSnackbar('Failed to generate CSV', 'error');
        }
    }, [
        leaderboard,
        lastDocId,
        showSnackbar,
        selectedWeek,
        selectedYear,
        tokensPerPoint,
        refetchLeaderboard,
    ]);

    const handleChainSelect = async selectedChainId => {
        try {
            await switchChain(selectedChainId);
            handleNext();
        } catch (error) {
            console.error('Error switching chain:', error);
        }
    };

    const handleGenerateFakeScores = async () => {
        try {
            const functions = getFunctions();
            const generateFakes = httpsCallable(functions, 'createFakeScores');

            await generateFakes({
                weekNumber: selectedWeek,
                yearNumber: selectedYear,
            });

            // Refresh the leaderboard using the returned function
            const result = await refetchLeaderboard();
            if (result?.leaderboard) {
                // No need to setLeaderboard directly as the hook handles it
                showSnackbar('Successfully generated fake scores', 'success');
            }
        } catch (error) {
            console.error('Error generating fake scores:', error);
            showSnackbar('Failed to generate fake scores', 'error');
        }
    };

    const handleLoadMore = useCallback(async () => {
        if (leaderboardLoading) return;
        try {
            await loadMore();
            showSnackbar('Successfully loaded more participants', 'success');
        } catch (error) {
            console.error('Error loading more participants:', error);
            showSnackbar('Failed to load more participants', 'error');
        }
    }, [leaderboardLoading, loadMore, showSnackbar]);

    // Process batch handler
    const handleProcessBatch = useCallback(
        async batch => {
            try {
                setBatchStatus(prev => ({ ...prev, preparing: true, error: null }));

                // Check allowance and approve if needed
                const provider = await getProvider();
                const tokenContract = new Contract(batch.token, ERC20_ABI, provider.getSigner());
                const disperseContract = CHAIN_CONFIGS[chainId].disperseContract;

                const allowance = await tokenContract.allowance(account, disperseContract);
                const totalAmount = batch.amounts.reduce(
                    (sum, amount) => sum + BigInt(amount),
                    BigInt(0)
                );

                if (allowance < totalAmount) {
                    const approveTx = await tokenContract.approve(disperseContract, totalAmount);
                    await approveTx.wait();
                }

                // Process the batch
                const functions = getFunctions();
                const processBatch = httpsCallable(functions, 'processBatch');
                await processBatch({ batchId: batch.id });

                // Update local state
                setBatches(prev =>
                    prev.map(b => (b.id === batch.id ? { ...b, status: 'done' } : b))
                );

                showSnackbar('Batch processed successfully', 'success');
            } catch (error) {
                console.error('Error processing batch:', error);
                setBatchStatus(prev => ({ ...prev, error: error.message }));
                showSnackbar('Failed to process batch', 'error');
            } finally {
                setBatchStatus(prev => ({ ...prev, preparing: false }));
            }
        },
        [chainId, account, getProvider, showSnackbar]
    );

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header with Connect/Disconnect and Wallet Address */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Typography variant="h4">Payout Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {account && (
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {shortenAddress(account)}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={account ? disconnect : connect}
                        color={account ? 'error' : 'primary'}
                    >
                        {account ? 'Disconnect' : 'Connect Wallet'}
                    </Button>
                </Box>
            </Box>

            {account && (
                <>
                    <Card sx={{ mb: 4, p: 3 }}>
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map(label => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Box sx={{ mt: 2 }}>
                            {/* Show summary of previous steps */}
                            <StepSummary
                                step={activeStep}
                                chainId={chainId}
                                selectedToken={selectedToken}
                                totalTokens={totalTokens}
                            />

                            {/* Show current step content */}
                            <StepContent
                                step={activeStep}
                                chainId={chainId}
                                selectedToken={selectedToken}
                                totalTokens={totalTokens}
                                setSelectedToken={setSelectedToken}
                                setTotalTokens={setTotalTokens}
                                leaderboard={leaderboard}
                                tokensPerPoint={tokensPerPoint}
                                onChainSelect={handleChainSelect}
                                selectedWeek={selectedWeek}
                                selectedYear={selectedYear}
                                batches={batches}
                                batchStatus={batchStatus}
                                onProcessBatch={handleProcessBatch}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={
                                        (activeStep === 0 && !chainId) ||
                                        (activeStep === 1 && !selectedToken) ||
                                        (activeStep === 2 && !totalTokens)
                                    }
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    </Card>

                    {/* KPI Cards */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard title="Total Points" value={totalPoints.toLocaleString()} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard
                                title="Tokens per Point"
                                value={tokensPerPoint}
                                subtitle={selectedToken?.symbol}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard title="Total Participants" value={leaderboard?.length} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard
                                title="Selected Period"
                                value={`Week ${selectedWeek}`}
                                subtitle={selectedYear.toString()}
                            />
                        </Grid>
                    </Grid>

                    {/* Period Selection and Tables */}
                    <Card sx={{ mb: 4 }}>
                        <Box sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        onClick={() => {
                                            const { week, year } = adjustWeekAndYear(
                                                selectedWeek,
                                                selectedYear,
                                                false
                                            );
                                            setSelectedWeek(week);
                                            setSelectedYear(year);
                                        }}
                                        size="small"
                                    >
                                        {'<'}
                                    </Button>
                                    <Select
                                        value={selectedWeek}
                                        onChange={e => setSelectedWeek(e.target.value)}
                                        size="small"
                                    >
                                        {Array.from({ length: 53 }, (_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                Week {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Select
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(e.target.value)}
                                        size="small"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <MenuItem
                                                key={new Date().getFullYear() - i}
                                                value={new Date().getFullYear() - i}
                                            >
                                                {new Date().getFullYear() - i}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Button
                                        onClick={() => {
                                            const { week, year } = adjustWeekAndYear(
                                                selectedWeek,
                                                selectedYear,
                                                true
                                            );
                                            setSelectedWeek(week);
                                            setSelectedYear(year);
                                        }}
                                        size="small"
                                    >
                                        {'>'}
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {chainId === '0xaa36a7' && ( // Sepolia chainId
                                        <Button
                                            variant="outlined"
                                            onClick={handleGenerateFakeScores}
                                            disabled={leaderboardLoading}
                                        >
                                            Generate Test Data
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={() => handleDownloadCSV()}
                                        disabled={!leaderboard || leaderboardLoading}
                                    >
                                        Download CSV
                                    </Button>
                                </Box>
                            </Box>

                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                sx={{
                                    mb: 2,
                                    '& .MuiTab-root': {
                                        minHeight: 48,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                    },
                                }}
                            >
                                <Tab
                                    label={
                                        <TabWithBadge
                                            label="Participants"
                                            count={leaderboard?.length}
                                        />
                                    }
                                />
                                <Tab
                                    label={
                                        <TabWithBadge
                                            label="Payouts"
                                            count={payouts?.length || 0}
                                        />
                                    }
                                />
                            </Tabs>

                            {activeTab === 0 ? (
                                <>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Wallet Address</TableCell>
                                                    <TableCell align="right">Points</TableCell>
                                                    <TableCell align="right">
                                                        Token Amount
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {leaderboardLoading && !leaderboard?.length ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center">
                                                            <CircularProgress size={24} />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    leaderboard?.map(participant => (
                                                        <TableRow key={participant.walletAddress}>
                                                            <TableCell>
                                                                {shortenAddress(
                                                                    participant.walletAddress
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {participant.points?.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {(
                                                                    participant.points *
                                                                    parseFloat(tokensPerPoint)
                                                                ).toFixed(6)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    {loadMore && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Button
                                                onClick={handleLoadMore}
                                                disabled={leaderboardLoading}
                                            >
                                                Load More
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <PayoutsTable payouts={payouts} loading={payoutsLoading} />
                            )}
                        </Box>
                    </Card>
                </>
            )}

            {/* Add Snackbar at the end of the component */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={10000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    '& .MuiAlert-root': {
                        width: '100%',
                        minWidth: '300px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '& .MuiAlert-message': {
                            fontSize: '1rem',
                        },
                    },
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    elevation={6}
                    sx={{
                        backgroundColor: theme => {
                            switch (snackbar.severity) {
                                case 'success':
                                    return theme.palette.success.main;
                                case 'error':
                                    return theme.palette.error.main;
                                case 'info':
                                    return theme.palette.info.main;
                                default:
                                    return theme.palette.primary.main;
                            }
                        },
                        color: 'white',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
