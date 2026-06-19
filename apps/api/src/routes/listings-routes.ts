/**
 * =============================================================================
 * LISTINGS ROUTES — Implementation blueprint (comments only)
 * =============================================================================
 *
 * Purpose:
 *   HTTP layer for reading vehicle listings that have already been ingested
 *   into Postgres via Prisma. This file does NOT call Apify — scraping lives
 *   in searches-routes + services/apify. Listings routes are read-focused.
 *
 * Packages already available / recommended:
 *   - express          → Router and request/response handling
 *   - @prisma/client   → Query the Listing model (via a shared prisma singleton)
 *   - zod              → Validate query params and route params before hitting DB
 *
 * Supporting files to add later (not in this file):
 *   - src/lib/prisma.ts
 *       Single PrismaClient instance; import here instead of creating per request.
 *
 *   - src/services/listings/listings.service.ts
 *       Business logic: build Prisma where/orderBy from filters, map DB rows to
 *       API response shape (Decimal → number, Date → ISO string).
 *
 *   - src/services/listings/listings.schema.ts
 *       Zod schemas for list query params and :id param validation.
 *
 *   - src/middleware/async-handler.ts (optional)
 *       Wrap async route handlers so rejected promises reach Express error middleware.
 *
 *   - src/middleware/error-handler.ts (optional)
 *       Central 400/404/500 JSON responses; keeps route files thin.
 *
 * Mount in src/index.ts:
 *   import { listingsRouter } from './routes/listings-routes.js';
 *   app.use('/api/listings', listingsRouter);
 *
 * =============================================================================
 * ENDPOINTS TO IMPLEMENT
 * =============================================================================
 *
 * GET /api/listings
 * -----------------
 *   Returns a paginated list of listings from the database.
 *
 *   Query params to support (align with apps/web listings page filters):
 *     - platform   (optional string)  — exact match, e.g. "Facebook Marketplace"
 *     - make       (optional string)  — exact match, e.g. "Toyota"
 *     - sort       (optional enum)    — "posted_desc" | "posted_asc" (default: posted_desc)
 *     - page       (optional number)  — default 1
 *     - limit      (optional number)  — default 20, cap at 100
 *
 *   Implementation steps:
 *     1. Parse and validate query string with Zod (reject invalid sort/limit with 400).
 *     2. Delegate to listings.service.list({ platform, make, sort, page, limit }).
 *     3. Service runs prisma.listing.findMany with:
 *          where:  { platform?, make? }
 *          orderBy: { posted: 'desc' | 'asc' }
 *          skip/take for pagination
 *     4. Run prisma.listing.count with same where for total count.
 *     5. Map each row to a JSON-safe DTO (listedPrice/estimatedPrice as numbers).
 *     6. Respond: { data: ListingDto[], meta: { page, limit, total, totalPages } }
 *
 *   Notes:
 *     - Filter only on fields indexed in Prisma later (platform, make, posted) if volume grows.
 *     - Do not return internal fields the UI does not need unless useful for debugging.
 *
 * GET /api/listings/:id
 * ---------------------
 *   Returns a single listing by cuid id.
 *
 *   Implementation steps:
 *     1. Validate :id with Zod (non-empty string).
 *     2. listings.service.getById(id) → prisma.listing.findUnique({ where: { id } })
 *     3. If null → 404 { error: 'Listing not found' }
 *     4. Map to ListingDto and return { data: ListingDto }
 *
 *   Notes:
 *     - Frontend shortlist/detail views can use this once mock Zustand data is replaced.
 *     - url is unique in schema — alternative lookup by url is possible but not required initially.
 *
 * =============================================================================
 * RESPONSE DTO SHAPE (contract with apps/web)
 * =============================================================================
 *
 *   ListingDto should mirror what the web app already expects:
 *     id, make, model, year, miles, platform, location,
 *     listedPrice, estimatedPrice?, discountPercentage?,
 *     posted (ISO 8601 string), url, createdAt?
 *
 *   Keep DTO mapping in the service layer so routes stay one-liners:
 *     res.json({ data: toListingDto(listing) })
 *
 * =============================================================================
 * OUT OF SCOPE FOR THIS ROUTER (handle elsewhere)
 * =============================================================================
 *
 *   - POST /api/listings or ingest endpoints
 *       Ingestion happens inside search runs (Apify → normalize → prisma.listing.upsert).
 *
 *   - Saved / shortlist CRUD
 *       Belongs on saved-listings routes tied to SavedListing + userId once auth exists.
 *
 *   - Valuation / discount calculation
 *       Computed at ingest time in search service; listings routes only read stored values.
 *
 * =============================================================================
 * ERROR HANDLING CONVENTIONS
 * =============================================================================
 *
 *   400 — invalid query params or :id (Zod validation errors → { error, details })
 *   404 — listing not found
 *   500 — unexpected Prisma/DB errors (log server-side, generic message to client)
 *
 * =============================================================================
 * TESTING CHECKLIST (when implemented)
 * =============================================================================
 *
 *   [ ] GET /api/listings returns seeded/migrated rows
 *   [ ] ?platform= and ?make= filter correctly
 *   [ ] ?sort=posted_asc reverses order
 *   [ ] Pagination meta is accurate
 *   [ ] GET /api/listings/:id returns 404 for unknown id
 *   [ ] Decimal prices serialize as numbers in JSON
 *
 * =============================================================================
 */
import { Router, type Request, type Response } from 'express';
import type { Listing } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
/**
 * Export a Router instance now so index.ts can mount it when routes are implemented.
 * Attach handlers above using listingsRouter.get(...) as each endpoint is built out.
 */
export const listingsRouter: Router = Router();

function toListingDto(listing: Listing) {
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

listingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { discountPercentage: 'desc' },
    });

    res.status(200).json({ data: listings.map(toListingDto) });
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// listingsRouter.get('/', ...)       → see GET /api/listings above
// listingsRouter.get('/:id', ...)    → see GET /api/listings/:id above
