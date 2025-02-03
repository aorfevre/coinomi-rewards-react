import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { PayoutStepper } from './payout/PayoutStepper';
import { StepContent } from './payout/PayoutStepper/StepContent';
import { PayoutContent } from './payout/PayoutContent';
import { FeedbackSnackbar } from './common/FeedbackSnackbar';
import { WalletButton } from './common/WalletButton';
import { usePayoutDashboard } from './payout/PayoutDashboard/usePayoutDashboard';

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
        handleCreateBatches,
        snackbar,
        handleCloseSnackbar,
        kpiData,
        activeTab,
        handleTabChange,
        totalParticipants,
        hasMore,
        handleLoadMore,
        isSepoliaNetwork,
    } = usePayoutDashboard();

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: theme => theme.palette.primary.main,
                        }}
                    >
                        Rewards Payout Dashboard
                    </Typography>
                    <WalletButton />
                </Box>

                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 3,
                        boxShadow: 1,
                        mb: 4,
                    }}
                >
                    <PayoutStepper activeStep={activeStep} onNext={handleNext} onBack={handleBack}>
                        <StepContent
                            step={activeStep}
                            chainId={chainId}
                            selectedToken={selectedToken}
                            handleTokenSelect={handleTokenSelect}
                            totalTokens={totalTokens}
                            setTotalTokens={setTotalTokens}
                            leaderboard={leaderboard}
                            tokensPerPoint={tokensPerPoint}
                            onChainSelect={handleChainSelect}
                            batches={batches}
                            batchStatus={batchStatus}
                            onProcessBatch={handleProcessBatch}
                            totalParticipants={totalParticipants}
                            onCreateBatches={handleCreateBatches}
                        />
                    </PayoutStepper>
                </Box>

                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 3,
                        boxShadow: 1,
                    }}
                >
                    <PayoutContent
                        selectedWeek={selectedWeek}
                        selectedYear={selectedYear}
                        onWeekChange={handleWeekChange}
                        leaderboard={leaderboard}
                        leaderboardLoading={leaderboardLoading}
                        payouts={payouts}
                        payoutsLoading={payoutsLoading}
                        onDownloadCSV={handleDownloadCSV}
                        onGenerateTest={handleGenerateTest}
                        chainId={chainId}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        kpiData={kpiData}
                        totalParticipants={totalParticipants}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                        loading={leaderboardLoading}
                        isSepoliaNetwork={isSepoliaNetwork}
                    />
                </Box>
            </Box>
            <FeedbackSnackbar {...snackbar} onClose={handleCloseSnackbar} />
        </Container>
    );
};
