import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { CHAIN_CONFIGS } from '../hooks/useWeb3'; // We'll need to export this

// Import chain icons
import ethereumIcon from '../assets/icons/ethereum.svg';
import bnbIcon from '../assets/icons/bnb.svg';
import polygonIcon from '../assets/icons/polygon.svg';
import baseIcon from '../assets/icons/base.svg';
import avalancheIcon from '../assets/icons/avalanche.svg';
import arbitrumIcon from '../assets/icons/arbitrum.svg';
import sepoliaIcon from '../assets/icons/sepolia.svg';

export const CHAIN_ICONS = {
    'ethereum.svg': ethereumIcon,
    'bnb.svg': bnbIcon,
    'polygon.svg': polygonIcon,
    'base.svg': baseIcon,
    'avalanche.svg': avalancheIcon,
    'arbitrum.svg': arbitrumIcon,
    'sepolia.svg': sepoliaIcon,
};

const isDevelopment = process.env.NODE_ENV === 'development';

export const ChainSelector = ({ currentChainId, onChainSelect }) => {
    // In development, show all chains. In production, filter out testnets
    const availableChains = Object.entries(CHAIN_CONFIGS).filter(
        ([, config]) => isDevelopment || !config.testnet
    );

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {availableChains.map(([chainId, config]) => (
                <Paper
                    key={chainId}
                    sx={{
                        p: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 150,
                        border: theme =>
                            chainId === currentChainId
                                ? `2px solid ${theme.palette.primary.main}`
                                : '2px solid transparent',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                        // Add a subtle indicator for testnet chains
                        position: 'relative',
                        ...(config.testnet && {
                            '&::after': {
                                content: '"TESTNET"',
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '0.6rem',
                                padding: '2px 4px',
                                borderRadius: 1,
                                backgroundColor: 'warning.main',
                                color: 'warning.contrastText',
                            },
                        }),
                    }}
                    onClick={() => onChainSelect(chainId)}
                >
                    <img
                        src={CHAIN_ICONS[config.icon]}
                        alt={config.chainName}
                        style={{ width: 24, height: 24 }}
                    />
                    <Box>
                        <Typography variant="subtitle1">{config.chainName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {config.nativeCurrency.symbol}
                        </Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

ChainSelector.propTypes = {
    currentChainId: PropTypes.string,
    onChainSelect: PropTypes.func.isRequired,
};
