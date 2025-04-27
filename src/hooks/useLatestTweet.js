import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const useLatestTweet = () => {
    const [tweet, setTweet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'koala_tweets'), orderBy('created_at', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, snapshot => {
            if (!snapshot.empty) {
                setTweet({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setTweet(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { tweet, loading };
};
