import { Request, Response } from 'firebase-functions';

export const corsHandler = (
    request: Request,
    response: Response,
    callback: () => Promise<void>
) => {
    response.set('Access-Control-Allow-Origin', '*');
    
    if (request.method === 'OPTIONS') {
        response.set('Access-Control-Allow-Methods', 'GET, POST');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.status(204).send('');
        return;
    }

    return callback();
}; 