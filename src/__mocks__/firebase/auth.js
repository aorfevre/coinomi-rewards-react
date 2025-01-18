export const getAuth = jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(callback => {
        callback(null);
        return () => {};
    }),
    signInWithCustomToken: jest.fn(),
    signOut: jest.fn(),
}));

export const connectAuthEmulator = jest.fn();
