import { useState, useCallback } from 'react';
import { Contract, ethers } from 'ethers';
import { useWeb3, CHAIN_CONFIGS } from './useWeb3';
import { updateBatchStatus } from '../config/firebase';

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
    'function decimals() public view returns (uint8)',
];

const DISPERSE_ABI = [
    'function disperseToken(address token, address[] recipients, uint256[] values) external',
];

export const useTokenPayout = () => {
    const { getProvider, chainId } = useWeb3();
    const [approving, setApproving] = useState(false);
    const [dispersing, setDispersing] = useState(false);
    const [error, setError] = useState(null);

    const checkAllowance = useCallback(
        async (tokenAddress, ownerAddress, desiredAmount) => {
            try {
                if (!tokenAddress || !ownerAddress || !desiredAmount) {
                    console.warn('Missing required parameters:', {
                        tokenAddress,
                        ownerAddress,
                        desiredAmount,
                    });
                    return false;
                }

                const provider = getProvider();
                if (!provider) {
                    console.error('No provider available');
                    return false;
                }

                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;
                if (!disperseAddress) {
                    console.error('No disperse contract address found for chain:', chainId);
                    return false;
                }

                const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
                const decimals = await tokenContract.decimals();
                const desiredAmountWithDecimals = ethers.parseUnits(
                    desiredAmount.toString(),
                    decimals
                );

                const allowance = await tokenContract.allowance(ownerAddress, disperseAddress);
                console.log('Current allowance:', {
                    allowance: allowance.toString(),
                    required: desiredAmountWithDecimals.toString(),
                });

                return allowance >= desiredAmountWithDecimals;
            } catch (err) {
                console.error('Error checking allowance:', err);
                return false;
            }
        },
        [chainId, getProvider]
    );

    const approveToken = useCallback(
        async (tokenAddress, amount) => {
            setError(null);
            setApproving(true);
            try {
                if (!amount) {
                    throw new Error('Amount is required');
                }
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const signer = await provider.getSigner();
                const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;

                const decimals = await tokenContract.decimals();
                const amountString = String(amount);
                const amountWithDecimals = ethers.parseUnits(amountString, decimals);

                console.log('Approving tokens:', {
                    amount,
                    decimals,
                    amountWithDecimals: amountWithDecimals.toString(),
                });

                const tx = await tokenContract.approve(disperseAddress, amountWithDecimals);
                await tx.wait();

                return true;
            } catch (err) {
                console.error('Error approving token:', err);
                setError(err.message);
                return false;
            } finally {
                setApproving(false);
            }
        },
        [getProvider, chainId]
    );

    const disperseTokens = useCallback(
        async (tokenAddress, recipients, amounts, batch) => {
            setError(null);
            setDispersing(true);
            try {
                console.log('Dispersing tokens:', {
                    tokenAddress,
                    recipientsLength: recipients?.length,
                    amountsLength: amounts?.length,
                    recipients: recipients,
                    amounts: amounts.map(a => a.toString()),
                });

                if (!tokenAddress || !recipients || !amounts) {
                    throw new Error('Missing required parameters for disperse');
                }

                if (!Array.isArray(recipients) || !Array.isArray(amounts)) {
                    throw new Error(`Invalid array parameters: recipients and amounts must be arrays
                        Recipients type: ${typeof recipients}
                        Amounts type: ${typeof amounts}
                    `);
                }

                if (recipients.length !== amounts.length) {
                    throw new Error(`Array length mismatch: 
                        Recipients length: ${recipients.length}
                        Amounts length: ${amounts.length}
                    `);
                }

                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const signer = await provider.getSigner();
                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;
                const disperseContract = new Contract(disperseAddress, DISPERSE_ABI, signer);

                console.log('Disperse contract setup:', {
                    disperseAddress,
                    contractInterface: disperseContract.interface.format(),
                    amounts: amounts.map(a => a.toString()),
                    chainId,
                });
                // remove decimals from amounts
                const amountsWithoutDecimals = amounts.map(a => a.toString().replace('.', ''));

                const tx = await disperseContract.disperseToken(
                    tokenAddress,
                    recipients,
                    amountsWithoutDecimals
                );
                console.log('Transaction sent:', {
                    hash: tx.hash,
                    data: tx.data,
                });

                const receipt = await tx.wait();
                console.log('Transaction confirmed:', {
                    hash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                });

                const result = await updateBatchStatus({
                    payoutId: batch.payoutId,
                    batchNumber: batch.number,
                    hash: tx.hash,
                });

                console.log('Backend update result:', result);
                return result.hash;
            } catch (err) {
                console.error('Error dispersing tokens:', {
                    error: err,
                    message: err.message,
                    code: err.code,
                    data: err.data,
                    stack: err.stack,
                });
                setError(err.message);
                throw err;
            } finally {
                setDispersing(false);
            }
        },
        [getProvider, chainId]
    );

    return {
        checkAllowance,
        approveToken,
        disperseTokens,
        approving,
        dispersing,
        error,
    };
};
