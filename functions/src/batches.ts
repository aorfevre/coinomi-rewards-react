import * as functions from 'firebase-functions';
import { db } from './config/firebase';

interface BatchRequest {
    weekNumber: string;
    yearNumber: string;
    token: {
        address: string;
        symbol: string;
        decimals: string;
    };
    totalTokens: string;
    batchSize: string;
}

export const createBatches = functions.https.onCall(async (data: BatchRequest) => {
    try {
        // Get leaderboard data
        const scoresRef = db.collection('scores');
        const scoresSnapshot = await scoresRef
            .where('weekNumber', '==', parseInt(data.weekNumber))
            .where('yearNumber', '==', parseInt(data.yearNumber))
            .get();

        const leaderboard = scoresSnapshot.docs.map(doc => ({
            wallet: doc.data().walletAddress,
            points: doc.data().points,
        }));

        if (leaderboard.length === 0) {
            throw new functions.https.HttpsError('failed-precondition', 'No participants found');
        }

        const batch = db.batch();
        const batchesRef = db.collection('batches');
        const timestamp = new Date().toISOString();

        const batchSize = parseInt(data.batchSize);
        const totalParticipants = leaderboard.length;
        const numberOfBatches = Math.ceil(totalParticipants / batchSize);

        // Calculate total points for token distribution
        const totalPoints = leaderboard.reduce((sum, entry) => sum + entry.points, 0);

        let participantIndex = 0;
        for (let i = 0; i < numberOfBatches; i++) {
            const currentBatchSize = Math.min(batchSize, totalParticipants - participantIndex);

            const batchParticipants = leaderboard.slice(
                participantIndex,
                participantIndex + currentBatchSize
            );

            // Calculate token amounts for each participant
            const participantAmounts = batchParticipants.map(p => {
                const amount = ((p.points * Number(data.totalTokens)) / totalPoints).toString();
                return {
                    amount,
                    amountDecimals: (
                        parseFloat(amount) * Math.pow(10, parseInt(data.token.decimals))
                    ).toString(),
                };
            });

            const batchDoc = batchesRef.doc();
            batch.set(batchDoc, {
                timestamp,
                walletCreation: timestamp,
                number: i + 1,
                size: currentBatchSize,
                participants: batchParticipants.map(p => p.wallet),
                amounts: participantAmounts.map(p => p.amount),
                amountsDecimals: participantAmounts.map(p => p.amountDecimals),
                token: {
                    ...data.token,
                    decimals: parseInt(data.token.decimals),
                },
                totalTokens: data.totalTokens,
                hash: null,
                status: 'todo',
                weekNumber: parseInt(data.weekNumber),
                yearNumber: parseInt(data.yearNumber),
            });

            participantIndex += currentBatchSize;
        }

        await batch.commit();

        return {
            success: true,
            batchCount: numberOfBatches,
            totalParticipants,
        };
    } catch (error) {
        console.error('Error creating batches:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create batches');
    }
});
