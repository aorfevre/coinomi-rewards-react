import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

export const BatchesStep = ({ batches, onProcessBatch, loading, error }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Process Batches
            </Typography>
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}
            {loading ? (
                <CircularProgress />
            ) : (
                batches?.map((batch, index) => (
                    <Button
                        key={index}
                        variant="contained"
                        onClick={() => onProcessBatch(batch)}
                        sx={{ mr: 2, mb: 2 }}
                    >
                        Process Batch {index + 1}
                    </Button>
                ))
            )}
        </Box>
    );
};

BatchesStep.propTypes = {
    batches: PropTypes.array,
    onProcessBatch: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
};
