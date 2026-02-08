import {getDocuments, test} from "../controllers/UserController.ts";
import {Router} from "express";
import {verifyToken} from "../middleware/authMiddleware.ts";
const router = Router();

router.post('/', verifyToken, getDocuments);


export default router
