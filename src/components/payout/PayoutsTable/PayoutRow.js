import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Link } from '@mui/material';
import { shortenAddress } from '../../../utils/address';

export const PayoutRow = ({ payout }) => (
    <TableRow>
        <TableCell>
            <Link
                href={`${payout.explorerUrl}/tx/${payout.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {shortenAddress(payout.transactionHash)}
            </Link>
        </TableCell>
        <TableCell>{payout.status}</TableCell>
        <TableCell align="right">{payout.amount}</TableCell>
        <TableCell align="right">{payout.recipients}</TableCell>
    </TableRow>
);

PayoutRow.propTypes = {
    payout: PropTypes.shape({
        explorerUrl: PropTypes.string.isRequired,
        transactionHash: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        recipients: PropTypes.number.isRequired,
    }).isRequired,
};
