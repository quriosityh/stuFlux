import { healthCheck } from '../../infra/db/client.js';

export const getHealthStatus = async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
  };
};

export const getDbStatus = async () => {
  const dbStatus = await healthCheck();
  return {
    status: dbStatus.status === 'healthy' ? 'ok' : 'error',
    database: {
      connected: dbStatus.status === 'healthy',
      type: 'PostgreSQL',
      provider: 'Neon',
      timestamp: dbStatus.timestamp,
      error: dbStatus.error,
    },
  };
};
