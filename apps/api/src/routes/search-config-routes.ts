import type { SearchConfig } from '@prisma/client';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';

const searchConfigBodySchema = z.object({
  platforms: z.array(z.string().min(1)).min(1),
  makes: z.array(z.string().min(1)).min(1),
  models: z.array(z.string().min(1)).min(1),
  yearMin: z.number().int().min(1980).max(2100),
  yearMax: z.number().int().min(1980).max(2100),
  minMileage: z.number().int().min(0),
  maxMileage: z.number().int().min(0),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  city: z.string().trim().min(1, 'City is required').max(100),
  radius: z.number().int().min(5).max(500),
  discountPercent: z.number().min(0).max(100),
  discountDollar: z.number().int().min(0),
});

/** Prisma row including `city` (regenerate client after schema changes). */
type SearchConfigRow = SearchConfig & { city: string };

function toApiShape(config: SearchConfig) {
  const row = config as SearchConfigRow;

  return {
    id: row.id,
    platforms: row.platforms,
    makes: row.makes,
    models: row.models,
    yearMin: row.year_min,
    yearMax: row.year_max,
    minMileage: row.min_mileage,
    maxMileage: row.max_mileage,
    zipCode: String(row.zip_code).padStart(5, '0'),
    city: row.city,
    radius: row.radius,
    discountPercent: row.discount_thres?.toNumber() ?? 0,
    discountDollar: row.discount_dollar,
  };
}

export const searchConfigRouter: Router = Router();

searchConfigRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const config = await prisma.searchConfig.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!config) {
      res.status(404).json({ error: 'No search configuration found' });
      return;
    }

    res.json({ data: toApiShape(config) });
  } catch (error) {
    console.error('Failed to fetch search configuration:', error);
    res.status(500).json({ error: 'Failed to fetch search configuration' });
  }
});

searchConfigRouter.post('/', async (req: Request, res: Response) => {
  const parsed = searchConfigBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid search configuration',
      details: parsed.error.flatten(),
    });
    return;
  }

  const body = parsed.data;

  if (body.yearMin > body.yearMax) {
    res.status(400).json({ error: 'yearMin cannot be greater than yearMax' });
    return;
  }

  if (body.minMileage > body.maxMileage) {
    res.status(400).json({ error: 'minMileage cannot be greater than maxMileage' });
    return;
  }

  try {
    const existing = await prisma.searchConfig.findFirst({
      orderBy: { id: 'desc' },
    });

    const dbPayload = {
      platforms: body.platforms,
      makes: body.makes,
      models: body.models,
      year_min: body.yearMin,
      year_max: body.yearMax,
      min_mileage: body.minMileage,
      max_mileage: body.maxMileage,
      zip_code: Number(body.zipCode),
      city: body.city,
      radius: body.radius,
      discount_dollar: body.discountDollar,
      discount_thres: body.discountPercent,
    };

    const saved = existing
      ? await prisma.searchConfig.update({
          where: { id: existing.id },
          data: dbPayload,
        })
      : await prisma.searchConfig.create({
          data: dbPayload,
        });

    res.json({
      data: toApiShape(saved),
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save search configuration:', error);
    res.status(500).json({ error: 'Failed to save search configuration' });
  }
});
