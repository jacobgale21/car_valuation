import type { SearchConfig } from '@prisma/client';
import { ApifyClient } from 'apify-client';

/** Listing fields for valuation / DB ingest (Prisma Listing minus id, createdAt, valuation). */
export interface ParsedListing {
  listedPrice: number;
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  url: string;
  location: string;
}

let apifyClient: ApifyClient | null = null;

function getApifyClient(): ApifyClient {
  if (!apifyClient) {
    const token = process.env.APIFY_API_KEY;
    if (!token) {
      throw new Error('APIFY_API_KEY is not configured');
    }
    apifyClient = new ApifyClient({ token });
  }
  return apifyClient;
}

function toMarketplaceSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

/** Pairs makes[i] with models[i] — indices correspond one-to-one. */
function buildMakeModelPairs(makes: string[], models: string[]) {
  const pairCount = Math.min(makes.length, models.length);

  if (pairCount === 0) {
    throw new Error('At least one make and model pair is required');
  }

  if (makes.length !== models.length) {
    console.warn(
      `SearchConfig has ${makes.length} makes and ${models.length} models; using first ${pairCount} pairs.`,
    );
  }

  return Array.from({ length: pairCount }, (_, index) => ({
    make: makes[index],
    model: models[index],
  }));
}

function buildMarketplaceSearchUrl(city: string, make: string, model: string): string {
  const locationSlug = toMarketplaceSlug(city);
  const query = encodeURIComponent(`${make} ${model}`);

  return `https://www.facebook.com/marketplace/${locationSlug}/search/?query=${query}`;
}

/** Maps SearchConfig to Apify actor input with one start URL per make/model pair. */
function buildActorInput(searchConfig: SearchConfig) {
  const pairs = buildMakeModelPairs(searchConfig.makes, searchConfig.models);

  return {
    startUrls: pairs.map(({ make, model }) => ({
      url: buildMarketplaceSearchUrl(searchConfig.city, make, model),
    })),
    resultsLimit: 2,
    includeListingDetails: true,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };
}

function convertApifyListingToListing(listing: any): ParsedListing {
  return {
    listedPrice: Number(listing.listing_price.amount),
    location: listing.location.reverse_geocode.city + ', ' + listing.location.reverse_geocode.state,
    year: Number(listing.marketplace_listing_title.split(' ')[0]),
    make: listing.marketplace_listing_title.split(' ')[1],
    model: listing.marketplace_listing_title.split(' ')[2],
    platform: 'facebook',
    url: listing.listingUrl,
    miles: listing.vehicle_odometer_data.value,
  };
}

export async function getListingsFromApify(searchConfig: SearchConfig): Promise<ParsedListing[]> {
  const client = getApifyClient();
  const actorId = process.env.APIFY_FACEBOOK_ACTOR_ID;

  if (!actorId) {
    throw new Error('APIFY_FACEBOOK_ACTOR_ID is not configured');
  }

  const input = buildActorInput(searchConfig);
  const run = await client.actor(actorId).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items
    .map((item) => convertApifyListingToListing(item))
    .filter((listing): listing is ParsedListing => listing !== null);
}
