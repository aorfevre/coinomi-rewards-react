import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Avatar,
    CircularProgress,
} from '@mui/material';
import { useLatestTweet } from '../hooks/useLatestTweet';
import PropTypes from 'prop-types';

export const TweetCard = ({ onLike, onRetweet, onSkip, twitterConnected, onStartTwitterAuth }) => {
    const { tweet, loading } = useLatestTweet();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (!tweet) {
        return <Box sx={{ p: 2 }}>No tweet found.</Box>;
    }

    // Example tweet fields: text, user, created_at, etc.
    // You may need to adjust these based on your Firestore structure
    const { text, user, created_at } = tweet;

    return (
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
            </CardContent>
            <CardActions>
                {twitterConnected ? (
                    <>
                        <Button color="primary" onClick={() => onLike && onLike(tweet)}>
                            Like
                        </Button>
                        <Button color="primary" onClick={() => onRetweet && onRetweet(tweet)}>
                            Retweet
                        </Button>
                        <Button color="secondary" onClick={() => onSkip && onSkip(tweet)}>
                            Skip
                        </Button>
                    </>
                ) : (
                    <Button color="primary" onClick={onStartTwitterAuth} fullWidth>
                        Connect to Twitter first
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

TweetCard.propTypes = {
    onLike: PropTypes.func,
    onRetweet: PropTypes.func,
    onSkip: PropTypes.func,
    twitterConnected: PropTypes.bool,
    onStartTwitterAuth: PropTypes.func,
};
