export const getFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
        doc: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        limit: jest.fn(),
    })),
}));

export const connectFirestoreEmulator = jest.fn();
