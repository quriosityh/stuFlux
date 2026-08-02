import { Router } from 'express';
import { getMe, updateMe, updateMyVerification, getUserById } from './controller.js';

const router: Router = Router();

router.get('/me', ...getMe);
router.put('/me', ...updateMe);
router.put('/me/verification', ...updateMyVerification);
router.get('/users/:id', ...getUserById);

export default router;
