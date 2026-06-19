// GET /api/saved, POST /api/saved, DELETE /api/saved/:id
import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const savedRouter: Router = Router();

function toListingDto(listing: {
  id: string;
  listedPrice: { toNumber(): number };
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  posted: Date;
  url: string;
  estimatedPrice: { toNumber(): number } | null;
  discountPercentage: { toNumber(): number } | null;
  location: string;
}) {
  return {
    id: listing.id,
    listedPrice: listing.listedPrice.toNumber(),
    make: listing.make,
    model: listing.model,
    year: listing.year,
    miles: listing.miles,
    platform: listing.platform,
    posted: listing.posted.toISOString(),
    url: listing.url,
    estimatedPrice: listing.estimatedPrice?.toNumber() ?? null,
    discountPercentage: listing.discountPercentage?.toNumber() ?? null,
    location: listing.location,
  };
}

function toSavedListingDto(row: {
  id: string;
  listingId: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  listing: Parameters<typeof toListingDto>[0];
}) {
  return {
    id: row.id,
    listingId: row.listingId,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    listing: toListingDto(row.listing),
  };
}

savedRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const savedRows = await prisma.savedListing.findMany({
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ data: savedRows.map(toSavedListingDto) });
  } catch (error) {
    console.error('Failed to fetch saved:', error);
    res.status(500).json({ error: 'Failed to fetch saved' });
  }
});

savedRouter.post('/', async (req: Request, res: Response) => {
  try {
    const listingID = req.body.listing.id;
    const saved = await prisma.savedListing.create({
      data: { listingId: listingID, status: 'saved' },
      include: { listing: true },
    });
    res.status(200).json({ data: toSavedListingDto(saved) });
  } catch (error) {
    console.error('Failed to save:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to save' });
  }
});

savedRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const listingId = req.params.id as string;
    const existing = await prisma.savedListing.findFirst({
      where: { listingId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Saved listing not found' });
      return;
    }

    const saved = await prisma.savedListing.delete({
      where: { id: existing.id },
    });
    res.status(200).json({ data: saved });
  } catch (error) {
    console.error('Failed to delete:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});
