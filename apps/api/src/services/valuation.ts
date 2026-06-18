import { ParsedListing } from './apify.js';
import axios from 'axios';

async function fetchValuation(listing: ParsedListing): Promise<any> {
  const params = {
    api_key: process.env.MARKETCHECK_API_KEY,
    ymm: `${listing.year}|${listing.make}|${listing.model}`,
    city_state: `${listing.location.split(',')[0].trim()}|${listing.location.split(',')[1].trim()}`,
  };
  const response = await axios.request({
    method: 'GET',
    url: 'https://api.marketcheck.com/v2/sales/car',
    params,
    headers: { Accept: 'application/json' },
  });
  return response;
}

function computeEstimatedValue(listing: ParsedListing, response: any): number {
  const z_mileage =
    (listing.miles - response.data.miles_stats.geometric_mean) /
    response.data.miles_stats.standard_deviation;
  const adjustment = -z_mileage * 0.3 * response.data.price_stats.standard_deviation;
  return response.data.price_stats.median + adjustment;
}
async function getValuation(listing: ParsedListing): Promise<any> {
  const response = await fetchValuation(listing);
  const estimated_value = computeEstimatedValue(listing, response);
  const discount_percentage = (listing.listedPrice - estimated_value) / listing.listedPrice;

  return {
    estimated_value,
    discount_percentage,
  };
}

export async function getValuations(listings: ParsedListing[]) {
  const valuations = await Promise.all(
    listings.map(async (listing) => {
      return await getValuation(listing);
    }),
  );
  return valuations;
}
