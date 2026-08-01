import { Router } from 'express';
import healthRoutes from './health/routes.js';
import listingsRoutes from './listings/index.js';
import uploadsRoutes from './uploads/routes.js';
import categoriesRoutes from './categories/index.js';
import usersRoutes from './users/index.js';
import webhookRoutes from './webhooks/routes.js';
import bookingsRoutes from './bookings/index.js';
import messagesRoutes from './messages/index.js';
import reviewsRouter from './reviews/index.js';
import notificationsRoutes from './notifications/index.js';
import pushRoutes from './push/index.js';

const apiV1: Router = Router();

apiV1.use('/health', healthRoutes);
apiV1.use('/listings', listingsRoutes);
apiV1.use('/uploads', uploadsRoutes);
apiV1.use('/categories', categoriesRoutes);
apiV1.use('/', usersRoutes);
apiV1.use('/webhooks', webhookRoutes);
apiV1.use('/bookings', bookingsRoutes);
apiV1.use('/', messagesRoutes);
apiV1.use('/reviews', reviewsRouter);
apiV1.use('/', notificationsRoutes);
apiV1.use('/push', pushRoutes);

export { apiV1 };
export default apiV1;
