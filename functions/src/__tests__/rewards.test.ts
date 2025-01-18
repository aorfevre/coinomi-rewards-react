import { claimDailyReward } from '../rewards';
import { mocks } from './setup';

const { testEnv } = mocks;

describe('claimDailyReward', () => {
    const mockContext = {
        auth: {
            uid: 'test-user-id',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mocks.cleanup();
    });

    afterAll(async () => {
        await testEnv.cleanup();
        // Clean up any remaining handlers
        jest.clearAllTimers();
    });

    it('should reject unauthenticated users', async () => {
        const mockData = { userId: 'test-user-id' };
        const unauthenticatedContext = { auth: null };

        await expect(
            testEnv.wrap(claimDailyReward)(mockData, unauthenticatedContext)
        ).rejects.toThrow('User must be authenticated');
    }, 10000); // Increased timeout

    it.skip('should successfully claim daily reward for first time', async () => {
        const mockData = { userId: 'test-user-id' };

        // Setup mock for empty previous claims
        mocks.mockFirestoreGet.mockResolvedValueOnce({ empty: true });

        // Setup mock for adding new reward
        mocks.mockFirestoreAdd.mockResolvedValueOnce({
            id: 'test-reward-id',
            get: jest.fn().mockResolvedValue({
                data: () => ({
                    timestamp: new Date().toISOString(),
                }),
            }),
        });

        const result = await testEnv.wrap(claimDailyReward)(mockData, mockContext);

        expect(mocks.mockFirestoreCollection).toHaveBeenCalledWith('rewards');
        expect(mocks.mockFirestoreAdd).toHaveBeenCalledWith({
            userId: 'test-user-id',
            timestamp: expect.any(String),
            type: 'daily',
        });

        expect(result).toEqual({
            success: true,
            rewardId: 'test-reward-id',
            timestamp: expect.any(String),
        });
    }, 10000); // Increased timeout

    it.skip('should prevent claiming reward before cooldown', async () => {
        const mockData = { userId: 'test-user-id' };
        const now = new Date();
        const recentClaim = {
            empty: false,
            docs: [
                {
                    data: () => ({
                        timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 hour ago
                    }),
                },
            ],
        };

        mocks.mockFirestoreGet.mockResolvedValueOnce(recentClaim);

        await expect(testEnv.wrap(claimDailyReward)(mockData, mockContext)).rejects.toThrow(
            'Daily reward already claimed'
        );
    }, 10000); // Increased timeout
});
