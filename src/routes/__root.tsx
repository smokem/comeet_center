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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
// Shared QueryClient
// ---------------------------------------------------------------------------

const queryClient = new QueryClient();

// ---------------------------------------------------------------------------
// Loader helper — per-fetch 2 s timeout that resolves to the default value
// so a slow document never blocks the other fetch or the page render.
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ---------------------------------------------------------------------------
// Contexts — two separate contexts so a comingSoon change never re-renders
// business-hours consumers and vice-versa.
// ---------------------------------------------------------------------------

export const BusinessHoursContext = createContext<BusinessHoursSettings>(DEFAULT_BUSINESS_HOURS);
export const ComingSoonContext     = createContext<ComingSoonSettings>(DEFAULT_SETTINGS);

/** Hook for components that display business hours (Header, Timeline, Contact…) */
export function useBusinessHours() { return useContext(BusinessHoursContext); }

/** Hook for the coming-soon gate check — only used in RootComponent itself. */
export function useComingSoon()    { return useContext(ComingSoonContext); }

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
  loader: async (): Promise<{
    comingSoon: ComingSoonSettings;
    businessHours: BusinessHoursSettings;
  }> => {
    // Each fetch races against a 2 s timeout that resolves to its default.
    // Promise.all is still used so both fetches run in parallel — neither
    // blocks the other, and a slow network degrades to defaults in 2 s.
    const [comingSoon, businessHours] = await Promise.all([
      withTimeout(getComingSoonSettings(), { ...DEFAULT_SETTINGS }),
      withTimeout(getBusinessHours(),      { ...DEFAULT_BUSINESS_HOURS }),
    ]);
    return { comingSoon, businessHours };
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
      { rel: "preconnect", href: "https://res.cloudinary.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      {
        // Preload the hero LCP image at the width used on desktop (1280w).
        rel:  "preload",
        href: "https://res.cloudinary.com/jhaaukjn/image/upload/f_auto,q_auto,w_1280/accueil-du-centre",
        as:   "image",
        imageSizes:  "(min-width: 1024px) 50vw, 100vw",
        imageSrcSet: [480, 768, 1280]
          .map((w) => `https://res.cloudinary.com/jhaaukjn/image/upload/f_auto,q_auto,w_${w}/accueil-du-centre ${w}w`)
          .join(", "),
      },
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

// ---------------------------------------------------------------------------
// RootComponent
// ---------------------------------------------------------------------------

// How long to wait between background refetches (milliseconds).
const REFETCH_COOLDOWN = 60_000;

function RootComponent() {
  const { queryClient: qc } = Route.useRouteContext();
  const { comingSoon: ssrComingSoon, businessHours: ssrBusinessHours } = Route.useLoaderData();

  const [liveSettings, setLiveSettings] = useState<ComingSoonSettings>(ssrComingSoon);
  const [liveHours,    setLiveHours]    = useState<BusinessHoursSettings>(ssrBusinessHours);

  // Sync when the loader re-runs (e.g. after admin save triggers router.invalidate()).
  useEffect(() => { setLiveSettings(ssrComingSoon); }, [ssrComingSoon]);
  useEffect(() => { setLiveHours(ssrBusinessHours); }, [ssrBusinessHours]);

  // Timestamp of the last background refetch — used to enforce the cooldown.
  const lastRefetch = useRef<number>(0);

  const refetch = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetch.current < REFETCH_COOLDOWN) return;
    lastRefetch.current = now;

    getComingSoonSettings()
      .then(setLiveSettings)
      .catch(() => {/* keep current value */});

    getBusinessHours()
      .then(setLiveHours)
      .catch(() => {/* keep current value */});
  }, []);

  // Refetch on window focus and on tab becoming visible — no polling.
  useEffect(() => {
    // visibilitychange fires when the user switches back to this tab.
    const onVisible = () => { if (document.visibilityState === "visible") refetch(); };
    // focus fires when the window regains focus (e.g. alt-tab back).
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refetch);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refetch);
    };
  }, [refetch]);

  const isAdminRoute   = useMatch({ from: "/admin", shouldThrow: false });
  const showComingSoon = !isAdminRoute && shouldShowComingSoon(liveSettings);

  if (showComingSoon) {
    return (
      <QueryClientProvider client={qc}>
        <ComingSoon settings={liveSettings} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={qc}>
      {/*
        Two separate providers so:
        - A comingSoon change only re-renders ComingSoonContext consumers.
        - A businessHours change only re-renders BusinessHoursContext consumers.
        Header/Timeline/Contact consume BusinessHoursContext and are unaffected
        by coming-soon state changes.
      */}
      <ComingSoonContext.Provider value={liveSettings}>
        <BusinessHoursContext.Provider value={liveHours}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </BusinessHoursContext.Provider>
      </ComingSoonContext.Provider>
    </QueryClientProvider>
  );
}
