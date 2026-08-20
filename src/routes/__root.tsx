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
import { useEffect, useState, type ReactNode } from "react";

import { ComingSoon } from "@/components/site/ComingSoon";
import { Footer, Header } from "@/components/site/SiteChrome";
import {
    DEFAULT_SETTINGS,
    getComingSoonSettings,
    shouldShowComingSoon,
    type ComingSoonSettings,
} from "@/lib/settings-api";
import appCss from "../styles.css?url";

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
  loader: async (): Promise<{ comingSoon: ComingSoonSettings }> => {
    try {
      const comingSoon = await getComingSoonSettings();
      return { comingSoon };
    } catch {
      return { comingSoon: { ...DEFAULT_SETTINGS } };
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
  const { comingSoon: ssrComingSoon } = Route.useLoaderData();

  // Client-side live settings. Seeded from the SSR snapshot and kept current by:
  //   1. Syncing whenever ssrComingSoon changes (router.invalidate() after admin save)
  //   2. Polling Firestore every 3 s so other browser tabs also see changes promptly
  const [liveSettings, setLiveSettings] = useState<ComingSoonSettings>(ssrComingSoon);

  // Keep in sync with loader re-runs (triggered by router.invalidate in admin save)
  useEffect(() => {
    setLiveSettings(ssrComingSoon);
  }, [ssrComingSoon]);

  // Background poll — catches changes made from other tabs / devices
  useEffect(() => {
    let cancelled = false;

    function refresh() {
      getComingSoonSettings()
        .then((s) => { if (!cancelled) setLiveSettings(s); })
        .catch(() => { /* keep last known value on network error */ });
    }

    const id = setInterval(refresh, 3_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // useMatch is evaluated on both server and client from the router's matched
  // route tree — SSR and hydration always produce the same result, no window.location.
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
