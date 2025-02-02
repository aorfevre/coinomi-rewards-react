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

const steps = ['Select Chain', 'Select Token', 'Set Amount'];

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
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
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

export const PayoutDashboard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { connect, disconnect, account, chainId, switchChain } = useWeb3();
    const [selectedToken, setSelectedToken] = useState(null);
    const [totalTokens, setTotalTokens] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(calculateWeek(new Date()));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { leaderboard, loading: leaderboardLoading } = useLeaderboard(
        account ? 1000 : 0,
        selectedWeek,
        selectedYear
    );

    // Calculate KPI values
    const totalPoints = leaderboard?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
    const totalParticipants = leaderboard?.length || 0;
    const tokensPerPoint =
        totalTokens && totalPoints ? (parseFloat(totalTokens) / totalPoints).toFixed(6) : '0';

    const handleNext = () => {
        setActiveStep(prevStep => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    const handleDownloadCSV = useCallback(() => {
        if (!leaderboard) return;

        // Create CSV content
        const headers = ['Wallet Address', 'Points', 'Token Amount'];
        const rows = leaderboard.map(participant => [
            participant.walletAddress,
            participant.points,
            (participant.points * parseFloat(tokensPerPoint)).toFixed(6),
        ]);

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
    }, [leaderboard, tokensPerPoint, selectedWeek, selectedYear]);

    const handleChainSelect = async selectedChainId => {
        try {
            await switchChain(selectedChainId);
            handleNext();
        } catch (error) {
            console.error('Error switching chain:', error);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header with Connect/Disconnect */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Typography variant="h4">Payout Dashboard</Typography>
                <Button
                    variant="contained"
                    onClick={account ? disconnect : connect}
                    color={account ? 'error' : 'primary'}
                >
                    {account ? 'Disconnect' : 'Connect Wallet'}
                </Button>
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
                            <KPICard title="Total Participants" value={totalParticipants} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KPICard
                                title="Selected Period"
                                value={`Week ${selectedWeek}`}
                                subtitle={selectedYear.toString()}
                            />
                        </Grid>
                    </Grid>

                    {/* Period Selection and Table */}
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
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleDownloadCSV}
                                    disabled={!leaderboard || leaderboardLoading}
                                >
                                    Download CSV
                                </Button>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Wallet Address</TableCell>
                                            <TableCell align="right">Points</TableCell>
                                            <TableCell align="right">Token Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaderboardLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leaderboard?.map(participant => (
                                                <TableRow key={participant.walletAddress}>
                                                    <TableCell>
                                                        {shortenAddress(participant.walletAddress)}
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
                        </Box>
                    </Card>
                </>
            )}
        </Box>
    );
};
