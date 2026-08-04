import { Router } from 'express';
import { completeMyOnboarding, getMe, updateMe, getUserById } from './controller.js';

const router: Router = Router();

router.get('/users/me', ...getMe);
router.put('/users/me', ...updateMe);
router.put('/users/me/onboarding', ...completeMyOnboarding);
router.get('/users/:id', ...getUserById);

export default router;
