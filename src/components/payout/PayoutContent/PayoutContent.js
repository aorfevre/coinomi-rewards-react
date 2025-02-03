import { Box, Card, Button } from '@mui/material';
import { PayoutTabs } from '../PayoutTabs';
import { WeekSelector } from '../../common/WeekSelector';
import { Download as FileDownloadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

export const PayoutContent = ({
    selectedWeek,
    selectedYear,
    onWeekChange,
    leaderboard,
    leaderboardLoading,
    payouts,
    payoutsLoading,
    onDownloadCSV,
    onGenerateTest,
    chainId,
    activeTab,
    onTabChange,
}) => {
    return (
        <Card sx={{ mt: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <WeekSelector
                    selectedWeek={selectedWeek}
                    selectedYear={selectedYear}
                    onChange={onWeekChange}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {chainId === '0xaa36a7' && (
                        <Button
                            variant="outlined"
                            onClick={onGenerateTest}
                            disabled={leaderboardLoading}
                        >
                            Generate Test Data
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={onDownloadCSV}
                        disabled={!leaderboard || leaderboardLoading}
                    >
                        Download CSV
                    </Button>
                </Box>
            </Box>

            <PayoutTabs
                leaderboard={leaderboard}
                leaderboardLoading={leaderboardLoading}
                payouts={payouts}
                payoutsLoading={payoutsLoading}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />
        </Card>
    );
};

PayoutContent.propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    onWeekChange: PropTypes.func.isRequired,
    leaderboard: PropTypes.array,
    leaderboardLoading: PropTypes.bool,
    payouts: PropTypes.array,
    payoutsLoading: PropTypes.bool,
    onDownloadCSV: PropTypes.func.isRequired,
    onGenerateTest: PropTypes.func.isRequired,
    chainId: PropTypes.string.isRequired,
    activeTab: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
};
