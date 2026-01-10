import { Router } from 'express';
import { getMe, updateMe } from './controller.js';

const router: Router = Router();

router.get('/me', ...getMe);
router.put('/me', ...updateMe);

export default router;
