import { Router } from 'express';
import {
  createBookingHandler,
  confirmBookingHandler,
  rejectBookingHandler,
  cancelBookingHandler,
  listBookingsHandler,
  availabilityHandler,
} from './controller.js';

const router: Router = Router();

router.post('/', ...createBookingHandler);
router.patch('/:id/confirm', ...confirmBookingHandler);
router.patch('/:id/reject', ...rejectBookingHandler);
router.patch('/:id/cancel', ...cancelBookingHandler);
router.get('/', ...listBookingsHandler);
router.get('/listings/:id/availability', ...availabilityHandler);

export default router;
