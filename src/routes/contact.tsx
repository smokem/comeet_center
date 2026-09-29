import emailjs from "@emailjs/browser";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "@/lib/fade-in";
import { useBusinessHours } from "./__root";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact et devis — Co.meet Space" },
      { name: "description", content: "Contactez le centre de formation Co.meet Space à Sfax : inscription, formation intra-entreprise ou devis. Réponse sous 48 h." },
      { property: "og:title", content: "Contact et devis — Co.meet Space" },
    ],
  }),
  component: Contact,
});

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-ring/10";

const courseOptions = [
  { value: "management-equipe-hybride", label: "Manager une équipe hybride" },
  { value: "prise-de-parole-en-public", label: "Prise de parole en public" },
  { value: "ia-generative-au-quotidien", label: "IA générative au quotidien" },
  { value: "gestion-de-projet-agile", label: "Gestion de projet agile" },
  { value: "bureautique-avancee-excel", label: "Excel avancé et tableaux de bord" },
  { value: "accueil-et-relation-client", label: "Accueil et relation client" },
];

type FormState = "idle" | "sending" | "sent" | "error";

function Contact() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const hours = useBusinessHours();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSendError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name    = (data.get("name")    as string).trim();
    const email   = (data.get("email")   as string).trim();
    const message = (data.get("message") as string).trim();
    const company = (data.get("company") as string | null)?.trim() ?? "";
    const course  = (data.get("course")  as string | null)?.trim() ?? "";

    // Client-side validation — HTML `required` covers empty fields, but we
    // double-check email format here before spending the EmailJS call.
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setSendError("L'adresse e-mail semble incorrecte. Merci de la vérifier.");
      return;
    }

    setFormState("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { name, email, message, company, course },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setFormState("sent");
      form.reset();
    } catch (err) {
      console.error("[EmailJS] send failed:", err);
      setSendError(
        "L'envoi a échoué. Vérifiez votre connexion ou réessayez dans quelques instants.",
      );
      setFormState("error");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/70 bg-sage/50">
        <div className="container-page py-14">
          <FadeIn>
            <p className="text-label-sm uppercase text-secondary">Contact</p>
            <h1 className="mt-2 max-w-2xl text-display-lg text-primary">Parlons de votre projet</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Inscription à une session, formation intra-entreprise ou question sur le financement : nous répondons sous 48 h ouvrées.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 pb-24 lg:grid-cols-[1.5fr_1fr] lg:items-start">

        {/* Form */}
        <FadeIn>
          <div className="surface-card p-7 md:p-10">
            {formState === "sent" ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-fixed">
                  <Mail className="size-6 text-primary" />
                </div>
                <h2 className="mt-5 text-headline-md text-primary">Message bien reçu</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Merci ! Un membre de l'équipe vous recontacte sous 48 h ouvrées.
                </p>
                <button
                  type="button"
                  onClick={() => { setFormState("idle"); setSendError(null); }}
                  className="mt-6 rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <h2 className="text-headline-md">Nous écrire</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold">Nom et prénom</label>
                    <input id="name" name="name" required className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold">E-mail professionnel</label>
                    <input id="email" name="email" type="email" required className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="company" className="mb-2 block text-sm font-semibold">Organisation</label>
                    <input id="company" name="company" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="course" className="mb-2 block text-sm font-semibold">Formation concernée</label>
                    <select id="course" name="course" className={fieldClass} defaultValue="">
                      <option value="">Je ne sais pas encore</option>
                      {courseOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      <option value="sur-mesure">Formation sur mesure</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold">Votre besoin</label>
                  <textarea id="message" name="message" rows={5} required className={fieldClass} />
                </div>

                {/* Error banner — shown on EmailJS failure or invalid email */}
                {(formState === "error" || sendError) && (
                  <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{sendError ?? "Une erreur est survenue. Veuillez réessayer."}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-level-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {formState === "sending" ? (
                      <><Loader2 className="size-4 animate-spin" /> Envoi en cours…</>
                    ) : (
                      "Envoyer la demande"
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground">Vos données servent uniquement à traiter votre demande.</p>
                </div>
              </form>
            )}
          </div>
        </FadeIn>

        {/* Sidebar */}
        <aside className="space-y-6">
          <FadeIn delay={80}>
            <div className="surface-card p-7">
              <h2 className="text-headline-md">Le centre</h2>
              <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>Rte de Mahdia Km 5.5<br />3011 Sfax</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <a href="mailto:contact@comeetspace.com" className="hover:text-primary hover:underline">
                    contact@comeetspace.com
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <a href="tel:+21692489103" className="hover:text-primary hover:underline">
                    +216 92 489 103
                  </a>
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="surface-card overflow-hidden">
              <div className="border-b border-border/70 bg-sage/60 px-6 py-4 text-label-sm font-semibold uppercase text-primary">
                Horaires d'accueil
              </div>
              <ul className="space-y-2 px-6 py-5 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>{hours.weekdayLabel}</span>
                  <span className="font-medium text-foreground">{hours.weekdayHours}</span>
                </li>
                <li className="flex justify-between">
                  <span>{hours.sundayLabel}</span>
                  <span className="font-medium text-foreground">{hours.sundayHours}</span>
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={160}>
            <div className="surface-card p-7">
              <h2 className="text-headline-md">Portes ouvertes</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Nos conseillers sont disponibles du lundi au samedi de
                <strong className="text-foreground"> {hours.weekdayHoursProse}</strong> et le dimanche de
                <strong className="text-foreground"> {hours.sundayHoursProse}</strong>.
              </p>
            </div>
          </FadeIn>
        </aside>
      </section>
    </>
  );
}
