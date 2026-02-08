import { Router } from 'express';
import {gemini, onboard} from '../controllers/UserController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/onboard', verifyToken, onboard);

router.post('/gemini', gemini);

export default router;