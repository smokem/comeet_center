/**
 * image-gallery.tsx
 *
 * Accordion-style horizontal expand gallery used as a lightbox.
 *
 * Mobile (< 640 px): vertical stack — one image fills the screen, prev/next
 * touch-swipe or arrow buttons to navigate.
 * Desktop (≥ 640 px): horizontal accordion strips expand on click.
 *
 * Accessibility
 * • Body scroll locked while open (padding-right compensates for scrollbar)
 * • Escape key closes
 * • Focus trapped inside (first focusable receives focus on open, focus
 *   returns to the triggering element on close)
 * • Close button ≥ 44×44 px
 * • uses 100dvh + env(safe-area-inset-*) for notched iPhones
 * • prefers-reduced-motion: transitions disabled
 */
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React from "react";

import { Img } from "@/components/site/Img";
import { cn } from "@/lib/utils";
import type { VenueImage } from "@/lib/venue-images";

interface ImageGalleryProps {
  images: VenueImage[];
  initialIndex?: number;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Focus trap helpers
// ---------------------------------------------------------------------------
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusables(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ImageGallery({ images, initialIndex = 0, onClose }: ImageGalleryProps) {
  const [active, setActive] = React.useState(initialIndex);
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Remember the element that opened the gallery so we can restore focus.
  const triggerRef = React.useRef<Element | null>(null);

  // Swipe state for mobile navigation
  const touchStartX = React.useRef<number | null>(null);

  // Sync when caller changes initialIndex
  React.useEffect(() => {
    setActive(initialIndex);
  }, [initialIndex]);

  // ── Body scroll lock ────────────────────────────────────────────────────
  React.useEffect(() => {
    // Compensate for the scrollbar disappearing so the page doesn't jump.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, []);

  // ── Remember trigger + set initial focus ───────────────────────────────
  React.useEffect(() => {
    triggerRef.current = document.activeElement;
    // Focus the first focusable element inside the panel on next tick.
    const raf = requestAnimationFrame(() => {
      const first = getFocusables(containerRef.current!)[0];
      first?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      // Return focus to the element that opened the gallery.
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keyboard: Escape + focus trap ──────────────────────────────────────
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => (i + 1) % images.length);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => (i - 1 + images.length) % images.length);
        return;
      }
      // Focus trap: Tab / Shift+Tab cycles within the container.
      if (e.key === "Tab" && containerRef.current) {
        const focusables = getFocusables(containerRef.current);
        if (focusables.length === 0) { e.preventDefault(); return; }
        const first = focusables[0]!;
        const last  = focusables[focusables.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, images.length]);

  // ── Touch swipe (mobile) ────────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0]!.clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActive((i) => (i + 1) % images.length);
      else            setActive((i) => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  }

  const current = images[active]!;

  return (
    /* Backdrop — click outside to close */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galerie de photos"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm motion-reduce:backdrop-blur-none"
      style={{
        // Safe area for notched iPhones
        paddingTop:    "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft:   "env(safe-area-inset-left)",
        paddingRight:  "env(safe-area-inset-right)",
        // Use dynamic viewport height so the address bar doesn't clip content
        height: "100dvh",
      }}
      onClick={onClose}
    >
      {/* Inner panel — stop propagation so clicks don't close */}
      <div
        ref={containerRef}
        className="relative flex w-full max-w-5xl flex-col px-4 md:px-8"
        style={{ maxHeight: "calc(100dvh - 6rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close button (≥ 44×44 px) ───────────────────────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            {String(active + 1).padStart(2, "0")} / {images.length}
          </p>
          <button
            type="button"
            aria-label="Fermer la galerie"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* ── MOBILE (< 640 px): full-width single image + swipe ──────── */}
        <div
          className="sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div className="relative w-full overflow-hidden rounded-2xl"
               style={{ height: "min(calc(100dvh - 10rem), 480px)" }}>
            <Img
              image={current}
              sizes="100vw"
              className="h-full w-full object-cover motion-reduce:transition-none"
            />
            {/* Gradient + label */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none rounded-2xl" />
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
              <p className="font-display text-lg font-bold text-white leading-tight">{current.label}</p>
            </div>
            {/* Prev arrow — 44×44 */}
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            {/* Next arrow — 44×44 */}
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
          {/* Dot indicators */}
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full transition-all duration-300 motion-reduce:transition-none",
                  i === active ? "w-4 h-2 bg-white" : "size-2 bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP (≥ 640 px): horizontal accordion strips ─────────── */}
        <div
          className="hidden sm:flex items-stretch gap-2 w-full overflow-hidden rounded-2xl"
          style={{ height: "min(calc(100dvh - 10rem), 460px)", touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, idx) => (
            <div
              key={image.publicId}
              role="button"
              tabIndex={0}
              aria-label={image.label}
              aria-pressed={active === idx}
              onClick={() => setActive(idx)}
              onKeyDown={(e) => e.key === "Enter" && setActive(idx)}
              className={cn(
                "relative flex-shrink-0 h-full rounded-xl overflow-hidden cursor-pointer",
                "transition-all duration-500 ease-in-out motion-reduce:transition-none",
                active === idx
                  ? "flex-[4_1_0%]"
                  : "flex-[1_1_0%] min-w-[32px] max-w-[48px]",
              )}
            >
              <Img
                image={image}
                sizes={active === idx ? "(min-width:640px) 60vw, 90vw" : "48px"}
                className="h-full w-full object-cover"
              />
              {/* Gradient + label on active strip */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 motion-reduce:transition-none",
                  active === idx ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-4 text-white transition-opacity duration-300 motion-reduce:transition-none",
                  active === idx ? "opacity-100" : "opacity-0",
                )}
              >
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {String(idx + 1).padStart(2, "0")} / {images.length}
                </p>
                <p className="mt-0.5 font-display text-lg font-bold leading-tight">
                  {image.label}
                </p>
              </div>
              {/* Slide number on inactive strips */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none",
                  active === idx ? "opacity-0" : "opacity-60",
                )}
              >
                <span className="text-[11px] font-semibold text-white">{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
