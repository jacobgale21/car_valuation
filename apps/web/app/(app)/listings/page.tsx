'use client';

import { ArrowDown, ArrowUp, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListings } from '@/hooks/use-listings';
import {
  useDeleteSavedListing,
  useSaveListing,
  useSavedListingIds,
} from '@/hooks/use-saved-listings';
import {
  getMakeOptions,
  getPlatformOptions,
  type VehicleListing,
} from '@/stores/listings-store';

const ALL_PLATFORMS = 'all-platforms';
const ALL_MAKES = 'all-makes';

/** Sort order for the Posted column — newest = smallest hours ago. */
type PostedSort = 'newest' | 'oldest';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMiles(miles: number): string {
  return `${new Intl.NumberFormat('en-US').format(miles)} mi`;
}

/** Converts a posted Date into "X hours ago" for the table. */
function formatHoursAgo(posted: Date): string {
  const hours = Math.max(1, Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60)));
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}

function getAmountSaved(listing: VehicleListing): number {
  return listing.estimatedPrice - listing.listedPrice;
}

/**
 * Listings page — browse all discovered vehicles with client-side filters.
 *
 * shadcn/ui components used:
 * - Select: dropdown filters for website and make (Radix-powered)
 * - Table: column layout for listing rows
 * - Card: wraps the table in a bordered panel (matches the dashboard)
 * - Button: URL link and save actions
 */
export default function ListingsPage() {
  const { data: listings = [], isLoading } = useListings();
  const savedListingIds = useSavedListingIds();
  const saveListingMutation = useSaveListing();
  const deleteSavedListingMutation = useDeleteSavedListing();

  const savingListingId =
    saveListingMutation.isPending && saveListingMutation.variables
      ? saveListingMutation.variables.id
      : null;
  const deletingListingId =
    deleteSavedListingMutation.isPending && deleteSavedListingMutation.variables
      ? deleteSavedListingMutation.variables
      : null;

  const handleSaveToggle = (listing: VehicleListing) => {
    if (savedListingIds.has(listing.id)) {
      deleteSavedListingMutation.mutate(listing.id);
      return;
    }
    saveListingMutation.mutate(listing);
  };

  // Local filter state — "all" sentinel values keep every listing visible.
  const [platformFilter, setPlatformFilter] = useState(ALL_PLATFORMS);
  const [makeFilter, setMakeFilter] = useState(ALL_MAKES);
  const [postedSort, setPostedSort] = useState<PostedSort>('newest');

  const platformOptions = useMemo(() => getPlatformOptions(listings), [listings]);
  const makeOptions = useMemo(() => getMakeOptions(listings), [listings]);

  const displayedListings = useMemo(() => {
    const filtered = listings.filter((listing) => {
      const matchesPlatform =
        platformFilter === ALL_PLATFORMS || listing.platform === platformFilter;
      const matchesMake = makeFilter === ALL_MAKES || listing.make === makeFilter;
      return matchesPlatform && matchesMake;
    });

    return [...filtered].sort((a, b) => {
      const diff = b.posted.getTime() - a.posted.getTime();
      return postedSort === 'newest' ? diff : -diff;
    });
  }, [listings, platformFilter, makeFilter, postedSort]);

  const togglePostedSort = () => {
    setPostedSort((current) => (current === 'newest' ? 'oldest' : 'newest'));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
        <p className="text-muted-foreground">
          All discovered vehicles. Filter by website or make.
        </p>
      </div>

      {/* Filter row — each Select controls one dimension of the listing list */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Website</p>
          {/*
            Select value/onValueChange: controlled component pattern.
            SelectTrigger is the visible button; SelectContent holds the menu.
          */}
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All websites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PLATFORMS}>All websites</SelectItem>
              {platformOptions.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Make</p>
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MAKES}>All makes</SelectItem>
              {makeOptions.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">Loading listings…</p>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">
              No listings yet. Run a search from the Dashboard to discover vehicles.
            </p>
          ) : displayedListings.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">
              No listings match the selected filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Listing Price</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-0.5">
                      <span>Posted</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={togglePostedSort}
                        aria-label={
                          postedSort === 'newest'
                            ? 'Sorted by most recent. Click to show oldest first.'
                            : 'Sorted by oldest. Click to show most recent first.'
                        }
                        title={postedSort === 'newest' ? 'Most recent first' : 'Oldest first'}
                      >
                        {postedSort === 'newest' ? (
                          <ArrowDown className="size-3.5" aria-hidden />
                        ) : (
                          <ArrowUp className="size-3.5" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedListings.map((listing) => {
                  const isSaved = savedListingIds.has(listing.id);
                  const isSaving = savingListingId === listing.id || deletingListingId === listing.id;
                  const amountSaved = getAmountSaved(listing);

                  return (
                    <TableRow key={listing.id}>
                      {/* Year, make, model with grey location underneath */}
                      <TableCell className="whitespace-normal">
                        <p className="font-medium">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <p className="text-muted-foreground text-xs">{listing.location}</p>
                      </TableCell>

                      <TableCell>{formatMiles(listing.miles)}</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(listing.listedPrice)}
                      </TableCell>

                      {/* Discount % and dollar amount below market value */}
                      <TableCell>
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">
                          {listing.discountPercentage.toFixed(1)}% saved
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatPrice(amountSaved)} below market
                        </p>
                      </TableCell>

                      <TableCell>{formatHoursAgo(listing.posted)}</TableCell>
                      <TableCell className="whitespace-normal">{listing.platform}</TableCell>

                      {/* URL button + save toggle */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="size-8" asChild>
                            <a
                              href={listing.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open listing URL"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          </Button>

                          <Button
                            variant={isSaved ? 'secondary' : 'outline'}
                            size="sm"
                            disabled={isSaving}
                            onClick={() => handleSaveToggle(listing)}
                          >
                            {isSaving ? (
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                            ) : (
                              <Bookmark
                                className={isSaved ? 'fill-current' : undefined}
                                aria-hidden
                              />
                            )}
                            {isSaved ? 'Saved' : 'Save'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
