import { Router } from 'express';
import { handleClerkWebhook } from './service.js';

const router: Router = Router();

router.post('/clerk', handleClerkWebhook);

export default router;
