import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/formations", label: "Formations" },
  { to: "/a-propos", label: "Le centre" },
  { to: "/contact", label: "Contact" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="relative flex h-7 w-11 items-center">
        <span className="absolute left-0 h-7 w-7 rounded-full bg-primary" />
        <span className="absolute left-4 h-7 w-7 rounded-full bg-cta/80 mix-blend-multiply" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-primary">
        Co.meet<span className="text-cta">.</span>Space
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between py-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="group relative py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {l.label}
              <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cta opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-xl bg-cta px-4 py-2.5 text-sm font-semibold text-cta-foreground shadow-level-2 transition-transform hover:-translate-y-0.5"
          >
            Demander un devis
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border p-2 text-primary md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="container-page flex flex-col gap-1 border-t border-border/70 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-extrabold">
            Co.meet<span className="text-cta">.</span>Space
          </p>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            Centre de formation professionnelle à Lyon. Formations courtes,
            intra-entreprise et sur mesure, animées par des praticiens.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-label-sm uppercase text-inverse-primary">Navigation</p>
          <ul className="mt-4 space-y-2 text-primary-foreground/75">
            <li><Link to="/formations">Catalogue</Link></li>
            <li><Link to="/a-propos">Le centre</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-label-sm uppercase text-inverse-primary">Contact</p>
          <ul className="mt-4 space-y-2 text-primary-foreground/75">
            <li>12 rue de la Fabrique, 69002 Lyon</li>
            <li>bonjour@comeet.space</li>
            <li>04 78 00 00 00</li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-primary-foreground/10 py-5 text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Co.meet Space — Organisme de formation
        enregistré sous le n° 84 69 12345 69.
      </div>
    </footer>
  );
}
