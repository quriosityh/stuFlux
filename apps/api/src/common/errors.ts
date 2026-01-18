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
