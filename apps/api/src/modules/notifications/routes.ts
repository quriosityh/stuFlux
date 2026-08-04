import { Router } from 'express';
import { listNotificationsHandler, markAllNotificationsReadHandler, markNotificationReadHandler, streamNotificationsHandler } from './controller.js';

const router: Router = Router();

router.get('/notifications/stream', ...streamNotificationsHandler);
router.get('/notifications', ...listNotificationsHandler);
router.patch('/notifications/read-all', ...markAllNotificationsReadHandler);
router.patch('/notifications/:id/read', ...markNotificationReadHandler);

export default router;
