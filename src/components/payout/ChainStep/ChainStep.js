import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useChainStep } from './useChainStep';
import { CHAIN_CONFIGS } from '../../../hooks/useWeb3';
import PropTypes from 'prop-types';

export const ChainStep = ({ onChainSelect }) => {
    const { handleChainSelect } = useChainStep(onChainSelect);

    const handleClick = async chainId => {
        console.log('🖱️ Chain button clicked:', { chainId });
        await handleChainSelect(chainId);
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Select Chain
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                }}
            >
                {Object.entries(CHAIN_CONFIGS).map(([chainId, config]) => (
                    <Paper
                        key={chainId}
                        onClick={() => handleClick(chainId)}
                        sx={{
                            p: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src={`/images/chains/${config.icon}`}
                            alt={config.chainName}
                            sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                            <Typography variant="subtitle1">{config.chainName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {config.nativeCurrency.symbol}
                            </Typography>
                            {config.testnet && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        ml: 1,
                                        px: 1,
                                        py: 0.5,
                                        bgcolor: 'warning.main',
                                        borderRadius: 1,
                                        color: 'warning.contrastText',
                                    }}
                                >
                                    TESTNET
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

ChainStep.propTypes = {
    onChainSelect: PropTypes.func.isRequired,
};
