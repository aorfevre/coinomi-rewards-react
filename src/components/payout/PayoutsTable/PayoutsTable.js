import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableLoadingRow } from '../../common/TableLoadingRow';
import { PayoutRow } from './PayoutRow';

export const PayoutsTable = ({ payouts, loading }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Transaction Hash</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Recipients</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableLoadingRow colSpan={4} />
                    ) : (
                        payouts?.map(payout => <PayoutRow key={payout.id} payout={payout} />)
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

PayoutsTable.propTypes = {
    payouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            explorerUrl: PropTypes.string.isRequired,
            transactionHash: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            amount: PropTypes.string.isRequired,
            recipients: PropTypes.number.isRequired,
        })
    ),
    loading: PropTypes.bool,
};

PayoutsTable.defaultProps = {
    payouts: [],
    loading: false,
};
