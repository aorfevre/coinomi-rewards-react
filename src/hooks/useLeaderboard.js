import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useLeaderboard = (weekRange, pageSize = 50) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [entries, setEntries] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [totalParticipants, setTotalParticipants] = useState(0);

    const fetchLeaderboard = useCallback(
        async (startAfterDoc = null) => {
            if (!weekRange) return;

            try {
                setLoading(true);
                setError(null);

                const [startDate, endDate] = weekRange.split('|').map(date => new Date(date));
                const leaderboardRef = collection(db, 'leaderboard');

                let baseQuery = query(
                    leaderboardRef,
                    where('timestamp', '>=', startDate),
                    where('timestamp', '<=', endDate),
                    orderBy('timestamp', 'desc'),
                    orderBy('points', 'desc'),
                    limit(pageSize)
                );

                if (startAfterDoc) {
                    baseQuery = query(baseQuery, startAfter(startAfterDoc));
                }

                const snapshot = await getDocs(baseQuery);
                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                if (startAfterDoc) {
                    setEntries(prev => [...prev, ...docs]);
                } else {
                    setEntries(docs);
                }

                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === pageSize);

                if (!startAfterDoc) {
                    const countQuery = query(
                        leaderboardRef,
                        where('timestamp', '>=', startDate),
                        where('timestamp', '<=', endDate)
                    );
                    const countSnapshot = await getDocs(countQuery);
                    setTotalParticipants(countSnapshot.size);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [weekRange, pageSize]
    );

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return;
        return fetchLeaderboard(lastDoc);
    }, [hasMore, loading, lastDoc, fetchLeaderboard]);

    return {
        entries,
        loading,
        error,
        hasMore,
        loadMore,
        totalParticipants,
        refetchLeaderboard: fetchLeaderboard,
        lastDocId: lastDoc?.id,
    };
};
