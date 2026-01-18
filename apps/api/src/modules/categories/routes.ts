import { Router } from 'express';
import { optionalAuth } from '../../infra/http/middleware/auth.js';
import { getCategories } from './controller.js';

const router: Router = Router();

router.get('/', optionalAuth, getCategories);

export default router;
