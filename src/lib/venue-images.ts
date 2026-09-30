// ---------------------------------------------------------------------------
// Shared venue photo list — Cloudinary edition.
//
// Each entry uses a Cloudinary publicId (no folder prefix, no extension).
// URLs are built at render time by src/lib/cdn.ts.
//
// width / height are the intrinsic pixel dimensions of the original upload.
// They give the browser the aspect ratio before the image loads (prevents CLS).
//
// Validated by: npm run check:cdn
// ---------------------------------------------------------------------------

export type VenueImage = {
  /** Cloudinary public ID — no path prefix, no extension, no version segment. */
  publicId: string;
  /** Human caption shown in carousels (accents OK). */
  label: string;
  /** Concise alt text for screen readers (accents OK). */
  alt: string;
  /** Intrinsic width of the original upload in pixels. */
  width: number;
  /** Intrinsic height of the original upload in pixels. */
  height: number;
};

export const VENUE_IMAGES: VenueImage[] = [
  {
    publicId: "accueil-du-centre",
    label:    "Accueil du centre",
    alt:      "Entrée et accueil du centre Co.meet Space à Sfax",
    width: 4032, height: 3024,
  },
  {
    publicId: "bibliotheque",
    label:    "Bibliothèque",
    alt:      "Bibliothèque du centre Co.meet Space",
    width: 4032, height: 3024,
  },
  {
    publicId: "bibliotheque_",
    label:    "Bibliothèque — détail",
    alt:      "Détail des rayons de la bibliothèque",
    width: 3024, height: 4032,
  },
  {
    publicId: "bibliotheque-vue",
    label:    "Bibliothèque — vue d'ensemble",
    alt:      "Vue d'ensemble de la bibliothèque",
    width: 4032, height: 3024,
  },
  {
    publicId: "coin-bibliotheque",
    label:    "Coin bibliothèque",
    alt:      "Coin lecture de la bibliothèque",
    width: 3024, height: 4032,
  },
  {
    publicId: "b7810c87-dbd1-43ab-ad0b-92ed91cde6bc",
    label:    "Coin de relaxation",
    alt:      "Espace de détente et de relaxation",
    width: 4032, height: 3024,
  },
  {
    publicId: "coworking-space",
    label:    "Espace coworking",
    alt:      "Espace de coworking ouvert toute la journée",
    width: 4032, height: 3024,
  },
  {
    publicId: "espace-attente",
    label:    "Espace d'attente",
    alt:      "Espace d'accueil et d'attente du centre",
    width: 4032, height: 3024,
  },
  {
    publicId: "salle-de-reunion",
    label:    "Salle de réunion",
    alt:      "Salle de réunion équipée",
    width: 4032, height: 3024,
  },
  {
    publicId: "salle_de_formation",
    label:    "Salle de formation",
    alt:      "Salle de formation du centre",
    width: 4032, height: 3024,
  },
  {
    publicId: "salle-formation",
    label:    "Salle de formation — vue",
    alt:      "Vue de la salle de formation",
    width: 4032, height: 3024,
  },
];

/** Look up a VenueImage by its Cloudinary publicId. */
export function venueImageById(publicId: string): VenueImage | undefined {
  return VENUE_IMAGES.find((img) => img.publicId === publicId);
}
