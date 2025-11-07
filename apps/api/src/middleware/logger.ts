import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  console.log(`📥 ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100) || 'Unknown',
    contentLength: req.get('Content-Length') || '0'
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const emoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    console.log(`📤 ${emoji} ${status} ${req.method} ${req.path} - ${duration}ms`);
  });

  next();
};