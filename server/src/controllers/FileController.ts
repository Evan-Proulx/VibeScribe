import type {Response} from 'express';
import type {AuthRequest} from '../middleware/authMiddleware';
import prisma from "../config/prismaClient";
import { GoogleGenAI } from "@google/genai";

export const processScan = async (req: AuthRequest, res: Response) => {
    const { imageUrl } = req.body;
    const { uid, email } = req.user!;

    if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

    try {
        // 1. Ensure user exists in Database (Onboarding check)
        const user = await prisma.user.upsert({
            where: { firebaseId: uid },
            update: {},
            create: {
                id: uid,
                firebaseId: uid,
                email: email!,
                name: req.user?.name || "User",
            },
        });

        // 2. Fetch image for Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const imgResponse = await fetch(imageUrl);
        const imageArrayBuffer = await imgResponse.arrayBuffer();
        const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

        // 3. Process with Gemini (OCR + Cleaning + Formatting)
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64ImageData,
                    },
                },
                {
                    text: "Perform high-accuracy OCR. Correct any spelling or grammar mistakes from the handwriting. Format the output as clean Markdown with headers and bullet points where appropriate."
                }
            ],
        });

        const extractedText = result.text || "No text could be extracted.";

        // 4. Save the document record to Prisma/Supabase
        const document = await prisma.document.create({
            data: {
                userId: user.id,
                imageUrl: imageUrl,
                markdownContent: extractedText,
            }
        });

        return res.status(201).json(document);

    } catch (error) {
        console.error("Scanning Error:", error);
        return res.status(500).json({ error: "Failed to process scan" });
    }
};