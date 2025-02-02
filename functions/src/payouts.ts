import { db } from './config/firebase';

interface PayoutData {
    weekNumber: number;
    yearNumber: number;
    timestamp: number;
    transactionHash: string;
    chainId: string;
    tokenAddress: string;
    tokenSymbol: string;
    tokenAmount: string;
}

export const createPayout = async (data: PayoutData) => {
    try {
        const payoutRef = db.collection('payouts');
        await payoutRef.add({
            ...data,
            createdAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating payout:', error);
        throw new Error('Failed to create payout record');
    }
};
