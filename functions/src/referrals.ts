import * as functions from 'firebase-functions';
import { db } from './config/firebase';
import { getWeek, getYear } from 'date-fns';

// Add the consistent week options
const WEEK_OPTIONS = {
    weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    firstWeekContainsDate: 4 as 1 | 4,
};

// Generate a random 7-character code
const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get or create user's referral code
export const getUserReferralCode = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        let referralCode = userDoc.data()?.referralCode;

        // If user doesn't have a referral code, generate one
        if (!referralCode) {
            // Generate and verify uniqueness
            let isUnique = false;
            while (!isUnique) {
                referralCode = generateReferralCode();
                const existingUsers = await db
                    .collection('users')
                    .where('referralCode', '==', referralCode)
                    .get();

                if (existingUsers.empty) {
                    isUnique = true;
                }
            }

            // Save the new referral code
            await userRef.update({
                referralCode,
                updatedAt: new Date().toISOString(),
            });
        }

        return { referralCode };
    } catch (error) {
        functions.logger.error('Error in getUserReferralCode:', error);
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Error processing request'
        );
    }
});

// Get count of user's referrals
export const getCountReferrals = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }

    try {
        const referralsSnapshot = await db
            .collection('users')
            .where('referredBy', '==', userId)
            .count()
            .get();

        return { count: referralsSnapshot.data().count };
    } catch (error) {
        functions.logger.error('Error in getCountReferrals:', error);
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Error processing request'
        );
    }
});

// Process new user registration with referral code
export const processReferral = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { referralCode, newUserId } = data;
    if (!referralCode || !newUserId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'referralCode and newUserId are required'
        );
    }

    try {
        // Find referrer by referral code
        const referrerQuery = await db
            .collection('users')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();

        if (referrerQuery.empty) {
            throw new functions.https.HttpsError('not-found', 'Invalid referral code');
        }

        const referrerId = referrerQuery.docs[0].id;

        // prevent self-referrals
        if (referrerId === newUserId) {
            throw new functions.https.HttpsError(
                'already-exists',
                'Self-referrals are not allowed'
            );
        }

        // Update new user with referral info
        await db.collection('users').doc(newUserId).update({
            referredBy: referrerId,
            referralTimestamp: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        functions.logger.error('Error in processReferral:', error);
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Error processing referral'
        );
    }
});

// Add this function to the existing file
export const updateReferralCode = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, newCode } = data;
    if (!userId || !newCode) {
        throw new functions.https.HttpsError('invalid-argument', 'userId and newCode are required');
    }

    // Validate code format
    const codeRegex = /^[a-zA-Z0-9]{5,}$/;
    if (!codeRegex.test(newCode)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Code must be at least 5 characters long and contain only letters and numbers'
        );
    }

    try {
        // Check if code is already taken
        const existingUsers = await db
            .collection('users')
            .where('referralCode', '==', newCode)
            .get();

        if (!existingUsers.empty) {
            throw new functions.https.HttpsError(
                'already-exists',
                'This referral code is already taken'
            );
        }

        // Update user's referral code
        await db.collection('users').doc(userId).update({
            referralCode: newCode,
            updatedAt: new Date().toISOString(),
        });

        return { success: true, referralCode: newCode };
    } catch (error) {
        functions.logger.error('Error in updateReferralCode:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            'internal',
            error instanceof Error ? error.message : 'Error updating referral code'
        );
    }
});

interface UserData {
    referredBy?: string;
    walletAddress?: string;
}

export const onReferralUpdate = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
        const newData = change.after.data() as UserData | undefined;
        const previousData = change.before.data() as UserData | undefined;
        const userId = context.params.userId;

        console.log('On referral update', newData);
        // Check if this is a new referral
        if (
            newData?.referredBy && // Has referrer
            (!previousData || !previousData.referredBy) && // Didn't have referrer before
            newData.referredBy !== userId // Prevent self-referrals
        ) {
            try {
                // get wallet address of the referrer
                const referrerDoc = await db.collection('users').doc(newData.referredBy).get();
                const referrerData = referrerDoc.data() as UserData;
                const walletAddress = referrerData.walletAddress;
                // Create reward document for the referrer
                await db.collection('rewards').add({
                    userId: newData.referredBy,
                    basePoints: 100,
                    points: 100, // basePoints * multiplier
                    multiplier: 1,
                    type: 'new-referral',
                    referredUser: userId,
                    timestamp: new Date().toISOString(),
                    processed: false,
                    weekNumber: getWeek(new Date(), WEEK_OPTIONS),
                    yearNumber: getYear(new Date()),
                    walletAddress: walletAddress,
                });

                functions.logger.info('Referral reward created', {
                    referrer: newData.referredBy,
                    referred: userId,
                });
            } catch (error) {
                functions.logger.error('Error creating referral reward', {
                    error,
                    referrer: newData.referredBy,
                    referred: userId,
                });
                throw error;
            }
        }
    });
