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
    batches,
    batchStatus = {
        preparing: false,
        processing: false,
        completed: false,
        failed: false,
    },
    onProcessBatch,
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
                <BatchesStep batches={batches} status={batchStatus} onProcess={onProcessBatch} />
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
    batches: PropTypes.array,
    batchStatus: PropTypes.shape({
        preparing: PropTypes.bool,
        processing: PropTypes.bool,
        completed: PropTypes.bool,
        failed: PropTypes.bool,
    }),
    onProcessBatch: PropTypes.func,
    handleTokenSelect: PropTypes.func.isRequired,
};
