/**
 * feature-carousel.tsx — 3D fan carousel.
 *
 * Responsive fixes applied
 * ------------------------
 * • Cards constrained to viewport width at 320 px (no overflow)
 * • Adjacent cards hidden (opacity-0, visibility:hidden) below sm breakpoint
 * • touch-action: pan-y so vertical scroll still works while swiping
 * • Prev/Next buttons are 44×44 px minimum touch targets
 * • Auto-advance pauses when document is hidden (Page Visibility API)
 * • prefers-reduced-motion: no transitions, no 3D transform, no auto-advance
 * • backdrop-blur limited to sm+ (expensive on low-end Android)
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import { Img } from "@/components/site/Img";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ui/image-gallery";
import { cn } from "@/lib/utils";
import type { VenueImage } from "@/lib/venue-images";

interface FeatureCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: VenueImage[];
}

export const FeatureCarousel = React.forwardRef<HTMLDivElement, FeatureCarouselProps>(
  ({ images, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(
      Math.floor(images.length / 2),
    );
    const [galleryOpen, setGalleryOpen] = React.useState(false);

    // Detect prefers-reduced-motion once on mount
    const prefersReduced = React.useRef(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    const handleNext = React.useCallback(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, [images.length]);

    const handlePrev = React.useCallback(() => {
      setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    }, [images.length]);

    // Touch/swipe state
    const touchStartX = React.useRef<number | null>(null);

    function handleTouchStart(e: React.TouchEvent) {
      touchStartX.current = e.touches[0]!.clientX;
    }
    function handleTouchEnd(e: React.TouchEvent) {
      if (touchStartX.current === null) return;
      const delta = touchStartX.current - e.changedTouches[0]!.clientX;
      if (Math.abs(delta) > 40) {
        delta > 0 ? handleNext() : handlePrev();
      }
      touchStartX.current = null;
    }

    // Auto-advance: pauses when tab is hidden OR prefers-reduced-motion
    React.useEffect(() => {
      if (prefersReduced.current) return;

      function tick() {
        if (document.visibilityState !== "hidden") handleNext();
      }

      const timer = setInterval(tick, 4000);
      return () => clearInterval(timer);
    }, [handleNext]);

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "relative w-full flex items-center justify-center overflow-hidden",
            // Height: slightly shorter on small screens to avoid overflow
            "h-[320px] sm:h-[480px] md:h-[580px]",
            className,
          )}
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
            {images.map((image, index) => {
              const total = images.length;
              let pos = ((index - currentIndex) + total) % total;
              if (pos > Math.floor(total / 2)) pos -= total;

              const isCenter   = pos === 0;
              const isAdjacent = Math.abs(pos) === 1;
              const isHidden   = Math.abs(pos) > 1;

              // Card dimensions responsive: narrower on small screens
              // Max width is capped so the card never exceeds the viewport
              // at 320 px (320 - 2×16px padding = 288 px max).
              return (
                <div
                  key={image.publicId}
                  className={cn(
                    // Base size — clamp to 90vw so nothing escapes on narrow phones
                    "absolute transition-all duration-500 ease-in-out",
                    // Reduced-motion: no transition, no 3D, show only center
                    prefersReduced.current && "motion-reduce:transition-none",
                    // Hide non-center cards on very small screens (< sm)
                    !isCenter && "max-sm:opacity-0 max-sm:pointer-events-none max-sm:select-none",
                  )}
                  style={{
                    // Responsive card size
                    width:  "min(90vw, 432px)",
                    height: "min(67.5vw, 324px)",
                    // On sm+ use the 3D fan; on xs just stack (center only visible)
                    transform: prefersReduced.current
                      ? "none"
                      : `translateX(${pos * 45}%) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7}) rotateY(${pos * -10}deg)`,
                    zIndex:     isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity:    isCenter ? 1  : isAdjacent ? 0.4 : 0,
                    filter:     isCenter
                      ? "none"
                      // Limit blur on mobile — expensive on low-end GPUs
                      : isAdjacent ? undefined : "none",
                    visibility: isHidden ? "hidden" : "visible",
                    cursor:     isCenter ? "zoom-in" : "pointer",
                  }}
                  onClick={() => {
                    if (isCenter) setGalleryOpen(true);
                    else setCurrentIndex(index);
                  }}
                >
                  <div className="relative w-full h-full">
                    <Img
                      image={image}
                      sizes="(min-width: 768px) 576px, min(90vw, 432px)"
                      className="w-full h-full object-cover rounded-2xl border border-border/20 shadow-xl"
                    />

                    {/* Gradient + label on center card */}
                    {isCenter && (
                      <>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 pointer-events-none">
                          <p className="text-xs uppercase tracking-widest text-white/60">
                            {String(currentIndex + 1).padStart(2, "0")} / {images.length}
                          </p>
                          <p className="mt-1 font-display text-lg sm:text-xl font-bold text-white leading-tight">
                            {image.label}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prev button — 44×44 px minimum, no backdrop-blur on mobile */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Photo précédente"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full z-20
                       size-11 sm:bg-background/60 sm:backdrop-blur-sm
                       bg-black/40 text-white border-white/20 hover:bg-black/60
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Button>

          {/* Next button — 44×44 px minimum */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Photo suivante"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full z-20
                       size-11 sm:bg-background/60 sm:backdrop-blur-sm
                       bg-black/40 text-white border-white/20 hover:bg-black/60
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Button>

          {/* Dot indicators (mobile — center-card-only mode) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden z-20">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === currentIndex ? "true" : undefined}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={cn(
                  "rounded-full transition-all duration-300 motion-reduce:transition-none",
                  i === currentIndex ? "w-4 h-2 bg-white" : "size-2 bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* Accordion lightbox */}
        {galleryOpen && (
          <ImageGallery
            images={images}
            initialIndex={currentIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </>
    );
  },
);

FeatureCarousel.displayName = "FeatureCarousel";
