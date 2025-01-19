import * as functions from 'firebase-functions';
import { Telegraf, Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { db } from './config/firebase';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

interface StartCommandContext extends Context {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    from: {
        id: number;
        is_bot: boolean;
        first_name: string;
        username?: string;
        language_code?: string;
    };
}

// Handle /start command with userId parameter
bot.command('start', async (ctx: StartCommandContext) => {
    try {
        // Send immediate feedback
        await ctx.reply('⏳ Processing your registration...');

        const message = ctx.message.text;
        const userId = message.split(' ')[1]; // Get userId from /start command

        functions.logger.info('Received /start command with full message:', {
            fullMessage: message,
            userId,
            from: ctx.from,
        });

        // Check if we have both userId and from data
        if (!userId || !ctx.from?.id) {
            await ctx.reply(
                '❌ Invalid authentication request. Please try again through the website.'
            );
            return;
        }

        const telegramId = ctx.from.id;
        const username = ctx.from.username;

        functions.logger.info('Processing Telegram link request', {
            userId,
            telegramId,
            username,
        });

        // Check if this Telegram ID is already linked
        const existingUsersQuery = await db
            .collection('users')
            .where('telegramId', '==', telegramId)
            .get();

        if (!existingUsersQuery.empty) {
            const existingUser = existingUsersQuery.docs[0];
            functions.logger.info('Existing user:', existingUser);

            if (existingUser.id !== userId) {
                await ctx.reply('❌ This Telegram account is already linked to another user.');
                return;
            } else {
                await ctx.reply('❌ This Telegram account is already linked to this user.');
                return;
            }
        }

        // Update user document with Telegram data
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // Update with Telegram data
        await userRef.update({
            telegramId: telegramId,
            telegramUsername: username,
            telegramFirstName: ctx.from.first_name,
            telegramConnected: true,
            telegramConnectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        functions.logger.info('Successfully linked Telegram account', {
            userId,
            telegramId,
            username,
        });

        await ctx.reply(
            '✅ Successfully connected your Telegram account!\n\n' +
                '🎉 You will now receive a 10% bonus on all rewards.\n' +
                '🔄 You can return to the website and continue earning points.'
        );
    } catch (error) {
        functions.logger.error('Error in telegram bot start command:', error);
        await ctx.reply('❌ An error occurred. Please try again later.');
    }
});

// Start bot with long polling in development
if (process.env.NODE_ENV === 'development') {
    bot.launch()
        .then(() => {
            console.log('🤖 Telegram bot started in polling mode');
        })
        .catch(err => {
            console.error('Failed to start Telegram bot:', err);
        });
}

// Create webhook handler for production
export const telegramWebhook = functions.https.onRequest(async (request, response) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            // Set webhook only in production
            const webhookInfo = await bot.telegram.getWebhookInfo();
            if (!webhookInfo.url) {
                const webhookUrl = `${process.env.FUNCTION_URL}/telegramWebhook`;
                await bot.telegram.setWebhook(webhookUrl);
                functions.logger.info('Webhook set to:', webhookUrl);
            }
            await bot.handleUpdate(request.body);
        }
        response.sendStatus(200);
    } catch (error) {
        functions.logger.error('Error in telegram webhook:', error);
        response.sendStatus(500);
    }
});

// Cleanup on process exit
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
