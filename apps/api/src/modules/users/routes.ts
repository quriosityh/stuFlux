import { Router } from 'express';
import { getMe, updateMe, getUserById } from './controller.js';

const router: Router = Router();

router.get('/me', ...getMe);
router.put('/me', ...updateMe);
router.get('/users/:id', ...getUserById);

export default router;
