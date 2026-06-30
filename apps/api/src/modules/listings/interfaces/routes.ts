import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../../infra/http/middleware/auth.js';
import {
  browseListings,
  getListingById,
  getOwnerListingsHandler,
  createListingHandler,
  updateListingHandler,
  getListingBlockedDatesHandler,
  updateListingBlockedDatesHandler,
} from './controller.js';

const router: Router = Router();

router.get('/owner/my', requireAuth, getOwnerListingsHandler);
router.get('/', optionalAuth, browseListings);
router.get('/:id', optionalAuth, getListingById);
router.post('/', requireAuth, createListingHandler);
router.put('/:id', requireAuth, updateListingHandler);
router.get('/:id/blocked-dates', optionalAuth, getListingBlockedDatesHandler);
router.put('/:id/blocked-dates', requireAuth, updateListingBlockedDatesHandler);

export default router;