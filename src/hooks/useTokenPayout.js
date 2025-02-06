import { useState, useCallback } from 'react';
import { Contract, ethers } from 'ethers';
import { useWeb3, CHAIN_CONFIGS } from './useWeb3';
import { updateBatchStatus } from '../config/firebase';

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
    'function decimals() public view returns (uint8)',
    'function balanceOf(address account) public view returns (uint256)',
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

                const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
                const decimals = await tokenContract.decimals();

                const amountsWithDecimals = amounts.map(a => {
                    // Convert to string and ensure we're handling whole numbers
                    const amountStr = a.toString().trim().split('.')[0];
                    console.log('Amount string:', amountStr);
                    // Simply parse the whole number and multiply by token decimals
                    return BigInt(amountStr);
                });

                console.log('Amounts with decimals:', amountsWithDecimals);
                // Add balance check before dispersing
                const signerAddress = await signer.getAddress();
                const tokenBalance = await tokenContract.balanceOf(signerAddress);

                console.log('Token balance:', tokenBalance.toString());
                // Calculate total in human-readable format first
                const totalAmountHuman = Number(
                    amounts.reduce((sum, val) => sum + Number(val), 0).toFixed(0)
                );
                // Then convert to token units
                console.log('Total amount human:', totalAmountHuman);
                const totalAmount = BigInt(totalAmountHuman);

                console.log('Balance check:', {
                    humanReadableTotal: totalAmountHuman,
                    tokenBalance: ethers.formatUnits(tokenBalance, decimals),
                    totalAmount: totalAmount.toString(),
                });

                if (BigInt(tokenBalance.toString()) < totalAmount) {
                    throw new Error('Insufficient token balance for disperse');
                }

                // Add allowance check
                const allowance = await tokenContract.allowance(signerAddress, disperseAddress);
                if (BigInt(allowance.toString()) < totalAmount) {
                    throw new Error('Insufficient token allowance for disperse');
                }

                console.log('Pre-disperse checks:', {
                    balance: tokenBalance.toString(),
                    totalAmount: totalAmount.toString(),
                    allowance: allowance.toString(),
                    signerAddress,
                    disperseAddress,
                    tokenAddress,
                    recipients,
                    amountsWithDecimals,
                });

                // Improve gas estimation with better error handling and buffer
                let gasLimit;
                try {
                    console.log('Attempting to estimate gas with params:', {
                        tokenAddress,
                        recipients: recipients.slice(0, 3),
                        amountsWithDecimals: amountsWithDecimals.map(a => a.toString()).slice(0, 3),
                    });

                    // Add exponential backoff retry logic for gas estimation
                    let retryCount = 0;
                    const maxRetries = 3;
                    const baseDelay = 1000; // 1 second

                    while (retryCount < maxRetries) {
                        try {
                            // Get current fee data to ensure estimation is accurate
                            const feeData = await provider.getFeeData();
                            console.log('Current gas price:', feeData.gasPrice?.toString());

                            gasLimit = await disperseContract.disperseToken.estimateGas(
                                tokenAddress,
                                recipients,
                                amountsWithDecimals,
                                { gasPrice: feeData.gasPrice }
                            );
                            break; // Success, exit the retry loop
                        } catch (estimateErr) {
                            retryCount++;
                            if (retryCount === maxRetries) throw estimateErr;

                            const delay = baseDelay * Math.pow(2, retryCount - 1);
                            console.warn(
                                `Gas estimation attempt ${retryCount} failed, retrying in ${delay}ms...`,
                                estimateErr.message
                            );
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }

                    // Add 50% buffer to the estimated gas for safer execution
                    gasLimit = (gasLimit * BigInt(150)) / BigInt(100);
                    console.log('Estimated gas limit with buffer:', gasLimit.toString());
                } catch (err) {
                    console.error('Gas estimation failed after retries:', {
                        error: err,
                        message: err.message,
                        code: err.code,
                        data: err.data,
                        method: 'disperseToken',
                        tokenAddress,
                        recipientsCount: recipients.length,
                        amountsCount: amountsWithDecimals.length,
                        rpcUrl: provider.connection?.url || 'unknown',
                    });

                    // More generous fallback gas calculation
                    const baseGas = 150000; // Increased base gas
                    const perRecipientGas = 85000; // Increased per-recipient gas
                    gasLimit = BigInt(baseGas + perRecipientGas * recipients.length);

                    // Add 50% safety buffer to fallback calculation
                    gasLimit = (gasLimit * BigInt(150)) / BigInt(100);
                    console.warn('Using calculated fallback gas limit:', gasLimit.toString());
                }
                console.log('Using gas limit:', gasLimit);
                const tx = await disperseContract.disperseToken(
                    tokenAddress,
                    recipients,
                    amountsWithDecimals,
                    { gasLimit: gasLimit }
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
