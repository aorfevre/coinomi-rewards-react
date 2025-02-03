// Logic and state management
import { useState, useCallback } from 'react';
import { getWeek, getYear } from 'date-fns';

export const usePayoutDashboard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()));
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
    const [chainId, setChainId] = useState('');
    const [selectedToken, setSelectedToken] = useState(null);
    const [totalTokens, setTotalTokens] = useState('');
    const showMessage = useCallback((message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    }, []);
    const handleChainSelect = useCallback(
        newChainId => {
            setChainId(newChainId);
            setActiveStep(prev => prev + 1);
            showMessage('Chain selected successfully', 'success');
        },
        [showMessage]
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
    };
};
