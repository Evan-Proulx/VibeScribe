import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6300;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
    credentials: true
}));
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`VibeScribe Server running on http://localhost:${PORT}`);
});