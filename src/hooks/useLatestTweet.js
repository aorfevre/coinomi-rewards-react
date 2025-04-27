import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, limit } from 'firebase/firestore';

// Returns the next tweet the user has not yet liked or retweeted
export const useNextTweet = userId => {
    const [tweet, setTweet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('useNextTweet', userId);
        let unsub = null;
        let cancelled = false;

        const fetchNextTweet = async () => {
            if (!userId) {
                // No userId: just show the latest tweet
                const tweetsQuery = query(
                    collection(db, 'koala_tweets'),
                    orderBy('created_at', 'desc'),
                    limit(1)
                );
                unsub = onSnapshot(tweetsQuery, snap => {
                    if (cancelled) return;
                    if (!snap.empty) {
                        setTweet({ id: snap.docs[0].id, ...snap.docs[0].data() });
                    } else {
                        setTweet(null);
                    }
                    setLoading(false);
                });
                return;
            }
            // Get all tweetIds the user has already liked or retweeted
            const rewardsQuery = query(
                collection(db, 'rewards'),
                where('userId', '==', userId),
                where('type', 'in', ['twitter_like', 'twitter_retweet'])
            );
            const rewardsSnap = await getDocs(rewardsQuery);
            const completedTweetIds = new Set();
            rewardsSnap.forEach(doc => {
                const data = doc.data();
                if (data.tweetId) completedTweetIds.add(data.tweetId);
            });

            // Listen for tweets, skipping completed ones
            const tweetsQuery = query(
                collection(db, 'koala_tweets'),
                orderBy('created_at', 'desc'),
                limit(20)
            );
            unsub = onSnapshot(tweetsQuery, snap => {
                if (cancelled) return;
                const tweets = [];
                snap.forEach(doc => {
                    if (!completedTweetIds.has(doc.id)) {
                        tweets.push({ id: doc.id, ...doc.data() });
                    }
                });
                setTweet(tweets.length > 0 ? tweets[0] : null);
                setLoading(false);
            });
        };
        fetchNextTweet();
        return () => {
            cancelled = true;
            if (unsub) unsub();
        };
    }, [userId]);

    return { tweet, loading };
};
