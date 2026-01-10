import { Request, Response } from 'express';
import { asyncHandler } from '../../infra/http/middleware/errorHandler.js';
import { listCategories } from './service.js';

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const payload = await listCategories();
  res.json(payload);
});
