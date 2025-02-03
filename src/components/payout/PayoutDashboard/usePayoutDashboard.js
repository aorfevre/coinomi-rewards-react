// Logic and state management
import { useState, useCallback, useEffect, useMemo } from 'react';
import { getWeek, getYear } from 'date-fns';
import { useLeaderboard } from '../../../hooks/useLeaderboard';
import { useWeb3 } from '../../../hooks/useWeb3';
import { CHAIN_IDS } from '../../../constants/chains';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../../config/firebase';

// Helper function to convert hex to decimal string
const hexToDecimal = hex => {
    if (!hex) return '';
    return parseInt(hex, 16).toString();
};

export const usePayoutDashboard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()));
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
    const [chainId, setChainId] = useState('');
    const [selectedToken, setSelectedToken] = useState(null);
    const [totalTokens, setTotalTokens] = useState('');
    const [batchStatus, setBatchStatus] = useState({
        preparing: false,
        processing: false,
        completed: false,
        failed: false,
    });

    const {
        entries: leaderboard,
        loading: leaderboardLoading,
        totalParticipants,
        hasMore,
        loadMore,
        fetchAllParticipants,
        refetchLeaderboard,
    } = useLeaderboard({
        weekNumber: selectedWeek,
        yearNumber: selectedYear,
    });

    const { chainId: currentChainId, switchChain } = useWeb3();
    const currentChainDecimal = hexToDecimal(currentChainId);
    const isSepoliaNetwork = currentChainDecimal === CHAIN_IDS.SEPOLIA;

    // Add debug logging
    useEffect(() => {
        console.log('Chain detection:', {
            currentChainId,
            currentChainDecimal,
            SEPOLIA_ID: CHAIN_IDS.SEPOLIA,
            isSepoliaNetwork,
        });
    }, [currentChainId, currentChainDecimal, isSepoliaNetwork]);

    // Calculate KPI data
    const kpiData = useMemo(() => {
        const totalPoints = leaderboard?.reduce((sum, entry) => sum + (entry.points || 0), 0) || 0;

        return {
            totalParticipants: totalParticipants || 0,
            totalPoints,
            tokensPerPoint: totalTokens ? Number(totalTokens) / totalPoints : 0,
            totalTokens: Number(totalTokens) || 0,
        };
    }, [leaderboard, totalParticipants, totalTokens]);

    // Log KPI data for debugging
    useEffect(() => {
        console.log('KPI Data:', kpiData);
    }, [kpiData]);

    // Update logging to use entries instead of leaderboard.length
    useEffect(() => {
        console.log('Week/Year changed:', {
            selectedWeek,
            selectedYear,
            hasLeaderboard: leaderboard?.length > 0,
        });
    }, [selectedWeek, selectedYear, leaderboard]);

    const showMessage = useCallback((message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    }, []);
    const handleChainSelect = useCallback(
        newChainId => {
            console.log('🔗 Chain selection initiated:', {
                chainId: newChainId,
                type: typeof newChainId,
            });
            switchChain(newChainId);
            setChainId(newChainId);
            setActiveStep(prev => prev + 1);
            showMessage('Chain selected successfully', 'success');
        },
        [showMessage, switchChain]
    );

    const handleTokenSelect = useCallback(
        token => {
            setSelectedToken(token);
            setActiveStep(prev => prev + 1);
            showMessage('Token selected successfully', 'success');
        },
        [showMessage]
    );

    const handleTabChange = useCallback((_, newValue) => {
        setActiveTab(newValue);
    }, []);

    const handleNext = useCallback(() => {
        setActiveStep(prev => prev + 1);
    }, []);

    const handleBack = useCallback(() => {
        setActiveStep(prev => prev - 1);
    }, []);

    const handleWeekChange = useCallback(
        (type, value) => {
            console.log('Week change:', { type, value }); // Add logging
            if (type === 'week') {
                setSelectedWeek(value);
            } else if (type === 'year') {
                setSelectedYear(value);
            } else if (type === 'prev') {
                if (selectedWeek === 1) {
                    setSelectedWeek(52);
                    setSelectedYear(prev => prev - 1);
                } else {
                    setSelectedWeek(prev => prev - 1);
                }
            } else if (type === 'next') {
                if (selectedWeek === 52) {
                    setSelectedWeek(1);
                    setSelectedYear(prev => prev + 1);
                } else {
                    setSelectedWeek(prev => prev + 1);
                }
            }
        },
        [selectedWeek]
    );

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const handleLoadMore = useCallback(() => {
        loadMore();
    }, [loadMore]);

    const handleDownloadCSV = useCallback(async () => {
        try {
            showMessage('Preparing CSV download...', 'info');

            // Fetch all participants at once
            const allParticipants = await fetchAllParticipants();

            if (!allParticipants?.length) {
                showMessage('No data to download', 'warning');
                return;
            }

            // Create CSV content
            const headers = ['Wallet Address', 'Points', 'Tokens'];
            const tokensPerPoint = totalTokens ? Number(totalTokens) / kpiData.totalPoints : 0;

            const rows = allParticipants.map(entry => [
                entry.walletAddress,
                entry.points,
                (entry.points * tokensPerPoint).toFixed(6),
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
            URL.revokeObjectURL(url);

            showMessage('CSV downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showMessage('Error downloading CSV', 'error');
        }
    }, [
        fetchAllParticipants,
        selectedWeek,
        selectedYear,
        totalTokens,
        kpiData.totalPoints,
        showMessage,
    ]);

    const handleGenerateTest = useCallback(async () => {
        if (!isSepoliaNetwork) {
            showMessage('Test data can only be generated on Sepolia network', 'warning');
            return;
        }

        try {
            showMessage('Generating test data...', 'info');

            const functions = getFunctions(app);
            const createFakeScoresFunction = httpsCallable(functions, 'createFakeScores');

            await createFakeScoresFunction({
                week: selectedWeek,
                year: selectedYear,
                count: 100,
            });

            await refetchLeaderboard();
            showMessage('Test data generated successfully', 'success');
        } catch (error) {
            console.error('Error generating test data:', error);
            showMessage(error.message || 'Error generating test data', 'error');
        }
    }, [selectedWeek, selectedYear, showMessage, isSepoliaNetwork, refetchLeaderboard]);

    return {
        activeStep,
        activeTab,
        handleNext,
        handleBack,
        handleTabChange,
        selectedWeek,
        selectedYear,
        handleWeekChange,
        snackbar,
        handleCloseSnackbar,
        showMessage,
        chainId,
        handleChainSelect,
        selectedToken,
        handleTokenSelect,
        totalTokens,
        setTotalTokens,
        batchStatus,
        setBatchStatus,
        leaderboard,
        leaderboardLoading,
        totalParticipants,
        hasMore,
        handleLoadMore,
        kpiData,
        handleDownloadCSV,
        handleGenerateTest,
        isSepoliaNetwork,
    };
};
