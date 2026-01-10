import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { getHealthStatus, getDbStatus } from './service.js';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const payload = await getHealthStatus();
  res.json(payload);
});

export const getHealthDb = asyncHandler(async (_req: Request, res: Response) => {
  const payload = await getDbStatus();
  res.json(payload);
});
