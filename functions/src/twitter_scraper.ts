import * as functions from 'firebase-functions';
import { TwitterApi, type TweetV2, type UserV2, type ApiV2Includes } from 'twitter-api-v2';

// Twitter API v2 Client with bearer token
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

interface UserTweetsResponse {
    user: UserV2;
    tweets: TweetV2[];
    includes?: ApiV2Includes;
}

export const scrapKoalaTweets = async () => {
    const username = 'koalawallet';
    const maxResults = 5;

    try {
        // First get the user ID from username
        const user = await twitterClient.v2.userByUsername(username);

        if (!user.data) {
            throw new functions.https.HttpsError('not-found', `User ${username} not found`);
        }

        // Get user's tweets
        const tweets = await twitterClient.v2.userTimeline(user.data.id, {
            max_results: maxResults,
            expansions: ['attachments.media_keys', 'author_id'],
            'tweet.fields': ['created_at', 'public_metrics', 'entities', 'text'],
            'media.fields': ['url', 'preview_image_url', 'type'],
        });

        const response: UserTweetsResponse = {
            user: user.data,
            tweets: tweets.data.data,
            includes: tweets.data.includes,
        };
        return response;
    } catch (error) {
        console.error('Error scraping tweets:', error);
        throw new functions.https.HttpsError('internal', `Failed to scrape tweets for ${username}`);
    }
};
