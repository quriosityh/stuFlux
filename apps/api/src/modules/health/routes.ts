import { Router } from 'express';
import { getHealth, getHealthDb } from './controller.js';

const router: Router = Router();

router.get('/', getHealth);
router.get('/db', getHealthDb);

export default router;