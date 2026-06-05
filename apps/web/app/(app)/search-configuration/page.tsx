'use client';

import { CheckCircle2, MapPin, Percent, Save, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TagInput } from '@/components/search-config/tag-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  MARKETPLACE_OPTIONS,
  SUGGESTED_MAKES,
  useSearchConfigStore,
} from '@/stores/search-config-store';

function formatSavedTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Search Configuration — define platforms, vehicle targets, location, and deal thresholds.
 * All state lives in Zustand until the backend SearchConfig API is wired up.
 */
export default function SearchConfigurationPage() {
  const config = useSearchConfigStore((state) => state.config);
  const lastSavedAt = useSearchConfigStore((state) => state.lastSavedAt);
  const setConfig = useSearchConfigStore((state) => state.setConfig);
  const togglePlatform = useSearchConfigStore((state) => state.togglePlatform);
  const addMake = useSearchConfigStore((state) => state.addMake);
  const removeMake = useSearchConfigStore((state) => state.removeMake);
  const addModel = useSearchConfigStore((state) => state.addModel);
  const removeModel = useSearchConfigStore((state) => state.removeModel);
  const saveConfiguration = useSearchConfigStore((state) => state.saveConfiguration);

  const [justSaved, setJustSaved] = useState(false);

  const activeFilterCount = useMemo(() => {
    return (
      config.platforms.length +
      config.makes.length +
      config.models.length +
      2 + // year range
      1 // mileage
    );
  }, [config]);

  const handleSave = () => {
    saveConfiguration();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-muted-foreground size-6" aria-hidden />
          <h1 className="text-3xl font-bold tracking-tight">Search Configuration</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Define the vehicles you want to monitor and the deal thresholds that qualify a listing as
          worth reviewing. Your scout will scan selected marketplaces and surface matches that meet
          these criteria.
        </p>
        <p className="text-muted-foreground text-sm">
          {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'} configured
        </p>
      </div>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="size-4" aria-hidden />
            Listing Platforms
          </CardTitle>
          <CardDescription>
            Choose which online marketplaces Vehicle Scout should search. Each platform can be
            enabled or disabled independently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {MARKETPLACE_OPTIONS.map((platform) => {
              const checked = config.platforms.includes(platform);
              const checkboxId = `platform-${platform.replace(/\s+/g, '-').toLowerCase()}`;

              return (
                <div
                  key={platform}
                  className="hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-4 transition-colors"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={checkboxId} className="cursor-pointer font-medium">
                      {platform}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Include listings posted on {platform}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle targeting — largest section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle Targeting</CardTitle>
          <CardDescription>
            Specify makes, models, model years, and mileage limits. Only vehicles matching these
            criteria will appear in your results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <TagInput
            id="makes-input"
            label="Makes"
            description="Add one make at a time. Press Enter or click away to confirm each entry."
            placeholder="e.g. Toyota"
            tags={config.makes}
            suggestions={SUGGESTED_MAKES}
            onAdd={addMake}
            onRemove={removeMake}
          />

          <Separator />

          <TagInput
            id="models-input"
            label="Models"
            description="Target specific models across your selected makes."
            placeholder="e.g. Camry"
            tags={config.models}
            onAdd={addModel}
            onRemove={removeModel}
          />

          <Separator />

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="year-min">Minimum year</Label>
              <Input
                id="year-min"
                type="number"
                min={1980}
                max={config.yearMax}
                value={config.yearMin}
                onChange={(event) =>
                  setConfig({ yearMin: Number(event.target.value) || config.yearMin })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year-max">Maximum year</Label>
              <Input
                id="year-max"
                type="number"
                min={config.yearMin}
                max={new Date().getFullYear() + 1}
                value={config.yearMax}
                onChange={(event) =>
                  setConfig({ yearMax: Number(event.target.value) || config.yearMax })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-mileage">Maximum mileage</Label>
              <Input
                id="max-mileage"
                type="number"
                min={0}
                step={1000}
                value={config.maxMileage}
                onChange={(event) =>
                  setConfig({ maxMileage: Number(event.target.value) || config.maxMileage })
                }
              />
              <p className="text-muted-foreground text-xs">Odometer must be at or below this value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="size-4" aria-hidden />
            Search Location
          </CardTitle>
          <CardDescription>
            Results are geographically constrained to a radius around your ZIP code — similar to how
            most marketplace apps limit local inventory searches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zip-code">ZIP code</Label>
              <Input
                id="zip-code"
                inputMode="numeric"
                maxLength={5}
                placeholder="78701"
                value={config.zipCode}
                onChange={(event) =>
                  setConfig({ zipCode: event.target.value.replace(/\D/g, '').slice(0, 5) })
                }
              />
              <p className="text-muted-foreground text-xs">Center point for your search area</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius (miles)</Label>
              <Input
                id="radius"
                type="number"
                min={5}
                max={500}
                step={5}
                value={config.radius}
                onChange={(event) =>
                  setConfig({ radius: Number(event.target.value) || config.radius })
                }
              />
              <p className="text-muted-foreground text-xs">
                Search within {config.radius} miles of {config.zipCode || 'your ZIP code'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="size-4" aria-hidden />
            Deal Thresholds
          </CardTitle>
          <CardDescription>
            A listing qualifies as a good deal if it meets <strong>either</strong> threshold below
            — percentage discount or fixed dollar savings versus estimated market value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vehicle Scout compares each listing price to an estimated market value. If the price
              is at least your percentage threshold <em>or</em> your dollar threshold below that
              estimate, the listing is flagged as a deal.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount-percent">Minimum discount (%)</Label>
              <div className="relative">
                <Input
                  id="discount-percent"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={config.discountPercent}
                  onChange={(event) =>
                    setConfig({
                      discountPercent: Number(event.target.value) || config.discountPercent,
                    })
                  }
                  className="pr-8"
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                  %
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                e.g. {config.discountPercent}% below market value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-dollar">Minimum savings ($)</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  $
                </span>
                <Input
                  id="discount-dollar"
                  type="number"
                  min={0}
                  step={100}
                  value={config.discountDollar}
                  onChange={(event) =>
                    setConfig({
                      discountDollar: Number(event.target.value) || config.discountDollar,
                    })
                  }
                  className="pl-7"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                e.g. at least ${config.discountDollar.toLocaleString()} under market
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="bg-background sticky bottom-0 -mx-4 border-t px-4 py-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            {justSaved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" aria-hidden />
                Configuration saved
                {lastSavedAt && ` at ${formatSavedTime(lastSavedAt)}`}
              </span>
            ) : lastSavedAt ? (
              `Last saved at ${formatSavedTime(lastSavedAt)}`
            ) : (
              'Changes are not saved until you click Save Configuration.'
            )}
          </div>

          <Button size="lg" onClick={handleSave} className="w-full sm:w-auto">
            <Save aria-hidden />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
