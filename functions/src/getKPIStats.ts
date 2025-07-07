import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getKPIStats = functions.https.onCall(async (data, context) => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }

    // Fetch users
    const usersSnap = await admin.firestore().collection('users').get();
    const users = usersSnap.docs.map(doc => doc.data());

    const totalUsers = users.length;
    const twitterConnected = users.filter(u => u.twitterConnected).length;
    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent registrations: users created in last 7 days (if creation date available)
    const recentRegistrations = users.filter(u => {
        if (!u.lastSignIn) return false;
        const date = new Date(u.lastSignIn);
        return !isNaN(date.getTime()) && date >= last7;
    }).length;

    // Active users: users with updatedAt in last 7 days
    const activeUsers = users.filter(u => {
        if (!u.updatedAt) return false;
        const date = new Date(u.updatedAt);
        return !isNaN(date.getTime()) && date >= last7;
    }).length;

    // Tasks: count bool fields per user
    const taskFields = ['followTwitter', 'visitPartnerWebsite'];
    let totalTasks = 0;
    users.forEach(u => {
        taskFields.forEach(f => {
            if (u[f]) totalTasks += 1;
        });
    });
    const avgTasks = totalUsers ? totalTasks / totalUsers : 0;

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

    // --- Rewards KPIs and engagement by type ---
    const rewardsSnap = await admin.firestore().collection('rewards').get();
    const rewards = rewardsSnap.docs.map(doc => doc.data());
    const totalRewards = rewards.length;
    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);

    // Top user by points in last 7 days
    const pointsByUser: Record<string, number> = {};
    rewards.forEach(r => {
        if (!r.userId || !r.timestamp) return;
        const ts = new Date(r.timestamp._seconds ? r.timestamp._seconds * 1000 : r.timestamp);
        if (!isNaN(ts.getTime()) && ts >= last7) {
            pointsByUser[r.userId] = (pointsByUser[r.userId] || 0) + (r.points || 0);
        }
    });
    let topUser: string | null = null;
    let topPoints = 0;
    Object.entries(pointsByUser).forEach(([userId, pts]) => {
        const ptsNum = typeof pts === 'number' ? pts : Number(pts);
        if (ptsNum > topPoints) {
            topUser = userId;
            topPoints = ptsNum;
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

    return {
        totalUsers,
        twitterConnected,
        recentRegistrations,
        activeUsers, // user doc based
        activeUsersByScore: activeUsersByScore.size, // score-based
        totalTasks,
        avgTasks,
        engagement,
        totalRewards,
        totalPoints,
        topUser,
        engagementByType,
    };
});
