import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Select, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const WeekYearSelector = ({ selectedWeek, selectedYear, onChange }) => {
    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => onChange('prev')}>
                <ChevronLeftIcon />
            </IconButton>

            <Select
                value={selectedWeek}
                onChange={e => onChange('week', e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
            >
                {weeks.map(week => (
                    <MenuItem key={week} value={week}>
                        Week {week}
                    </MenuItem>
                ))}
            </Select>

            <Select
                value={selectedYear}
                onChange={e => onChange('year', e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
            >
                {years.map(year => (
                    <MenuItem key={year} value={year}>
                        {year}
                    </MenuItem>
                ))}
            </Select>

            <IconButton onClick={() => onChange('next')}>
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

WeekYearSelector.propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};
