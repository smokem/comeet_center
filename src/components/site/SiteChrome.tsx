import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const brandLogo = "/brand-logo.png";
const footerLogo = "/footer-logo.png";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/formations", label: "Formations" },
  { to: "/a-propos", label: "Le centre" },
  { to: "/contact", label: "Contact" },
] as const;

const WA_HREF = "https://wa.me/21692489103";

function WhatsAppButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={WA_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white shadow-level-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-level-3 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={compact ? "size-3.5" : "size-4"}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.847L0 24l6.335-1.508A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.214-3.722.886.935-3.612-.235-.372A9.818 9.818 0 1 1 12 21.818z" />
      </svg>
      Nous appeler
    </a>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center">
      <img
        src={brandLogo}
        alt="Co.meet Space"
        className={`w-auto object-contain transition-all duration-300 ${
          small ? "h-9 max-w-[160px]" : "h-12 max-w-[220px] md:h-14"
        }`}
      />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/95 shadow-level-2 backdrop-blur-xl"
          : "border-b border-transparent bg-background/80 backdrop-blur-xl"
      }`}
    >
      <div
        className={`container-page flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14 py-2" : "h-18 py-4"
        }`}
      >
        <Logo small={scrolled} />

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
          <WhatsAppButton compact={scrolled} />
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
          <div className="mt-2 px-2 pb-1">
            <WhatsAppButton />
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img
            src={footerLogo}
            alt="Co.meet Space"
            className="h-12 w-auto max-w-[220px] object-contain"
          />
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            Centre de formation professionnelle à Sfax. Formations courtes,
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
            <li>Rte de Mahdia Km 5.5, Sfax</li>
            <li>contact@comeetspace.com</li>
            <li>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground"
              >
                +216 92 489 103
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-primary-foreground/10 py-5 text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Co.meet Space — Organisme de formation à Sfax
      </div>
    </footer>
  );
}
