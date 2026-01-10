import { Router } from 'express';
import healthRoutes from './health/routes.js';
import listingsRoutes from './listings/index.js';
import uploadsRoutes from './uploads/routes.js';
import categoriesRoutes from './categories/index.js';
import usersRoutes from './users/index.js';
import webhookRoutes from './webhooks/routes.js';

const apiV1: Router = Router();

apiV1.use('/health', healthRoutes);
apiV1.use('/listings', listingsRoutes);
apiV1.use('/uploads', uploadsRoutes);
apiV1.use('/categories', categoriesRoutes);
apiV1.use('/', usersRoutes);
apiV1.use('/webhooks', webhookRoutes);

export { apiV1 };
export default apiV1;
