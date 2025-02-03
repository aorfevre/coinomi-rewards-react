export const formatUnits = (value, decimals) => {
    if (!value) return '0';

    // Convert to string and handle scientific notation
    const stringValue = value.toString();

    // If value length is less than decimals, pad with zeros
    if (stringValue.length <= decimals) {
        return `0.${'0'.repeat(decimals - stringValue.length)}${stringValue}`;
    }

    // Insert decimal point at the right position
    const position = stringValue.length - decimals;
    const result = `${stringValue.slice(0, position)}.${stringValue.slice(position)}`;

    // Remove trailing zeros and decimal point if needed
    return result.replace(/\.?0+$/, '');
};

export const parseUnits = (value, decimals) => {
    if (!value) return '0';

    const [whole = '0', fraction = ''] = value.toString().split('.');
    const paddedFraction = fraction.padEnd(decimals, '0');
    const result = whole + paddedFraction;

    // Remove leading zeros
    return result.replace(/^0+/, '') || '0';
};
