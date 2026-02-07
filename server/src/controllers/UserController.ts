import type {Response} from 'express';
import type {AuthRequest} from '../middleware/authMiddleware.ts';
import prisma from "../config/prismaClient.ts";

export const onboard = async (req: AuthRequest, res: Response) => {
    const { uid, email, name, picture } = req.user!;

    try {
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
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to login",
        });
    }
};