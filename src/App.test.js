import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Firebase functions
jest.mock('firebase/functions', () => ({
    httpsCallable: jest.fn(() => Promise.resolve({ data: {} })),
    getFunctions: jest.fn(),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
    signInWithCustomToken: jest.fn(),
    getAuth: jest.fn(() => ({
        currentUser: null,
    })),
}));

// Mock Firebase firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    getFirestore: jest.fn(),
}));

describe('App', () => {
    it('renders without crashing for user not authenticated', () => {
        render(<App />);
        // expect(screen.getByText(/Your Points/i)).toBeInTheDocument();
    });
    // add a query param token with a valid wallet address
    it.skip('renders without crashing for user authenticated', () => {
        window.history.pushState({}, '', '?token=0x1234567890abcdef&userId=123');
        render(<App />);
        expect(screen.getByText(/Your Points/i)).toBeInTheDocument();
    });
});
