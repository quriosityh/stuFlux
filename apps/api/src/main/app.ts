import express, { Application } from 'express';
import compression from 'compression';

import { helmetConfig } from '../config/helmet.js';
import { corsConfig } from '../config/cors.js';
import rateLimiter from '../config/rateLimiter.js';

import apiV1 from '../modules/index.js';

import { errorHandler } from '../infra/http/middleware/errorHandler.js';
import { requestLogger } from '../infra/http/middleware/logger.js';
import { optionalAuth } from '../infra/http/middleware/auth.js';

const app: Application = express();

app.set('trust proxy', 1);

// Core middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Logging
app.use(requestLogger);

// Optional auth context for all routes
app.use(optionalAuth);

// Routes
app.use('/api/v1', apiV1);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'StuFlux API',
    version: '1.0.0',
    status: 'running',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
});

// Error handler LAST
app.use(errorHandler);

export default app;
