import type { Metadata } from "next";
import { LegalPage, Block, Facts } from "@/components/site/LegalPage";
import { SITE, LEGAL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site odegia.com, édité par Orbis Optima SASU. Éditeur, hébergeur, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

export default function Page() {
  return (
    <LegalPage
      kicker="Informations légales"
      title="Mentions légales"
      intro="Odegia est une marque exploitée par Orbis Optima SASU. Vous trouverez ici l'identité de l'éditeur du site et celle de son hébergeur."
    >
      <Block title="Éditeur du site">
        <p>
          Le site {SITE.url.replace("https://", "")}, ainsi que son alias{" "}
          {SITE.urlAlias.replace("https://", "")}, est édité par{" "}
          {LEGAL.editeur}. Odegia est une marque commerciale exploitée par cette
          société.
        </p>
        <Facts
          rows={[
            ["Raison sociale", LEGAL.editeur],
            ["Forme juridique", LEGAL.forme],
            ["Capital social", LEGAL.capital],
            ["RCS", LEGAL.rcs],
            ["Siège social", LEGAL.siege],
            ["Directeur de la publication", LEGAL.directeur],
            ["SIREN", LEGAL.siren],
            ["SIRET (siège)", LEGAL.siret],
            ["N° TVA intracommunautaire", LEGAL.tva],
            ["Email", SITE.email],
          ]}
        />
      </Block>

      <Block title="Hébergement">
        <p>
          Le site est hébergé par {LEGAL.hebergeur}, {LEGAL.hebergeurAdresse}.
          Téléphone, {LEGAL.hebergeurTel}. Les serveurs utilisés sont situés en
          France.
        </p>
      </Block>

      <Block title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus de ce site, textes, illustrations,
          méthode de diagnostic, échelle d&apos;autonomie et catalogue de
          briques, est la propriété d&apos;{LEGAL.editeur} ou fait l&apos;objet
          d&apos;une autorisation d&apos;usage. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>
        <p>
          La marque Odegia et le logo associé sont des signes distinctifs
          exploités par {LEGAL.editeur}.
        </p>
      </Block>

      <Block title="Responsabilité">
        <p>
          Les estimations affichées sur ce site, notamment les heures
          récupérables et les délais de retour sur investissement, sont des
          ordres de grandeur issus de notre grille de diagnostic. Elles ne
          constituent ni un devis ni un engagement contractuel. Seul le
          diagnostic permet un chiffrage ferme.
        </p>
        <p>
          Les liens vers des sites tiers, notamment le service de prise de
          rendez-vous, n&apos;engagent pas la responsabilité de l&apos;éditeur
          quant à leur contenu.
        </p>
      </Block>

      <Block title="Contact">
        <p>
          Pour toute question relative au site, écrivez à{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-petrol underline underline-offset-2"
          >
            {SITE.email}
          </a>
          .
        </p>
      </Block>
    </LegalPage>
  );
}
