#!/usr/bin/env python3
"""Generate SP4 ClickUp backlog deliverables from strategic reframing plan."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"


def us_body(
    metier: str,
    inclus: list[str],
    exclus: list[str],
    ac: list[str],
    erreurs: list[str],
    regles: list[str],
    validation: list[str],
    hypotheses: list[str],
    proto_valide: list[str] | None = None,
    mvp_cible: list[str] | None = None,
    hors_proto: list[str] | None = None,
) -> str:
    parts = ["Description métier", "", metier, "", "Périmètre", "", "Inclus", ""]
    parts.extend(f"- {x}" for x in inclus)
    parts.extend(["", "Exclus", ""])
    parts.extend(f"- {x}" for x in exclus)
    parts.extend(["", "Critères d’acceptation", ""])
    parts.extend(f"- {x}" for x in ac)
    parts.extend(["", "Cas d’erreur / limites", ""])
    parts.extend(f"- {x}" for x in erreurs)
    parts.extend(["", "Règles de gestion", ""])
    parts.extend(f"- {x}" for x in regles)
    parts.extend(["", "Validation fonctionnelle", ""])
    parts.extend(f"- {x}" for x in validation)
    parts.extend(["", "Hypothèses", ""])
    parts.extend(f"- {x}" for x in hypotheses)
    if proto_valide:
        parts.extend(["", "Validé sur prototype UX (référence démo)", ""])
        parts.extend(f"- {x}" for x in proto_valide)
    if mvp_cible:
        parts.extend(["", "Implémentation MVP cible", ""])
        parts.extend(f"- {x}" for x in mvp_cible)
    if hors_proto:
        parts.extend(["", "Hors périmètre prototype (exigence MVP conservée)", ""])
        parts.extend(f"- {x}" for x in hors_proto)
    return "\n".join(parts)


# --- UPDATE: 86c9n9a4t → US-A (product logical model) ---
US_4T_A_NAME = (
    "ETQ équipe produit, je veux un modèle logique de versioning contrat "
    "afin d’aligner parcours utilisateur et règles de publication"
)
US_4T_A_DESC = us_body(
    metier=(
        "Le MVP doit formaliser la distinction entre (1) un contrat publié immuable, "
        "(2) une copie de travail non publiée (working copy / révision ouverte), et "
        "(3) l’historique des publications. Ce modèle logique guide l’UI et les règles "
        "métier, indépendamment du détail d’implémentation backend."
    ),
    inclus=[
        "Statuts lifecycle : proposed, draft, active, deprecated, retired",
        "Révision ouverte sur contrat active (working copy) sans statut lifecycle « revision »",
        "Une seule version active publiée à la fois ; historique append-only",
        "Snapshot logique du contenu exportable + gouvernance versionnée à chaque publication",
        "Séparation : contenu YAML exportable vs gouvernance app-only (owner, contacts)",
        "Brouillon non publié ≠ version officielle dans l’historique",
    ],
    exclus=[
        "Entité Draft comme écran ou navigation séparée obligatoire",
        "Bouton Save draft comme action P0",
        "Collaboration temps réel",
        "Approval workflow",
    ],
    ac=[
        "Le parcours documente working copy, révision ouverte et versions publiées",
        "Une publication ne crée une version officielle que via Publish (simulé ou réel)",
        "Compare et changelog respectent la séparation export vs gouvernance",
        "Le modèle logique est documenté dans la doc produit MVP",
    ],
    erreurs=[
        "Confusion entre statut lifecycle active et révision ouverte",
        "Afficher la working copy comme version publiée dans la timeline",
    ],
    regles=[
        "Toute évolution d’un contrat active publié passe par New version puis Publish update",
        "Les versions publiées ne sont jamais modifiées in place",
    ],
    validation=[
        "Revue produit avec scénarios S11, S11b, S22 (doc QA)",
        "Alignement libellés UI : Working copy, Revision open, Discard changes",
    ],
    hypotheses=[
        "Le backend matérialisera Draft/PublishedVersion ; l’UI peut projeter sur un contrat courant",
    ],
    proto_valide=[
        "inRevision + badge Revision open ; working copy en tête de Versions",
        "Compare export-only ; changelog publish avec gouvernance",
    ],
    mvp_cible=[
        "Documentation produit et critères d’acceptation transverses SP4",
        "Cohérence avec entités backend (voir US CREATE modèle persistance)",
    ],
    hors_proto=[
        "Persistance SQL, APIs REST, structure tables — US technique dédiée",
    ],
)

# --- CREATE: 86c9n9a4t-B (backend) ---
US_4T_B_NAME = (
    "ETQ système, je veux persister le modèle Contract / Draft / PublishedVersion "
    "afin de supporter le versioning et l’audit MVP backend"
)
US_4T_B_DESC = us_body(
    metier=(
        "Le backend MVP doit persister un modèle clair : contrat logique, brouillon "
        "éditable, versions publiées immuables, objets de schéma, métadonnées de "
        "publication (checksum, commit Git). Validé en UX sur le prototype ; "
        "implémentation cible : API + base + Git connecté."
    ),
    inclus=[
        "Entités : Contract, Draft (ou équivalent brouillon), PublishedVersion",
        "SchemaObject, SchemaProperty liés au contrat / brouillon",
        "Statuts Draft / Active / Deprecated sur les versions publiées",
        "Métadonnées publication : version, auteur, changelog, type Update/Breaking",
        "Checksum MD5 sur le YAML effectivement publié",
        "Commit hash Git correspondant à l’écriture repository",
        "Immutabilité des versions publiées (refus update API)",
        "Soft delete contrat avec conservation audit versions",
    ],
    exclus=[
        "Modèle collaboratif temps réel",
        "Policies Zeenea avancées",
        "Data product assembly",
    ],
    ac=[
        "Le modèle distingue brouillon non publié et version publiée append-only",
        "Un brouillon peut être créé depuis une version Active",
        "Une seule version Active par contrat",
        "Chaque publication stocke MD5 du YAML publié et hash commit Git",
        "Les API refusent la modification directe d’une PublishedVersion Active/Deprecated",
        "Le modèle permet la génération YAML ODCS v3.1.0",
    ],
    erreurs=[
        "Tentative de PATCH sur version publiée → 409 ou équivalent",
        "Échec persistance brouillon → erreur explicite (pas de perte silencieuse)",
    ],
    regles=[
        "La base applicative porte l’édition des brouillons ; Git porte les YAML auditables",
        "Un brouillon non publié n’est pas une version officielle",
    ],
    validation=[
        "Tests persistance Draft vs PublishedVersion",
        "Tests migration depuis stockage prototype si applicable",
        "Tests immutabilité API",
    ],
    hypotheses=[
        "L’UI peut agréger Contract + Draft en une vue ; le backend reste normalisé",
    ],
    proto_valide=[
        "Parcours et règles métier validés en démo locale (localStorage, gitHistory simulé)",
    ],
    mvp_cible=[
        "Schéma de données, APIs CRUD brouillon, publish, historique",
        "Intégration Git : voir SP5 — Publish & Gitops pour l’exécution push",
    ],
    hors_proto=[
        "Détail des écrans React et localStorage",
    ],
)

UPDATES: dict[str, tuple[str, str]] = {
    "86c9n9a5x": (
        "ETQ utilisateur, je veux ouvrir une révision (New version) sur un contrat active "
        "afin de modifier le contrat sans altérer la version publiée",
        us_body(
            metier=(
                "Un contrat active publié est immuable. L’utilisateur (Publisher ou Contributor) "
                "ouvre une révision via New version : copie de travail (working copy) sur la "
                "base de la dernière version publiée, sans modifier la publication courante."
            ),
            inclus=[
                "Bouton New version sur contrat active (sans révision déjà ouverte)",
                "Badge Revision open : révision en cours (statut lifecycle reste Active)",
                "Version affichée = dernière version publiée jusqu’à Publish update",
                "Contenu éditable = working copy (fondamentals, schema, gouvernance, etc.)",
                "Publish update proposera minor/major (pas à l’ouverture de la révision)",
                "Création brouillon côté backend à l’ouverture de révision (MVP)",
            ],
            exclus=[
                "Modification directe du contrat active sans révision",
                "Écran ou navigation « Draft » séparé obligatoire",
                "Merge collaboratif, approval workflow, rollback publié",
                "Détection automatique breaking changes",
            ],
            ac=[
                "New version disponible sur active pour Publisher et Contributor",
                "Au clic : révision ouverte (Revision open visible) ; active publiée inchangée",
                "La working copy reprend le contenu de la dernière publication",
                "L’utilisateur peut éditer toutes les sections autorisées par son rôle",
                "Reader ne voit pas New version",
                "Un seul brouillon de travail actif par contrat",
            ],
            erreurs=[
                "Tentative d’édition sur active sans révision → lecture seule avec message explicite",
            ],
            regles=[
                "Toute modification d’un active publié passe par New version puis Publish update",
                "Le choix minor/major est manuel à la publication (MVP)",
            ],
            validation=[
                "UX : scénario S22 (Revision open badge)",
                "MVP : test API création brouillon depuis version Active",
            ],
            hypotheses=[
                "Le prototype utilise inRevision sur un contrat unique ; le backend peut matérialiser un Draft",
            ],
            proto_valide=[
                "handleNewVersion → inRevision ; bannière read-only sur active sans révision",
            ],
            mvp_cible=[
                "API POST brouillon depuis version active ; lien version source",
            ],
        ),
    ),
    "86c9n9a60": (
        "ETQ système, je veux stocker les métadonnées de publication afin de tracer "
        "chaque version activée (audit MVP)",
        us_body(
            metier=(
                "Chaque publication (première ou mise à jour) enregistre des métadonnées "
                "d’audit : version, auteur, changelog, type de changement, snapshot, "
                "checksum MD5 du YAML publié, référence commit Git. Validé en UX sur le "
                "prototype (simulation) ; cible MVP : persistance backend + Git réel (SP5)."
            ),
            inclus=[
                "Version publiée, statut final, date, auteur",
                "Titre stable et changelog multiligne (What changed?)",
                "Type Update ou Breaking (choix utilisateur à la publish)",
                "Snapshot du contenu exportable + gouvernance versionnée",
                "Checksum MD5 calculé sur le YAML effectivement écrit dans Git",
                "Commit hash de l’écriture repository",
                "Chemin ou convention fichier YAML ({contractId}_{version}.yaml)",
                "Immutabilité des métadonnées une fois publiées",
            ],
            exclus=[
                "Journal collaboration temps réel",
                "Signature électronique",
                "Traçabilité de chaque frappe autosave",
            ],
            ac=[
                "Chaque Publish crée un enregistrement de métadonnées consultable dans Versions",
                "Changelog stocké ; défaut auto-généré si vide (première publish ou delta)",
                "MD5 correspond au YAML publié ; hash commit correspond au commit Git",
                "Métadonnées immutables ; conservées après soft delete contrat (audit)",
                "Publication gouvernance seule (YAML inchangé) : métadonnées + note explicite",
            ],
            erreurs=[
                "Échec écriture Git → publication non finalisée (contrat non promu Active)",
            ],
            regles=[
                "Versions publiées append-only ; métadonnées non modifiables par édition ultérieure",
                "Exécution push Git : voir SP5 — Publish & Gitops",
            ],
            validation=[
                "UX : changelog first/update, Option B gouvernance",
                "MVP : tests MD5, commit hash, immutabilité, échec Git",
            ],
            hypotheses=[
                "Prototype : hash local simulé ; MVP : vrais MD5 et SHA commit Git",
            ],
            proto_valide=[
                "gitHistory avec title, changelog, snapshot ; PushToGitModal steps simulés",
            ],
            mvp_cible=[
                "Table PublishedVersion + colonnes audit ; intégration SP5 pour push",
            ],
            hors_proto=[
                "Connexion repository réelle (détail dans SP5)",
            ],
        ),
    ),
    "86c9n9a6m": (
        "ETQ utilisateur, je veux consulter l’historique des versions et la working copy "
        "afin de suivre l’évolution d’un contrat",
        us_body(
            metier=(
                "La section Versions affiche la timeline des publications et, le cas échéant, "
                "une carte Working copy en tête (changements non publiés). L’utilisateur "
                "compare, abandonne des changements, et consulte audit (MD5, commit) sur le MVP."
            ),
            inclus=[
                "Section Versions dédiée (sans onglets Form/YAML du bandeau)",
                "Timeline versions publiées : version, statut Active/Deprecated, date, changelog",
                "Carte Working copy si révision ou brouillon avec changements",
                "Résumé des changements depuis dernière publication (export + gouvernance résumée)",
                "Compare depuis working copy ; Discard changes avec confirmation",
                "Checksum MD5 et commit hash visibles ou accessibles par version (MVP)",
                "État vide si jamais publié",
            ],
            exclus=[
                "Rollback version publiée",
                "Suppression version publiée depuis l’UI",
                "Restauration d’un brouillon abandonné",
                "Time Machine Git complète",
            ],
            ac=[
                "Première publication visible ; active et deprecated distinguées",
                "Working copy non comptée comme version publiée",
                "Messages : No changes since last version / Revision open - no changes…",
                "Compare par défaut working copy vs dernière active depuis la carte",
                "Discard ouvre modale ; restaure dernier snapshot publié",
                "MD5 et commit hash affichés pour chaque version (MVP backend)",
            ],
            erreurs=[
                "Snapshot manquant sur ancienne entrée → Compare désactivé pour cette ligne",
            ],
            regles=[
                "Historique append-only ; abandon working copy n’altère pas versions publiées",
            ],
            validation=[
                "UX : S11, Discard, timeline multi-versions",
                "MVP : affichage MD5/commit depuis API",
            ],
            hypotheses=[
                "Prototype peut afficher hash simulé en attendant données Git production",
            ],
            proto_valide=[
                "VersionsView, VERSIONS_EXPORT_COMPARE_HINT, working copy card",
            ],
            mvp_cible=[
                "API liste versions + métadonnées audit",
            ],
        ),
    ),
    "86c9nc7t1": (
        "ETQ utilisateur, je veux abandonner les changements non publiés (Discard changes) "
        "afin de revenir à la dernière version publiée",
        us_body(
            metier=(
                "Lorsqu’une révision ou working copy contient des changements non publiés, "
                "l’utilisateur peut les abandonner pour restaurer le dernier snapshot publié "
                "et fermer la révision."
            ),
            inclus=[
                "Action Discard changes depuis Versions (icône / tooltip Revert to vX.Y.Z)",
                "Modale de confirmation destructive",
                "Restauration contenu depuis dernier snapshot publié",
                "Fermeture révision (inRevision false)",
                "Publish update indisponible si plus aucun changement",
            ],
            exclus=[
                "Modification d’une version publiée",
                "Restauration historique d’un brouillon abandonné",
                "Undo granulaire champ par champ",
            ],
            ac=[
                "Action visible uniquement si working copy / révision avec snapshot de référence",
                "Cancel ferme sans changement",
                "Discard restaure fundamentals, schema, gouvernance versionnée du snapshot",
                "Versions publiées inchangées dans l’historique",
            ],
            erreurs=[
                "Aucun snapshot publié → Discard non proposé",
            ],
            regles=[
                "Discard n’affecte que le brouillon non publié",
            ],
            validation=[
                "UX : modale Discard, annulation, confirmation",
                "MVP : API reset brouillon depuis PublishedVersion",
            ],
            hypotheses=[],
            proto_valide=[
                "handleDiscardDraft dans App.tsx",
            ],
            mvp_cible=[
                "Endpoint abandon brouillon + restauration snapshot",
            ],
        ),
    ),
    "86c9n9a66": (
        "ETQ utilisateur, je veux comparer deux états exportables d’un contrat "
        "afin de comprendre les différences (Form ou YAML)",
        us_body(
            metier=(
                "L’utilisateur compare deux snapshots (working copy vs publié, ou deux "
                "versions publiées) sur le **contenu exportable ODCS uniquement**. Les "
                "changements gouvernance app-only apparaissent dans le changelog / working "
                "copy summary, pas dans Compare."
            ),
            inclus=[
                "Modale Compare depuis Versions ; défaut working copy vs dernière active",
                "Sélection deux états : working copy et/ou versions publiées",
                "Modes Form et YAML ; lecture seule",
                "Diff Form : metadata, schema, data access, SLA, custom, quality, ref links, relationships",
                "Bandeau export-only explicite",
                "Diff YAML side-by-side",
            ],
            exclus=[
                "Contract owner, governance contacts, collaborators dans Compare",
                "Résumé IA, merge, rollback, édition depuis Compare",
                "Breaking change auto-blocking",
            ],
            ac=[
                "Deux versions publiées comparables",
                "Working copy sélectionnable comme Draft dans les listes",
                "Form et YAML cohérents avec contenu YAML généré",
                "Ajouts/suppressions/modifications visuellement distincts",
                "Compare identique si seule la gouvernance a changé (S11b)",
                "Aucune modification de contrat depuis Compare",
            ],
            erreurs=[
                "Moins de deux snapshots → message Compare not enough versions",
            ],
            regles=[
                "Compare simple, non bloquant ; export-only",
            ],
            validation=[
                "UX : S11, S11b, inversion gauche/droite",
                "MVP : service diff backend sur snapshots persistés",
            ],
            hypotheses=[],
            proto_valide=[
                "VersionCompareModal + COMPARE_EXPORT_ONLY_NOTE",
            ],
            mvp_cible=[
                "API compare deux PublishedVersion snapshots (+ brouillon courant)",
            ],
        ),
    ),
    "86c9n9a55": (
        "ETQ utilisateur, je veux que mes modifications soient persistées automatiquement "
        "afin de limiter la perte de données en édition",
        us_body(
            metier=(
                "En édition (draft ou révision), les changements sont persistés automatiquement "
                "sans action Save draft et sans publication. Le MVP backend assure la "
                "persistance ; le prototype valide le parcours UX (autosave perçu, notes "
                "gouvernance)."
            ),
            inclus=[
                "Persistance automatique des champs éditables (draft / révision)",
                "Notes autosave sur sections gouvernance (contacts, data access, SLA, custom)",
                "Mise à jour updatedAt",
                "Aucune création de version publiée ni écriture Git par autosave",
                "Pas d’autosave sur active publié sans révision ni sur deprecated/retired",
            ],
            exclus=[
                "Bouton Save draft P0 (US annulée 86c9n9a52)",
                "Collaboration temps réel et résolution conflits multi-utilisateurs",
                "Indicateur global saving/saved/error (hors scope MVP initial sauf spec ultérieure)",
                "Commit Git automatique",
            ],
            ac=[
                "Modification en contexte éditable → persistance sans clic Save",
                "Rechargement : données retrouvées",
                "Erreur persistance signalée à l’utilisateur (MVP backend)",
                "Aucune entrée gitHistory créée par autosave",
            ],
            erreurs=[
                "Échec API autosave → message erreur ; données précédentes conservées",
                "Quota / indisponibilité → comportement documenté",
            ],
            regles=[
                "Autosave ne remplace pas Publish ; Git uniquement à la publication (SP5)",
            ],
            validation=[
                "UX : édition gouvernance + rechargement prototype",
                "MVP : tests API PATCH brouillon, pas de publish implicite",
            ],
            hypotheses=[
                "Prototype : persistance immédiate localStorage ; MVP : API debounce ou on-blur",
            ],
            proto_valide=[
                "updateContract + GovernanceSectionMeta autosave notes",
            ],
            mvp_cible=[
                "Endpoints persistance brouillon ; stratégie debounce documentée",
            ],
            hors_proto=[
                "Conflits multi-utilisateur — backlog ultérieur",
            ],
        ),
    ),
    "86c9n9a5e": (
        "ETQ utilisateur, je veux savoir si mon contrat est publiable (Publication readiness) "
        "afin de publier uniquement un contrat complet et cohérent",
        us_body(
            metier=(
                "Avant publication, le panneau Publication readiness agrège obligations "
                "ODCS, règles produit et qualité des champs. Publish est bloqué si erreurs "
                "ou si aucun changement depuis la dernière version. Validation serveur "
                "répliquée au publish (MVP)."
            ),
            inclus=[
                "Panneau readiness sur onglet Form (hors Versions, Import)",
                "Score 70 % requis / 25 % qualité champs / 5 % suggestions",
                "Navigation vers champs manquants",
                "Publish / Publish update désactivé si erreurs bloquantes",
                "Message si aucun changement depuis dernière publication",
                "Validation ODCS v3.1.0 + règles produit (name, owner, schema, FK, SLA, etc.)",
                "Contract quality (post-publish) sans blocage",
            ],
            exclus=[
                "Policies Zeenea, SEMQL, approval workflow",
                "Détection breaking change automatique",
            ],
            ac=[
                "Publish grisé + raison si champ obligatoire manquant",
                "Erreurs visibles par section après tentative publish",
                "apiVersion v3.1.0, kind DataContract, id, schema minimal respectés côté validation",
                "No changes to publish si snapshot identique export + gouvernance",
                "Backend rejette publish invalide même si UI contournée",
            ],
            erreurs=[
                "Contrat proposed : publish bloqué jusqu’à Start drafting",
                "Type unknown, FK incomplète : messages utilisateur mappés",
            ],
            regles=[
                "Quality rules text-only ne bloquent pas ; PII sans contact = avertissement",
            ],
            validation=[
                "UX : scénarios readiness doc §9 et §15",
                "MVP : tests contractValidation + API publish 422",
            ],
            hypotheses=[],
            proto_valide=[
                "computePublicationReadiness, ReadinessPanel, hasAnyChangeSinceLastPublish",
            ],
            mvp_cible=[
                "validateContract côté API ; même règles que prototype",
            ],
        ),
    ),
}

CREATES: list[tuple[str, str]] = [
    (
        "ETQ utilisateur en révision, je veux voir le badge Revision open "
        "afin de comprendre que j’édite une copie de travail non publiée",
        us_body(
            metier=(
                "Pendant une révision sur contrat active, un badge Revision open "
                "signale une working copy. Le statut lifecycle affiché reste Active ; "
                "la version affichée reste celle de la dernière publication."
            ),
            inclus=[
                "Badge Revision open dans la barre supérieure",
                "Tooltip explicatif",
                "Masqué hors révision",
            ],
            exclus=[
                "Statut lifecycle « revision »",
                "Changement de numéro de version affiché avant Publish update",
            ],
            ac=[
                "Badge visible si active + révision ouverte",
                "Tooltip : édition basée sur la version active publiée",
                "Statut badge Active inchangé",
            ],
            erreurs=[],
            regles=[
                "Revision open n’est pas un statut ODCS exporté",
            ],
            validation=["UX : S22"],
            hypotheses=[],
            proto_valide=["TOP_BAR_REVISION_OPEN_LABEL, RevisionOpenBadge"],
            mvp_cible=["Même règles d’affichage côté UI connectée API"],
        ),
    ),
    (
        "ETQ publisher, je veux être bloqué si aucun changement depuis la dernière publication "
        "afin d’éviter une version vide",
        us_body(
            metier=(
                "Publish update n’est pas proposé (ou est désactivé) lorsque le contenu "
                "exportable et la gouvernance versionnée sont identiques au dernier snapshot publié."
            ),
            inclus=[
                "Détection changements export + gouvernance versionnée",
                "Message No changes to publish since the last version",
                "Publish update désactivé",
            ],
            exclus=[
                "Publication forcée vide",
            ],
            ac=[
                "Aucun delta → publish indisponible + message",
                "Dès qu’un changement export ou gouvernance → publish possible si readiness OK",
            ],
            erreurs=[],
            regles=[
                "Aligné compare export-only : gouvernance seule compte pour publish (Option B)",
            ],
            validation=["UX : tentative publish sans edit"],
            hypotheses=[],
            proto_valide=["hasAnyChangeSinceLastPublish, NO_CHANGES_TO_PUBLISH"],
            mvp_cible=["API publish 400 si pas de delta"],
        ),
    ),
    (
        "ETQ publisher, je veux publier lorsque seuls owner ou governance contacts changent "
        "afin de versionner la responsabilité sans modifier le YAML exporté",
        us_body(
            metier=(
                "Option B : publication autorisée si le YAML exportable est inchangé mais "
                "owner ou governance contacts ont évolué. La modale publish affiche une note ; "
                "le changelog mentionne la gouvernance ; Compare reste sans diff export."
            ),
            inclus=[
                "publishChangeKind governance_only",
                "Note dans modale publish",
                "Changelog mentionnant mise à jour gouvernance",
                "Snapshot incluant gouvernance versionnée",
            ],
            exclus=[
                "Export owner/contacts dans YAML ODCS",
            ],
            ac=[
                "Publish possible avec YAML identique et contacts modifiés",
                "Compare export identique entre avant/après (S11b)",
                "Historique Versions affiche changelog gouvernance",
            ],
            erreurs=[],
            regles=[
                "Distinct de publish avec changement schema",
            ],
            validation=["UX : S11b, publish governance only"],
            hypotheses=[],
            proto_valide=["PUBLISH_GOVERNANCE_ONLY_NOTE, getPublishChangeKind"],
            mvp_cible=["Backend accepte publish governance-only avec même MD5 YAML"],
        ),
    ),
]


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in fieldnames})


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    # UPDATE CSV (id required)
    update_rows = [{"id": k, "name": v[0], "description": v[1]} for k, v in UPDATES.items()]
    update_rows.insert(
        0,
        {"id": "86c9n9a4t", "name": US_4T_A_NAME, "description": US_4T_A_DESC},
    )
    write_csv(OUT / "sp4-update.csv", ["id", "name", "description"], update_rows)

    # CREATE CSV (name required, no id)
    create_rows = [{"name": n, "description": d} for n, d in CREATES]
    create_rows.extend(
        [{"name": US_4T_B_NAME, "description": US_4T_B_DESC}]
    )
    write_csv(OUT / "sp4-create.csv", ["name", "description"], create_rows)

    # CANCEL manifest
    write_csv(
        OUT / "sp4-cancel.csv",
        ["id", "name", "action", "reason"],
        [
            {
                "id": "86c9n9a52",
                "name": "ETQ utilisateur, je veux sauvegarder mon draft afin de conserver mes modifications avant publication",
                "action": "CANCEL",
                "reason": (
                    "Parcours Save draft P0 invalidé par prototype UX (autosave implicite). "
                    "Persistance brouillon couverte par 86c9n9a55 UPDATE + US backend 4t-B. "
                    "Ne pas réintroduire bouton Save draft."
                ),
            }
        ],
    )

    # SPLIT doc
    (DOCS / "sp4-split-86c9n9a4t.md").write_text(
        """# SPLIT — `86c9n9a4t`

## Décision

| Branche | Action ClickUp | ID |
|---------|----------------|-----|
| **A — Modèle logique produit** | **UPDATE** tâche existante | `86c9n9a4t` |
| **B — Persistance backend** | **CREATE** nouvelle tâche | _(pas d’ID — import `sp4-create.csv`)_ |

## Rationale

- Le prototype valide le **parcours** (working copy, révision, snapshots) — branche A.
- Le MVP réel conserve **Contract / Draft / PublishedVersion**, MD5, Git — branche B.
- Ne pas annuler `86c9n9a4t` en bloc.

## Fichiers

- UPDATE A : [../output/sp4-update.csv](../output/sp4-update.csv) (ligne `86c9n9a4t`)
- CREATE B : [../output/sp4-create.csv](../output/sp4-create.csv) (dernière ligne)
""",
        encoding="utf-8",
    )

    # SP5 report
    (DOCS / "sp4-report-sp5.md").write_text(
        """# REPORT SP4 → SP5 (GitOps)

Les exigences **Git réel** restent dans le **MVP global**. SP4 couvre le **versioning produit** et les **métadonnées** ; SP5 couvre l’**exécution repository**.

## Liens explicites à ajouter dans les US SP4 (UPDATE)

| US SP4 | Mention SP5 |
|--------|-------------|
| `86c9n9a60` | Push YAML, échec publish si Git down → **SP5** (`86c9n9a5p`, `86c9n9a5h`, `86c9nc596`) |
| `86c9n9a6m` | Affichage commit hash production → alimenté par SP5 |
| US CREATE `4t-B` | Intégration push → **SP5** |

## US SP5 à ne pas annuler (recadrage global)

- `86c9n9a5p` — publier YAML dans Git
- `86c9n9a5h` — structure Git des contrats
- `86c9n9a5n` — checksum MD5 à l’activation (complémentaire à `86c9n9a60`)
- `86c9nc596` — suivi processus publication / écriture Git

## Distinction QA

| Couche | Liste | Tests |
|--------|-------|-------|
| UX / métier versioning | SP4 | Prototype + scénarios doc S11, S22 |
| GitOps exécution | SP5 | Intégration repository, échec Git |
""",
        encoding="utf-8",
    )

    # README index
    (ROOT / "backlog" / "README.md").write_text(
        """# Backlog ClickUp — alignement MVP

## SP4 — Versioning (recadrage stratégique)

**Input :** [input/sp4-versioning.csv](input/sp4-versioning.csv)  
**Plan de référence :** recadrage prototype = validation UX/métier ; backlog = MVP réel (backend, Git, MD5).

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp4-update.csv](output/sp4-update.csv) (`id` obligatoire)
2. **CREATE** — [output/sp4-create.csv](output/sp4-create.csv) (`name` obligatoire, pas d’`id`)
3. **CANCEL** — [output/sp4-cancel.csv](output/sp4-cancel.csv) (`86c9n9a52` manuel)
4. **SPLIT** — [docs/sp4-split-86c9n9a4t.md](docs/sp4-split-86c9n9a4t.md)
5. **REPORT SP5** — [docs/sp4-report-sp5.md](docs/sp4-report-sp5.md)

### Fiches

| ID | Action |
|----|--------|
| `86c9n9a4t` | UPDATE (modèle logique produit) + CREATE B (backend) |
| `86c9n9a52` | CANCEL |
| `86c9n9a5x`, `86c9n9a60`, `86c9n9a6m`, `86c9nc7t1`, `86c9n9a66`, `86c9n9a55`, `86c9n9a5e` | UPDATE |
| _(nouvelles)_ | CREATE ×4 (Revision open, No changes, Option B, Modèle backend) |
""",
        encoding="utf-8",
    )

    print(f"Wrote {len(update_rows)} updates, {len(create_rows)} creates, 1 cancel")
    print(f"Output: {OUT}")


if __name__ == "__main__":
    main()
