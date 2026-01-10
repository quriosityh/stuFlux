import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../../infra/http/middleware/auth.js';
import { browseListings, getListingById, createListingHandler, updateListingHandler } from './controller.js';

const router: Router = Router();

router.get('/', optionalAuth, browseListings);
router.get('/:id', optionalAuth, getListingById);
router.post('/', requireAuth, createListingHandler);
router.put('/:id', requireAuth, updateListingHandler);

export default router;