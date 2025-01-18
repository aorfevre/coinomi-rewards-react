import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useUserRank(userId) {
    const [rankData, setRankData] = useState({
        rank: null,
        totalPlayers: 0,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!userId) {
            setRankData(prev => ({ ...prev, loading: false }));
            return;
        }

        const fetchUserRank = async () => {
            try {
                const scoresRef = collection(db, 'scores');

                // Get user's points
                const userQuery = query(scoresRef, where('userId', '==', userId));
                const userDoc = await getDocs(userQuery);

                if (userDoc.empty) {
                    setRankData({
                        rank: null,
                        totalPlayers: 0,
                        loading: false,
                        error: new Error('User not found'),
                    });
                    return;
                }

                const userPoints = userDoc.docs[0].data().points;

                // Count players with more points
                const higherScoresQuery = query(
                    scoresRef,
                    where('points', '>', userPoints),
                    orderBy('points', 'desc')
                );
                const higherScores = await getDocs(higherScoresQuery);

                // Get total number of players
                const totalPlayersQuery = query(scoresRef);
                const totalPlayers = (await getDocs(totalPlayersQuery)).size;

                // User's rank is the number of players with higher scores + 1
                const rank = higherScores.size + 1;

                setRankData({
                    rank,
                    totalPlayers,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                console.error('Error fetching user rank:', err);
                setRankData({
                    rank: null,
                    totalPlayers: 0,
                    loading: false,
                    error: err instanceof Error ? err : new Error('Failed to fetch rank'),
                });
            }
        };

        fetchUserRank();
    }, [userId]);

    return rankData;
} 