import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Firebase Admin SDK
let app: admin.app.App;

if (process.env.NODE_ENV === 'test') {
    app = admin.initializeApp({
        projectId: 'demo-project',
    });
} else {
    app = admin.initializeApp();
}

// Get Firestore instance
const db = admin.firestore(app);
const auth = admin.auth(app);

// Export both admin and db
export { admin, app, auth, db };
