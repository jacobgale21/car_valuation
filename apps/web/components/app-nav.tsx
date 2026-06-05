'use client';

import { Car, CalendarClock, LayoutDashboard, List, Search, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * Navigation items for the main app shell.
 * Each entry maps a route to a label and icon (from lucide-react, bundled with shadcn/ui).
 */
const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/listings', label: 'Listings', icon: List },
  { href: '/shortlist', label: 'Shortlist', icon: Star },
  { href: '/search-configuration', label: 'Search Configuration', icon: Search },
  { href: '/scheduling', label: 'Scheduling', icon: CalendarClock },
] as const;

/**
 * Top navigation bar shared across every app page.
 *
 * shadcn/ui pattern used here: Button with `asChild` lets the Button styles wrap a
 * Next.js <Link> without rendering an extra <button> inside an <a> (invalid HTML).
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* App branding */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Car className="size-5" aria-hidden />
          <span>Vehicle Scout</span>
        </Link>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        {/* Primary navigation — highlight the active route */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Main">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <Button
                key={href}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                asChild
                className={cn('shrink-0', isActive && 'font-medium')}
              >
                <Link href={href}>
                  <Icon className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
