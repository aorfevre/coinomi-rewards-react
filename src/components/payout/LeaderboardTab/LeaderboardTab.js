import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';

export const LeaderboardTab = ({ leaderboard, hasMore, onLoadMore, loading }) => {
    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Wallet Address</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaderboard?.map(entry => (
                            <TableRow key={entry.id}>
                                <TableCell>{entry.walletAddress}</TableCell>
                                <TableCell align="right">{entry.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Load More Button */}
            {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onLoadMore}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </Box>
            )}
        </>
    );
};

LeaderboardTab.propTypes = {
    leaderboard: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            walletAddress: PropTypes.string,
            points: PropTypes.number,
        })
    ),
    hasMore: PropTypes.bool,
    onLoadMore: PropTypes.func,
    loading: PropTypes.bool,
};

LeaderboardTab.defaultProps = {
    leaderboard: [],
    hasMore: false,
    onLoadMore: () => {},
    loading: false,
};
