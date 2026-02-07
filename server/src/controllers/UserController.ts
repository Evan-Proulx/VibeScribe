import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware';
import prisma from "../config/prismaClient";

export const onboard = async (req: AuthRequest, res: Response) => {
    console.log('Onboard endpoint hit');
    const { uid, email, name, picture } = req.user!;
    console.log('User info:', { uid, email, name });

    try {
        console.log('Attempting database upsert...');
        const user = await prisma.user.upsert({
            where: { firebaseId: uid },
            update: {
                name: name || "N/A",
                photo: picture ?? null,
            },
            create: {
                id: uid,
                firebaseId: uid,
                email: email!,
                name: name || "N/A",
                photo: picture ?? null,
            },
        });
        console.log('Database upsert successful:', user);
        return res.status(200).json(user);
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            error: "Unable to login",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};