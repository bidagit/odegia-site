"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SITE } from "@/lib/content";
import {
  NOM_PALIER,
  plafondHeuresSemaine,
  TACHES,
  FREQUENCES,
  TAILLES,
  TAUX,
  OUTILS,
  DOCUMENTATION,
  PART_RECUPERABLE,
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
  /* L envoi a trois issues et l ecran de resultat les distingue. Annoncer un
     email parti alors que rien n a quitte le navigateur trompe le visiteur, et
     c etait le cas jusqu au 25/08/2026, faute de route serveur. */
  const [envoi, setEnvoi] = useState<"repos" | "encours" | "ok" | "echec">("repos");

  const set = <K extends keyof Reponses>(k: K, v: Reponses[K]) =>
    setR((p) => ({ ...p, [k]: v }));

  /* Choisir un effectif repositionne le curseur d heures sur une valeur
     plausible pour cette taille. Sans cela une entreprise de trente personnes
     reste sur la valeur par defaut d un fondateur, et le plafond de realisme
     rabat tout le calcul sur ce chiffre, ce qui annule l effet de l effectif
     qu on vient d introduire. */
  const choisirTaille = (t: string) => {
    const plafond = plafondHeuresSemaine(t);
    setR((p) => ({
      ...p,
      taille: t,
      heuresSemaine: Math.max(1, Math.round(plafond / 4)),
    }));
  };

  const toggle = (k: "taches" | "outils", id: string) =>
    setR((p) => ({
      ...p,
      [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id],
    }));

  const choisies = TACHES.filter((t) => r.taches.includes(t.id));
  const res = useMemo(() => calculer(r), [r]);

  /* Plafond du curseur d heures, derive du modele pour l effectif declare. */
  const plafondHeures = useMemo(
    () => plafondHeuresSemaine(r.taille),
    [r.taille]
  );

  const ecrans = [
    {
      valide: !!r.taille,
      node: (
        <Screen question="Vous êtes">
          {TAILLES.map((t) => (
            <Choice
              key={t}
              label={t}
              selected={r.taille === t}
              onClick={() => choisirTaille(t)}
            />
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
            {/* Le plafond suit l effectif declare a l ecran precedent. Fige a
                30 h, il bloquait toute PME sous le total que le modele savait
                calculer, et le curseur mentait sur ce qui etait representable.
                Le pas s elargit avec la course, un pas de 1 sur 290 h etant
                impraticable a la souris. */}
            <input
              type="range"
              min={1}
              max={plafondHeures}
              step={plafondHeures <= 60 ? 1 : 5}
              value={r.heuresSemaine}
              onChange={(e) => set("heuresSemaine", Number(e.target.value))}
              aria-label="Heures d'administratif par semaine"
              className="mt-5 w-full accent-[#0f7a5c]"
            />
            <div className="mt-1.5 flex justify-between text-[12px] text-ink-soft">
              <span>1 h</span>
              <span>{plafondHeures} h</span>
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
            {/* La duree de conservation annoncee doit correspondre a ce qui
                se passe reellement. Tant qu aucune base ne stocke les reponses,
                annoncer trois ans serait faux dans l autre sens. */}
            <p className="text-[12.5px] leading-[1.6] text-ink-soft">
              Votre estimation part à cette adresse dès validation. Vos réponses
              servent à la produire et à affiner nos barèmes, et vous pouvez
              demander leur suppression à tout moment en écrivant à{" "}
              {SITE.email}.
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
                Je veux aussi recevoir les emails d&apos;Odegia sur
                l&apos;automatisation administrative, quelques envois par
                trimestre. Désinscription en un clic dans chaque message.
              </span>
            </label>
          </div>
        </Screen>
      ),
    },
  ];

  if (fini) return <Resultat res={res} prenom={prenom} envoi={envoi} email={email} />;

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
          onClick={async () => {
            if (!dernier) {
              setEtape((e) => e + 1);
              return;
            }
            /* Le resultat s affiche quoi qu il arrive, il a ete calcule dans le
               navigateur. Seul l envoi de l email depend du serveur. */
            setEnvoi("encours");
            setFini(true);
            try {
              const rep = await fetch("/api/estimation", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email, prenom, optin, reponses: r }),
              });
              setEnvoi(rep.ok ? "ok" : "echec");
            } catch {
              setEnvoi("echec");
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-vert px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-vert-deep disabled:cursor-not-allowed disabled:opacity-35"
        >
          {dernier ? "Voir mon estimation" : "Continuer"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function EtatEnvoi({
  envoi,
  email,
}: {
  envoi: "repos" | "encours" | "ok" | "echec";
  email: string;
}) {
  if (envoi === "repos") return null;

  const base = "mb-8 rounded-2xl border-2 px-5 py-4 text-[13.5px] leading-[1.65]";

  if (envoi === "encours") {
    return (
      <p className={`${base} border-ink/15 bg-surface text-ink-soft`} role="status">
        Envoi de votre estimation à {email} en cours.
      </p>
    );
  }

  if (envoi === "ok") {
    return (
      <p className={`${base} border-vert bg-vert-soft`} role="status">
        Votre estimation part à l&apos;instant vers <strong>{email}</strong>.
      </p>
    );
  }

  return (
    <div className={`${base} border-rose bg-rose-soft`} role="status">
      <p>
        <strong>L&apos;envoi vers {email} a échoué.</strong> Votre estimation
        reste affichée ci-dessous, gardez cette page ouverte ou notez les
        chiffres.
      </p>
      <p className="mt-2 text-ink-soft">
        Écrivez à{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>{" "}
        pour que nous vous la renvoyions, ou réservez directement quinze minutes.
      </p>
    </div>
  );
}

function Resultat({
  res,
  prenom,
  envoi,
  email,
}: {
  res: ReturnType<typeof calculer>;
  prenom: string;
  envoi: "repos" | "encours" | "ok" | "echec";
  email: string;
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
      {/* L etat de l envoi se lit avant tout le reste. Le resultat s affiche de
          toute facon, il a ete calcule dans le navigateur, mais l email depend
          du serveur et le visiteur doit savoir ou il en est. */}
      <EtatEnvoi envoi={envoi} email={email} />

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
        Calculé sur une heure de votre temps valorisée à {euros(res.taux)}. Environ{" "}
        {Math.round(PART_RECUPERABLE * 100)} % de ce temps est récupérable, soit{" "}
        {heures(res.heuresRecuperees)} heures par mois.
      </p>

      {/* L avertissement se lit avant les chiffres detailles et non en bas de
          page. Un ordre de grandeur presente comme un devis se retourne contre
          nous des le premier entretien. */}
      <div className="mt-7 rounded-2xl border-2 border-ink bg-vert-soft p-5 md:p-6">
        <p className="text-[14px] leading-[1.7]">
          <strong>Ces chiffres sont un ordre de grandeur.</strong> Ils viennent
          de moyennes du secteur appliquées à vos réponses, sur des barèmes que
          nous affinons encore. Votre situation réelle peut s&apos;en écarter
          largement, dans un sens comme dans l&apos;autre.
        </p>
        <p className="mt-3 text-[13.5px] leading-[1.7] text-ink-soft">
          Le diagnostic approfondi mesure vos volumes réels, tâche par tâche,
          et remet un rapport de quatre pages avec les chiffres qui vous
          engagent et la feuille de route. C&apos;est lui qui sert de base au
          devis, cette estimation sert à décider si le sujet mérite un entretien.
        </p>
      </div>

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
                {euros(l.gainAnnuel)} récupérés par an, chantier{" "}
                {NOM_PALIER[l.palier]}, {euros(l.cout)}
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
        {/* La remise s'affiche avec son prix plein barré. Un rabais que le
            client ignore ne produit aucun effet, l'ancien forfait offrait
            700 EUR sans que personne ne le sache. */}
        {res.remiseAppliquee && (
          <p className="mt-3 text-[14.5px] leading-[1.7] text-white/75">
            À partir de trois tâches la remise de parc s&apos;applique.{" "}
            <span className="line-through">{euros(res.coutPlein)}</span> devient{" "}
            <strong className="text-white">{euros(res.coutChantier)}</strong>,
            soit {euros(res.remiseEuros)} de moins.
          </p>
        )}
        {/* Le suivi s'annonce avant le retour et non en bas de page. C'est lui
            qui allonge le chiffre, le taire rendrait le retour invérifiable. */}
        <p className="mt-3 text-[14.5px] leading-[1.7] text-white/75">
          S&apos;y ajoute le suivi, {euros(SUIVI_PREMIERE)} hors taxes par mois
          puis {euros(SUIVI_SUIVANTE)} par brique supplémentaire, soit{" "}
          {euros(res.suiviMensuel)} par mois pour ce périmètre. Le retour
          ci-dessous est calculé une fois ce suivi payé.
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
          Vos règles de fonctionnement restent à écrire, ou vos outils
          communiquent peu entre eux. Il faudra donc une étape de cadrage avant
          de construire, et elle peut donner lieu à un supplément. Le diagnostic
          la mesure et la chiffre, cette estimation la laisse de côté.
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
