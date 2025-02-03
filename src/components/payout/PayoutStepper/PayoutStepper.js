import React from 'react';
import PropTypes from 'prop-types';
import { Stepper as MuiStepper, Step, StepLabel, Box, Button } from '@mui/material';

const steps = ['Select Chain', 'Select Token', 'Set Amount', 'Process Batches'];

// Stepper component UI
export const PayoutStepper = ({ activeStep, onNext, onBack, children }) => {
    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ mb: 2 }}>
                <MuiStepper activeStep={activeStep}>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </MuiStepper>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button onClick={onBack} disabled={activeStep === 0}>
                    Back
                </Button>
                <Button onClick={onNext} disabled={activeStep === steps.length - 1}>
                    Next
                </Button>
            </Box>
            {children}
        </Box>
    );
};

PayoutStepper.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    children: PropTypes.node,
};
