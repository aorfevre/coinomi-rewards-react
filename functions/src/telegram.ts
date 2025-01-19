import * as functions from 'firebase-functions';
import { db } from './config/firebase';
import { createHmac } from 'crypto';

interface TelegramAuthData {
    id: number;
    first_name: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

const validateTelegramAuth = (data: Omit<TelegramAuthData, 'hash'>, hash: string): boolean => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        throw new Error('Telegram bot token not configured');
    }

    // Check if auth_date is not older than 1 day
    const authTimestamp = data.auth_date * 1000; // Convert to milliseconds
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - authTimestamp > oneDay) {
        throw new Error('Authentication data is expired');
    }

    // Create data check string
    const dataCheckArr = Object.entries(data)
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`);

    const dataCheckString = dataCheckArr.join('\n');

    // Generate secret key from bot token
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
};

export const linkTelegramAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, telegramData } = data;

    if (!telegramData || !telegramData.hash) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Telegram data');
    }

    const { hash, ...telegramDataWithoutHash } = telegramData;

    try {
        // Validate the authentication data from Telegram
        if (!validateTelegramAuth(telegramDataWithoutHash, hash)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid Telegram authentication data'
            );
        }

        // Check if this Telegram ID is already linked to another account
        const existingUserQuery = await db
            .collection('users')
            .where('telegramId', '==', telegramData.id)
            .where('uid', '!=', userId)
            .get();

        if (!existingUserQuery.empty) {
            throw new functions.https.HttpsError(
                'already-exists',
                'This Telegram account is already linked to another user'
            );
        }

        // Update user document with Telegram data
        await db.collection('users').doc(userId).update({
            telegramId: telegramData.id,
            telegramUsername: telegramData.username,
            telegramFirstName: telegramData.first_name,
            telegramPhotoUrl: telegramData.photo_url,
            telegramConnected: true,
            telegramConnectedAt: new Date().toISOString(),
            telegramAuthDate: telegramData.auth_date,
            updatedAt: new Date().toISOString(),
        });

        return {
            success: true,
            message: 'Telegram account linked successfully',
            telegramUsername: telegramData.username,
        };
    } catch (error) {
        functions.logger.error('Error linking Telegram account:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to link Telegram account');
    }
});
