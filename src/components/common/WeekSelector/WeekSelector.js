import React from 'react';
import PropTypes from 'prop-types';
import { Box, Select, MenuItem, Button } from '@mui/material';

// Reusable week selector component
export const WeekSelector = ({ selectedWeek, selectedYear, onChange }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button onClick={() => onChange('prev')}>&lt;</Button>
            <Select value={selectedWeek} onChange={e => onChange('week', e.target.value)}>
                {Array.from({ length: 52 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                        Week {i + 1}
                    </MenuItem>
                ))}
            </Select>
            <Select value={selectedYear} onChange={e => onChange('year', e.target.value)}>
                {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    );
                })}
            </Select>
            <Button onClick={() => onChange('next')}>&gt;</Button>
        </Box>
    );
};

WeekSelector.propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};
