import type { Metadata } from "next";
import { LegalPage, Block, Facts } from "@/components/site/LegalPage";
import { SITE, LEGAL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Odegia traite vos données personnelles. Finalités, bases légales, durées de conservation, sous-traitants et droits RGPD.",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return (
    <LegalPage
      kicker="Données personnelles"
      title="Politique de confidentialité"
      intro="Ce que nous collectons, pourquoi, combien de temps nous le gardons, et comment reprendre la main. Nous ne collectons rien qui ne serve directement à répondre à votre demande."
    >
      <Block title="Responsable du traitement">
        <p>
          {LEGAL.editeur}, {LEGAL.siege}, immatriculée au RCS de {LEGAL.rcs}.
          Contact pour toute question relative aux données,{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-petrol underline underline-offset-2"
          >
            {SITE.email}
          </a>
          .
        </p>
      </Block>

      <Block title="Ce que nous collectons, et pourquoi">
        <Facts
          rows={[
            [
              "Prise de rendez-vous",
              "Nom, email et créneau choisi. Base légale, votre demande. Traitée via Google Agenda.",
            ],
            [
              "Échanges par email",
              "Les informations que vous nous écrivez. Base légale, votre demande.",
            ],
            [
              "Diagnostic",
              "Réponses au questionnaire et données d'activité nécessaires au chiffrage. Base légale, l'exécution de la prestation.",
            ],
            [
              "Journaux serveur",
              "Adresse IP et pages consultées, conservées par l'hébergeur à des fins de sécurité. Base légale, notre intérêt légitime.",
            ],
          ]}
        />
        <p>
          Nous ne demandons ni votre chiffre d&apos;affaires détaillé, ni vos
          identifiants bancaires, à aucun moment.
        </p>
      </Block>

      <Block title="Cookies et mesure d'audience">
        <p>
          Ce site ne dépose aucun cookie publicitaire, aucun traceur tiers et
          aucun outil de mesure d&apos;audience. Aucune bannière de consentement
          n&apos;est donc nécessaire. Si un outil de mesure était ajouté, cette
          page serait mise à jour et votre consentement recueilli avant tout
          dépôt.
        </p>
      </Block>

      <Block title="Sous-traitants">
        <Facts
          rows={[
            ["Hébergement du site", `${LEGAL.hebergeur}, serveurs en France`],
            ["Prise de rendez-vous", "Google Ireland Limited, Google Agenda"],
            ["Messagerie", "Fournisseur de messagerie professionnelle"],
          ]}
        />
        <p>
          Certains de ces prestataires appartiennent à des groupes établis hors
          de l&apos;Union européenne. Les transferts éventuels sont encadrés par
          les clauses contractuelles types de la Commission européenne.
        </p>
      </Block>

      <Block title="Durées de conservation">
        <Facts
          rows={[
            ["Demande restée sans suite", "3 ans à compter du dernier contact"],
            ["Dossier client", "Durée de la relation, puis 5 ans"],
            ["Pièces comptables", "10 ans, obligation légale"],
            ["Journaux serveur", "12 mois au plus"],
          ]}
        />
      </Block>

      <Block title="Confidentialité des données de mission">
        <p>
          Lorsque nous construisons une brique, nous accédons aux outils
          strictement nécessaires, et uniquement au périmètre concerné. Nous
          n&apos;accédons jamais à un compte bancaire ni à un moyen de paiement,
          y compris en lecture seule. C&apos;est une clause de nos contrats, pas
          seulement un engagement de cette page.
        </p>
        <p>
          Lorsque la sensibilité du domaine l&apos;impose, les traitements par
          modèle de langage sont exécutés localement plutôt que chez un
          fournisseur tiers. Ce choix est arbitré au diagnostic et écrit dans la
          proposition.
        </p>
      </Block>

      <Block title="Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité.
          Écrivez à{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-petrol underline underline-offset-2"
          >
            {SITE.email}
          </a>
          , nous répondons sous un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL, 3
          place de Fontenoy, 75007 Paris, ou déposer une plainte sur cnil.fr.
        </p>
      </Block>
    </LegalPage>
  );
}
