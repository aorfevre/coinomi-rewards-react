import { useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import React from 'react';

const CHAIN_CONFIGS = {
    '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://eth-mainnet.public.blastapi.io'],
        blockExplorerUrls: ['https://etherscan.io'],
    },
    '0x38': {
        chainId: '0x38',
        chainName: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com'],
    },
    '0x89': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
    },
    '0x2105': {
        chainId: '0x2105',
        chainName: 'Base Mainnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
    },
};

const WALLET_CONNECTED_KEY = 'walletConnected';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [error, setError] = useState(null);

    const getProvider = useCallback(() => {
        if (!window.ethereum) return null;
        return new BrowserProvider(window.ethereum);
    }, []);

    const switchChain = useCallback(async targetChainId => {
        if (!window.ethereum) return;

        try {
            // Reset error state
            setError(null);

            // Try to switch to the chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
            });

            // Update chainId state after successful switch
            setChainId(targetChainId);
        } catch (switchError) {
            // Handle chain not added to MetaMask
            if (switchError?.code === 4902 || switchError?.code === -32603) {
                const config = CHAIN_CONFIGS[targetChainId];
                if (!config) {
                    throw new Error(`Chain configuration not found for chainId: ${targetChainId}`);
                }

                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [config],
                    });

                    // After adding the chain, try switching again
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: targetChainId }],
                    });

                    // Update chainId state after successful switch
                    setChainId(targetChainId);
                } catch (addError) {
                    console.error('Error adding chain:', addError);
                    throw addError;
                }
            } else {
                console.error('Error switching chain:', switchError);
                throw switchError;
            }
        }
    }, []);

    const connect = useCallback(
        async targetChainId => {
            if (!window.ethereum) {
                setError('Please install MetaMask');
                return null;
            }

            try {
                setError(null);
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });

                setAccount(accounts[0]);

                // Get current chain ID
                const currentChainId = await window.ethereum.request({
                    method: 'eth_chainId',
                });
                setChainId(currentChainId);

                // Setup event listeners
                window.ethereum.on('accountsChanged', newAccounts => {
                    setAccount(newAccounts[0] || null);
                    if (!newAccounts[0]) {
                        localStorage.removeItem(WALLET_CONNECTED_KEY);
                    }
                });

                window.ethereum.on('chainChanged', newChainId => {
                    setChainId(newChainId);
                });

                // Switch chain if specified
                if (targetChainId && targetChainId !== currentChainId) {
                    try {
                        await switchChain(targetChainId);
                    } catch (error) {
                        console.error('Failed to switch chain:', error);
                        // Continue with connection even if chain switch fails
                    }
                }

                localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
                return getProvider();
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
                setError('Failed to connect to MetaMask');
                return null;
            }
        },
        [getProvider, switchChain]
    );
    // Auto-connect on mount if previously connected
    React.useEffect(() => {
        const wasConnected = localStorage.getItem(WALLET_CONNECTED_KEY);
        if (wasConnected === 'true' && window.ethereum) {
            connect();
        }
    }, [connect]);

    const disconnect = useCallback(() => {
        if (window.ethereum) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
        }
        setAccount(null);
        setChainId(null);
        setError(null);
        localStorage.removeItem(WALLET_CONNECTED_KEY);
    }, []);

    return {
        connect,
        disconnect,
        switchChain,
        account,
        chainId,
        error,
        getProvider,
    };
};
