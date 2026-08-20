import { createFileRoute, useRouter } from "@tanstack/react-router";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import {
  AlertTriangle, BarChart3, BookOpen, ClipboardList,
  Clock, Eye,
  LayoutDashboard, Loader2, LogIn, PencilLine,
  Plus, Search, Shield, Sparkles, Trash2, Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComingSoon } from "@/components/site/ComingSoon";
import { modeLabel, type Course, type Level, type Mode } from "@/data/courses";
import { logOut, signIn, useAuth } from "@/lib/auth";
import { listCourses } from "@/lib/courses-api";
import { db } from "@/lib/firebase";
import {
  DEFAULT_SETTINGS,
  getComingSoonSettings,
  saveComingSoonSettings,
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

type CourseDraft = {
  title: string; category: string; level: Level; mode: Mode;
  durationHours: string; price: string; excerpt: string;
  description: string; objectivesText: string; syllabusText: string;
  featured: boolean;
};

const emptyDraft: CourseDraft = {
  title: "", category: "", level: "Débutant", mode: "presentiel",
  durationHours: "7", price: "490", excerpt: "", description: "",
  objectivesText: "", syllabusText: "", featured: false,
};

function slugify(v: string) {
  return v.toLowerCase().normalize("NFD")
    .replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

function courseToDraft(c: Course): CourseDraft {
  return {
    title: c.title, category: c.category, level: c.level, mode: c.mode,
    durationHours: String(c.durationHours), price: String(c.price),
    excerpt: c.excerpt, description: c.description,
    objectivesText: c.objectives.join("\n"),
    syllabusText: c.syllabus.map((s) => `${s.title} | ${s.detail}`).join("\n"),
    featured: Boolean(c.featured),
  };
}

function draftToCourse(draft: CourseDraft, existing?: Course): Course {
  const title = draft.title.trim();
  const objectives = draft.objectivesText.split("\n").map((s) => s.trim()).filter(Boolean);
  const syllabus = draft.syllabusText.split("\n").map((line, i) => {
    const [t, d] = line.split("|").map((s) => s.trim());
    return { title: t || `Module ${i + 1}`, detail: d || "À compléter" };
  }).filter((s) => s.title.length > 0);
  return {
    slug: existing?.slug ?? slugify(title), title,
    category: draft.category.trim(), level: draft.level, mode: draft.mode,
    durationHours: Number(draft.durationHours) || 0,
    price: Number(draft.price) || 0,
    excerpt: draft.excerpt.trim() || title,
    description: draft.description.trim() || draft.excerpt.trim() || title,
    objectives: objectives.length > 0 ? objectives : ["À définir"],
    syllabus: syllabus.length > 0 ? syllabus : [{ title: "Programme", detail: "À compléter" }],
    trainer: existing?.trainer ?? { name: "À assigner", role: "Formateur", bio: "Profil à compléter.", initials: "AA" },
    sessions: existing?.sessions ?? [],
    featured: draft.featured,
  };
}

const actionItems = [
  "Créer ou modifier une formation",
  "Planifier une session et assigner un formateur",
  "Valider les inscriptions et gérer la liste d'attente",
  "Mettre à jour les contenus publics du site",
];

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
                  required autoComplete="username"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold">Mot de passe</label>
                <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10" />
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

function Dashboard({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"formations" | "coming-soon">("formations");
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

  const selectedCourse = useMemo(() => courses.find((c) => c.slug === selectedSlug) ?? null, [courses, selectedSlug]);

  useEffect(() => {
    setDraft(selectedCourse ? courseToDraft(selectedCourse) : emptyDraft);
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => [c.title, c.category, c.level, modeLabel[c.mode]].join(" ").toLowerCase().includes(q));
  }, [courses, search]);

  const stats = useMemo(() => {
    const featured = courses.filter((c) => c.featured).length;
    const sessions = courses.reduce((t, c) => t + c.sessions.length, 0);
    const seats = courses.reduce((t, c) => t + c.sessions.reduce((s, sess) => s + sess.seatsLeft, 0), 0);
    const avgPrice = courses.length > 0 ? Math.round(courses.reduce((t, c) => t + c.price, 0) / courses.length) : 0;
    return [
      { label: "Formations actives", value: String(courses.length), icon: BookOpen },
      { label: "À la une", value: String(featured), icon: Sparkles },
      { label: "Sessions listées", value: String(sessions), icon: ClipboardList },
      { label: "Prix moyen", value: `${avgPrice} €`, icon: BarChart3 },
      { label: "Places ouvertes", value: String(seats), icon: Users },
    ];
  }, [courses]);

  function resetDraft() { setSelectedSlug(null); setDraft(emptyDraft); setSaveError(null); }

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
    } catch { setSaveError("Erreur lors de la sauvegarde. Vérifie ta connexion."); }
    finally { setSaving(false); }
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
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "formations" && <FormationsTab
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
          courseToDraft={courseToDraft}
        />}

        {activeTab === "coming-soon" && <ComingSoonTab userEmail={userEmail} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FormationsTab — extracted from Dashboard for cleanliness
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
  courseToDraft: (c: Course) => CourseDraft;
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
  courseToDraft,
}: FormationsTabProps) {
  return (
    <div className="space-y-8">
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-lg">Gestion des formations</h2>
              <p className="mt-2 text-sm text-muted-foreground">Crée, modifie ou supprime une formation.</p>
            </div>
            <button type="button" onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent">
              <Plus className="size-4" /> Nouvelle formation
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="course-search" className="mb-2 block text-sm font-semibold">Rechercher</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-4 py-3">
                <Search className="size-4 text-muted-foreground" />
                <input id="course-search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Management, Numérique…" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="rounded-2xl bg-sage/60 p-4 text-sm text-muted-foreground">
              Sélection : <span className="font-semibold text-primary">{selectedCourse?.title ?? "Nouvelle formation"}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {(["title", "category"] as const).map((field) => (
                  <div key={field}>
                    <label htmlFor={`f-${field}`} className="mb-2 block text-sm font-semibold">{field === "title" ? "Titre" : "Catégorie"}</label>
                    <input id={`f-${field}`} value={draft[field]} onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/10" />
                  </div>
                ))}
                <div>
                  <label htmlFor="f-level" className="mb-2 block text-sm font-semibold">Niveau</label>
                  <select id="f-level" value={draft.level} onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as Level }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary">
                    <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-mode" className="mb-2 block text-sm font-semibold">Format</label>
                  <select id="f-mode" value={draft.mode} onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value as Mode }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary">
                    <option value="presentiel">Présentiel</option>
                    <option value="hybride">Hybride</option>
                    <option value="en-ligne">En ligne</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-hours" className="mb-2 block text-sm font-semibold">Durée (h)</label>
                  <input id="f-hours" type="number" min="1" value={draft.durationHours}
                    onChange={(e) => setDraft((d) => ({ ...d, durationHours: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="f-price" className="mb-2 block text-sm font-semibold">Prix (€)</label>
                  <input id="f-price" type="number" min="0" value={draft.price}
                    onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              {(["excerpt", "description"] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={`f-${field}`} className="mb-2 block text-sm font-semibold">{field === "excerpt" ? "Accroche" : "Description"}</label>
                  <textarea id={`f-${field}`} rows={3} value={draft[field]}
                    onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
              ))}
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium">
                <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))} className="size-4 accent-primary" />
                Mettre à la une
              </label>
              {saveError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{saveError}</p>}
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

            <div className="space-y-4">
              <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
                <p className="text-label-sm uppercase text-primary-foreground/60">Aperçu</p>
                <p className="mt-2 font-display text-xl font-bold">{draft.title || "Titre de la formation"}</p>
                <p className="mt-1 text-sm text-primary-foreground/75">{draft.excerpt || "Accroche…"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[draft.category || "Catégorie", draft.level, modeLabel[draft.mode]].map((tag) => (
                    <span key={tag} className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase text-inverse-primary">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="surface-card p-5">
                <h3 className="text-headline-md">Formations</h3>
                {loadingCourses ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Chargement…</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {filteredCourses.map((course) => (
                      <div key={course.slug} className={`rounded-2xl border p-4 transition-all ${selectedSlug === course.slug ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => { setSelectedSlug(course.slug); setDraft(courseToDraft(course)); }} className="text-left">
                            <p className="font-semibold">{course.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{course.category} · {course.price} €</p>
                          </button>
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => { setSelectedSlug(course.slug); setDraft(courseToDraft(course)); }}
                              className="rounded-full border border-border p-1.5 text-primary hover:bg-accent" aria-label="Modifier">
                              <PencilLine className="size-3.5" />
                            </button>
                            <button type="button" onClick={() => handleDeleteCourse(course.slug)}
                              className="rounded-full border border-border p-1.5 text-destructive hover:bg-destructive/10" aria-label="Supprimer">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        {course.featured && <span className="mt-2 inline-block rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-semibold text-primary">À la une</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-7">
            <h2 className="text-headline-lg">Actions rapides</h2>
            <div className="mt-5 grid gap-3">
              {actionItems.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 hover:-translate-y-0.5 transition-transform">
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-sm font-semibold text-secondary">Ouvrir</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-7">
            <h2 className="text-headline-lg">Statut</h2>
            <div className="mt-4 rounded-2xl bg-sage/60 p-4 text-sm text-muted-foreground">
              Connecté : <span className="font-semibold text-primary">{_courses.length} formations chargées</span>
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
      // Re-run the root loader so the coming-soon gate on this tab reflects
      // the new forceState immediately without a manual page reload.
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
      {/* Form */}
      <div className="surface-card space-y-6 p-7">
        <div>
          <h2 className="text-headline-lg">Page d'attente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifiez le contenu de la page Coming Soon. Les changements sont visibles immédiatement après sauvegarde.
          </p>
        </div>

        {/* forceState — prominent warning when not auto */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            État de la page <span className="text-muted-foreground">(Africa/Tunis)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "show", "hide"] as ForceState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, forceState: s }))}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  form.forceState === s
                    ? s === "show" ? "border-destructive bg-destructive/10 text-destructive"
                      : s === "hide" ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
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

        {/* Target date */}
        <div>
          <label htmlFor="cs-target" className="mb-2 block text-sm font-semibold">
            Date d'ouverture <span className="font-normal text-muted-foreground">(fuseau Africa/Tunis = UTC+1)</span>
          </label>
          <input
            id="cs-target"
            type="datetime-local"
            value={form.targetDate.slice(0, 16)}
            onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value + ":00" }))}
            className={inputClass}
          />
        </div>

        {/* Headlines */}
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

        {/* Supporting line */}
        <div>
          <label htmlFor="cs-support" className="mb-2 block text-sm font-semibold">Ligne d'accroche</label>
          <input id="cs-support" value={form.supportingLine}
            onChange={(e) => setForm((f) => ({ ...f, supportingLine: e.target.value }))}
            className={inputClass} />
        </div>

        {/* CTA */}
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

      {/* Live preview */}
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
