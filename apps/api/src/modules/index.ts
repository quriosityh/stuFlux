import { Router } from 'express';
import healthRoutes from './health/routes.js';
import listingsRoutes from './listings/index.js';
import uploadsRoutes from './uploads/routes.js';

const apiV1: Router = Router();

apiV1.use('/health', healthRoutes);
apiV1.use('/listings', listingsRoutes);
apiV1.use('/uploads', uploadsRoutes);

export { apiV1 };
export default apiV1;
