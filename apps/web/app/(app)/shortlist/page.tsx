'use client';

import { ChevronDown, ExternalLink, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteSavedListing,
  useSavedListings,
  useUpdateSavedListingNotes,
} from '@/hooks/use-saved-listings';
import { cn } from '@/lib/utils';
import type { VehicleListing } from '@/stores/listings-store';

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

function formatHoursSinceSaved(savedAt: Date): string {
  const hours = Math.max(1, Math.floor((Date.now() - savedAt.getTime()) / (1000 * 60 * 60)));
  return hours === 1 ? 'Saved 1 hour ago' : `Saved ${hours} hours ago`;
}

function getAmountSaved(listing: VehicleListing): number {
  return listing.estimatedPrice - listing.listedPrice;
}

export default function ShortlistPage() {
  const { data: savedListings = [], isLoading } = useSavedListings();
  const deleteSavedListingMutation = useDeleteSavedListing();
  const updateNotes = useUpdateSavedListingNotes();

  const deletingListingId =
    deleteSavedListingMutation.isPending && deleteSavedListingMutation.variables
      ? deleteSavedListingMutation.variables
      : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Shortlist</h1>
        <p className="text-muted-foreground">
          Vehicles you have saved for follow-up. Expand a row for details and notes.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">Loading saved listings…</p>
          </CardContent>
        </Card>
      ) : savedListings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No saved vehicles yet. Use the Save button on the Listings page to add one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {savedListings.map((saved) => {
            const { listing } = saved;
            const amountSaved = getAmountSaved(listing);
            const isDeleting = deletingListingId === listing.id;

            return (
              <Card key={saved.id} className="gap-0 py-0">
                <Collapsible className="group">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            aria-label="Show listing details"
                          >
                            <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {listing.year} {listing.make} {listing.model}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {formatMiles(listing.miles)} ·{' '}
                                  {formatHoursSinceSaved(saved.savedAt)}
                                </p>
                              </div>

                              <div className="shrink-0">
                                <p className="font-semibold">{formatPrice(listing.listedPrice)}</p>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  {listing.discountPercentage.toFixed(1)}% saved ·{' '}
                                  {formatPrice(amountSaved)} below market
                                </p>
                              </div>
                            </div>

                            <p className="text-muted-foreground shrink-0 text-sm">
                              {listing.platform} · {listing.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
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
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive size-8"
                          disabled={isDeleting}
                          onClick={() => deleteSavedListingMutation.mutate(listing.id)}
                          aria-label="Remove from shortlist"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <CollapsibleContent
                      className={cn(
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                      )}
                    >
                      <Separator />
                      <div className="space-y-4 p-4 pt-3">
                        <div>
                          <p className="text-sm font-medium">Estimated market value</p>
                          <p className="text-lg font-semibold">
                            {formatPrice(listing.estimatedPrice)}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {listing.description}
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor={`notes-${listing.id}`}
                            className="mb-1.5 block text-sm font-medium"
                          >
                            Notes
                          </label>
                          <Textarea
                            id={`notes-${listing.id}`}
                            placeholder="Add your own notes about this vehicle…"
                            value={saved.notes}
                            onChange={(event) => updateNotes(listing.id, event.target.value)}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
