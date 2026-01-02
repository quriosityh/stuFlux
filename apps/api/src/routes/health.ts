import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import { testConnection } from '../../db/index.js';

const router: Router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
    }
  };

  res.json(healthCheck);
}));

// Database health check (will add in Day 4)
router.get('/db', asyncHandler(async (req, res) => {
  const isConnected = await testConnection();
  
  res.json({ 
    status: isConnected ? 'ok' : 'error',
    database: {
      connected: isConnected,
      type: 'PostgreSQL',
      provider: 'Neon',
      timestamp: new Date().toISOString()
    }
  });
}));

export default router;