import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    HeadContent,
    Link,
    Outlet,
    Scripts,
    createRootRouteWithContext,
    useMatch,
    useRouter,
} from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { ComingSoon } from "@/components/site/ComingSoon";
import { Footer, Header } from "@/components/site/SiteChrome";
import {
    DEFAULT_BUSINESS_HOURS,
    DEFAULT_SETTINGS,
    getBusinessHours,
    getComingSoonSettings,
    shouldShowComingSoon,
    type BusinessHoursSettings,
    type ComingSoonSettings,
} from "@/lib/settings-api";
import appCss from "../styles.css?url";

// ---------------------------------------------------------------------------
// Business hours context — lets any page/component read live hours without
// prop-drilling. Defaults to DEFAULT_BUSINESS_HOURS so pages never crash
// if the context is somehow missing.
// ---------------------------------------------------------------------------
export const BusinessHoursContext = createContext<BusinessHoursSettings>(DEFAULT_BUSINESS_HOURS);
export function useBusinessHours() { return useContext(BusinessHoursContext); }

// ---------------------------------------------------------------------------
// Error / 404
// ---------------------------------------------------------------------------

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root route
// ---------------------------------------------------------------------------

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async (): Promise<{ comingSoon: ComingSoonSettings; businessHours: BusinessHoursSettings }> => {
    try {
      const [comingSoon, businessHours] = await Promise.all([
        getComingSoonSettings(),
        getBusinessHours(),
      ]);
      return { comingSoon, businessHours };
    } catch {
      return {
        comingSoon: { ...DEFAULT_SETTINGS },
        businessHours: { ...DEFAULT_BUSINESS_HOURS },
      };
    }
  },

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Co.meet Space — Centre de formation professionnelle à Sfax" },
      {
        name: "description",
        content:
          "Formations courtes, intra-entreprise et sur mesure animées par des praticiens. Catalogue, sessions et inscriptions en ligne.",
      },
      { name: "author", content: "Co.meet Space" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { comingSoon: ssrComingSoon, businessHours: ssrBusinessHours } = Route.useLoaderData();

  const [liveSettings, setLiveSettings] = useState<ComingSoonSettings>(ssrComingSoon);
  const [liveHours, setLiveHours] = useState<BusinessHoursSettings>(ssrBusinessHours);

  // Keep in sync with loader re-runs (triggered by router.invalidate in admin save)
  useEffect(() => { setLiveSettings(ssrComingSoon); }, [ssrComingSoon]);
  useEffect(() => { setLiveHours(ssrBusinessHours); }, [ssrBusinessHours]);

  // Background poll — catches changes made from other tabs / devices
  useEffect(() => {
    let cancelled = false;

    function refresh() {
      getComingSoonSettings()
        .then((s) => { if (!cancelled) setLiveSettings(s); })
        .catch(() => {});
      getBusinessHours()
        .then((h) => { if (!cancelled) setLiveHours(h); })
        .catch(() => {});
    }

    const id = setInterval(refresh, 3_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const isAdminRoute = useMatch({ from: "/admin", shouldThrow: false });
  const showComingSoon = !isAdminRoute && shouldShowComingSoon(liveSettings);

  if (showComingSoon) {
    return (
      <QueryClientProvider client={queryClient}>
        <ComingSoon settings={liveSettings} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BusinessHoursContext.Provider value={liveHours}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </BusinessHoursContext.Provider>
    </QueryClientProvider>
  );
}
