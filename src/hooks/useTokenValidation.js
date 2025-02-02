import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWeb3 } from './useWeb3';

const ERC20_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
];

export const useTokenValidation = chainId => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getProvider, account } = useWeb3();

    const validateToken = useCallback(
        async address => {
            if (!address || !chainId || !account) return;

            setLoading(true);
            setError(null);

            try {
                const provider = getProvider();
                if (!provider) throw new Error('No provider available');

                const tokenContract = new Contract(address, ERC20_ABI, provider);

                // Fetch token details
                const [name, symbol, decimals, balance] = await Promise.all([
                    tokenContract.name(),
                    tokenContract.symbol(),
                    tokenContract.decimals(),
                    tokenContract.balanceOf(account),
                ]);

                const tokenInfo = {
                    address,
                    name,
                    symbol,
                    decimals,
                    balance: balance.toString(),
                };

                setToken(tokenInfo);
                return tokenInfo;
            } catch (err) {
                console.error('Error validating token:', err);
                setError('Failed to validate token. Please check the address and try again.');
                setToken(null);
            } finally {
                setLoading(false);
            }
        },
        [chainId, account, getProvider]
    );

    return {
        token,
        loading,
        error,
        validateToken,
    };
};
