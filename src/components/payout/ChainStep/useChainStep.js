import { useCallback } from 'react';
import { useWeb3 } from '../../../hooks/useWeb3';

export const useChainStep = onChainSelect => {
    const { switchChain } = useWeb3();

    const handleChainSelect = useCallback(
        async chainId => {
            console.log('🔗 Chain selection initiated:', {
                chainId,
                type: typeof chainId,
            });

            try {
                console.log('⚡ Attempting to switch chain...');
                await switchChain(chainId);
                console.log('✅ Chain switched successfully');

                console.log('📣 Calling onChainSelect callback...');
                onChainSelect(chainId);
                console.log('✅ Chain selection complete');
            } catch (error) {
                console.error('❌ Error in chain selection:', {
                    error,
                    message: error.message,
                    code: error.code,
                });
                // Maybe show a snackbar or handle error
            }
        },
        [switchChain, onChainSelect]
    );

    return {
        handleChainSelect,
    };
};
