import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware as auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', auth, authController.updateProfile);

export default router;
