from __future__ import annotations

from pathlib import Path
from typing import Iterable
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DOSSIER_RAPPORT = ROOT / "rapport"
# La version Word n'est pas suivie dans le dépôt (fichier binaire). Exécutez le
# script localement pour régénérer NathanReyes_RapportRecherche.docx au besoin.
DOCX_PATH = DOSSIER_RAPPORT / "NathanReyes_RapportRecherche.docx"
MD_PATH = DOSSIER_RAPPORT / "NathanReyes_RapportRecherche.md"

# Contenu du rapport structuré en éléments simples. Chaque entrée représente
# un paragraphe avec un style spécifique.
DOCUMENT = [
    {"type": "title", "text": "Application Dofus – Rapport de recherche sur SvelteKit"},
    {"type": "subtitle", "text": "Cours : Technologie émergente (Automne 2025)"},
    {"type": "paragraph", "text": "Étudiant : Nathan Reyes"},
    {"type": "paragraph", "text": "Enseignant : Étienne Rivard"},
    {"type": "paragraph", "text": "Date de remise : 29 novembre 2025"},
    {"type": "blank"},
    {"type": "heading1", "text": "Table des matières"},
    {"type": "paragraph", "text": "1. Retour sur la technologie"},
    {"type": "paragraph", "text": "2. Métier lié à la technologie"},
    {"type": "paragraph", "text": "3. Retour sur l'élaboration du prototype"},
    {"type": "paragraph", "text": "4. Recherche et documentation"},
    {"type": "paragraph", "text": "5. Bibliographie"},
    {"type": "blank"},
    {"type": "heading1", "text": "1. Retour sur la technologie"},
    {"type": "heading2", "text": "1.1 Introduction"},
    {
        "type": "paragraph",
        "text": (
            "Ce projet de session explore SvelteKit en tant que technologie émergente. "
            "Au démarrage, mes attentes portaient sur la capacité du framework à offrir "
            "une expérience de développement rapide pour un outil de comparaison "
            "d'équipements Dofus tout en restant accessible à un étudiant de niveau cégep."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "Je souhaitais valider que SvelteKit permette de structurer une application "
            "simple avec navigation multipage, gestion d'état locale et intégration de "
            "données statiques sans configurer un serveur complexe."
        ),
    },
    {"type": "heading2", "text": "1.2 Concepts clés et carte mentale"},
    {
        "type": "paragraph",
        "text": (
            "La carte mentale ci-dessous résume les principaux concepts étudiés autour de SvelteKit :"
        ),
    },
    {
        "type": "paragraph",
        "text": "• Noyau SvelteKit : routage basé sur le système de fichiers, chargement de données, actions." ,
    },
    {
        "type": "paragraph",
        "text": "• Interface utilisateur : composants Svelte réactifs, gestion des formulaires, styles SCSS." ,
    },
    {
        "type": "paragraph",
        "text": "• Données locales : utilisation de fichiers JSON, stores persistants et synchronisation." ,
    },
    {
        "type": "paragraph",
        "text": "• Outils : Vite pour le développement, TypeScript pour la sécurité, tests via npm run check." ,
    },
    {
        "type": "paragraph",
        "text": (
            "• Livraison : génération statique possible, déploiement léger sur un hébergement statique."
        ),
    },
    {
        "type": "heading2", "text": "1.3 Avis et matrice de décision"},
    {
        "type": "paragraph",
        "text": (
            "Après expérimentation, SvelteKit se démarque par sa simplicité de prise en main, "
            "ses performances et l'unification entre frontend et logique de chargement."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "La matrice de décision suivante compare SvelteKit à d'autres solutions étudiées :"
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "• Critères : facilité d'apprentissage, performance, écosystème, support TypeScript, "
            "adaptation au prototypage."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "• SvelteKit : 5/5 sur la facilité (documentation claire), 4/5 en performance (rendue côté serveur), "
            "4/5 pour l'écosystème (communauté en croissance), 5/5 en TypeScript, 5/5 en prototypage."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "• Next.js : 3/5 en facilité (concepts plus nombreux), 4/5 en performance, 5/5 pour l'écosystème, "
            "4/5 en TypeScript, 4/5 pour le prototypage."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "• Nuxt 3 : 4/5 en facilité (Vue familier), 4/5 en performance, 4/5 pour l'écosystème, "
            "4/5 en TypeScript, 4/5 pour le prototypage."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "Cette analyse confirme que SvelteKit répond efficacement aux besoins du projet, "
            "en particulier pour la réalisation rapide d'une preuve de concept."
        ),
    },
    {"type": "heading1", "text": "2. Métier lié à la technologie"},
    {
        "type": "heading2",
        "text": "2.1 Poste ciblé : Développeur ou développeuse front-end Svelte",
    },
    {
        "type": "paragraph",
        "text": "Compétences requises :", 
    },
    {
        "type": "paragraph",
        "text": "• Maîtrise de Svelte et SvelteKit, bonnes pratiques HTML/CSS/TypeScript.",
    },
    {
        "type": "paragraph",
        "text": "• Connaissances UX/UI, intégration d'API REST et outils de build modernes.",
    },
    {
        "type": "paragraph",
        "text": "• Capacité à documenter et à travailler en équipe agile.",
    },
    {
        "type": "paragraph",
        "text": "Tâches principales :",
    },
    {
        "type": "paragraph",
        "text": "• Concevoir des composants réactifs et optimiser les performances côté client.",
    },
    {
        "type": "paragraph",
        "text": "• Mettre en place des parcours utilisateurs, gérer l'état et les tests d'interface.",
    },
    {
        "type": "paragraph",
        "text": "• Collaborer avec les équipes backend et assurer la veille technologique.",
    },
    {
        "type": "paragraph",
        "text": (
            "Description : spécialiste du développement Web moderne, garantissant une expérience "
            "utilisateur fluide grâce à SvelteKit et à la performance du rendu hybride."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "Salaire moyen au Québec : entre 68 000 $ et 82 000 $ par année selon Emploi Québec (profil 2024)."
        ),
    },
    {"type": "heading1", "text": "3. Retour sur l'élaboration du prototype"},
    {"type": "heading2", "text": "3.1 Exigences techniques"},
    {
        "type": "paragraph",
        "text": "Le prototype respecte les exigences suivantes :",
    },
    {
        "type": "paragraph",
        "text": "• Catalogue local d'équipements avec recherche, filtres de type, niveaux et effets.",
    },
    {
        "type": "paragraph",
        "text": "• Gestion des prix personnalisés enregistrés dans le navigateur (localStorage).",
    },
    {
        "type": "paragraph",
        "text": "• Création de panoplies avec emplacements prédéfinis (chapeau, anneaux, dofus, familier).",
    },
    {
        "type": "paragraph",
        "text": "• Calcul automatique du coût total, du niveau minimal et des effets cumulés.",
    },
    {
        "type": "paragraph",
        "text": "• Comparaison de deux panoplies et export CSV prévu dans les itérations futures.",
    },
    {"type": "heading2", "text": "3.2 Fiches de dépannage"},
    {
        "type": "paragraph",
        "text": "Problème 1 : Filtrage qui échoue lorsque le nom d'un équipement est vide.",
    },
    {
        "type": "paragraph",
        "text": "Causes possibles : données incomplètes dans le JSON d'équipements.",
    },
    {
        "type": "paragraph",
        "text": "Solution : ignorer les entrées sans nom avant tout filtrage." ,
    },
    {
        "type": "paragraph",
        "text": "Problème 2 : Plantage sur toLowerCase lors de la recherche.",
    },
    {
        "type": "paragraph",
        "text": "Causes possibles : valeurs nulles renvoyées par certains champs.",
    },
    {
        "type": "paragraph",
        "text": "Solution : normaliser chaque texte avec une conversion en chaîne sécurisée." ,
    },
    {
        "type": "paragraph",
        "text": "Problème 3 : Incohérence entre emplacements et types d'équipements.",
    },
    {
        "type": "paragraph",
        "text": "Causes possibles : absence de correspondance stricte entre les catégories.",
    },
    {
        "type": "paragraph",
        "text": "Solution : définir une table des emplacements avec les types compatibles et filtrer la liste." ,
    },
    {"type": "heading2", "text": "3.3 Prototype vs attentes"},
    {
        "type": "paragraph",
        "text": (
            "Le prototype répond aux objectifs : consultation détaillée d'un équipement, gestion de "
            "plusieurs panoplies personnalisées, comparaison et suivi du coût total selon les prix saisis."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "Les interactions sont réalisées entièrement côté client, démontrant la pertinence de "
            "SvelteKit pour une application locale et réactive."
        ),
    },
    {"type": "heading2", "text": "3.4 Avis sur la solution"},
    {
        "type": "paragraph",
        "text": (
            "SvelteKit offre une longévité prometteuse grâce à une communauté active et à une "
            "intégration étroite avec Vite. Les composants sont stables, performants et maintenables "
            "grâce à TypeScript et aux stores centralisés."
        ),
    },
    {
        "type": "paragraph",
        "text": (
            "Les pratiques adoptées (normalisation des données, séparation des services et stores) "
            "assurent une base solide pour faire évoluer le projet."
        ),
    },
    {"type": "heading1", "text": "4. Recherche et documentation"},
    {"type": "heading2", "text": "4.1 Veille hebdomadaire"},
    {
        "type": "paragraph",
        "text": "Semaine du 9 septembre : lecture du guide officiel de démarrage SvelteKit et tutoriels Vite.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 16 septembre : analyse de la structure des routes et des layouts dynamiques.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 23 septembre : veille sur les stores Svelte et la persistance localStorage.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 30 septembre : lecture sur l'accessibilité des composants et les formulaires.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 7 octobre : expérimentation des chargements de données et endpoints.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 14 octobre : comparaison entre SvelteKit, Next.js et Nuxt dans des études de cas.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 21 octobre : recherche sur les meilleures pratiques de typage TypeScript.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 28 octobre : veille UI sur les catalogues d'objets et affichage d'icônes.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 4 novembre : tests des méthodes de comparaison de panoplies et calculs d'effets.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 11 novembre : recherche sur les options d'export CSV et PDF en SvelteKit.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 18 novembre : veille sur la performance et la gestion des images locales.",
    },
    {
        "type": "paragraph",
        "text": "Semaine du 25 novembre : préparation de la présentation finale et revue des fonctionnalités.",
    },
    {"type": "heading1", "text": "5. Bibliographie"},
    {
        "type": "paragraph",
        "text": (
            "Svelte Society. \"SvelteKit Documentation\", consulté entre septembre et novembre 2025."
        ),
    },
    {
        "type": "paragraph",
        "text": "Vite. \"Guide officiel\", consulté en septembre 2025.",
    },
    {
        "type": "paragraph",
        "text": (
            "Emploi Québec. \"Développeur Web – statistiques salariales 2024\", consulté le 20 octobre 2025."
        ),
    },
]

STYLE_MAP = {
    "title": "Title",
    "subtitle": "Subtitle",
    "heading1": "Heading1",
    "heading2": "Heading2",
}

STYLES_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">
  <w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\">
    <w:name w:val=\"Normal\"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type=\"paragraph\" w:styleId=\"Title\">
    <w:name w:val=\"Titre\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:next w:val=\"Normal\"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type=\"paragraph\" w:styleId=\"Subtitle\">
    <w:name w:val=\"Sous-titre\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:next w:val=\"Normal\"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type=\"paragraph\" w:styleId=\"Heading1\">
    <w:name w:val=\"Titre 1\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:next w:val=\"Normal\"/>
    <w:uiPriority w:val=\"9\"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type=\"paragraph\" w:styleId=\"Heading2\">
    <w:name w:val=\"Titre 2\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:next w:val=\"Normal\"/>
    <w:uiPriority w:val=\"9\"/>
    <w:qFormat/>
  </w:style>
</w:styles>
"""

CONTENT_TYPES_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">
  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>
  <Default Extension=\"xml\" ContentType=\"application/xml\"/>
  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>
  <Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/>
</Types>
"""

RELS_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>
</Relationships>
"""

DOCUMENT_RELS_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>
</Relationships>
"""


def escape_xml(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def paragraph_to_xml(paragraph: dict) -> str:
    if paragraph["type"] == "blank":
        return "<w:p/>"

    text = escape_xml(paragraph.get("text", ""))
    style = STYLE_MAP.get(paragraph["type"])

    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    if text == "":
        return f"<w:p>{ppr}<w:r><w:t/></w:r></w:p>"
    return (
        f"<w:p>{ppr}<w:r><w:t xml:space=\"preserve\">{text}</w:t></w:r></w:p>"
    )


def build_document_xml(paragraphs: Iterable[dict]) -> str:
    body = "".join(paragraph_to_xml(p) for p in paragraphs)
    sect_pr = (
        "<w:sectPr>"
        "<w:pgSz w:w=\"11906\" w:h=\"16838\"/>"
        "<w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\" w:header=\"708\" w:footer=\"708\" w:gutter=\"0\"/>"
        "<w:cols w:space=\"708\"/>"
        "<w:docGrid w:linePitch=\"360\"/>"
        "</w:sectPr>"
    )
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<w:document xmlns:wpc=\"http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas\" "
        "xmlns:mc=\"http://schemas.openxmlformats.org/markup-compatibility/2006\" "
        "xmlns:o=\"urn:schemas-microsoft-com:office:office\" "
        "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" "
        "xmlns:m=\"http://schemas.openxmlformats.org/officeDocument/2006/math\" "
        "xmlns:v=\"urn:schemas-microsoft-com:vml\" "
        "xmlns:wp14=\"http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing\" "
        "xmlns:wp=\"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing\" "
        "xmlns:w10=\"urn:schemas-microsoft-com:office:word\" "
        "xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" "
        "xmlns:w14=\"http://schemas.microsoft.com/office/word/2010/wordml\" "
        "xmlns:wpg=\"http://schemas.microsoft.com/office/word/2010/wordprocessingGroup\" "
        "xmlns:wpi=\"http://schemas.microsoft.com/office/word/2010/wordprocessingInk\" "
        "xmlns:wne=\"http://schemas.microsoft.com/office/word/2006/wordml\" "
        "xmlns:wps=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\" "
        "mc:Ignorable=\"w14 wp14\">"
        f"<w:body>{body}{sect_pr}</w:body></w:document>"
    )


def build_markdown(paragraphs: Iterable[dict]) -> str:
    lines: list[str] = []
    for item in paragraphs:
        type_ = item["type"]
        if type_ == "blank":
            lines.append("")
            continue
        text = item.get("text", "")
        if type_ == "title":
            lines.append(f"# {text}")
        elif type_ == "subtitle":
            lines.append(f"## {text}")
        elif type_ == "heading1":
            lines.append(f"## {text}")
        elif type_ == "heading2":
            lines.append(f"### {text}")
        else:
            lines.append(text)
    return "\n".join(lines) + "\n"


def generer_docx() -> None:
    document_xml = build_document_xml(DOCUMENT)
    with zipfile.ZipFile(DOCX_PATH, "w") as archive:
        archive.writestr("[Content_Types].xml", CONTENT_TYPES_XML)
        archive.writestr("_rels/.rels", RELS_XML)
        archive.writestr("word/document.xml", document_xml)
        archive.writestr("word/_rels/document.xml.rels", DOCUMENT_RELS_XML)
        archive.writestr("word/styles.xml", STYLES_XML)


def generer_markdown() -> None:
    md_content = build_markdown(DOCUMENT)
    MD_PATH.write_text(md_content, encoding="utf-8")


def main() -> None:
    DOSSIER_RAPPORT.mkdir(exist_ok=True)
    generer_docx()
    generer_markdown()
    print(f"Fichiers générés dans {DOSSIER_RAPPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
