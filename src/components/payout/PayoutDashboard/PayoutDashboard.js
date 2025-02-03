// Main component UI
import { Box } from '@mui/material';
import { PayoutStepper } from '../PayoutStepper';
import { PayoutContent } from '../PayoutContent';
import { KPISection } from '../KPISection';
import { FeedbackSnackbar } from '../../common/FeedbackSnackbar';
import { usePayoutDashboard } from './usePayoutDashboard';

export const PayoutDashboard = () => {
    const {
        activeStep,
        selectedWeek,
        selectedYear,
        leaderboard,
        payouts,
        snackbar,
        kpiData,
        stepProps,
        handlers,
        loading,
    } = usePayoutDashboard();

    return (
        <Box>
            <KPISection {...kpiData} />
            <PayoutStepper activeStep={activeStep} {...stepProps} />
            <PayoutContent
                selectedWeek={selectedWeek}
                selectedYear={selectedYear}
                leaderboard={leaderboard}
                payouts={payouts}
                loading={loading}
                {...handlers}
            />
            <FeedbackSnackbar {...snackbar} />
        </Box>
    );
};
