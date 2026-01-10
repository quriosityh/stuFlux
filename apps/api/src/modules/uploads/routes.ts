import { Router } from 'express';
import { getSignature, completeUploadHandler } from './controller.js';

const router: Router = Router();

router.post('/signature', ...getSignature);
router.post('/complete', ...completeUploadHandler);

export default router;