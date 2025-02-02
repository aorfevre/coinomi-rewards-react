import { useState, useEffect, useCallback } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';

export const useLeaderboard = ({ pageSize = 100, lastDocId, week, year }) => {
    const [data, setData] = useState({
        leaderboard: [],
        totalParticipants: 0,
        hasMore: false,
        lastDocId: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = useCallback(
        async (options = {}) => {
            setLoading(true);
            try {
                const functions = getFunctions();
                const getLeaderboard = httpsCallable(functions, 'getLeaderboard');

                const result = await getLeaderboard({
                    pageSize: options.pageSize || pageSize,
                    lastDocId: options.lastDocId || lastDocId,
                    week: options.week || week,
                    year: options.year || year,
                });

                // Don't update state if this is a CSV download request
                if (!options.isForDownload) {
                    if (options.lastDocId) {
                        setData(prev => ({
                            ...result.data,
                            leaderboard: [...prev.leaderboard, ...result.data.leaderboard],
                        }));
                    } else {
                        setData(result.data);
                    }
                }

                return result.data;
            } catch (error) {
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [pageSize, lastDocId, week, year]
    );

    useEffect(() => {
        fetchLeaderboard().catch(console.error);
    }, [fetchLeaderboard]);

    return {
        leaderboard: data.leaderboard,
        totalParticipants: data.totalParticipants,
        hasMore: data.hasMore,
        lastDocId: data.lastDocId,
        loading,
        error,
        refetch: fetchLeaderboard,
    };
};
