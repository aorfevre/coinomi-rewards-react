import { useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import React from 'react';

export const CHAIN_CONFIGS = {
    '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://eth-mainnet.public.blastapi.io'],
        blockExplorerUrls: ['https://etherscan.io'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'ethereum.svg',
    },
    '0xaa36a7': {
        chainId: '0xaa36a7',
        chainName: 'Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://eth-sepolia.public.blastapi.io'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        testnet: true,
        icon: 'sepolia.svg',
        tokens: [
            {
                address: process.env.REACT_APP_TEST_TOKEN_ADDRESS,
                symbol: 'TEST',
                name: 'Test Token',
                decimals: 18,
            },
        ],
    },
    '0x38': {
        chainId: '0x38',
        chainName: 'BNB Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'bnb.svg',
    },
    '0x89': {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'polygon.svg',
    },
    '0x2105': {
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'base.svg',
    },
    '0xa86a': {
        chainId: '0xa86a',
        chainName: 'Avalanche',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'avalanche.svg',
    },
    '0xa4b1': {
        chainId: '0xa4b1',
        chainName: 'Arbitrum',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
        disperseContract: '0xD152f549545093347A162Dce210e7293f1452150',
        icon: 'arbitrum.svg',
    },
};

const WALLET_CONNECTED_KEY = 'walletConnected';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [error, setError] = useState(null);
    const [provider, setProvider] = useState(null);

    const getProvider = useCallback(() => {
        if (!window.ethereum) return null;
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
        return provider;
    }, []);

    const switchChain = useCallback(async targetChainId => {
        if (!window.ethereum) {
            throw new Error('No provider available');
        }

        try {
            // First try to switch to the chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${Number(targetChainId).toString(16)}` }],
            });
            setChainId(`0x${Number(targetChainId).toString(16)}`);
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    const chainParams = getChainParams(targetChainId);
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [chainParams],
                    });
                    setChainId(`0x${Number(targetChainId).toString(16)}`);
                } catch (addError) {
                    throw new Error('Failed to add network');
                }
            } else {
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

                // Initialize provider
                const provider = getProvider();

                // Get current chain ID
                const currentChainId = await window.ethereum.request({
                    method: 'eth_chainId',
                });
                setChainId(currentChainId);

                if (targetChainId && currentChainId !== `0x${Number(targetChainId).toString(16)}`) {
                    await switchChain(targetChainId);
                }

                // Setup event listeners
                window.ethereum.on('accountsChanged', newAccounts => {
                    setAccount(newAccounts[0] || null);
                    if (!newAccounts[0]) {
                        localStorage.removeItem(WALLET_CONNECTED_KEY);
                        setProvider(null);
                    }
                });

                window.ethereum.on('chainChanged', newChainId => {
                    setChainId(newChainId);
                    getProvider(); // Reinitialize provider on chain change
                });

                localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
                return provider;
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
        setProvider(null);
        localStorage.removeItem(WALLET_CONNECTED_KEY);
    }, []);

    return {
        connect,
        disconnect,
        switchChain,
        account,
        chainId,
        error,
        provider,
        getProvider,
    };
};

// Helper function to get chain parameters
const getChainParams = chainId => {
    const chains = {
        1: {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io'],
        },
        11155111: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
        },
        // Add other chains as needed
    };

    return chains[chainId] || null;
};
