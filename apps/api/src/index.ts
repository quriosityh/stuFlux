import dotenv from 'dotenv';
// Load environment variables as early as possible
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

// Import routes
import healthRoutes from './routes/health.js';
import listingsRoutes from './routes/listings.js';
import uploadsRoutes from './routes/uploads.js';

// Import middleware
import { errorHandler } from './middleware/errors.js';
import { requestLogger } from './middleware/logger.js';

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for Railway/Heroku deployment
app.set('trust proxy', 1);

// Security middleware (Enhanced)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.clerk.com"],
    }
  },
  crossOriginEmbedderPolicy: false, // Required for Cloudinary uploads
}));

// CORS configuration (Production ready)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://stuflux.vercel.app' // Add your Vercel domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// API Routes (v1 namespace)
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/listings', listingsRoutes);
app.use('/api/v1/uploads', uploadsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'StuFlux API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/v1/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Route not found',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 StuFlux API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏱️  SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

export default app;