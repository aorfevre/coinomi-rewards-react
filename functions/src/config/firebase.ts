import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// Export both admin and db
export { admin, db }; 