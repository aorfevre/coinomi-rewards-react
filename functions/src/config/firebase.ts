import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
const app = admin.initializeApp();

// Get Firestore instance
const db = admin.firestore(app);
const auth = admin.auth(app);

// Export both admin and db
export { admin, app, auth, db };

