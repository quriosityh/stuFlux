import { Router } from 'express';
import { subscribePushHandler, unsubscribePushHandler } from './controller.js';

const router: Router = Router();

router.post('/subscribe', ...subscribePushHandler);
router.delete('/subscribe', ...unsubscribePushHandler);

export default router;
