// Put apify and valuation together here, then save the listing to the database
import type { Prisma, SearchConfig } from '@prisma/client';
import { getListingsFromApify, ParsedListing } from './apify.js';
import { getValuations } from './valuation.js';
import { prisma } from '../lib/prisma.js';

async function saveListingsToDatabase(
  listings: ParsedListing[],
  valuations: { estimated_value: number; discount_percentage: number }[],
) {
  const data: Prisma.ListingCreateManyInput[] = listings.map((listing, index) => ({
    listedPrice: listing.listedPrice,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    miles: listing.miles,
    platform: listing.platform,
    url: listing.url,
    location: listing.location,
    posted: new Date(),
    estimatedPrice: valuations[index].estimated_value,
    discountPercentage: valuations[index].discount_percentage,
  }));

  await prisma.listing.createMany({ data });
}

export async function getListings(searchConfig: SearchConfig) {
  const listings = await getListingsFromApify(searchConfig);
  const valuations = await getValuations(listings);
  await saveListingsToDatabase(listings, valuations);
}
