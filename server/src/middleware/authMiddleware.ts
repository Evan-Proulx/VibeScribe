import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type {Request, Response, NextFunction} from 'express';

// Read the ServiceAccount
const serviceAccountPath = resolve('../src/config/serviceAccount.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Defining an interface for the Request structure
export interface AuthRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// Tis method gets the authorization header, gets the token, and verifies the user identity before protected routes
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        req.user = await admin.auth().verifyIdToken(token);
        next();
    } catch (error) {
        console.error("Firebase Admin Error:", error);
        res.status(403).json({ error: "Forbidden: Token validation failed" });
    }
};