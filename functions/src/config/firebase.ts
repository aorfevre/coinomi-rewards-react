import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Firebase Admin SDK
let app: admin.app.App;

app = admin.initializeApp({
    projectId: 'coinomi-rewards', // or just admin.initializeApp()
});

// Get Firestore instance
const db = admin.firestore(app);
const auth = admin.auth(app);

// Connect to emulators if in development mode
// Remove or comment out this block:

console.log('Firebase initialized', db);
// Export both admin and db
export { admin, app, auth, db };
