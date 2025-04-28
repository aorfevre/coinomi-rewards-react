import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Avatar,
    CircularProgress,
    Snackbar,
    IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import PropTypes from 'prop-types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNextTweet } from '../hooks/useLatestTweet';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const TweetCard = ({ userId, onLike, onRetweet, onSkip, twitterConnected }) => {
    const { tweet, loading } = useNextTweet(userId);
    const [actionLoading, setActionLoading] = useState(''); // '' | 'like' | 'retweet' | 'skip'
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [liked, setLiked] = useState(false);
    const [retweeted, setRetweeted] = useState(false);

    useEffect(() => {
        if (!tweet) {
            return;
        }
        if (!userId) {
            setLiked(false);
            setRetweeted(false);
            return;
        }
        const checkActions = async () => {
            const q = query(
                collection(db, 'rewards'),
                where('userId', '==', userId),
                where('tweetId', '==', tweet.id),
                where('type', 'in', ['twitter_like', 'twitter_retweet'])
            );
            const snap = await getDocs(q);
            let liked = false,
                retweeted = false;
            snap.forEach(doc => {
                const data = doc.data();
                if (data.type === 'twitter_like') liked = true;
                if (data.type === 'twitter_retweet') retweeted = true;
            });
            setLiked(liked);
            setRetweeted(retweeted);
        };
        checkActions();
    }, [tweet, userId]);

    useEffect(() => {
        if (tweet && liked && retweeted && onSkip) {
            const timer = setTimeout(() => {
                onSkip();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tweet, liked, retweeted, onSkip]);

    const handleLike = async () => {
        if (!tweet?.id) return;
        setActionLoading('like');
        setError('');
        try {
            const functions = getFunctions();
            const likeTweet = httpsCallable(functions, 'likeTweet');
            await likeTweet({ tweetId: tweet.id });
            setLiked(true);
            if (onLike) onLike(tweet);
            setSnackbar({ open: true, message: 'Tweet liked successfully!' });
        } catch (err) {
            setError('Failed to like tweet');
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const handleRetweet = async () => {
        if (!tweet?.id) return;
        setActionLoading('retweet');
        setError('');
        try {
            const functions = getFunctions();
            const retweetTweet = httpsCallable(functions, 'retweetTweet');
            await retweetTweet({ tweetId: tweet.id });
            setRetweeted(true);
            if (onRetweet) onRetweet(tweet);
            setSnackbar({ open: true, message: 'Tweet retweeted successfully!' });
        } catch (err) {
            setError('Failed to retweet');
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const handleSkip = async () => {
        if (!tweet?.id) return;
        setActionLoading('skip');
        setError('');
        try {
            const functions = getFunctions();
            const skipTweet = httpsCallable(functions, 'skipTweet');
            await skipTweet({ tweetId: tweet.id });
            setSnackbar({ open: true, message: 'Tweet skipped successfully!' });
            if (onSkip) onSkip();
        } catch (err) {
            setError('Failed to skip tweet');
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ open: false, message: '' });
    };

    // Sign-in handler (same as in Challenges.js)
    const handleSignIn = async () => {
        try {
            // Get current URL parameters
            const currentUrl = new URL(window.location.href);
            const originalParams = {};
            currentUrl.searchParams.forEach((value, key) => {
                originalParams[key] = value;
            });

            const functions = getFunctions();
            const generateAuthUrl = httpsCallable(functions, 'generateTwitterAuthUrl');
            const result = await generateAuthUrl({ originalParams });

            const { url } = result.data;
            const width = 600;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            window.open(
                url,
                'twitter-auth',
                `width=${width},height=${height},left=${left},top=${top}`
            );
        } catch (error) {
            console.error('Error generating Twitter auth URL:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (!tweet) {
        console.log('TweetCard no tweet', { userId, twitterConnected });
        return <Box sx={{ p: 2 }}>No tweet found.</Box>;
    }

    const { text, user, created_at } = tweet;

    return (
        <>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {user?.profile_image_url && (
                            <Avatar src={user.profile_image_url} alt={user.name} sx={{ mr: 1 }} />
                        )}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {user?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{user?.username || 'unknown'}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {created_at ? new Date(created_at).toLocaleString() : ''}
                    </Typography>
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    {userId && twitterConnected ? (
                        <>
                            <IconButton
                                color={liked ? 'error' : 'default'}
                                onClick={handleLike}
                                disabled={
                                    liked ||
                                    actionLoading === 'like' ||
                                    actionLoading === 'retweet' ||
                                    actionLoading === 'skip'
                                }
                            >
                                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <IconButton
                                color={retweeted ? 'primary' : 'default'}
                                onClick={handleRetweet}
                                disabled={
                                    retweeted ||
                                    actionLoading === 'like' ||
                                    actionLoading === 'retweet' ||
                                    actionLoading === 'skip'
                                }
                            >
                                {retweeted ? <RepeatIcon /> : <RepeatOutlinedIcon />}
                            </IconButton>
                            <Button
                                color="secondary"
                                onClick={handleSkip}
                                disabled={
                                    actionLoading === 'like' ||
                                    actionLoading === 'retweet' ||
                                    actionLoading === 'skip'
                                }
                            >
                                Skip
                            </Button>
                        </>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            {!userId ? (
                                <Button variant="contained" color="primary" onClick={handleSignIn}>
                                    Sign in to interact with tweets.
                                </Button>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Connect to Twitter first to interact.
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardActions>
            </Card>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
};

TweetCard.propTypes = {
    userId: PropTypes.string.isRequired,
    onLike: PropTypes.func,
    onRetweet: PropTypes.func,
    onSkip: PropTypes.func,
    twitterConnected: PropTypes.bool,
};
