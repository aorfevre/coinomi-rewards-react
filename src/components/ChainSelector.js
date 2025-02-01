import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Alert, Button } from '@mui/material';

// Import SVG icons directly
import { ReactComponent as ETHIcon } from '../assets/icons/eth.svg';
import { ReactComponent as BNBIcon } from '../assets/icons/bnb.svg';
import { ReactComponent as POLYGONIcon } from '../assets/icons/polygon.svg';
import { ReactComponent as BASEIcon } from '../assets/icons/base.svg';

export const SUPPORTED_CHAINS = [
    {
        id: '0x1',
        name: 'Ethereum',
        nativeCurrency: 'ETH',
        tokens: ['USDT', 'USDC', 'DAI'],
        Icon: ETHIcon,
    },
    {
        id: '0x38',
        name: 'BNB Chain',
        nativeCurrency: 'BNB',
        tokens: ['USDT', 'BUSD'],
        Icon: BNBIcon,
    },
    {
        id: '0x89',
        name: 'Polygon',
        nativeCurrency: 'MATIC',
        tokens: ['USDT', 'USDC'],
        Icon: POLYGONIcon,
    },
    {
        id: '0x2105',
        name: 'Base',
        nativeCurrency: 'ETH',
        tokens: ['USDC'],
        Icon: BASEIcon,
    },
];

export const ChainSelector = ({ currentChainId, onChainSelect }) => {
    const isValidChain = SUPPORTED_CHAINS.some(chain => chain.id === currentChainId);

    if (!isValidChain && currentChainId) {
        return (
            <Alert
                severity="warning"
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => onChainSelect(SUPPORTED_CHAINS[0].id)}
                    >
                        Switch to Ethereum
                    </Button>
                }
            >
                Please switch to a supported network
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {SUPPORTED_CHAINS.map(chain => (
                <Box
                    key={chain.id}
                    onClick={() => onChainSelect(chain.id)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: theme =>
                            chain.id === currentChainId
                                ? `2px solid ${theme.palette.primary.main}`
                                : '2px solid transparent',
                        bgcolor: 'background.paper',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    <Box sx={{ width: 24, height: 24 }}>
                        <chain.Icon width="100%" height="100%" />
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {chain.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {chain.nativeCurrency}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

// Add PropTypes validation
ChainSelector.propTypes = {
    currentChainId: PropTypes.string,
    onChainSelect: PropTypes.func.isRequired,
};

ChainSelector.defaultProps = {
    currentChainId: null,
};
