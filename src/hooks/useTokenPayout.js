import { useState, useCallback } from 'react';
import { Contract, ethers } from 'ethers';
import { useWeb3, CHAIN_CONFIGS } from './useWeb3';

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
        [chainId]
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
        async (tokenAddress, recipients, amounts) => {
            setError(null);
            setDispersing(true);
            try {
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const signer = await provider.getSigner();
                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;
                const disperseContract = new Contract(disperseAddress, DISPERSE_ABI, signer);

                const tx = await disperseContract.disperseToken(tokenAddress, recipients, amounts);
                await tx.wait();

                return true;
            } catch (err) {
                console.error('Error dispersing tokens:', err);
                setError(err.message);
                return false;
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
