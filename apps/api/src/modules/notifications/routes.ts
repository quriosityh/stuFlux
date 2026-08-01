import { Router } from 'express';
import { streamNotificationsHandler } from './controller.js';

const router: Router = Router();

router.get('/notifications/stream', ...streamNotificationsHandler);

export default router;
