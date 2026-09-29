// ---------------------------------------------------------------------------
// Shared venue photo list — single source of truth for all pages.
// Update this array to add/remove photos across the whole site at once.
// Labels shown as captions — filename without the .webp extension.
// ---------------------------------------------------------------------------

export type VenueImage = { src: string; label: string };

export const VENUE_IMAGES: VenueImage[] = [
  { src: "/venue/bibliothek.webp",         label: "bibliothek" },
  { src: "/venue/bibliothek ..webp",        label: "bibliothek ." },
  { src: "/venue/bibliothek-.webp",         label: "bibliothek-" },
  { src: "/venue/coin bibliothek.webp",     label: "coin bibliothek" },
  { src: "/venue/coin de ralaxation.webp",  label: "coin de ralaxation" },
  { src: "/venue/Coworking space.webp",     label: "Coworking space" },
  { src: "/venue/espace d'attente.webp",    label: "espace d'attente" },
  { src: "/venue/IMG_4061.webp",            label: "IMG_4061" },
  { src: "/venue/Salle de reunion.webp",    label: "Salle de reunion" },
  { src: "/venue/Training room 1.webp",     label: "Training room 1" },
  { src: "/venue/Training room 2.webp",     label: "Training room 2" },
];
