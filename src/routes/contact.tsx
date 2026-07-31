import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact et devis — Co.meet Space" },
      {
        name: "description",
        content:
          "Contactez le centre de formation Co.meet Space à Lyon : inscription à une session, formation intra-entreprise ou demande de devis. Réponse sous 48 h.",
      },
      { property: "og:title", content: "Contact et devis — Co.meet Space" },
      {
        property: "og:description",
        content: "Inscription, formation sur mesure ou devis : réponse sous 48 h ouvrées.",
      },
    ],
  }),
  component: Contact,
});

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-ring/10";

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="border-b border-border/70 bg-sage/50">
        <div className="container-page py-14">
          <p className="text-label-sm uppercase text-secondary">Contact</p>
          <h1 className="mt-2 max-w-2xl text-display-lg text-primary">Parlons de votre projet</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Inscription à une session, formation intra-entreprise ou question sur
            le financement : nous répondons sous 48 h ouvrées.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="surface-card p-7 md:p-10">
          {sent ? (
            <div className="py-10 text-center">
              <h2 className="text-headline-md text-primary">Message bien reçu</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Merci ! Un membre de l'équipe vous recontacte sous 48 h ouvrées.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                    Nom et prénom
                  </label>
                  <input id="name" name="name" required className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                    E-mail professionnel
                  </label>
                  <input id="email" name="email" type="email" required className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-semibold">
                    Organisation
                  </label>
                  <input id="company" name="company" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="course" className="mb-2 block text-sm font-semibold">
                    Formation concernée
                  </label>
                  <select id="course" name="course" className={fieldClass} defaultValue="">
                    <option value="">Je ne sais pas encore</option>
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                    <option value="sur-mesure">Formation sur mesure</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold">
                  Votre besoin
                </label>
                <textarea id="message" name="message" rows={5} required className={fieldClass} />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Envoyer la demande
              </button>
              <p className="text-xs text-muted-foreground">
                Vos données servent uniquement à traiter votre demande.
              </p>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <div className="surface-card p-7">
            <h2 className="text-headline-md">Le centre</h2>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                12 rue de la Fabrique
                <br />
                69002 Lyon
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-secondary" />
                bonjour@comeet.space
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-secondary" />
                04 78 00 00 00
              </li>
            </ul>
          </div>
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border/70 bg-sage/60 px-6 py-4 text-label-sm uppercase text-primary">
              Horaires d'accueil
            </div>
            <ul className="space-y-2 px-6 py-5 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Lundi – jeudi</span><span>8 h 30 – 18 h</span></li>
              <li className="flex justify-between"><span>Vendredi</span><span>8 h 30 – 16 h</span></li>
              <li className="flex justify-between"><span>Week-end</span><span>Fermé</span></li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
