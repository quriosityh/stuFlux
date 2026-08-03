import { Router } from 'express';
import { getMe, updateMe, updateMyVerification, getUserById } from './controller.js';

const router: Router = Router();

router.get('/users/me', ...getMe);
router.put('/users/me', ...updateMe);
router.put('/users/me/verification', ...updateMyVerification);
router.get('/users/:id', ...getUserById);

export default router;
