import { AppNav } from '@/components/app-nav';

/**
 * Route group layout for the main application pages.
 * The (app) folder name is invisible in URLs — it only groups files in Next.js.
 * Every page inside this group automatically receives the navigation bar below.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
