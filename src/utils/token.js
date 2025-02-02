import { Contract } from 'ethers';

// ERC20 ABI - minimal interface for name, symbol, decimals and balanceOf
const ERC20_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
];

export const validateToken = async (tokenAddress, provider, walletAddress) => {
    try {
        if (!provider) throw new Error('No provider available');

        const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

        // Fetch token details and balance
        const [name, symbol, decimals, balance] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            walletAddress ? tokenContract.balanceOf(walletAddress) : 0n,
        ]);

        return {
            isValid: true,
            name,
            symbol,
            decimals,
            address: tokenAddress,
            balance,
            formattedBalance: formatTokenBalance(balance, decimals),
        };
    } catch (error) {
        console.error('Error validating token:', error);
        return {
            isValid: false,
            error: 'Invalid token address or not an ERC20 token',
        };
    }
};

const formatTokenBalance = (balance, decimals) => {
    if (!balance) return '0';

    // Convert BigInt to string and handle decimals
    const balanceStr = balance.toString();
    const len = balanceStr.length;

    if (len <= decimals) {
        // Add leading zeros if needed
        const zeros = '0'.repeat(decimals - len + 1);
        return `0.${zeros}${balanceStr}`;
    }

    // Insert decimal point
    const decimalPoint = len - decimals;
    const wholeNumber = balanceStr.slice(0, decimalPoint);
    const fraction = balanceStr.slice(decimalPoint);

    // Remove trailing zeros after decimal
    const trimmedFraction = fraction.replace(/0+$/, '');

    return trimmedFraction ? `${wholeNumber}.${trimmedFraction}` : wholeNumber;
};
