import { TableRow, TableCell, Link } from '@mui/material';
import { shortenAddress } from '../../../utils/address';

export const PayoutRow = ({ payout }) => (
    <TableRow>
        <TableCell>
            <Link href={`${payout.explorerUrl}/tx/${payout.transactionHash}`} target="_blank">
                {shortenAddress(payout.transactionHash)}
            </Link>
        </TableCell>
        <TableCell>{payout.status}</TableCell>
        <TableCell align="right">{payout.amount}</TableCell>
        <TableCell align="right">{payout.recipients}</TableCell>
    </TableRow>
);
