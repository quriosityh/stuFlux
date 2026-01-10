import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { AppError, type ApiError, type ErrorContext } from '../../../common/errors.js';

// Express 5 compatible async handler wrapper
export const asyncHandler = <T = any>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Centralized error handler
export const errorHandler = (
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let userMessage = 'Something went wrong';
  let details: any[] = [];
  let context: ErrorContext = {};

  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    userMessage = 'Please check your input data';

    details = err.issues.map((issue: ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      received: (issue as any).received,
      expected: (issue as any).expected,
    }));

    context = { operation: 'request_validation' };
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    userMessage = err.userMessage || err.message;
    context = err.context || {};
  } else if ('statusCode' in err && typeof (err as ApiError).statusCode === 'number') {
    const apiError = err as ApiError;
    statusCode = apiError.statusCode || 500;
    code = apiError.code || 'UNKNOWN_ERROR';
    message = apiError.message;
    context = apiError.context || {};
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    userMessage = 'Please sign in again';
    context = { operation: 'jwt_verification' };
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
    userMessage = 'Please sign in again';
    context = { operation: 'jwt_verification' };
  } else if (err.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database connection failed';
    userMessage = 'Service temporarily unavailable';
    context = { operation: 'database_connection' };
  }

  const errorLocation = getErrorLocation(err);
  const requestContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    query: req.query,
    params: req.params,
    userId: (req as any).auth?.userId,
  };

  console.error(`❌ ERROR ${code} [${statusCode}]`, {
    timestamp: new Date().toISOString(),
    location: errorLocation,
    message: err.message,
    stack: err.stack,
    context: { ...context, ...requestContext },
    details: details.length > 0 ? details : undefined,
    errorType: err.constructor.name,
    originalError: process.env.NODE_ENV === 'development' ? err : undefined,
  });

  const errorResponse = {
    error: {
      code,
      message: userMessage,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.headers['x-request-id'] || generateRequestId(),
      ...(details.length > 0 && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          technicalMessage: message,
          location: errorLocation,
          stack: err.stack,
          context: { ...context, ...requestContext },
        },
      }),
      ...(process.env.NODE_ENV === 'development' && err instanceof ZodError && {
        validation: {
          issues: err.issues,
        },
      }),
    },
  };

  res.status(statusCode).json(errorResponse);
};

function getErrorLocation(error: Error): string {
  const stack = error.stack;
  if (!stack) return 'Unknown location';

  const stackLines = stack.split('\n');
  for (let i = 1; i < stackLines.length; i++) {
    const line = stackLines[i]?.trim();
    if (!line) continue;
    if (!line.includes('node_modules') && !line.includes('internal/')) {
      const match = line.match(/at\s+.+\(?(.+):(\d+):(\d+)\)?/);
      if (match) {
        const [, file, lineNum, column] = match;
        return `${file}:${lineNum}:${column}`;
      }
      return line;
    }
  }
  return 'Location not found in stack';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
