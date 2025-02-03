import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../config/firebase';

const parseNumber = value => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
};

export const useLeaderboard = ({ weekNumber, yearNumber }, pageSize = 50) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [entries, setEntries] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [totalParticipants, setTotalParticipants] = useState(0);

    const fetchLeaderboard = useCallback(
        async (startAfterDoc = null) => {
            const parsedWeek = parseNumber(weekNumber);
            const parsedYear = parseNumber(yearNumber);

            console.log('Fetching leaderboard with parsed params:', {
                weekNumber: parsedWeek,
                yearNumber: parsedYear,
                originalWeek: weekNumber,
                originalYear: yearNumber,
                pageSize,
                startAfterDoc,
            });

            if (!parsedWeek || !parsedYear) {
                console.log('Missing required params:', { parsedWeek, parsedYear });
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const leaderboardRef = collection(db, 'scores');

                // First, let's check what fields our documents have
                console.log('Checking collection data...');
                const allDocsQuery = query(
                    leaderboardRef,
                    // Remove all filters to see what's actually in the collection
                    limit(5)
                );
                const allDocsSnapshot = await getDocs(allDocsQuery);

                if (allDocsSnapshot.empty) {
                    console.log('Collection is empty');
                } else {
                    console.log(
                        'Sample documents:',
                        allDocsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            data: doc.data(),
                            week: doc.data().weekNumber, // Log specific fields
                            year: doc.data().yearNumber,
                            timestamp: doc.data().timestamp,
                            points: doc.data().points,
                        }))
                    );
                }

                // Now try the filtered query
                let baseQuery = query(
                    leaderboardRef,
                    where('weekNumber', '==', parsedWeek),
                    where('yearNumber', '==', parsedYear),
                    orderBy('points', 'desc'),
                    limit(pageSize)
                );

                if (startAfterDoc) {
                    console.log('Paginating with startAfterDoc:', startAfterDoc.id);
                    baseQuery = query(baseQuery, startAfter(startAfterDoc));
                }

                console.log('Executing query...');
                const snapshot = await getDocs(baseQuery);
                console.log('Query results:', {
                    totalDocs: snapshot.docs.length,
                    empty: snapshot.empty,
                    firstDoc: snapshot.docs[0]?.data(),
                });

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
                        where('weekNumber', '==', weekNumber),
                        where('yearNumber', '==', yearNumber)
                    );
                    const countSnapshot = await getDocs(countQuery);
                    console.log('Total participants count:', countSnapshot.size);
                    setTotalParticipants(countSnapshot.size);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                console.error('Error details:', {
                    message: err.message,
                    code: err.code,
                    stack: err.stack,
                });
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [weekNumber, yearNumber, pageSize]
    );

    useEffect(() => {
        console.log('useEffect triggered with:', { weekNumber, yearNumber });
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const loadMore = useCallback(() => {
        if (!hasMore || loading) {
            console.log('Cannot load more:', { hasMore, loading });
            return;
        }
        console.log('Loading more entries...');
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
