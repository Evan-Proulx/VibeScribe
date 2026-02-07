import admin from 'firebase-admin';
import type { NextFunction } from "express";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token)
        return res.status(401).json({
            error: "No token provided" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Contains uid, email, etc.
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};