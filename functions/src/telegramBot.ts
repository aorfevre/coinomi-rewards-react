import * as functions from 'firebase-functions';
import { Telegraf, Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { db } from './config/firebase';

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

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Set up bot command handlers
bot.command('start', async (ctx: StartCommandContext) => {
    const startTime = Date.now();
    functions.logger.info('Processing Telegram link request');

    try {
        await ctx.reply('⏳ Processing your registration...');

        const message = ctx.message.text;
        const userId = message.split(' ')[1];
        const telegramId = ctx.from.id;
        const username = ctx.from.username;

        if (!userId || !telegramId) {
            await ctx.reply(
                '❌ Invalid authentication request. Please try again through the website.'
            );
            return;
        }

        // Add a lock check to prevent duplicate processing
        const lockRef = db.collection('telegramLocks').doc(telegramId.toString());
        const lock = await db.runTransaction(async transaction => {
            const lockDoc: any = await transaction.get(lockRef);
            if (lockDoc.exists && Date.now() - lockDoc.data().timestamp < 30000) {
                return false;
            }
            transaction.set(lockRef, { timestamp: Date.now() });
            return true;
        });

        if (!lock) {
            functions.logger.warn('Duplicate request detected');
            return;
        }

        // Check if this Telegram ID is already linked
        const existingUsersQuery = await db
            .collection('users')
            .where('telegramId', '==', telegramId)
            .get();

        if (!existingUsersQuery.empty) {
            const existingUser = existingUsersQuery.docs[0];
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
            telegramId,
            telegramUsername: username,
            telegramFirstName: ctx.from.first_name,
            telegramConnected: true,
            telegramConnectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await ctx.reply(
            '✅ Successfully connected your Telegram account!\n\n' +
                '🎉 You will now receive a 10% bonus on all rewards.\n' +
                '🔄 You can return to the website and continue earning points.'
        );

        functions.logger.info(`Telegram link completed in ${Date.now() - startTime}ms`);

        // Clean up lock after processing
        await lockRef.delete();
    } catch (error) {
        functions.logger.error('Error processing Telegram link:', error);
        await ctx.reply('❌ An error occurred. Please try again later.');
    }
});

// Development mode: Use polling
if (process.env.NODE_ENV !== 'production') {
    functions.logger.info('Starting Telegram bot in development mode (polling)');
    bot.launch()
        .then(() => {
            functions.logger.info('Telegram bot is running in polling mode');
        })
        .catch(error => {
            functions.logger.error('Failed to start Telegram bot in polling mode:', error);
        });
}

// Production mode: Use webhook
export const telegramWebhook = functions
    .runWith({
        timeoutSeconds: 30,
        memory: '256MB',
    })
    .https.onRequest(async (request, response) => {
        const startTime = Date.now();
        try {
            if (process.env.NODE_ENV === 'production') {
                await bot.handleUpdate(request.body);
            }
            functions.logger.info(`Webhook processed in ${Date.now() - startTime}ms`);
            response.sendStatus(200);
        } catch (error) {
            functions.logger.error('Webhook error:', error);
            response.sendStatus(500);
        }
    });

// Cleanup webhook on function termination
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
