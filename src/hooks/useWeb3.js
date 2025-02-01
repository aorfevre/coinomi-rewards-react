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

    // Auto-connect on mount if previously connected
    React.useEffect(() => {
        const wasConnected = localStorage.getItem(WALLET_CONNECTED_KEY);
        if (wasConnected === 'true' && window.ethereum) {
            connect();
        }
    }, []);

    const getProvider = useCallback(() => {
        if (window.ethereum) {
            return new BrowserProvider(window.ethereum);
        }
        return null;
    }, []);

    const switchChain = useCallback(async targetChainId => {
        if (!window.ethereum) return;

        try {
            // Try to switch to the chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [CHAIN_CONFIGS[targetChainId]],
                    });
                } catch (addError) {
                    setError('Failed to add network to MetaMask');
                    console.error('Error adding chain:', addError);
                }
            } else {
                setError('Failed to switch network');
                console.error('Error switching chain:', switchError);
            }
        }
    }, []);

    const connect = useCallback(
        async (targetChainId = null) => {
            if (!window.ethereum) {
                setError('Please install MetaMask!');
                return;
            }

            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);

                // Switch chain if specified
                if (targetChainId) {
                    await switchChain(targetChainId);
                }

                // Get current chain
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                setChainId(chainId);

                // Setup event listeners
                window.ethereum.on('accountsChanged', accounts => {
                    setAccount(accounts[0] || null);
                    if (!accounts[0]) {
                        localStorage.removeItem(WALLET_CONNECTED_KEY);
                    }
                });

                window.ethereum.on('chainChanged', newChainId => {
                    setChainId(newChainId);
                    window.location.reload(); // Recommended by MetaMask
                });

                // Store connection state
                localStorage.setItem(WALLET_CONNECTED_KEY, 'true');

                return getProvider();
            } catch (error) {
                setError('Error connecting to MetaMask');
                console.error('Error connecting to MetaMask:', error);
                return null;
            }
        },
        [getProvider, switchChain]
    );

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
