import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';

// Enhanced error types for better debugging
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  context?: Record<string, any>;
  userMessage?: string;
}

export interface ErrorContext {
  module?: string | undefined;
  operation?: string | undefined;
  userId?: string | undefined;
  resourceId?: string | undefined;
  inputData?: any | undefined;
  metadata?: Record<string, any> | undefined;
  resource?: string | undefined;
  validationDetails?: any[] | undefined;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context: ErrorContext;
  public readonly userMessage: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    context: ErrorContext = {},
    userMessage?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.context = context;
    this.userMessage = userMessage || message;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Express 5 compatible error handler with detailed debugging
export const errorHandler = (
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let userMessage = 'Something went wrong';
  let details: any[] = [];
  let context: ErrorContext = {};

  // ✅ Use correct Zod API and typings
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
      expected: (issue as any).expected
    }));

    context = { operation: 'request_validation' };
  } 
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    userMessage = err.userMessage || err.message;
    context = err.context || {};
  } 
  else if ('statusCode' in err && typeof (err as ApiError).statusCode === 'number') {
    const apiError = err as ApiError;
    statusCode = apiError.statusCode || 500;
    code = apiError.code || 'UNKNOWN_ERROR';
    message = apiError.message;
    context = apiError.context || {};
  }
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    userMessage = 'Please sign in again';
    context = { operation: 'jwt_verification' };
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
    userMessage = 'Please sign in again';
    context = { operation: 'jwt_verification' };
  }
  else if (err.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database connection failed';
    userMessage = 'Service temporarily unavailable';
    context = { operation: 'database_connection' };
  }

  // Enhanced error logging with explicit location information
  const errorLocation = getErrorLocation(err);
  const requestContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    query: req.query,
    params: req.params,
    userId: (req as any).auth?.userId
  };

  console.error(`❌ ERROR ${code} [${statusCode}]`, {
    timestamp: new Date().toISOString(),
    location: errorLocation,
    message: err.message,
    stack: err.stack,
    context: { ...context, ...requestContext },
    details: details.length > 0 ? details : undefined,
    errorType: err.constructor.name,
    originalError: process.env.NODE_ENV === 'development' ? err : undefined
  });

  // Structured error response
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
          context: { ...context, ...requestContext }
        }
      }),
      ...(process.env.NODE_ENV === 'development' && err instanceof ZodError && {
        validation: {
          issues: err.issues
        }
      })
    }
  };

  res.status(statusCode).json(errorResponse);
};

// Helper to extract error location from stack trace
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
        const [, file, line, column] = match;
        return `${file}:${line}:${column}`;
      }
      return line;
    }
  }
  return 'Location not found in stack';
}

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Express 5 compatible async handler with proper typing
export const asyncHandler = <T = any>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Utility functions for common error scenarios
export const ErrorUtils = {
  notFound: (resource: string, id?: string, context?: ErrorContext) => {
    const errorContext: ErrorContext = {
      ...context,
      resource,
      resourceId: id ?? undefined
    };
    return new AppError(
      `${resource}${id ? ` with ID ${id}` : ''} not found`,
      404,
      'RESOURCE_NOT_FOUND',
      errorContext,
      `${resource} not found${id ? `: ${id}` : ''}`
    );
  },

  unauthorized: (operation: string, context?: ErrorContext) => {
    const errorContext: ErrorContext = {
      ...context,
      operation
    };
    return new AppError(
      `Unauthorized to perform: ${operation}`,
      401,
      'UNAUTHORIZED',
      errorContext,
      'You are not authorized to perform this action'
    );
  },

  validation: (message: string, details?: any[], context?: ErrorContext) => {
    const errorContext: ErrorContext = {
      ...context,
      validationDetails: details ?? undefined
    };
    return new AppError(
      `Validation failed: ${message}`,
      400,
      'VALIDATION_ERROR',
      errorContext,
      'Please check your input and try again'
    );
  },
};
