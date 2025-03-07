export const PayoutDashboard = () => {
    const {
        activeStep,
        handleNext,
        handleBack,
        chainId,
        selectedToken,
        handleChainSelect,
        handleTokenSelect,
        selectedWeek,
        selectedYear,
        handleWeekChange,
        leaderboard,
        leaderboardLoading,
        payouts,
        payoutsLoading,
        totalTokens,
        setTotalTokens,
        tokensPerPoint,
        batches,
        batchStatus,
        handleProcessBatch,
        handleDownloadCSV,
        handleGenerateTest,
        snackbar,
        handleCloseSnackbar,
        kpiData,
        activeTab,
        handleTabChange,
        totalParticipants,
        hasMore,
        handleLoadMore,
        isSepoliaNetwork,
        handleCreateBatches,
    } = usePayoutDashboard();

    // ... rest of the component
};
