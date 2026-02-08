import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware';
import prisma from "../config/prismaClient";
import {GoogleGenAI} from "@google/genai";

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

export const gemini = async (req: AuthRequest, res: Response) => {
    const ai = new GoogleGenAI({apiKey: "AIzaSyCCxA-P0njcm4CQUs321oOffaKCz_nxh_U"});
    const image_path = "https://farm4.staticflickr.com/3789/10177514664_0ff9a53cf8_z.jpg"

    const response = await fetch(image_path);
    const imageArrayBuffer = await response.arrayBuffer();
    const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64ImageData,
                },
            },
            { text: "Extract the text from this image" }
        ],
    });
    console.log(result.text);

    return res.status(200).json(result);
}