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
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 10);
            const fiveDaysAgoISOString = fiveDaysAgo.toISOString();

            if (!userId) {
                // No userId: just show the latest tweet from last 5 days
                const tweetsQuery = query(
                    collection(db, 'koala_tweets'),
                    where('created_at', '>=', fiveDaysAgoISOString),
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

            // Get all tweetIds the user has skipped in the last 5 days
            const skipsQuery = query(
                collection(db, 'tweet_skips'),
                where('userId', '==', userId),
                where('createdAt', '>=', fiveDaysAgoISOString)
            );

            const skipsSnap = await getDocs(skipsQuery);
            const skippedTweetIds = new Set();
            skipsSnap.forEach(doc => {
                const data = doc.data();
                if (data.tweetId) skippedTweetIds.add(data.tweetId);
            });

            // Listen for tweets from the last 5 days, skipping the ones that were skipped
            const tweetsQuery = query(
                collection(db, 'koala_tweets'),
                where('created_at', '>=', fiveDaysAgoISOString),
                orderBy('created_at', 'desc'),
                limit(20)
            );
            unsub = onSnapshot(tweetsQuery, snap => {
                if (cancelled) return;
                const tweets = [];
                snap.forEach(doc => {
                    if (!skippedTweetIds.has(doc.id)) {
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
