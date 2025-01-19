const isDevelopment = process.env.NODE_ENV === 'development';

export const logFirebaseConfig = config => {
    console.log('Firebase Config Start');
    console.group('Firebase Configuration');
    console.log('config:', isDevelopment);
    console.log('apiKey:', config.apiKey);
    console.log('authDomain:', config.authDomain);
    console.log('projectId:', config.projectId);
    console.log('storageBucket:', config.storageBucket);
    console.log('messagingSenderId:', config.messagingSenderId);
    console.log('appId:', config.appId);
    console.log('measurementId:', config.measurementId);
    console.groupEnd();
};

export const logEnvironmentVariables = () => {
    console.group('Environment Variables');
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('REACT_APP_')) {
            console.log(`${key}:`, process.env[key]);
        }
    });
    console.groupEnd();
};
