import { Box, Typography } from '@mui/material';
import { ChainSelector } from '../../ChainSelector';
import { TokenSelector } from '../../TokenSelector';
import { AmountStep } from '../AmountStep';
import { BatchesStep } from '../BatchesStep/BatchesStep';
import PropTypes from 'prop-types';

export const StepContent = ({
    step,
    chainId,
    selectedToken,
    totalTokens,
    setTotalTokens,
    leaderboard,
    tokensPerPoint,
    onChainSelect,
    totalParticipants,
    onCreateBatches,
    handleTokenSelect,
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
                        onTokenSelect={handleTokenSelect}
                    />
                </Box>
            );
        case 2:
            return (
                <AmountStep
                    totalTokens={totalTokens}
                    setTotalTokens={setTotalTokens}
                    leaderboard={leaderboard}
                    tokensPerPoint={tokensPerPoint}
                    selectedToken={selectedToken}
                />
            );
        case 3:
            return (
                <BatchesStep
                    totalParticipants={totalParticipants}
                    onCreateBatches={onCreateBatches}
                />
            );
        default:
            return null;
    }
};

StepContent.propTypes = {
    step: PropTypes.number.isRequired,
    chainId: PropTypes.string.isRequired,
    selectedToken: PropTypes.object,
    totalTokens: PropTypes.string,
    setTotalTokens: PropTypes.func.isRequired,
    leaderboard: PropTypes.array,
    tokensPerPoint: PropTypes.string,
    onChainSelect: PropTypes.func.isRequired,
    totalParticipants: PropTypes.number.isRequired,
    onCreateBatches: PropTypes.func.isRequired,
    handleTokenSelect: PropTypes.func.isRequired,
};
