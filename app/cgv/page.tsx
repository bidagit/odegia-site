import type { Metadata } from "next";
import { LegalPage, Block, Facts } from "@/components/site/LegalPage";
import { SITE, LEGAL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente d'Odegia, marque d'Orbis Optima SASU. Diagnostic, briques, suivi, propriété des livrables et confidentialité.",
  alternates: { canonical: "/cgv" },
};

export default function Page() {
  return (
    <LegalPage
      kicker="Conditions"
      title="Conditions générales de vente"
      intro="Ces conditions s'appliquent aux prestations vendues sous la marque Odegia à des clients professionnels. Elles forment le socle de la négociation commerciale et sont complétées par la proposition signée."
    >
      <Block title="1. Champ d'application">
        <p>
          Les présentes conditions régissent les prestations fournies par{" "}
          {LEGAL.editeur} sous la marque Odegia. Elles s&apos;adressent
          exclusivement à des professionnels, entreprises, associations et
          organismes publics, agissant dans le cadre de leur activité.
        </p>
        <p>
          Toute commande implique leur acceptation sans réserve. En cas de
          contradiction, les termes de la proposition signée prévalent sur les
          présentes.
        </p>
      </Block>

      <Block title="2. Prestations">
        <Facts
          rows={[
            [
              "Diagnostic",
              "Formulaire préalable, entretien, puis rapport écrit remis sous 72 heures ouvrées.",
            ],
            [
              "Brique",
              "Automatisation d'une tâche identifiée, livrée au niveau d'autonomie convenu dans la proposition.",
            ],
            [
              "Suivi et gouvernance",
              "Supervision, correction des dérives et ajustements, par abonnement mensuel.",
            ],
          ]}
        />
        <p>
          Le périmètre se compte en briques. Une demande d&apos;automatisation
          globale sans périmètre défini ne peut pas être acceptée.
        </p>
      </Block>

      <Block title="3. Prix et paiement">
        <p>
          Les prix sont exprimés en euros hors taxes. La TVA au taux en vigueur
          s&apos;ajoute. Les tarifs affichés sur le site sont indicatifs, seul
          le devis fait foi. Un devis est valable trente jours.
        </p>
        <p>
          Le diagnostic est payable à la commande. Les chantiers sont facturés
          pour moitié à la commande et pour moitié à la livraison, sauf
          échelonnement prévu au devis. Les abonnements sont facturés
          mensuellement à terme échu.
        </p>
        <p>
          Le montant du diagnostic est déduit du chantier si celui-ci est
          confié dans les trois mois suivant la remise du rapport.
        </p>
        <p>
          En cas de retard, des pénalités égales à trois fois le taux
          d&apos;intérêt légal sont dues de plein droit, ainsi qu&apos;une
          indemnité forfaitaire de recouvrement de 40 euros, conformément au
          code de commerce.
        </p>
      </Block>

      <Block title="4. Obligations du client">
        <p>
          Le client fournit les accès, informations et interlocuteurs
          nécessaires. Un retard imputable au client décale d&apos;autant les
          délais, sans indemnité.
        </p>
        <p>
          Les abonnements aux outils tiers nécessaires au fonctionnement des
          livrables restent souscrits au nom du client et payés par lui.
        </p>
      </Block>

      <Block title="5. Nature de l'engagement">
        <p>
          Nous sommes tenus à une obligation de moyens. Les gains de temps et
          les délais de retour sur investissement figurant dans nos documents
          sont des estimations fondées sur les informations transmises par le
          client, ils ne constituent pas une garantie de résultat.
        </p>
        <p>
          Les systèmes livrés produisent ou décident selon des règles écrites et
          validées. Le client conserve la gouvernance et la responsabilité des
          décisions prises par le système sur son périmètre. Aucun accès à un
          compte bancaire ou à un moyen de paiement n&apos;est demandé ni
          accepté, y compris en lecture seule.
        </p>
      </Block>

      <Block title="6. Propriété des livrables">
        <p>
          Le rapport de diagnostic est la propriété du client dès son paiement
          intégral.
        </p>
        <p>
          Les briques livrées, paramétrages et documentations associés sont
          cédés au client au paiement intégral du chantier, pour ses besoins
          propres. {LEGAL.editeur} conserve la propriété de sa méthode, de ses
          composants génériques et de son savoir-faire, et reste libre de les
          réutiliser pour d&apos;autres clients.
        </p>
      </Block>

      <Block title="7. Confidentialité et données">
        <p>
          Chaque partie garde confidentielles les informations reçues de
          l&apos;autre. Le traitement des données personnelles est décrit dans
          notre{" "}
          <a
            href="/confidentialite"
            className="font-medium text-violet underline underline-offset-2"
          >
            politique de confidentialité
          </a>
          .
        </p>
      </Block>

      <Block title="8. Résiliation">
        <p>
          Les abonnements de suivi et de gouvernance sont sans engagement de
          durée et résiliables par écrit avec un préavis de trente jours, la
          période en cours restant due.
        </p>
        <p>
          L&apos;abandon d&apos;un chantier en cours par le client donne lieu au
          règlement des travaux réalisés à la date d&apos;arrêt.
        </p>
      </Block>

      <Block title="9. Droit applicable">
        <p>
          Les présentes sont soumises au droit français. À défaut de résolution
          amiable, compétence est attribuée aux tribunaux du ressort du siège
          social de {LEGAL.editeur}.
        </p>
        <p>
          Pour toute question, écrivez à{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-violet underline underline-offset-2"
          >
            {SITE.email}
          </a>
          .
        </p>
      </Block>
    </LegalPage>
  );
}
