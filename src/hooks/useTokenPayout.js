import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWeb3 } from './useWeb3';

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
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
        async (tokenAddress, ownerAddress) => {
            try {
                const provider = getProvider();
                if (!provider) return 0;

                const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;

                const allowance = await tokenContract.allowance(ownerAddress, disperseAddress);
                return allowance;
            } catch (err) {
                console.error('Error checking allowance:', err);
                return 0;
            }
        },
        [getProvider, chainId]
    );

    const approveToken = useCallback(
        async (tokenAddress, amount) => {
            setError(null);
            setApproving(true);
            try {
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const signer = await provider.getSigner();
                const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
                const disperseAddress = CHAIN_CONFIGS[chainId]?.disperseContract;

                const tx = await tokenContract.approve(disperseAddress, amount);
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
