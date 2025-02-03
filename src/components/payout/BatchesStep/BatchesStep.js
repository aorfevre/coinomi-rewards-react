import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, TextField, Typography } from '@mui/material';

const MAX_BATCH_SIZE = 500;

export const BatchesStep = ({ totalParticipants, onCreateBatches }) => {
    const [batchSize, setBatchSize] = useState(MAX_BATCH_SIZE);

    const batchDetails = useMemo(() => {
        if (!totalParticipants || !batchSize) return [];

        const numberOfBatches = Math.ceil(totalParticipants / batchSize);
        const batches = [];

        let remainingParticipants = totalParticipants;
        for (let i = 0; i < numberOfBatches; i++) {
            const currentBatchSize = Math.ceil(remainingParticipants / (numberOfBatches - i));
            batches.push(currentBatchSize);
            remainingParticipants -= currentBatchSize;
        }

        return batches;
    }, [totalParticipants, batchSize]);

    const handleBatchSizeChange = event => {
        const value = Math.min(Math.max(parseInt(event.target.value) || 1, 1), MAX_BATCH_SIZE);
        setBatchSize(value);
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Configure Batches
            </Typography>

            <Box sx={{ mb: 4 }}>
                <TextField
                    label="Batch Size"
                    type="number"
                    value={batchSize}
                    onChange={handleBatchSizeChange}
                    inputProps={{
                        min: 1,
                        max: MAX_BATCH_SIZE,
                    }}
                    helperText={`Maximum batch size is ${MAX_BATCH_SIZE}`}
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Total Participants: {totalParticipants}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Number of Batches: {batchDetails.length}
                </Typography>

                {batchDetails.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Batch Distribution:
                        </Typography>
                        {batchDetails.map((size, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                                Batch {index + 1}: {size} participants
                            </Typography>
                        ))}
                    </Box>
                )}

                <Button
                    variant="contained"
                    onClick={() => onCreateBatches(batchDetails)}
                    disabled={batchDetails.length === 0}
                    fullWidth
                >
                    Create Batches
                </Button>
            </Box>
        </Box>
    );
};

BatchesStep.propTypes = {
    totalParticipants: PropTypes.number.isRequired,
    onCreateBatches: PropTypes.func.isRequired,
};
