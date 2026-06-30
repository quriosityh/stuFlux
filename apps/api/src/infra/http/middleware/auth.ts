import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { AppError } from '../../../common/errors.js';
import { ensureUserSynced } from '../../../modules/users/service.js';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string; // Database user UUID
    clerkUserId: string; // Clerk user ID (e.g. user_...)
    sessionId: string;
    claims: any;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    // Debug: surface incoming auth header for local troubleshooting
    console.debug('Incoming Authorization header:', authHeader ? authHeader.slice(0, 128) : authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const user = await ensureUserSynced(payload.sub);
    if (!user) {
      throw new AppError('User synchronization failed', 500, 'USER_SYNC_ERROR');
    }

    // Add user info to request
    req.auth = {
      userId: user.id,
      clerkUserId: payload.sub,
      sessionId: payload.sid as string,
      claims: payload
    };

    next();
  } catch (error: any) {
    console.error('🔒 Auth verification failed:', error.message);
    
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    }
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const user = await ensureUserSynced(payload.sub);

      if (user) {
        req.auth = {
          userId: user.id,
          clerkUserId: payload.sub,
          sessionId: payload.sid as string,
          claims: payload
        };
      }
    }

    next();
  } catch (error: any) {
    // Silently continue without auth
    console.warn('⚠️ Optional auth failed:', error?.message || 'Unknown error');
    next();
  }
};

// Get user details from Clerk
export const getUserDetails = async (userId: string) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatar: user.imageUrl,
      createdAt: new Date(user.createdAt)
    };
  } catch (error: any) {
    console.error('Failed to fetch user details:', error?.message || error);
    throw new AppError('Failed to fetch user details', 500, 'USER_FETCH_ERROR');
  }
};