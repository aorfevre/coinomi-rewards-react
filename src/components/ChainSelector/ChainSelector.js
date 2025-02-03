import React, { useState } from 'react';
import { Grid, Card } from '@mui/material';
import PropTypes from 'prop-types';

export const ChainSelector = ({ currentChainId, onChainSelect }) => {
    const [chains, setChains] = useState([
        { id: 'chain1', name: 'Chain 1' },
        { id: 'chain2', name: 'Chain 2' },
        { id: 'chain3', name: 'Chain 3' },
    ]);

    return (
        <Grid container spacing={2}>
            {chains.map(chain => (
                <Grid item xs={12} sm={6} md={4} key={chain.id}>
                    <Card
                        onClick={() => onChainSelect(chain.id)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor:
                                currentChainId === chain.id
                                    ? 'action.selected'
                                    : 'background.paper',
                        }}
                    >
                        {/* ... rest of the component ... */}
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

ChainSelector.propTypes = {
    currentChainId: PropTypes.string,
    onChainSelect: PropTypes.func.isRequired,
};
