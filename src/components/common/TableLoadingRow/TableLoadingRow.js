import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, CircularProgress } from '@mui/material';

export const TableLoadingRow = ({ colSpan }) => (
    <TableRow>
        <TableCell colSpan={colSpan} align="center">
            <CircularProgress size={24} />
        </TableCell>
    </TableRow>
);

TableLoadingRow.propTypes = {
    colSpan: PropTypes.number.isRequired,
};
