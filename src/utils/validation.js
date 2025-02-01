export const isValidAddress = address => {
    if (!address) return false;

    // Basic Ethereum address validation (0x followed by 40 hex characters)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
};
