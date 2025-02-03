import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableLoadingRow } from '../../common/TableLoadingRow';
import { shortenAddress } from '../../../utils/address';

export const ParticipantsTable = ({ participants, loading }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Wallet Address</TableCell>
                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableLoadingRow colSpan={2} />
                    ) : (
                        participants?.map(participant => (
                            <TableRow key={participant.walletAddress}>
                                <TableCell>{shortenAddress(participant.walletAddress)}</TableCell>
                                <TableCell align="right">
                                    {participant.points?.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

ParticipantsTable.propTypes = {
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            walletAddress: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
        })
    ),
    loading: PropTypes.bool,
};
