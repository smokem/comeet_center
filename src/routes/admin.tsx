import { createFileRoute, useRouter } from "@tanstack/react-router";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import {
    AlertTriangle, BarChart3, BookOpen, ClipboardList,
    Clock, Eye,
    LayoutDashboard, Loader2, LogIn, MapPin,
    Minus,
    PencilLine, Plus, Search, Shield, Sparkles, Trash2, Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComingSoon } from "@/components/site/ComingSoon";
import { modeLabel, type Course, type Level, type Mode, type Session } from "@/data/courses";
import { logOut, signIn, useAuth } from "@/lib/auth";
import { listCourses } from "@/lib/courses-api";
import { db } from "@/lib/firebase";
import {
    DEFAULT_BUSINESS_HOURS,
    DEFAULT_SETTINGS,
    getBusinessHours,
    getComingSoonSettings,
    saveBusinessHours,
    saveComingSoonSettings,
    type BusinessHoursSettings,
    type ComingSoonSettings,
    type CtaType,
    type ForceState,
} from "@/lib/settings-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Co.meet Space" },
      { name: "description", content: "Tableau de bord admin Co.meet Space." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

// ---------------------------------------------------------------------------
// Known categories — add new ones here as the catalogue grows
// ---------------------------------------------------------------------------
const CATEGORIES = [
  "Management",
  "Communication",
  "Numérique",
  "Bureautique",
  "Design",
];

// ---------------------------------------------------------------------------
// Draft type — mirrors Course but keeps everything as strings for form inputs,
// and carries trainer + sessions as structured sub-objects (not text blobs).
// ---------------------------------------------------------------------------
type TrainerDraft = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

type SessionDraft = {
  start: string;   // YYYY-MM-DD
  end: string;     // YYYY-MM-DD
  city: string;
  seatsLeft: string; // string for input, parsed on save
};

type CardVisibilityDraft = {
  badges: boolean;
  title: boolean;
  excerpt: boolean;
  meta: boolean;
  price: boolean;
  cta: boolean;
};

type CourseDraft = {
  title: string;
  category: string;
  level: Level;
  mode: Mode;
  durationHours: string;
  price: string;
  excerpt: string;
  description: string;
  objectivesText: string;   // one objective per line
  syllabusText: string;     // one "Title | detail" per line
  trainer: TrainerDraft;
  sessions: SessionDraft[];
  featured: boolean;
  cardTextVisibility: CardVisibilityDraft;
};

const emptyTrainer: TrainerDraft = { name: "", role: "", bio: "", initials: "" };
const emptySession: SessionDraft = { start: "", end: "", city: "Sfax", seatsLeft: "12" };

const emptyCardVisibility: CardVisibilityDraft = {
  badges: true, title: true, excerpt: true, meta: true, price: true, cta: true,
};

const emptyDraft: CourseDraft = {
  title: "", category: "Management", level: "Débutant", mode: "presentiel",
  durationHours: "7", price: "490", excerpt: "", description: "",
  objectivesText: "", syllabusText: "",
  trainer: { ...emptyTrainer },
  sessions: [],
  featured: false,
  cardTextVisibility: { ...emptyCardVisibility },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(v: string) {
  return v.toLowerCase().normalize("NFD")
    .replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

function courseToDraft(c: Course): CourseDraft {
  return {
    title: c.title,
    category: c.category,
    level: c.level,
    mode: c.mode,
    durationHours: String(c.durationHours),
    price: String(c.price),
    excerpt: c.excerpt,
    description: c.description,
    objectivesText: c.objectives.join("\n"),
    syllabusText: c.syllabus.map((s) => `${s.title} | ${s.detail}`).join("\n"),
    trainer: {
      name: c.trainer.name,
      role: c.trainer.role,
      bio: c.trainer.bio,
      initials: c.trainer.initials,
    },
    sessions: c.sessions.map((s) => ({
      start: s.start,
      end: s.end,
      city: s.city,
      seatsLeft: String(s.seatsLeft),
    })),
    featured: Boolean(c.featured),
    cardTextVisibility: {
      badges:  c.cardTextVisibility?.badges  !== false,
      title:   c.cardTextVisibility?.title   !== false,
      excerpt: c.cardTextVisibility?.excerpt !== false,
      meta:    c.cardTextVisibility?.meta    !== false,
      price:   c.cardTextVisibility?.price   !== false,
      cta:     c.cardTextVisibility?.cta     !== false,
    },
  };
}

function draftToCourse(draft: CourseDraft, existing?: Course): Course {
  const title = draft.title.trim();
  const objectives = draft.objectivesText.split("\n").map((s) => s.trim()).filter(Boolean);
  const syllabus = draft.syllabusText.split("\n").map((line, i) => {
    const [t, d] = line.split("|").map((s) => s.trim());
    return { title: t || `Module ${i + 1}`, detail: d || "À compléter" };
  }).filter((s) => s.title.length > 0);

  const sessions: Session[] = draft.sessions
    .filter((s) => s.start && s.end && s.city.trim())
    .map((s) => ({
      start: s.start,
      end: s.end,
      city: s.city.trim(),
      seatsLeft: Math.max(0, Number(s.seatsLeft) || 0),
    }));

  return {
    slug: existing?.slug ?? slugify(title),
    title,
    category: draft.category.trim(),
    level: draft.level,
    mode: draft.mode,
    durationHours: Number(draft.durationHours) || 0,
    price: Number(draft.price) || 0,
    excerpt: draft.excerpt.trim() || title,
    description: draft.description.trim() || draft.excerpt.trim() || title,
    objectives: objectives.length > 0 ? objectives : ["À définir"],
    syllabus: syllabus.length > 0 ? syllabus : [{ title: "Programme", detail: "À compléter" }],
    trainer: {
      name: draft.trainer.name.trim() || "À assigner",
      role: draft.trainer.role.trim() || "Formateur",
      bio: draft.trainer.bio.trim() || "Profil à compléter.",
      initials: draft.trainer.initials.trim() || "??",
    },
    sessions,
    featured: draft.featured,
    cardTextVisibility: draft.cardTextVisibility,
  };
}

/** Returns true when a course still has placeholder/incomplete data */
function isIncomplete(c: Course): boolean {
  return (
    c.price === 0 ||
    c.durationHours === 0 ||
    c.sessions.length === 0 ||
    c.trainer.name === "À assigner" ||
    c.trainer.name === "PLACEHOLDER" ||
    c.trainer.initials === "??"
  );
}

const actionItems = [
  "Créer ou modifier une formation",
  "Planifier une session et assigner un formateur",
  "Valider les inscriptions et gérer la liste d'attente",
  "Mettre à jour les contenus publics du site",
];

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------
const ic =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10";

// ---------------------------------------------------------------------------
// LoginScreen
// ---------------------------------------------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try { await signIn(email.trim(), password); }
    catch { setError("Identifiants invalides. Vérifie ton e-mail et mot de passe."); }
    finally { setLoading(false); }
  }

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-cta/10 animate-float-slow" />
      <div className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-inverse-primary/10 animate-float-slow [animation-delay:-4s]" />
      <div className="container-page grid min-h-[calc(100vh-5rem)] gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 text-label-sm uppercase text-inverse-primary">
            <Shield className="size-3.5" /> Espace admin
          </div>
          <h1 className="mt-6 text-display-lg">Connectez-vous pour gérer<br />les formations et sessions.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/75">
            Tableau de bord, formations, sessions, inscriptions et contenus du site.
          </p>
        </div>
        <div className="animate-fade-in-up [animation-delay:120ms]">
          <div className="surface-card bg-background p-7 text-foreground shadow-level-3">
            <div className="flex items-center gap-3 border-b border-border/70 pb-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <LogIn className="size-5" />
              </div>
              <div>
                <h2 className="text-headline-md">Connexion admin</h2>
                <p className="text-sm text-muted-foreground">Accède au dashboard de gestion.</p>
              </div>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold">E-mail</label>
                <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="username" className={ic} />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold">Mot de passe</label>
                <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" className={ic} />
              </div>
              {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading || !email || !password}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all hover:-translate-y-0.5 hover:shadow-level-2 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                {loading ? "Connexion…" : "Entrer dans le dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"formations" | "coming-soon" | "horaires">("formations");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then((items) => { setCourses(items); setLoadingCourses(false); })
      .catch(() => setLoadingCourses(false));
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === selectedSlug) ?? null,
    [courses, selectedSlug],
  );

  useEffect(() => {
    setDraft(selectedCourse ? courseToDraft(selectedCourse) : { ...emptyDraft, trainer: { ...emptyTrainer }, sessions: [], cardTextVisibility: { ...emptyCardVisibility } });
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      [c.title, c.category, c.level, modeLabel[c.mode]].join(" ").toLowerCase().includes(q),
    );
  }, [courses, search]);

  const stats = useMemo(() => {
    const featured = courses.filter((c) => c.featured).length;
    const sessions = courses.reduce((t, c) => t + c.sessions.length, 0);
    const seats = courses.reduce((t, c) => t + c.sessions.reduce((s, sess) => s + sess.seatsLeft, 0), 0);
    const avgPrice = courses.length > 0
      ? Math.round(courses.reduce((t, c) => t + c.price, 0) / courses.length)
      : 0;
    return [
      { label: "Formations actives", value: String(courses.length), icon: BookOpen },
      { label: "À la une", value: String(featured), icon: Sparkles },
      { label: "Sessions listées", value: String(sessions), icon: ClipboardList },
      { label: "Prix moyen", value: `${avgPrice} TND`, icon: BarChart3 },
      { label: "Places ouvertes", value: String(seats), icon: Users },
    ];
  }, [courses]);

  function resetDraft() {
    setSelectedSlug(null);
    setDraft({ ...emptyDraft, trainer: { ...emptyTrainer }, sessions: [], cardTextVisibility: { ...emptyCardVisibility } });
    setSaveError(null);
  }

  async function handleSaveCourse() {
    setSaving(true); setSaveError(null);
    try {
      const next = draftToCourse(draft, selectedCourse ?? undefined);
      await setDoc(doc(db, "courses", next.slug), next);
      setCourses((prev) => {
        const exists = prev.some((c) => c.slug === next.slug);
        return exists ? prev.map((c) => c.slug === next.slug ? next : c) : [next, ...prev];
      });
      setSelectedSlug(next.slug);
    } catch {
      setSaveError("Erreur lors de la sauvegarde. Vérifie ta connexion.");
    } finally { setSaving(false); }
  }

  async function handleDeleteCourse(slug: string) {
    try {
      await deleteDoc(doc(db, "courses", slug));
      setCourses((prev) => prev.filter((c) => c.slug !== slug));
      if (selectedSlug === slug) resetDraft();
    } catch { /* silent */ }
  }

  return (
    <section className="bg-sage/40 py-12">
      <div className="container-page space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-label-sm uppercase text-primary-foreground">
              <LayoutDashboard className="size-3.5" /> Dashboard admin
            </div>
            <h1 className="mt-4 text-display-lg text-primary">Piloter les formations</h1>
            <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <button type="button" onClick={() => logOut()}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent">
            Se déconnecter
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-border/70">
          {([
            { id: "formations", label: "Formations", icon: BookOpen },
            { id: "coming-soon", label: "Page d'attente", icon: Clock },
            { id: "horaires", label: "Horaires", icon: MapPin },
          ] as const).map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "formations" && (
          <FormationsTab
            courses={courses}
            loadingCourses={loadingCourses}
            filteredCourses={filteredCourses}
            stats={stats}
            selectedSlug={selectedSlug}
            selectedCourse={selectedCourse}
            draft={draft}
            setDraft={setDraft}
            search={search}
            setSearch={setSearch}
            saving={saving}
            saveError={saveError}
            handleSaveCourse={handleSaveCourse}
            handleDeleteCourse={handleDeleteCourse}
            resetDraft={resetDraft}
            setSelectedSlug={setSelectedSlug}
          />
        )}

        {activeTab === "coming-soon" && <ComingSoonTab userEmail={userEmail} />}
        {activeTab === "horaires" && <HorairesTab userEmail={userEmail} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FormationsTab
// ---------------------------------------------------------------------------
type FormationsTabProps = {
  courses: Course[];
  loadingCourses: boolean;
  filteredCourses: Course[];
  stats: { label: string; value: string; icon: React.FC<{ className?: string }> }[];
  selectedSlug: string | null;
  selectedCourse: Course | null;
  draft: CourseDraft;
  setDraft: React.Dispatch<React.SetStateAction<CourseDraft>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  saving: boolean;
  saveError: string | null;
  handleSaveCourse: () => Promise<void>;
  handleDeleteCourse: (slug: string) => Promise<void>;
  resetDraft: () => void;
  setSelectedSlug: React.Dispatch<React.SetStateAction<string | null>>;
};

function FormationsTab({
  courses: _courses,
  loadingCourses,
  filteredCourses,
  stats,
  selectedSlug,
  selectedCourse,
  draft,
  setDraft,
  search,
  setSearch,
  saving,
  saveError,
  handleSaveCourse,
  handleDeleteCourse,
  resetDraft,
  setSelectedSlug,
}: FormationsTabProps) {

  // ── Session helpers ──────────────────────────────────────────────────────
  function addSession() {
    setDraft((d) => ({ ...d, sessions: [...d.sessions, { ...emptySession }] }));
  }
  function removeSession(i: number) {
    setDraft((d) => ({ ...d, sessions: d.sessions.filter((_, idx) => idx !== i) }));
  }
  function updateSession(i: number, field: keyof SessionDraft, value: string) {
    setDraft((d) => ({
      ...d,
      sessions: d.sessions.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));
  }

  // ── Trainer helper ───────────────────────────────────────────────────────
  function updateTrainer(field: keyof TrainerDraft, value: string) {
    setDraft((d) => ({ ...d, trainer: { ...d.trainer, [field]: value } }));
  }

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((card) => (
          <article key={card.label} className="surface-card p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-level-2">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <card.icon className="size-5" />
            </div>
            <p className="mt-5 text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-primary">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.4fr]">

        {/* ── Main editor panel ─────────────────────────────────────── */}
        <div className="surface-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-lg">Gestion des formations</h2>
              <p className="mt-1 text-sm text-muted-foreground">Crée, modifie ou supprime une formation.</p>
            </div>
            <button type="button" onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent">
              <Plus className="size-4" /> Nouvelle formation
            </button>
          </div>

          {/* Search + selection indicator */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="course-search" className="mb-2 block text-sm font-semibold">Rechercher</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-4 py-3">
                <Search className="size-4 text-muted-foreground" />
                <input id="course-search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Management, Numérique…"
                  className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="rounded-2xl bg-sage/60 p-4 text-sm text-muted-foreground">
              Sélection : <span className="font-semibold text-primary">{selectedCourse?.title ?? "Nouvelle formation"}</span>
            </div>
          </div>

          {/* ── Section A: Identité ──────────────────────────────── */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Identité
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-title" className="mb-2 block text-sm font-semibold">Titre</label>
                <input id="f-title" value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-category" className="mb-2 block text-sm font-semibold">Catégorie</label>
                <select id="f-category" value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className={ic}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-level" className="mb-2 block text-sm font-semibold">Niveau</label>
                <select id="f-level" value={draft.level}
                  onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as Level }))}
                  className={ic}>
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-mode" className="mb-2 block text-sm font-semibold">Format</label>
                <select id="f-mode" value={draft.mode}
                  onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value as Mode }))}
                  className={ic}>
                  <option value="presentiel">Présentiel</option>
                  <option value="hybride">Hybride</option>
                  <option value="en-ligne">En ligne</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-hours" className="mb-2 block text-sm font-semibold">Durée (heures)</label>
                <input id="f-hours" type="number" min="0" value={draft.durationHours}
                  onChange={(e) => setDraft((d) => ({ ...d, durationHours: e.target.value }))}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-price" className="mb-2 block text-sm font-semibold">Prix (TND)</label>
                <input id="f-price" type="number" min="0" value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                  className={ic} />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
                <input type="checkbox" checked={draft.featured}
                  onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
                  className="size-4 accent-primary" />
                Mettre à la une (affiché sur la page d'accueil)
              </label>
            </div>

            {/* ── Visibility per field on the catalog card ────────── */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Visibilité sur la carte catalogue
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { key: "badges",  label: "Catégorie + format (bandeau)" },
                    { key: "title",   label: "Titre" },
                    { key: "excerpt", label: "Accroche" },
                    { key: "meta",    label: "Durée / niveau / ville" },
                    { key: "price",   label: "Prix" },
                    { key: "cta",     label: '"Voir la formation →"' },
                  ] as { key: keyof CardVisibilityDraft; label: string }[]
                ).map(({ key, label }) => (
                  <label key={key}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
                    <input type="checkbox"
                      checked={draft.cardTextVisibility[key]}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          cardTextVisibility: { ...d.cardTextVisibility, [key]: e.target.checked },
                        }))
                      }
                      className="size-4 accent-primary shrink-0" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section B: Contenu éditorial ────────────────────── */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Contenu
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="f-excerpt" className="mb-1 block text-sm font-semibold">
                  Accroche <span className="font-normal text-muted-foreground">— texte affiché sur la carte du catalogue</span>
                </label>
                <textarea id="f-excerpt" rows={2} value={draft.excerpt}
                  onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-description" className="mb-1 block text-sm font-semibold">
                  Description complète <span className="font-normal text-muted-foreground">— page de détail uniquement</span>
                </label>
                <textarea id="f-description" rows={5} value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-objectives" className="mb-1 block text-sm font-semibold">
                  Objectifs <span className="font-normal text-muted-foreground">— un objectif par ligne</span>
                </label>
                <textarea id="f-objectives" rows={4} value={draft.objectivesText}
                  onChange={(e) => setDraft((d) => ({ ...d, objectivesText: e.target.value }))}
                  placeholder={"Maîtriser X\nSavoir faire Y\nObtenir Z"}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-syllabus" className="mb-1 block text-sm font-semibold">
                  Programme <span className="font-normal text-muted-foreground">— format : Titre | Détail (une ligne par module)</span>
                </label>
                <textarea id="f-syllabus" rows={4} value={draft.syllabusText}
                  onChange={(e) => setDraft((d) => ({ ...d, syllabusText: e.target.value }))}
                  placeholder={"Module 1 | Description du contenu\nModule 2 | Description du contenu"}
                  className={ic} />
              </div>
            </div>
          </div>

          {/* ── Section C: Formateur ────────────────────────────── */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Formateur
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-trainer-name" className="mb-2 block text-sm font-semibold">Nom complet</label>
                <input id="f-trainer-name" value={draft.trainer.name}
                  onChange={(e) => updateTrainer("name", e.target.value)}
                  placeholder="Prénom Nom"
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-trainer-initials" className="mb-2 block text-sm font-semibold">Initiales</label>
                <input id="f-trainer-initials" value={draft.trainer.initials}
                  onChange={(e) => updateTrainer("initials", e.target.value)}
                  placeholder="PL" maxLength={3}
                  className={ic} />
              </div>
              <div>
                <label htmlFor="f-trainer-role" className="mb-2 block text-sm font-semibold">Rôle / titre</label>
                <input id="f-trainer-role" value={draft.trainer.role}
                  onChange={(e) => updateTrainer("role", e.target.value)}
                  placeholder="Coach en management"
                  className={ic} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-trainer-bio" className="mb-2 block text-sm font-semibold">Biographie courte</label>
                <textarea id="f-trainer-bio" rows={3} value={draft.trainer.bio}
                  onChange={(e) => updateTrainer("bio", e.target.value)}
                  placeholder="15 ans d'expérience dans…"
                  className={ic} />
              </div>
            </div>
          </div>

          {/* ── Section D: Sessions ─────────────────────────────── */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Sessions
              </h3>
              <button type="button" onClick={addSession}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent">
                <Plus className="size-3.5" /> Ajouter une session
              </button>
            </div>

            {draft.sessions.length === 0 && (
              <p className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                Aucune session — la formation ne sera pas réservable. Ajoutez au moins une date avant de mettre en ligne.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {draft.sessions.map((s, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Session {i + 1}</span>
                    <button type="button" onClick={() => removeSession(i)}
                      className="rounded-lg border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Supprimer cette session">
                      <Minus className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date de début</label>
                      <input type="date" value={s.start}
                        onChange={(e) => updateSession(i, "start", e.target.value)}
                        className={ic} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date de fin</label>
                      <input type="date" value={s.end}
                        onChange={(e) => updateSession(i, "end", e.target.value)}
                        className={ic} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Ville</label>
                      <input type="text" value={s.city}
                        onChange={(e) => updateSession(i, "city", e.target.value)}
                        placeholder="Sfax"
                        className={ic} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Places disponibles</label>
                      <input type="number" min="0" value={s.seatsLeft}
                        onChange={(e) => updateSession(i, "seatsLeft", e.target.value)}
                        className={ic} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Save / error ─────────────────────────────────────── */}
          <div className="mt-8 space-y-4">
            {saveError && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {saveError}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleSaveCourse} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all hover:-translate-y-0.5 hover:shadow-level-2 disabled:opacity-60">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
              <button type="button" onClick={resetDraft}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 font-semibold text-primary transition-colors hover:bg-accent">
                <Plus className="size-4" /> Nouveau
              </button>
            </div>
          </div>
        </div>

        {/* ── Right sidebar: preview + course list ──────────────────── */}
        <div className="space-y-6">
          {/* Mini card preview */}
          <div className="surface-card p-5">
            <p className="text-label-sm uppercase text-muted-foreground">Aperçu carte</p>
            <div className="mt-3 rounded-2xl bg-primary p-4 text-primary-foreground">
              <p className="font-display text-base font-bold leading-tight">{draft.title || "Titre de la formation"}</p>
              <p className="mt-1 text-xs text-primary-foreground/75 line-clamp-2">{draft.excerpt || "Accroche…"}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[draft.category || "Catégorie", draft.level, modeLabel[draft.mode]].map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-inverse-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Course list */}
          <div className="surface-card p-5">
            <h3 className="text-headline-md">Formations</h3>
            {loadingCourses ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Chargement…
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {filteredCourses.map((course) => {
                  const incomplete = isIncomplete(course);
                  return (
                    <div key={course.slug}
                      className={`rounded-2xl border p-3 transition-all ${
                        selectedSlug === course.slug
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <button type="button"
                          onClick={() => { setSelectedSlug(course.slug); }}
                          className="min-w-0 text-left">
                          <p className="truncate text-sm font-semibold">{course.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {course.category} · {course.price} TND
                          </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          {incomplete && (
                            <span title="Données incomplètes — prix, durée, formateur ou sessions manquants"
                              className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-300">
                              ⚠ incomplet
                            </span>
                          )}
                          <button type="button"
                            onClick={() => { setSelectedSlug(course.slug); }}
                            className="rounded-full border border-border p-1.5 text-primary hover:bg-accent"
                            aria-label="Modifier">
                            <PencilLine className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDeleteCourse(course.slug)}
                            className="rounded-full border border-border p-1.5 text-destructive hover:bg-destructive/10"
                            aria-label="Supprimer">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {course.featured && (
                        <span className="mt-1.5 inline-block rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-semibold text-primary">
                          À la une
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="surface-card p-5">
            <h3 className="text-headline-md">Statut</h3>
            <div className="mt-3 rounded-2xl bg-sage/60 p-3 text-sm text-muted-foreground">
              Connecté · <span className="font-semibold text-primary">{_courses.length} formations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ComingSoonTab
// ---------------------------------------------------------------------------
const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10";

// ---------------------------------------------------------------------------
// HorairesTab — edit business hours stored in settings/businessHours
// ---------------------------------------------------------------------------
function HorairesTab({ userEmail }: { userEmail: string }) {
  const [form, setForm] = useState<BusinessHoursSettings>({ ...DEFAULT_BUSINESS_HOURS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getBusinessHours()
      .then((h) => { setForm(h); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setSaveError(null);
    try {
      await saveBusinessHours({
        tagline: form.tagline,
        weekdayLabel: form.weekdayLabel,
        weekdayHours: form.weekdayHours,
        sundayLabel: form.sundayLabel,
        sundayHours: form.sundayHours,
        weekdayHoursProse: form.weekdayHoursProse,
        sundayHoursProse: form.sundayHoursProse,
        timelineHeading: form.timelineHeading,
        timelineStep1: form.timelineStep1,
        timelineStep2: form.timelineStep2,
        timelineStep3: form.timelineStep3,
        timelineStep4: form.timelineStep4,
      }, userEmail);
      setSavedAt(new Date().toLocaleTimeString("fr-FR"));
      await router.invalidate();
    } catch {
      setSaveError("Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const ic = "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10";

  function field(id: string, label: string, hint: string, key: keyof BusinessHoursSettings) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold">
          {label} <span className="font-normal text-muted-foreground text-xs">{hint}</span>
        </label>
        <input
          id={id}
          value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className={ic}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="surface-card space-y-6 p-7">
        <div>
          <h2 className="text-headline-lg">Horaires d'ouverture</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ces valeurs remplacent tous les horaires affichés sur le site. Les changements sont visibles immédiatement après sauvegarde.
          </p>
        </div>

        {/* Tagline — shown in hero + map section */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Bandeau court</h3>
          {field("h-tagline", "Tagline", "affiché dans le hero et la section carte", "tagline")}
        </div>

        {/* Hours table — contact page */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Tableau horaires (page Contact)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("h-wdlabel", "Libellé semaine", 'ex: "Lundi – samedi"', "weekdayLabel")}
            {field("h-wdhours", "Heures semaine", 'ex: "8 h – 22 h"', "weekdayHours")}
            {field("h-sunlabel", "Libellé dimanche", 'ex: "Dimanche"', "sundayLabel")}
            {field("h-sunhours", "Heures dimanche", 'ex: "8 h – 17 h"', "sundayHours")}
          </div>
        </div>

        {/* Prose hours — contact + a-propos */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Formulation longue (texte courant)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("h-wdprose", "Heures semaine", 'ex: "8 h à 22 h"', "weekdayHoursProse")}
            {field("h-sunprose", "Heures dimanche", 'ex: "8 h à 17 h"', "sundayHoursProse")}
          </div>
        </div>

        {/* Timeline section */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Section "Une journée au centre"</h3>
          <div className="space-y-4">
            {field("h-tlhead", "Titre", 'ex: "Ouvert de 8h à 22h."', "timelineHeading")}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("h-tl1", "Étape 1", "ex: 8h 30min", "timelineStep1")}
              {field("h-tl2", "Étape 2", "ex: 10h00", "timelineStep2")}
              {field("h-tl3", "Étape 3", "ex: 13h00", "timelineStep3")}
              {field("h-tl4", "Étape 4", "ex: 19h00", "timelineStep4")}
            </div>
          </div>
        </div>

        {saveError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all hover:-translate-y-0.5 hover:shadow-level-2 disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          {savedAt && (
            <p className="text-xs text-muted-foreground">
              Sauvegardé par <strong>{userEmail}</strong> à {savedAt}
            </p>
          )}
        </div>
      </div>

      {/* Live preview panel */}
      <div className="surface-card p-7">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Aperçu</p>
        <div className="space-y-5 text-sm">
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <p className="text-label-sm uppercase text-primary-foreground/60">Hero · Carte</p>
            <p className="mt-1 font-semibold">Sfax · {form.tagline}</p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-label-sm uppercase text-muted-foreground mb-2">Tableau Contact</p>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span>{form.weekdayLabel}</span>
              <span className="font-medium">{form.weekdayHours}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>{form.sundayLabel}</span>
              <span className="font-medium">{form.sundayHours}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-label-sm uppercase text-muted-foreground mb-2">Texte courant</p>
            <p className="text-muted-foreground">
              Disponible du lundi au samedi de <strong className="text-foreground">{form.weekdayHoursProse}</strong> et le dimanche de <strong className="text-foreground">{form.sundayHoursProse}</strong>.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-label-sm uppercase text-muted-foreground mb-2">Timeline</p>
            <p className="font-semibold text-primary">{form.timelineHeading}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[form.timelineStep1, form.timelineStep2, form.timelineStep3, form.timelineStep4].map((t) => (
                <span key={t} className="rounded-lg bg-primary-fixed px-2.5 py-1 text-xs font-bold text-primary">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonTab({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ComingSoonSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    getComingSoonSettings()
      .then((s) => { setForm(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setSaveError(null);
    try {
      await saveComingSoonSettings(
        {
          targetDate: form.targetDate,
          headlineFr: form.headlineFr,
          headlineEn: form.headlineEn,
          supportingLine: form.supportingLine,
          ctaLabel: form.ctaLabel,
          ctaType: form.ctaType,
          ctaValue: form.ctaValue,
          forceState: form.forceState,
        },
        userEmail,
      );
      setSavedAt(new Date().toLocaleTimeString("fr-FR"));
      await router.invalidate();
    } catch {
      setSaveError("Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  }

  const forceNotAuto = form.forceState !== "auto";

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="surface-card space-y-6 p-7">
        <div>
          <h2 className="text-headline-lg">Page d'attente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifiez le contenu de la page Coming Soon. Les changements sont visibles immédiatement après sauvegarde.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            État de la page <span className="text-muted-foreground">(Africa/Tunis)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "show", "hide"] as ForceState[]).map((s) => (
              <button key={s} type="button"
                onClick={() => setForm((f) => ({ ...f, forceState: s }))}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  form.forceState === s
                    ? s === "show" ? "border-destructive bg-destructive/10 text-destructive"
                      : s === "hide" ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}>
                {s === "auto" ? "🟢 Auto" : s === "show" ? "🔴 Forcer ON" : "🔵 Forcer OFF"}
              </button>
            ))}
          </div>
          {forceNotAuto && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong>Override actif</strong> —{" "}
                {form.forceState === "show"
                  ? "La page d'attente est affichée à tous les visiteurs, quelle que soit la date."
                  : "Le site réel est accessible à tous, quelle que soit la date."}
                {" "}Remettez sur Auto quand ce n'est plus nécessaire.
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="cs-target" className="mb-2 block text-sm font-semibold">
            Date d'ouverture <span className="font-normal text-muted-foreground">(fuseau Africa/Tunis = UTC+1)</span>
          </label>
          <input id="cs-target" type="datetime-local"
            value={form.targetDate.slice(0, 16)}
            onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value + ":00" }))}
            className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cs-fr" className="mb-2 block text-sm font-semibold">Titre français</label>
            <input id="cs-fr" value={form.headlineFr}
              onChange={(e) => setForm((f) => ({ ...f, headlineFr: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label htmlFor="cs-en" className="mb-2 block text-sm font-semibold">Sous-titre anglais</label>
            <input id="cs-en" value={form.headlineEn}
              onChange={(e) => setForm((f) => ({ ...f, headlineEn: e.target.value }))}
              className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="cs-support" className="mb-2 block text-sm font-semibold">Ligne d'accroche</label>
          <input id="cs-support" value={form.supportingLine}
            onChange={(e) => setForm((f) => ({ ...f, supportingLine: e.target.value }))}
            className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr_1.5fr]">
          <div>
            <label htmlFor="cs-cta-type" className="mb-2 block text-sm font-semibold">Type CTA</label>
            <select id="cs-cta-type" value={form.ctaType}
              onChange={(e) => setForm((f) => ({ ...f, ctaType: e.target.value as CtaType }))}
              className={inputClass}>
              <option value="tel">📞 Téléphone</option>
              <option value="mailto">✉️ Email</option>
              <option value="url">🔗 URL</option>
            </select>
          </div>
          <div>
            <label htmlFor="cs-cta-label" className="mb-2 block text-sm font-semibold">Libellé bouton</label>
            <input id="cs-cta-label" value={form.ctaLabel}
              onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label htmlFor="cs-cta-value" className="mb-2 block text-sm font-semibold">
              {form.ctaType === "tel" ? "Numéro" : form.ctaType === "mailto" ? "Adresse email" : "URL"}
            </label>
            <input id="cs-cta-value" value={form.ctaValue}
              onChange={(e) => setForm((f) => ({ ...f, ctaValue: e.target.value }))}
              placeholder={form.ctaType === "tel" ? "+21622489100" : form.ctaType === "mailto" ? "contact@..." : "https://..."}
              className={inputClass} />
          </div>
        </div>

        {saveError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all hover:-translate-y-0.5 hover:shadow-level-2 disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          <button type="button" onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent">
            <Eye className="size-4" />
            {showPreview ? "Masquer" : "Aperçu"}
          </button>
          {savedAt && (
            <p className="text-xs text-muted-foreground">
              Sauvegardé par <strong>{userEmail}</strong> à {savedAt}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Eye className="size-4" /> Aperçu en temps réel
        </p>
        <div className="overflow-hidden rounded-3xl border border-border shadow-level-3" style={{ height: 520 }}>
          <div style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "166.7%", height: "166.7%" }}>
            <ComingSoon settings={form} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminPage
// ---------------------------------------------------------------------------
function AdminPage() {
  const authState = useAuth();

  if (authState.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authState.status === "unauthenticated") {
    return <LoginScreen />;
  }

  return <Dashboard userEmail={authState.user.email ?? ""} />;
}
