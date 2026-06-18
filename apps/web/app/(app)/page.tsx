'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Bookmark, ExternalLink, Loader2, Radar, ScanSearch, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LISTINGS_QUERY_KEY, useListings } from '@/hooks/use-listings';
import { runSearchAndFetchListings } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { BestDeal } from '@/stores/dashboard-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { VehicleListing } from '@/stores/listings-store';

function formatScanTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) return `Today, ${time}`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMiles(miles: number): string {
  return new Intl.NumberFormat('en-US').format(miles);
}

function toBestDeal(listing: VehicleListing): BestDeal {
  return {
    id: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    miles: listing.miles,
    platform: listing.platform,
    location: listing.location,
    listedPrice: listing.listedPrice,
    discountPercentage: listing.discountPercentage,
    url: listing.url,
  };
}

/** One row inside the Best Deals card. */
function BestDealRow({ deal, className }: { deal: BestDeal; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-4', className)}>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="leading-snug font-medium">
          {deal.make} {deal.year} {deal.model}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatMiles(deal.miles)} mi · {deal.platform} · {deal.location}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{formatPrice(deal.listedPrice)}</p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {deal.discountPercentage.toFixed(1)}% off
          </p>
        </div>

        <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
          <a href={deal.url} target="_blank" rel="noopener noreferrer" aria-label="View listing">
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const savedDealsCount = useDashboardStore((state) => state.savedDealsCount);
  const dealsFoundToday = useDashboardStore((state) => state.dealsFoundToday);
  const recentScans = useDashboardStore((state) => state.recentScans);
  const recordScan = useDashboardStore((state) => state.recordScan);

  const { data: listings = [], isLoading: listingsLoading } = useListings();

  const bestDeals = useMemo(
    () =>
      [...listings]
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8)
        .map(toBestDeal),
    [listings],
  );

  const searchMutation = useMutation({
    mutationFn: runSearchAndFetchListings,
    onSuccess: (fetchedListings) => {
      queryClient.setQueryData(LISTINGS_QUERY_KEY, fetchedListings);
      recordScan(fetchedListings.length);
    },
  });

  const searchInProgress = searchMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your saved deals, today&apos;s finds, and recent scans.
          </p>
        </div>

        <Button onClick={() => searchMutation.mutate()} disabled={searchInProgress} size="lg">
          {searchInProgress ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Searching…
            </>
          ) : (
            <>
              <ScanSearch aria-hidden />
              Run Search
            </>
          )}
        </Button>
      </div>

      {searchMutation.isError ? (
        <p className="text-destructive text-sm">
          Search failed. Ensure the API is running, Search Configuration is saved, and Apify env
          vars are set.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium">Deals Saved</CardTitle>
            <Bookmark className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{savedDealsCount}</p>
            <CardDescription>On your shortlist</CardDescription>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium">Found Today</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{dealsFoundToday}</p>
            <CardDescription>Deals discovered since midnight</CardDescription>
          </CardContent>
        </Card>

        <Card className="gap-0 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium">Latest Scan</CardTitle>
            <Radar className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{recentScans[0]?.dealsFound ?? 0}</p>
            <CardDescription>Deals in most recent search</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <Card className="gap-0">
          <CardHeader className="pb-3">
            <CardTitle>Best Recent Deals</CardTitle>
            <CardDescription>Top listings sorted by discount from your latest search.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-0 pt-2">
            {searchInProgress || listingsLoading ? (
              <p className="text-muted-foreground text-sm">Loading listings…</p>
            ) : bestDeals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No deals yet. Run a search to find vehicles.
              </p>
            ) : (
              bestDeals.map((deal, index) => (
                <div key={deal.id}>
                  <BestDealRow deal={deal} className={index === 0 ? 'pt-2' : undefined} />
                  {index < bestDeals.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="h-fit gap-0 lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Scans</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-0 pt-2">
            {recentScans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No scans yet. Click &quot;Run Search&quot; to start.
              </p>
            ) : (
              recentScans.map((scan, index) => (
                <div key={scan.id}>
                  <div
                    className={cn(
                      'flex items-center justify-between gap-3 py-3',
                      index === 0 && 'pt-2',
                    )}
                  >
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{scan.dealsFound}</p>
                      <p className="text-muted-foreground text-xs">
                        {scan.dealsFound === 1 ? 'deal' : 'deals'} found
                      </p>
                    </div>
                    <p className="text-muted-foreground text-right text-xs leading-snug">
                      {formatScanTime(scan.completedAt)}
                    </p>
                  </div>
                  {index < recentScans.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
