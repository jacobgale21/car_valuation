'use client';

import { useMutation } from '@tanstack/react-query';
import { Bookmark, ExternalLink, Loader2, Radar, ScanSearch, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BestDeal } from '@/stores/dashboard-store';
import { useDashboardStore } from '@/stores/dashboard-store';

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

/** One row inside the Best Deals card. */
function BestDealRow({ deal }: { deal: BestDeal }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      {/* Vehicle details — left */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium leading-snug">
          {deal.make} {deal.year} {deal.model}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatMiles(deal.miles)} mi · {deal.platform} · {deal.location}
        </p>
      </div>

      {/* Pricing + link — right */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{formatPrice(deal.listedPrice)}</p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {deal.discountPercentage.toFixed(1)}% off
          </p>
        </div>

        {/* Small icon button opens the listing in a new tab */}
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
  const savedDealsCount = useDashboardStore((state) => state.savedDealsCount);
  const dealsFoundToday = useDashboardStore((state) => state.dealsFoundToday);
  const recentScans = useDashboardStore((state) => state.recentScans);
  const bestDeals = useDashboardStore((state) => state.bestDeals);
  const isSearching = useDashboardStore((state) => state.isSearching);
  const runSearch = useDashboardStore((state) => state.runSearch);

  const searchMutation = useMutation({
    mutationFn: runSearch,
  });

  const searchInProgress = isSearching || searchMutation.isPending;

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deals Saved</CardTitle>
            <Bookmark className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{savedDealsCount}</p>
            <CardDescription>On your shortlist</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Found Today</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dealsFoundToday}</p>
            <CardDescription>Deals discovered since midnight</CardDescription>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Scan</CardTitle>
            <Radar className="text-muted-foreground size-4" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recentScans[0]?.dealsFound ?? 0}</p>
            <CardDescription>Deals in most recent search</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main content: best deals (wide) + recent scans sidebar (narrow, right) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <Card>
          <CardHeader>
            <CardTitle>Best Recent Deals</CardTitle>
            <CardDescription>
              Top listings sorted by discount. Mock data until the API is connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {bestDeals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No deals yet. Run a search to find vehicles.
              </p>
            ) : (
              bestDeals.map((deal, index) => (
                <div key={deal.id}>
                  <BestDealRow deal={deal} />
                  {index < bestDeals.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentScans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No scans yet. Click &quot;Run Search&quot; to start.
              </p>
            ) : (
              recentScans.map((scan, index) => (
                <div key={scan.id}>
                  <div className="flex items-center justify-between gap-3 py-3">
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
