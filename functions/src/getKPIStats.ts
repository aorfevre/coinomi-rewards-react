import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getKPIStats = functions.https.onCall(async (data, context) => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }

    // Fetch users
    const usersSnap = await admin.firestore().collection('users').get();
    const users = usersSnap.docs.map(doc => doc.data());

    // Fetch rewards
    const rewardsSnap = await admin.firestore().collection('rewards').get();
    const rewards = rewardsSnap.docs.map(doc => doc.data());

    // Fetch Firebase Auth users for creationTime
    let authUsers: admin.auth.UserRecord[] = [];
    try {
        let nextPageToken;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            authUsers = authUsers.concat(listUsersResult.users);
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
    } catch (e) {
        // fallback to Firestore only
    }

    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Registrations in last 7 days
    const recentRegistrations =
        authUsers.length > 0
            ? authUsers.filter(
                  u => u.metadata.creationTime && new Date(u.metadata.creationTime) > last7
              ).length
            : users.filter(u => u.createdAt && u.createdAt.toDate && u.createdAt.toDate() > last7)
                  .length;

    // Telegram connected
    const telegramConnected = users.filter(u => u.telegramConnected === true).length;

    // Email connected (users with email but no telegram/twitter)
    const emailConnected = users.filter(u => u.emailConnected && u.emailConnected === true).length;

    // Twitter connected
    const twitterConnected = users.filter(u => u.twitterConnected === true).length;

    // Total users
    const totalUsers = users.length;

    // Total tasks = total rewards
    const totalTasks = rewards.length;

    // Total rewards (for compatibility)
    const totalRewards = rewards.length;

    // Points distributed
    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);

    // Top user (by points in last 7 days)
    const pointsByUser: Record<string, number> = {};
    rewards.forEach(r => {
        const ts = r.timestamp ? new Date(r.timestamp) : null;
        if (ts && ts > last7 && r.userId) {
            pointsByUser[r.userId] = (pointsByUser[r.userId] || 0) + (r.points || 0);
        }
    });
    const topUserId = Object.keys(pointsByUser).sort(
        (a, b) => pointsByUser[b] - pointsByUser[a]
    )[0];
    let topUser = topUserId;
    if (topUserId) {
        const userDoc = users.find(u => u.uid === topUserId || u.userId === topUserId);
        topUser = userDoc?.twitterHandle || userDoc?.walletAddress || topUserId;
    }

    // --- Engagement based on scores collection ---
    const scoresSnap = await admin.firestore().collection('scores').get();
    const scores = scoresSnap.docs.map(doc => doc.data());

    // For each of the last 7 days, count unique users with a score on that day
    const engagement = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const usersSet = new Set();
        scores.forEach(s => {
            // Use s.timestamp, or fallback to s.lastTaskTimestamp or s.lastUpdated
            const rawTs = s.timestamp || s.lastTaskTimestamp || s.lastUpdated;
            if (!rawTs || !s.userId) return;
            const ts = new Date(rawTs._seconds ? rawTs._seconds * 1000 : rawTs);
            if (!isNaN(ts.getTime()) && ts >= day && ts < nextDay) {
                usersSet.add(s.userId);
            }
        });
        engagement.push({
            day: day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            count: usersSet.size,
        });
    }

    // Optionally, recalculate activeUsers based on scores activity in last 7 days
    const activeUsersByScore = new Set();
    scores.forEach(s => {
        const rawTs = s.timestamp || s.lastTaskTimestamp || s.lastUpdated;
        if (!rawTs || !s.userId) return;
        const ts = new Date(rawTs._seconds ? rawTs._seconds * 1000 : rawTs);
        if (!isNaN(ts.getTime()) && ts >= last7) {
            activeUsersByScore.add(s.userId);
        }
    });

    // Engagement by type (stacked bar data)
    const types = ['twitter_like', 'daily', 'referral-bonus', 'new-referral', 'twitter_retweet'];
    const engagementByType: Array<Record<string, any>> = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const entry: Record<string, any> = {
            day: day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        };
        types.forEach(type => (entry[type] = 0));
        rewards.forEach(r => {
            if (!r.type || !r.timestamp) return;
            const ts = new Date(r.timestamp._seconds ? r.timestamp._seconds * 1000 : r.timestamp);
            if (!isNaN(ts.getTime()) && ts >= day && ts < nextDay && types.includes(r.type)) {
                entry[r.type] += 1;
            }
        });
        engagementByType.push(entry);
    }

    // Total points distributed in the last 7 days
    const totalPoints7d = rewards
        .filter((r: any) => {
            const ts = r.timestamp
                ? new Date(r.timestamp._seconds ? r.timestamp._seconds * 1000 : r.timestamp)
                : null;
            return ts && ts >= last7;
        })
        .reduce((sum, r) => sum + (r.points || 0), 0);

    // Referral counts
    const referrals7d = users.filter((u: any) => {
        const createdAt = u.createdAt && u.createdAt.toDate ? u.createdAt.toDate() : null;
        return createdAt && createdAt >= last7 && u.referredBy !== undefined;
    }).length;
    const referralsLifetime = users.filter((u: any) => u.referredBy !== undefined).length;

    return {
        totalUsers,
        twitterConnected,
        telegramConnected,
        emailConnected,
        recentRegistrations,
        activeUsers: activeUsersByScore.size, // unique users active in last 7 days
        activeUsersByScore: rewards.filter((r: any) => {
            const ts = r.timestamp
                ? new Date(r.timestamp._seconds ? r.timestamp._seconds * 1000 : r.timestamp)
                : null;
            return ts && ts >= last7;
        }).length, // number of tasks (rewards) in last 7 days
        totalTasks,
        totalRewards,
        totalPoints,
        totalPoints7d,
        referrals7d,
        referralsLifetime,
        topUser,
        engagement,
        engagementByType,
    };
});
