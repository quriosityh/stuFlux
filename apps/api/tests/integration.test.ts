import request from 'supertest';
import app from '../src/index.js';
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';

describe('StuFlux API Integration Tests', () => {
  let server: ReturnType<typeof app.listen>;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    try {
      // Close the server first
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Import and close database pool
      const { closePool } = await import('../db/index.js');
      await closePool();
      
      // Give time for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Cleanup error:', error);
      throw error;
    }
  });

  it('should return API info at root', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: 'StuFlux API',
      version: '1.0.0',
      status: 'running'
    });
  });

  it('should return health status', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number)
    });
  });

  it('should handle 404 routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Route not found',
        timestamp: expect.any(String)
      }
    });
  });

  it('should check database health', async () => {
    const response = await request(app).get('/api/v1/health/db');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: {
        connected: true,
        type: 'PostgreSQL',
        provider: 'Neon',
        timestamp: expect.any(String)
      }
    });
  });
});