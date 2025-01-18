// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Keep native behaviour for other methods, use those to print out things in your own tests
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Clear all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    console.error('Unhandled Promise Rejection:', error);
});
