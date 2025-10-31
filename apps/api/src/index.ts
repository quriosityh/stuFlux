import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
// import compression from 'compression'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

// Initialize Express app
const app: Application = express()

const PORT = process.env.PORT || 4000

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
)

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  })
)

// Common middleware
// app.use(compression()) // optional Gzip compression
app.use(express.json({ limit: '10mb' })) // parse JSON
app.use(express.urlencoded({ extended: true })) // parse URL-encoded
app.use(morgan('combined')) // HTTP request logger

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  })
})

// Base route example
app.get('/', (req: Request, res: Response) => {
  res.send('API is running 🚀')
})

// 404 handler (Express v5 safe)
// 404 handler (Express v5 compatible)
app.use( (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
