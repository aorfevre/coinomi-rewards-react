import functionsTest from 'firebase-functions-test';

// Initialize test environment with mock project config
const testEnv = functionsTest({
    projectId: 'demo-project',
});

// Create mock functions
const mockFirestoreGet = jest.fn();
const mockFirestoreAdd = jest.fn();
const mockFirestoreWhere = jest.fn();
const mockFirestoreOrderBy = jest.fn();
const mockFirestoreLimit = jest.fn();
const mockFirestoreCollection = jest.fn();

// Setup the mock chain
const setupMockChain = () => {
    mockFirestoreCollection.mockReturnValue({
        where: mockFirestoreWhere.mockReturnValue({
            orderBy: mockFirestoreOrderBy.mockReturnValue({
                limit: mockFirestoreLimit.mockReturnValue({
                    get: mockFirestoreGet,
                }),
            }),
        }),
        add: mockFirestoreAdd,
    });
};

setupMockChain();

// Mock the firebase config
jest.mock('../config/firebase', () => ({
    admin: {
        firestore: jest.fn(() => ({
            collection: mockFirestoreCollection,
        })),
    },
}));

// Disable firebase functions logger in tests
jest.mock('firebase-functions', () => ({
    ...jest.requireActual('firebase-functions'),
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

export const mocks = {
    testEnv,
    mockFirestoreGet,
    mockFirestoreAdd,
    mockFirestoreWhere,
    mockFirestoreOrderBy,
    mockFirestoreLimit,
    mockFirestoreCollection,
    cleanup: () => {
        mockFirestoreGet.mockReset();
        mockFirestoreAdd.mockReset();
        mockFirestoreWhere.mockReset();
        mockFirestoreOrderBy.mockReset();
        mockFirestoreLimit.mockReset();
        mockFirestoreCollection.mockReset();
        setupMockChain();
    },
};
