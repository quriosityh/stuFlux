import { Request, Response } from 'express';
import { asyncHandler } from '../../../infra/http/middleware/errorHandler.js';
import { listListings, getListing, getListingForOwner, createListing, updateListing, getOwnerListings, getListingBlockedDates, updateListingBlockedDates } from '../application/service.js';
import { type AuthenticatedRequest } from '../../../infra/http/middleware/auth.js';

export const browseListings = asyncHandler(async (req: Request, res: Response) => {
  const result = await listListings(req.query);
  res.json(result);
});

export const getListingById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await getListing(id, { viewerId: req.auth?.userId });
  res.json({ data: result });
});

export const getOwnerListingsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await getOwnerListings(req.auth!.userId, req.query);
  res.json(result);
});

export const getOwnerListingByIdHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await getListingForOwner(req.params.id, req.auth!.userId);
  res.json({ data: result });
});

export const createListingHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await createListing(req.body, req.auth!.userId);
  res.status(201).json({ data: result });
});

export const updateListingHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await updateListing(id, req.body, req.auth!.userId);
  res.json({ data: result });
});

export const getListingBlockedDatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getListingBlockedDates(id);
  res.json({ data: result });
});

export const updateListingBlockedDatesHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await updateListingBlockedDates(id, req.body, req.auth!.userId);
  res.json({ data: result });
});
