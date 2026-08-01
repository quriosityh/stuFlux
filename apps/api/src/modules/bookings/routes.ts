import { Router } from 'express';
import {
  createBookingHandler,
  confirmBookingHandler,
  rejectBookingHandler,
  cancelBookingHandler,
  completeBookingHandler,
  listBookingsHandler,
  getBookingByIdHandler,
  availabilityHandler,
} from './controller.js';

const router: Router = Router();

router.post('/', ...createBookingHandler);
router.get('/', ...listBookingsHandler);
router.get('/:id', ...getBookingByIdHandler);
router.patch('/:id/confirm', ...confirmBookingHandler);
router.patch('/:id/reject', ...rejectBookingHandler);
router.patch('/:id/cancel', ...cancelBookingHandler);
router.patch('/:id/complete', ...completeBookingHandler);
router.get('/listings/:id/availability', ...availabilityHandler);

export default router;
