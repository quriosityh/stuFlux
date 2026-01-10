import { Request, Response } from 'express';

export const paginate = (array: any[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result: any = {};

    if (endIndex < array.length) {
        result.next = {
            page: page + 1,
            limit: limit,
        };
    }

    if (startIndex > 0) {
        result.previous = {
            page: page - 1,
            limit: limit,
        };
    }

    result.results = array.slice(startIndex, endIndex);
    return result;
};

export const paginateResponse = (req: Request, res: Response, data: any[]) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const paginatedData = paginate(data, page, limit);
    res.json(paginatedData);
};