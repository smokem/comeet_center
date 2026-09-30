/**
 * Shared scroll-reveal animation primitive.
 * Uses IntersectionObserver — safe in SSR (no-ops server-side).
 */
import { useEffect, useRef, useState } from "react";

export function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible=true so content renders immediately if JS/observer never fires.
  // We flip to false only once we know the element is genuinely off-screen.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: reveal after 1 s regardless — covers in-app browsers (WKWebView,
    // Messenger, Instagram) where IntersectionObserver fires late or not at all.
    const fallback = setTimeout(() => setVisible(true), 1000);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          clearTimeout(fallback);
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);

    // If the element is already in the viewport on mount (common for above-fold
    // content), IntersectionObserver still fires asynchronously — check now.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      clearTimeout(fallback);
      setVisible(true);
      obs.disconnect();
    }

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [threshold]);

  return { ref, visible };
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
