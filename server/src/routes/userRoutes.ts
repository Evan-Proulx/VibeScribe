import { Router } from 'express';
import { onboard } from '../controllers/UserController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/onboard', verifyToken, onboard);

export default router;