/** Full vehicle listing — mirrors the Prisma Listing model fields used by the UI. */
export interface VehicleListing {
  id: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  location: string;
  listedPrice: number;
  estimatedPrice: number;
  discountPercentage: number;
  posted: Date;
  url: string;
  description: string;
}

export function getPlatformOptions(listings: VehicleListing[]): string[] {
  return [...new Set(listings.map((l) => l.platform))].sort();
}

export function getMakeOptions(listings: VehicleListing[]): string[] {
  return [...new Set(listings.map((l) => l.make))].sort();
}
