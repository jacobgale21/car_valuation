import { Router, type Request, type Response } from 'express';

import { prisma } from '../lib/prisma.js';
import { getListings } from '../services/listings.js';

export const searchesRouter: Router = Router();

/**
 * POST /api/searches/run
 * Loads the saved SearchConfig from Neon, runs Apify, returns parsed listings.
 * No valuation or database persistence — test endpoint only.
 */
searchesRouter.post('/run', async (_req: Request, res: Response) => {
  try {
    const searchConfig = await prisma.searchConfig.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!searchConfig) {
      res.status(404).json({
        error:
          'No search configuration found. Save your settings on the Search Configuration page first.',
      });
      return;
    }

    await getListings(searchConfig); // This will save the listings to the database

    res.status(200).json({
      ranAt: new Date().toISOString(),
      searchConfigId: searchConfig.id,
      config: {
        city: searchConfig.city,
        makes: searchConfig.makes,
        models: searchConfig.models,
        platforms: searchConfig.platforms,
      },
    });
  } catch (error) {
    console.error('Saving listings failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Saving listings failed',
    });
  }
});
