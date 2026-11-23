import app from './app.js';
import { env } from '../config/env.js';
import { startBookingLifecycle, stopBookingLifecycle } from '../modules/bookings/lifecycle.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 StuFlux API running on port ${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
});

startBookingLifecycle();

process.on('SIGTERM', () => {
  console.log('⏱️ SIGTERM received, shutting down');
  stopBookingLifecycle();
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});
