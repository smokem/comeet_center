/**
 * FaqSection.tsx
 *
 * Animated FAQ accordion — native <details>/<summary> semantics,
 * smooth open/close via Web Animations API on the CONTENT div only.
 *
 * Key design decision:
 *   We animate the inner content wrapper, NOT the <details> element.
 *   This means the <summary> (title) is completely static — no layout
 *   shifts, no flickering, no covering.
 *
 *   Open:  content div animates from height 0 → scrollHeight
 *   Close: content div animates from scrollHeight → 0, then [open] removed
 *
 * prefers-reduced-motion: skips animation, flips state instantly.
 * SSR: all answers are in the initial HTML (works without JS).
 */
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import { type FaqItem } from "@/data/faq";
import { safeJson, SITE_URL } from "@/lib/seo";

const DURATION = 280;
const EASING   = "cubic-bezier(0.4, 0, 0.2, 1)";

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ---------------------------------------------------------------------------
// Single item
// ---------------------------------------------------------------------------
function FaqItem({ question, answer }: FaqItem) {
  const detailsRef  = useRef<HTMLDetailsElement>(null);
  const innerRef    = useRef<HTMLDivElement>(null);
  const animRef     = useRef<Animation | null>(null);

  function open() {
    const details = detailsRef.current;
    const inner   = innerRef.current;
    if (!details || !inner) return;

    // Make the element visible before measuring
    details.open = true;

    if (prefersReduced()) return;

    animRef.current?.cancel();
    const target = inner.scrollHeight;

    animRef.current = inner.animate(
      [
        { height: "0px", opacity: "0" },
        { height: `${target}px`, opacity: "1" },
      ],
      { duration: DURATION, easing: EASING, fill: "forwards" },
    );
    animRef.current.onfinish = () => {
      // Remove inline styles so natural layout takes over (handles resize)
      inner.style.height  = "";
      inner.style.opacity = "";
      animRef.current = null;
    };
  }

  function close() {
    const details = detailsRef.current;
    const inner   = innerRef.current;
    if (!details || !inner) return;

    if (prefersReduced()) {
      details.open = false;
      return;
    }

    animRef.current?.cancel();
    const start = inner.scrollHeight;

    animRef.current = inner.animate(
      [
        { height: `${start}px`, opacity: "1" },
        { height: "0px", opacity: "0" },
      ],
      { duration: DURATION, easing: EASING, fill: "forwards" },
    );
    animRef.current.onfinish = () => {
      details.open    = false;
      inner.style.height  = "";
      inner.style.opacity = "";
      animRef.current = null;
    };
  }

  function handleToggle(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    const details = detailsRef.current;
    if (!details) return;
    details.open ? close() : open();
  }

  return (
    <details ref={detailsRef} className="group border-b border-border last:border-b-0">
      <summary
        onClick={handleToggle}
        className={[
          // Reset
          "[&::-webkit-details-marker]:hidden select-none list-none",
          // Layout — title stays put, chevron pushed to the right
          "flex cursor-pointer items-center justify-between gap-4",
          "min-h-14 py-4",
          // Typography
          "font-display text-base font-semibold text-foreground",
          // Focus ring
          "rounded-sm focus-visible:outline focus-visible:outline-2",
          "focus-visible:outline-primary focus-visible:outline-offset-2",
        ].join(" ")}
      >
        <span>{question}</span>
        <ChevronDown
          aria-hidden="true"
          className={[
            "size-5 shrink-0 text-muted-foreground",
            "transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            "group-open:rotate-180",
            "motion-reduce:transition-none",
          ].join(" ")}
        />
      </summary>

      {/*
        The content wrapper starts with overflow:hidden so nothing bleeds
        outside during the height animation. Once open it returns to visible
        so text selection, sticky elements, etc. work normally.
      */}
      <div
        ref={innerRef}
        className="overflow-hidden group-open:overflow-visible"
      >
        <p className="pb-5 pt-1 text-sm leading-7 text-muted-foreground">
          {answer}
        </p>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// JSON-LD (FAQPage)
// ---------------------------------------------------------------------------
function faqJsonLd(items: FaqItem[]): string {
  return safeJson({
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: items.map((item) => ({
      "@type":          "Question",
      name:             item.question,
      acceptedAnswer:   { "@type": "Answer", text: item.answer },
    })),
  });
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="container-page py-20" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd(items) }}
      />

      <div className="mb-10">
        <p className="text-label-sm uppercase text-secondary">FAQ</p>
        <h2 id="faq-heading" className="mt-2 text-headline-lg">
          Questions fréquentes
        </h2>
      </div>

      <div>
        {items.map((item, i) => (
          <FaqItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Autre question ?{" "}
        <a
          href={`${SITE_URL}/contact`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Écrivez-nous
        </a>{" "}
        ou appelez le{" "}
        <a
          href="tel:+21692489103"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          +216 92 489 103
        </a>
        .
      </p>
    </section>
  );
}
