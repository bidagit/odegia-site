"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SITE } from "@/lib/content";
import {
  TACHES,
  FREQUENCES,
  TAILLES,
  TAUX,
  OUTILS,
  DOCUMENTATION,
  REPONSES_VIDES,
  SUIVI_PREMIERE,
  SUIVI_SUIVANTE,
  calculer,
  euros,
  heures,
  type Reponses,
  type Frequence,
} from "@/lib/estimator";

/* Neuf écrans, une question par écran. Le calcul tourne ici, dans le
   navigateur, et rien ne part avant le consentement du dernier écran. */

const cardBase =
  "w-full rounded-2xl border px-5 py-4 text-left text-[14.5px] transition-colors";
const cardOff = "border-ink/12 bg-surface hover:border-vert/50";
const cardOn = "border-vert bg-vert text-white";

function Choice({
  label,
  selected,
  onClick,
  multi = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${cardBase} ${selected ? cardOn : cardOff} flex items-center gap-3`}
    >
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center border ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "border-white/70 bg-white/15" : "border-ink/25"}`}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
      {label}
    </button>
  );
}

function Screen({
  question,
  hint,
  children,
}: {
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[30px]">
        {question}
      </h2>
      {hint && (
        <p className="mt-2.5 text-[13.5px] leading-[1.6] text-ink-soft">{hint}</p>
      )}
      <div className="mt-7 space-y-2.5">{children}</div>
    </div>
  );
}

export function Estimator() {
  const [etape, setEtape] = useState(0);
  const [r, setR] = useState<Reponses>(REPONSES_VIDES);
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [optin, setOptin] = useState(false);
  const [fini, setFini] = useState(false);

  const set = <K extends keyof Reponses>(k: K, v: Reponses[K]) =>
    setR((p) => ({ ...p, [k]: v }));

  const toggle = (k: "taches" | "outils", id: string) =>
    setR((p) => ({
      ...p,
      [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id],
    }));

  const choisies = TACHES.filter((t) => r.taches.includes(t.id));
  const res = useMemo(() => calculer(r), [r]);

  const ecrans = [
    {
      valide: !!r.taille,
      node: (
        <Screen question="Vous êtes">
          {TAILLES.map((t) => (
            <Choice key={t} label={t} selected={r.taille === t} onClick={() => set("taille", t)} />
          ))}
        </Screen>
      ),
    },
    {
      valide: true,
      node: (
        <Screen
          question="Sur une semaine normale, combien de temps l'administratif vous prend"
          hint="À vous et à votre équipe, toutes personnes confondues."
        >
          <div className="rounded-2xl border border-ink/12 bg-surface px-5 py-6">
            <div className="text-[34px] font-semibold tracking-[-0.03em] text-vert">
              {r.heuresSemaine} h
              <span className="ml-1.5 text-[15px] font-normal text-ink-soft">
                par semaine
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={r.heuresSemaine}
              onChange={(e) => set("heuresSemaine", Number(e.target.value))}
              aria-label="Heures d'administratif par semaine"
              className="mt-5 w-full accent-[#0f7a5c]"
            />
            <div className="mt-1.5 flex justify-between text-[12px] text-ink-soft">
              <span>1 h</span>
              <span>30 h</span>
            </div>
          </div>
        </Screen>
      ),
    },
    {
      valide: r.taux !== null,
      node: (
        <Screen question="Une heure de votre temps, vous la valorisez à combien">
          {TAUX.map((t) => (
            <Choice
              key={t.label}
              label={t.label}
              selected={r.taux === t.value}
              onClick={() => set("taux", t.value)}
            />
          ))}
        </Screen>
      ),
    },
    {
      valide: r.taches.length > 0,
      node: (
        <Screen
          question="Qu'est-ce qui vous prend du temps"
          hint="Plusieurs réponses possibles."
        >
          {TACHES.map((t) => (
            <Choice
              key={t.id}
              multi
              label={t.label}
              selected={r.taches.includes(t.id)}
              onClick={() => toggle("taches", t.id)}
            />
          ))}
        </Screen>
      ),
    },
    {
      valide: choisies.every((t) => r.frequences[t.id]),
      node: (
        <Screen question="À quelle fréquence, pour chacune">
          <div className="space-y-5">
            {choisies.map((t) => (
              <div key={t.id}>
                <p className="text-[14px] font-medium">{t.label}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {FREQUENCES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() =>
                        set("frequences", { ...r.frequences, [t.id]: f.value as Frequence })
                      }
                      aria-pressed={r.frequences[t.id] === f.value}
                      className={`rounded-xl border px-3 py-2.5 text-[12.5px] transition-colors ${
                        r.frequences[t.id] === f.value ? cardOn : cardOff
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Screen>
      ),
    },
    {
      valide: r.outils.length > 0,
      node: (
        <Screen
          question="Avec quoi vous travaillez aujourd'hui"
          hint="Plusieurs réponses possibles."
        >
          {OUTILS.map((o) => (
            <Choice
              key={o.id}
              multi
              label={o.label}
              selected={r.outils.includes(o.id)}
              onClick={() => toggle("outils", o.id)}
            />
          ))}
        </Screen>
      ),
    },
    {
      valide: !!r.documentation,
      node: (
        <Screen question="Vos façons de faire sont-elles écrites quelque part">
          {DOCUMENTATION.map((d) => (
            <Choice
              key={d.id}
              label={d.label}
              selected={r.documentation === d.id}
              onClick={() => set("documentation", d.id)}
            />
          ))}
        </Screen>
      ),
    },
    {
      valide: !!r.agace,
      node: (
        <Screen question="Qu'est-ce qui vous agace le plus">
          {choisies.map((t) => (
            <Choice
              key={t.id}
              label={t.label}
              selected={r.agace === t.id}
              onClick={() => set("agace", t.id)}
            />
          ))}
        </Screen>
      ),
    },
    {
      valide: prenom.trim().length > 0 && /\S+@\S+\.\S+/.test(email),
      node: (
        <Screen
          question="Où envoyer votre estimation détaillée"
          hint="Le résumé s'affiche à l'écran juste après. Le détail part par mail."
        >
          <div className="space-y-3">
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prénom"
              aria-label="Prénom"
              className="w-full rounded-2xl border border-ink/12 bg-surface px-5 py-4 text-[14.5px] outline-none focus:border-vert"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              aria-label="Adresse email"
              className="w-full rounded-2xl border border-ink/12 bg-surface px-5 py-4 text-[14.5px] outline-none focus:border-vert"
            />
            <p className="text-[12.5px] leading-[1.6] text-ink-soft">
              Votre estimation vous est envoyée à cette adresse. Vos réponses sont
              conservées trois ans, vous pouvez demander leur suppression à tout
              moment.
            </p>
            {/* Case séparée, décochée par défaut. Le rapport part même sans elle,
                un consentement obtenu en échange d'un service ne serait pas libre. */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/12 bg-surface px-5 py-4">
              <input
                type="checkbox"
                checked={optin}
                onChange={(e) => setOptin(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f7a5c]"
              />
              <span className="text-[13px] leading-[1.6] text-ink-soft">
                Je veux aussi recevoir les quatre emails d&apos;Odegia sur
                l&apos;automatisation administrative. Désinscription en un clic dans
                chaque message.
              </span>
            </label>
          </div>
        </Screen>
      ),
    },
  ];

  if (fini) return <Resultat res={res} prenom={prenom} />;

  const courant = ecrans[etape];
  const dernier = etape === ecrans.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 md:py-16">
      <div className="mb-8">
        <div className="flex items-center justify-between text-[12px] text-ink-soft">
          <span>
            Question {etape + 1} sur {ecrans.length}
          </span>
          <span>2 minutes</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full bg-vert transition-all duration-300"
            style={{ width: `${((etape + 1) / ecrans.length) * 100}%` }}
          />
        </div>
      </div>

      {courant.node}

      <div className="mt-9 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setEtape((e) => Math.max(0, e - 1))}
          disabled={etape === 0}
          className="inline-flex items-center gap-2 text-[14px] text-ink-soft transition-colors hover:text-ink disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour
        </button>
        <button
          type="button"
          disabled={!courant.valide}
          onClick={() => (dernier ? setFini(true) : setEtape((e) => e + 1))}
          className="inline-flex items-center gap-2 rounded-full bg-vert px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-vert-deep disabled:cursor-not-allowed disabled:opacity-35"
        >
          {dernier ? "Voir mon estimation" : "Continuer"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function Resultat({
  res,
  prenom,
}: {
  res: ReturnType<typeof calculer>;
  prenom: string;
}) {
  /* Sous le plancher, on dit au visiteur de ne rien faire. Refuser une vente ici
     vaut mieux qu'un client qui ne sera jamais rentable. */
  if (res.sousLePlancher) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[32px]">
          Votre administratif ne justifie pas encore un chantier.
        </h2>
        <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
          D&apos;après vos réponses, ce que vous récupéreriez ne couvrirait pas
          le coût de l&apos;automatisation. Revenez quand votre volume aura
          grandi, nous préférons vous le dire maintenant.
        </p>
        <a
          href={SITE.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full border border-ink/15 px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-vert hover:text-vert"
        >
          En parler quand même, 15 minutes
        </a>
      </div>
    );
  }

  /* Volume suffisant, mais éclaté sur des tâches trop petites pour qu'une seule
     couvre son propre suivi. Cas distinct du plancher, et il mérite sa propre
     réponse plutôt qu'un retour à plusieurs années. */
  if (res.aucunRetour) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[32px]">
          Vos tâches sont trop dispersées pour être automatisées une par une.
        </h2>
        <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
          Votre administratif pèse, mais même regroupées, vos tâches ne libèrent
          pas assez de temps pour couvrir le suivi du système. Automatiser dans
          ces conditions
          vous coûterait plus que la main. Le diagnostic sert justement à voir si
          plusieurs de ces tâches se regroupent en une seule brique, et nous
          préférons le vérifier avant de vous vendre quoi que ce soit.
        </p>
        <a
          href={SITE.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full border border-ink/15 px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-vert hover:text-vert"
        >
          En parler, 15 minutes
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 md:py-16">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {prenom ? `${prenom}, votre estimation` : "Votre estimation"}
      </span>

      <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[38px]">
        Votre administratif vous coûte environ{" "}
        <span className="text-vert">{heures(res.heuresMois)} heures</span> par
        mois, soit{" "}
        <span className="text-vert">{euros(res.coutAnnuel)}</span> par an.
      </h2>
      <p className="mt-4 text-[14px] leading-[1.7] text-ink-soft">
        Calculé sur une heure de votre temps valorisée à {euros(res.taux)}. Environ
        70 % de ce temps est récupérable, soit {heures(res.heuresRecuperees)} heures
        par mois.
      </p>

      <section className="mt-12">
        <h3 className="text-[17px] font-semibold">Ce qui est récupérable</h3>
        <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {res.lignes.map((l) => (
            <div key={l.id} className="flex items-baseline justify-between gap-6 py-3">
              <dt className="text-[13.5px] text-ink-soft">{l.label}</dt>
              <dd className="shrink-0 text-[14px] font-medium">
                {heures(l.heuresRecuperees)} h/mois
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h3 className="text-[17px] font-semibold">Par quoi commencer</h3>
        <ol className="mt-4 space-y-3">
          {res.recommandees.map((l, i) => (
            <li
              key={l.id}
              className={`rounded-2xl border p-5 ${
                i === 0 ? "border-vert bg-vert/[0.06]" : "border-ink/12 bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[14.5px] font-medium">{l.label}</span>
                <span className="shrink-0 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-soft">
                  {i === 0 ? "à traiter en premier" : `étape ${i + 1}`}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] text-ink-soft">
                {euros(l.gainAnnuel)} récupérés par an, {l.complexe ? "chantier complexe" : "chantier simple"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 rounded-2xl bg-vert p-7 text-white md:p-9">
        <h3 className="text-[17px] font-semibold">Ce que ça représente</h3>
        <p className="mt-3 text-[14.5px] leading-[1.7] text-white/75">
          Traiter les {res.recommandees.length} tâches se situe entre{" "}
          {euros(res.coutBas)} et {euros(res.coutHaut)} hors taxes. Vous
          n&apos;êtes pas obligé de tout prendre, la première seule coûte{" "}
          {euros(res.recommandees[0]?.cout ?? 0)}.
        </p>
        {/* Le suivi s'annonce avant le retour et non en bas de page. C'est lui
            qui allonge le chiffre, le taire rendrait le retour invérifiable. */}
        <p className="mt-3 text-[14.5px] leading-[1.7] text-white/75">
          S&apos;y ajoute le suivi, {euros(SUIVI_PREMIERE)} hors taxes par mois
          puis {euros(SUIVI_SUIVANTE)} par brique supplémentaire, soit{" "}
          {euros(res.suiviMensuel)} par mois pour ce périmètre. Il est déjà
          déduit du retour ci-dessous.
        </p>
        <p className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">
          Ce périmètre se rembourse en{" "}
          <span className="text-banane">{res.roiMois} mois</span>.
        </p>
        {/* Le suivi étant dégressif, une brique peut couvrir sa surveillance
            marginale sans couvrir le socle. Le dire évite un devis à une brique
            que personne ne tiendrait. */}
        {res.teteNonViableSeule && (
          <p className="mt-4 border-t border-white/20 pt-4 text-[13.5px] leading-[1.65] text-white/70">
            À prendre ensemble. Isolée, la première tâche ne libère pas assez de
            temps pour couvrir le suivi à {euros(SUIVI_PREMIERE)} par mois. C&apos;est
            le regroupement qui la rend rentable, pas la tâche seule.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h3 className="text-[17px] font-semibold">La suite</h3>
        <p className="mt-3 text-[14px] leading-[1.7] text-ink-soft">
          Le diagnostic à 500 € HT confirme ces chiffres sur vos données réelles
          et vous remet un rapport de quatre pages sous 72 heures. Il est déduit
          si vous nous confiez le chantier, et remboursé si l&apos;automatisation
          n&apos;est pas votre vraie réponse.
        </p>
        <a
          href={SITE.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-vert px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-vert-deep"
        >
          Réserver le diagnostic
        </a>
      </section>

      {/* Le contexte ne change pas le prix, mais le prospect doit savoir qu il
          allongera le cadrage. Le dire ici evite la mauvaise surprise au devis. */}
      {res.cadrageAlourdi && (
        <p className="mt-8 rounded-2xl border border-ink/12 bg-surface p-5 text-[13px] leading-[1.7] text-ink-soft">
          Vos règles de fonctionnement ne sont pas encore écrites, ou vos outils
          sont peu connectés. Cela n&apos;augmente pas le prix, mais il faudra
          compter une étape de cadrage avant de construire. Le diagnostic la
          chiffre précisément.
        </p>
      )}

      <p className="mt-10 border-t border-ink/10 pt-5 text-[12px] leading-[1.6] text-ink-soft">
        Estimation indicative calculée à partir de vos réponses. Elle ne constitue
        pas un devis et n&apos;engage pas Odegia. Seul le diagnostic permet un
        chiffrage ferme.
      </p>
    </div>
  );
}
