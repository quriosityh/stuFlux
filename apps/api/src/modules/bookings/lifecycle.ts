import { completeExpiredBookings } from './service.js';

const BOOKING_COMPLETION_INTERVAL_MS = 15 * 60 * 1_000;

let completionTimer: ReturnType<typeof setInterval> | undefined;

const runCompletionCycle = async () => {
  try {
    const completed = await completeExpiredBookings();
    if (completed.length > 0) {
      console.log(`✅ Marked ${completed.length} expired booking(s) as completed`);
    }
  } catch (error) {
    // A later cycle or the on-read fallback will retry safely. Do not let a
    // transient database outage terminate the API process.
    console.error('Failed to complete expired bookings', error);
  }
};

/**
 * Keeps persisted booking state aligned with calendar dates even when nobody
 * visits the bookings page. The database update is idempotent, so it is safe
 * for multiple API instances to run this job.
 */
export const startBookingLifecycle = () => {
  void runCompletionCycle();
  completionTimer = setInterval(() => void runCompletionCycle(), BOOKING_COMPLETION_INTERVAL_MS);
  completionTimer.unref();
};

export const stopBookingLifecycle = () => {
  if (completionTimer) clearInterval(completionTimer);
  completionTimer = undefined;
};
