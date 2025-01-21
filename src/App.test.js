import { render, screen } from '@testing-library/react';
import App from './App';

// Mock firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/functions');

describe('App', () => {
    it('renders without crashing for user not authenticated', () => {
        render(<App />);
        // expect(screen.getByText(/Your Points/i)).toBeInTheDocument();
    });
    // add a query param token with a valid wallet address
    it.skip('renders without crashing for user authenticated', () => {
        window.history.pushState({}, '', '?token=0x1234567890abcdef');
        render(<App />);
        expect(screen.getByText(/Your Points/i)).toBeInTheDocument();
    });
});
