import { z } from 'zod';
import { isBefore, parseISO } from 'date-fns';

export const createBookingSchema = z.object({
  listing_id: z.string().uuid(),
  start_date: z.string().transform((v) => parseISO(v)),
  end_date: z.string().transform((v) => parseISO(v)),
  message: z.string().max(500).optional(),
}).refine((data) => isBefore(data.start_date, data.end_date), {
  message: 'start_date must be before end_date',
  path: ['start_date'],
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
