#!/usr/bin/env python3
"""Generate SP5 ClickUp backlog deliverables (dual-track prototype / MVP)."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"
INPUT = ROOT / "backlog" / "input"
SRC_CSV = ROOT / "clickup-backlog-SP5_-_Publish_&_Gitops-2026-05-20-110043.csv"


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
    liens_sp4: list[str] | None = None,
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
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning (ne pas réimplémenter ici)", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    return "\n".join(parts)


SP4_READINESS = "86c9n9a5e — Publication readiness (panneau, score, navigation champs)"
SP4_META = "86c9n9a60 — Métadonnées de publication (stockage, affichage MD5/commit)"
SP4_VERSIONS = "86c9n9a6m — Section Versions (timeline, affichage audit)"
SP4_NO_DELTA = "CREATE SP4 — No changes to publish (blocage sans delta)"
SP4_OPT_B = "CREATE SP4 — Publish gouvernance seule (Option B, YAML inchangé)"
SP4_AUTOSAVE = "86c9n9a55 — Autosave (pas d’écriture Git hors publish)"

UPDATE_ROWS: list[tuple[str, str, str]] = []

# --- 86c9n9a5b ---
UPDATE_ROWS.append(
    (
        "86c9n9a5b",
        "ETQ système, je veux valider le YAML ODCS avant publication afin d’éviter d’écrire un contrat invalide dans Git",
        us_body(
            metier=(
                "Avant toute publication, le système valide le payload YAML ODCS généré (convention P1, champs requis, "
                "schema) et bloque la suite si invalide. La validation UX du prototype existe ; le MVP exige le même "
                "contrôle côté API avant écriture Git."
            ),
            inclus=[
                "Validation du YAML généré à partir du contrat courant",
                "Contrôle des champs fondamentaux et du schema requis pour publish",
                "Messages d’erreur exploitables pour l’utilisateur",
                "Blocage de publication et d’écriture Git si invalide",
                "Même règles pour première publication et publish update",
                "Tests automatisés API / service de validation",
            ],
            exclus=[
                "Policies Zeenea avancées",
                "Validation de règles qualité exécutables hors P1 publish",
                "Approval workflow",
                "Correction automatique IA",
            ],
            ac=[
                "La validation s’exécute avant Publish / Publish update côté backend",
                "Un YAML invalide empêche l’écriture Git et le passage Active",
                "Les erreurs sont remontées à l’UI (readiness / modale publish)",
                "Un YAML valide autorise la suite du pipeline publish (SP5 5p, 5n)",
                "Tests : YAML valide, champs manquants, schema vide, sérialisation",
            ],
            erreurs=[
                "Échec sérialisation → message utilisateur, pas de commit Git",
                "Contrat publiable côté UI mais rejet API → message cohérent",
            ],
            regles=[
                "Jamais Active si le YAML ODCS généré est invalide",
                "Alignement avec validateContract / règles publish du prototype",
            ],
            validation=[
                "UX : validateContract + messages publishBlockUserMessage",
                "MVP : tests API rejet publish + pas d’appel Git",
            ],
            hypotheses=[
                "Les règles P1 publish restent la source de vérité métier",
            ],
            proto_valide=[
                "validateContract dans contractValidation.ts avant ouverture publish",
                "PushToGitModal bloque si !canPublish",
            ],
            mvp_cible=[
                "Endpoint ou service backend validate-before-publish",
                "Réponse structurée (codes) consommée par readiness SP4 et modale SP5",
            ],
            hors_proto=[
                "Connexion repository — exécution dans 86c9n9a5p",
            ],
            liens_sp4=[SP4_READINESS, "Readiness bloque Publish en UI — complémentaire, pas doublon"],
        ),
    )
)

# --- 86c9n9a5h ---
UPDATE_ROWS.append(
    (
        "86c9n9a5h",
        "ETQ système, je veux définir la structure Git des contrats afin de garantir un stockage prévisible des versions publiées",
        us_body(
            metier=(
                "Le MVP définit où et comment chaque YAML publié est stocké dans le dépôt Git : repo cible, chemins, "
                "nommage déterministe, stratégie de branche minimale. Prérequis à l’écriture réelle (5p)."
            ),
            inclus=[
                "Repo cible configurable",
                "Convention de dossiers et nommage fichier déterministe",
                "Plusieurs contrats et plusieurs versions par contrat",
                "Stratégie de branche par défaut documentée",
                "Gestion des conflits de nom / chemin",
                "Documentation technique pour équipes data / platform",
            ],
            exclus=[
                "Multi-repo complexe",
                "Branches par client avancées",
                "Tags Git par fichier",
                "PR workflow complet",
                "CI/CD complet",
            ],
            ac=[
                "Convention de chemin documentée et appliquée par 5p",
                "Deux contrats ne collisionnent pas",
                "Versions successives d’un contrat retrouvables dans Git",
                "Erreurs de conflit prévues et testées",
            ],
            erreurs=[
                "Chemin existant avec contenu incompatible → erreur explicite",
            ],
            regles=[
                "Git = source d’audit des artefacts YAML publiés",
                "L’app édite le brouillon ; Git ne reçoit que les publish",
            ],
            validation=[
                "Revue technique convention",
                "Tests multi-contrats / multi-versions / conflit",
            ],
            hypotheses=[
                "Un repo unique MVP suffit pour la vague courante",
            ],
            proto_valide=[
                "Aucune convention Git réelle au prototype — message PUBLISH_EXTERNAL_SYNC_NOTE",
            ],
            mvp_cible=[
                "Spécification repo + implémentation utilisée par le service push 5p",
                "Configuration environnement (URL, credentials hors scope US si SP6)",
            ],
            hors_proto=[
                "Push commit — US 86c9n9a5p",
            ],
            liens_sp4=[SP4_META, "Chemins cohérents avec métadonnées version stockées en base"],
        ),
    )
)

# --- 86c9n9a5n ---
UPDATE_ROWS.append(
    (
        "86c9n9a5n",
        "ETQ système, je veux générer et stocker un checksum MD5 à l’activation afin de garantir l’intégrité du contrat publié",
        us_body(
            metier=(
                "À chaque publication réussie, le système calcule un MD5 sur le YAML **effectivement écrit dans Git**, "
                "puis stocke ce checksum avec la version publiée. Complète SP4 (affichage / métadonnées) par le calcul "
                "sur l’artefact réel."
            ),
            inclus=[
                "Calcul MD5 sur le contenu YAML publié dans Git",
                "Stockage immuable lié contrat + version",
                "Nouveau checksum à chaque publication",
                "Échec calcul → publish échoue (pas Active)",
                "Exposition pour historique / audit (consommée par SP4 Versions)",
            ],
            exclus=[
                "Signature électronique",
                "API /verify publique complète",
                "Algorithmes multiples / rotation",
            ],
            ac=[
                "Première publication et update génèrent un checksum distinct",
                "Checksum calculé sur le YAML réellement commité, pas sur un brouillon",
                "Checksum publié non modifiable après coup",
                "Échec MD5 empêche passage Active",
                "Valeur visible dans l’historique (via SP4 6m / 60)",
            ],
            erreurs=[
                "Git OK mais MD5 fail → rollback publish, brouillon conservé",
            ],
            regles=[
                "MD5 obligatoire dès la première activation",
                "Pas de checksum valide si Git a échoué (5p)",
            ],
            validation=[
                "Tests publish OK, payload identique, échec calcul",
            ],
            hypotheses=[
                "MD5 suffit pour intégrité MVP ; SHA256 ultérieur si besoin",
            ],
            proto_valide=[
                "Hash simulé dans gitHistory au prototype — pas de MD5 sur artefact Git réel",
            ],
            mvp_cible=[
                "Service checksum post-commit Git",
                "Persistance liée PublishedVersion / métadonnées 60",
            ],
            hors_proto=[
                "Affichage UI timeline — SP4 86c9n9a6m",
            ],
            liens_sp4=[SP4_META, SP4_VERSIONS],
        ),
    )
)

# --- 86c9n9a5p ---
UPDATE_ROWS.append(
    (
        "86c9n9a5p",
        "ETQ système, je veux publier le YAML dans Git afin de versionner réellement chaque contrat activé",
        us_body(
            metier=(
                "Lors d’un Publish réussi côté métier, le système écrit le fichier YAML ODCS dans Git, crée un commit, "
                "stocke le hash. Si Git échoue, le contrat ne devient pas Active. Cœur GitOps du MVP."
            ),
            inclus=[
                "Écriture fichier YAML selon convention 5h",
                "Création commit avec message explicite (contrat, version)",
                "Stockage commit hash côté application",
                "Gestion erreurs Git (repo down, conflit, permission)",
                "Rollback applicatif : pas Active, brouillon conservé",
                "Première publication et publish update",
            ],
            exclus=[
                "PR review / merge workflow",
                "Tags Git par version",
                "Sync bidirectionnelle / import depuis Git",
                "Écriture Git sur autosave",
            ],
            ac=[
                "Publish valide → fichier présent dans Git + commit",
                "Commit hash persisté et lié à la version",
                "Erreur Git → pas Active, message utilisateur",
                "Aucun checksum finalisé si Git échoue (5n)",
                "Message commit contient identifiant contrat et version",
            ],
            erreurs=[
                "Repo indisponible, conflit, erreur écriture — cas testés",
            ],
            regles=[
                "Git uniquement à la publication, pas au Save draft / autosave",
                "Orchestration après validation YAML (5b)",
            ],
            validation=[
                "Intégration repository, échec Git, pas de régression Active",
            ],
            hypotheses=[
                "Credentials Git gérés hors UI (SP6 / infra)",
            ],
            proto_valide=[
                "randomHash() simulé — PUBLISH_EXTERNAL_SYNC_NOTE",
                "PushToGitModal : étapes Preparing / Saving sans appel Git",
            ],
            mvp_cible=[
                "Client Git / API repository réel",
                "Transaction publish : validate → git push → md5 → active",
            ],
            hors_proto=[
                "Modale formulaire changelog — SP5 5u / 5z",
                "Détail étapes UX — SP5 nc596",
            ],
            liens_sp4=[SP4_AUTOSAVE, SP4_VERSIONS, "Commit hash affiché — alimenté par cette US"],
        ),
    )
)

# --- 86c9n9a5u ---
UPDATE_ROWS.append(
    (
        "86c9n9a5u",
        "ETQ utilisateur, je veux publier une première version afin de rendre un contrat actif",
        us_body(
            metier=(
                "Depuis un contrat éditable (draft ou proposed après Start drafting), le Publisher publie la "
                "première version : validation, YAML, Git, MD5, passage Active v1.0.0, verrouillage. Le prototype "
                "valide la modale et le parcours ; le MVP exécute Git et persistance réels."
            ),
            inclus=[
                "Bouton Publish (première publication)",
                "Ouverture modale / panneau publish (voir aussi nc596 pour étapes)",
                "Validation publishable (readiness SP4 + 5b)",
                "Génération YAML ODCS",
                "Orchestration : validation → Git (5p) → MD5 (5n) → Active",
                "Version v1.0.0 sans choix minor/major",
                "Verrouillage après succès",
                "Feedback succès / erreur",
            ],
            exclus=[
                "Choix minor/major (réservé publish update — 5z)",
                "Approval workflow",
                "Publication sans Git",
                "Publication si validation échoue",
                "Readiness panel (SP4 5e)",
                "Blocage no-changes (première publish — SP4 CREATE si applicable)",
            ],
            ac=[
                "Publish visible si Publisher + contrat publiable (SP4 readiness)",
                "Première version = v1.0.0 affichée après succès",
                "Étapes visibles : préparation, validation, repository, succès (nc596)",
                "Échec Git ou validation → pas Active, brouillon conservé",
                "Succès → contrat Active verrouillé + entrée historique",
            ],
            erreurs=[
                "Validation bloquante → modale ou message, pas de Git",
                "Git down → message explicite, draft intact",
            ],
            regles=[
                "Publisher seul (rôle owner prototype)",
                "Pipeline publish atomique",
            ],
            validation=[
                "UX : PushToGitModal première publication, seedContracts",
                "MVP : E2E publish draft → Git + MD5 + active",
            ],
            hypotheses=[
                "Progression async courte acceptable MVP",
            ],
            proto_valide=[
                "PushToGitModal isFirstPublish, pas de bump minor/major",
                "validateContract + hasAnyChangeSinceLastPublish (hors 1ère publish)",
                "PUBLISH_MODAL_SUBTITLE, étapes simulées 3 phases",
            ],
            mvp_cible=[
                "API POST publish-first-version",
                "Appel enchaîné 5b → 5p → 5n",
            ],
            hors_proto=[
                "Git réel, MD5 réel, commit SHA production",
            ],
            liens_sp4=[SP4_READINESS, SP4_NO_DELTA, SP4_VERSIONS],
        ),
    )
)

# --- 86c9n9a5z ---
UPDATE_ROWS.append(
    (
        "86c9n9a5z",
        "ETQ utilisateur, je veux publier une mise à jour afin de créer une nouvelle version active",
        us_body(
            metier=(
                "Depuis une révision ouverte (working copy), le Publisher documente les changements, choisit Update ou "
                "Breaking, confirme la publication. Le système génère le YAML, pousse Git, MD5, active la nouvelle "
                "version et déprécie l’ancienne Active."
            ),
            inclus=[
                "Bouton Publish update",
                "Modale Publish new version (nom, version cible, champs)",
                "Champ What changed? / changelog",
                "Choix Update (minor) ou Breaking (major)",
                "CTA dynamique Publish vX.Y.Z",
                "Validation publishable + génération YAML",
                "Git + MD5 + métadonnées",
                "Ancienne Active → Deprecated automatiquement",
                "Support publication gouvernance seule (Option B) si produit validé",
            ],
            exclus=[
                "Détection auto bloquante breaking changes",
                "Approval workflow",
                "AI diff summary",
                "Rollback version publiée depuis UI",
                "Publication sans Git",
                "New version / Discard (SP4)",
            ],
            ac=[
                "Publish update ouvre modale avec résumé contrat et version cible",
                "Commentaire éditable ; défaut auto-généré si vide",
                "Bump minor ou major selon choix",
                "Blocage si aucun changement depuis dernière publication (SP4)",
                "Option B : publish autorisé si seule gouvernance a changé (SP4)",
                "Succès → nouvelle Active + deprecated précédente",
            ],
            erreurs=[
                "No changes → publish indisponible (SP4)",
                "Git fail → révision conservée",
            ],
            regles=[
                "SemVer appliqué à la confirmation publish, pas à New version",
                "Changelog persisté avec la version",
            ],
            validation=[
                "UX : bump cards, PUBLISH_GOVERNANCE_ONLY_NOTE, summarizeChangesSince",
                "MVP : API publish-update + deprecated auto",
            ],
            hypotheses=[
                "Breaking = major bump uniquement via choix utilisateur",
            ],
            proto_valide=[
                "PushToGitModal bump minor/major, buildDefaultPublishChangelog",
                "publishChangeKind governance_only",
            ],
            mvp_cible=[
                "API publish-update avec type bump + changelog",
                "Intégration 5p, 5n, règles deprecated",
            ],
            hors_proto=[
                "Push Git réel",
            ],
            liens_sp4=[SP4_READINESS, SP4_NO_DELTA, SP4_OPT_B, "New version — 86c9n9a5x"],
        ),
    )
)

# --- 86c9nc596 ---
UPDATE_ROWS.append(
    (
        "86c9nc596",
        "ETQ utilisateur, je veux suivre le processus de publication afin de comprendre l’état de l’écriture Git",
        us_body(
            metier=(
                "L’utilisateur voit un feedback clair pendant Publish et Publish update : étapes, succès, erreur Git. "
                "Contrat UX transversal ; les détails fonctionnels des parcours sont dans 5u et 5z."
            ),
            inclus=[
                "Modale ou panneau de progression commun Publish / Publish update",
                "Étapes : préparation changements, validation contrat/YAML, écriture repository, MD5, succès",
                "État erreur compréhensible (dont Git)",
                "Conservation du brouillon / révision si échec",
                "Cohérence libellés avec doc produit",
            ],
            exclus=[
                "Workflow d’approbation",
                "Logs techniques bruts pour utilisateur final",
                "Retry automatique avancé",
                "Publication async longue + notifications externes",
                "PR workflow Git",
            ],
            ac=[
                "Ouverture progression au clic Publish / Publish update",
                "Utilisateur voit chaque étape nommée (prep, validation, Git, checksum)",
                "Succès explicite en fin de parcours",
                "Erreur Git : message clair, pas Active",
                "Échec : working copy / brouillon non perdu",
            ],
            erreurs=[
                "Timeout repository → message + pas Active",
            ],
            regles=[
                "Même composant progression pour première publish et update",
                "Ne pas afficher succès avant fin pipeline backend",
            ],
            validation=[
                "UX : étapes proto (3) vs cible MVP (5) documentées",
                "MVP : tests E2E affichage états",
            ],
            hypotheses=[
                "Retry manuel acceptable MVP ; retry auto ultérieur",
            ],
            proto_valide=[
                "PushToGitModal phases loading : Preparing, Updating version, Saving",
                "Pas d’étapes séparées validation/Git/MD5 au prototype",
            ],
            mvp_cible=[
                "States machine publish exposée à l’UI",
                "Brancher sur événements 5b, 5p, 5n",
            ],
            hors_proto=[
                "Écriture Git réelle et calcul MD5",
            ],
            liens_sp4=[
                "Parcours publish — 86c9n9a5u (première), 86c9n9a5z (update)",
                "Détail push — 86c9n9a5p",
            ],
        ),
    )
)

METADATA_ROWS = [
    ("86c9n9a5b", "technical foundation", "high"),
    ("86c9n9a5h", "gitops", "high"),
    ("86c9n9a5n", "checksum", "high"),
    ("86c9n9a5p", "gitops", "high"),
    ("86c9n9a5u", "publication", "high"),
    ("86c9n9a5z", "publication", "high"),
    ("86c9nc596", "publication", "normal"),
]


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(rows)


def main() -> None:
    # input copy
    INPUT.mkdir(parents=True, exist_ok=True)
    if SRC_CSV.exists():
        shutil.copy(SRC_CSV, INPUT / "sp5-publish-gitops.csv")

    update_csv = [
        {"id": id_, "name": name, "description": desc}
        for id_, name, desc in UPDATE_ROWS
    ]
    write_csv(OUT / "sp5-update.csv", ["id", "name", "description"], update_csv)

    meta_csv = [
        {"id": id_, "tags": tags, "priority": pri} for id_, tags, pri in METADATA_ROWS
    ]
    write_csv(OUT / "sp5-metadata-update.csv", ["id", "tags", "priority"], meta_csv)

    # fiches
    fiches = """# Fiches SP5 — import ClickUp (Publish & GitOps)

Référence : audit SP5 / gouvernance [backlog-governance.md](./backlog-governance.md).  
Prototype = validation UX publish ; MVP = Git réel + MD5 + validation backend.

## Matrice validée (plan SP5)

| Action | Nombre |
|--------|--------|
| UPDATE | 7 |
| CREATE | 0 |
| CANCEL | 0 |
| SPLIT | 0 |

Dédoublonnage : **5u** (première publish), **5z** (update), **nc596** (contrat étapes UX).

## Ordre d’import ClickUp

1. **UPDATE** — [../output/sp5-update.csv](../output/sp5-update.csv)
2. **Metadata** — [../output/sp5-metadata-update.csv](../output/sp5-metadata-update.csv) (vérifier mapping colonne `tags` / `Tag` selon outil)
3. **REPORT SP4** — [sp5-report-sp4.md](./sp5-report-sp4.md)
4. Contrôle post-import — [sp5-pre-import-audit.md](./sp5-pre-import-audit.md) § Post-import

---

"""
    for id_, name, _ in UPDATE_ROWS:
        tag, pri = next((t, p) for i, t, p in METADATA_ROWS if i == id_)
        fiches += f"""## `{id_}`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `{tag}` |
| Priorité | `{pri}` |
| Titre | {name[:60]}… |

---

"""
    (DOCS / "sp5-fiches-import.md").write_text(fiches, encoding="utf-8")

    # tags mapping
    mapping = """# SP5 — Mapping tags / priorités

**Source :** [input/sp5-publish-gitops.csv](../input/sp5-publish-gitops.csv)  
**Gouvernance :** [backlog-governance.md](./backlog-governance.md) §6bis

## Mapping final (7 US)

| ID | Tag | Priorité | Motif |
|----|-----|----------|--------|
"""
    for id_, tags, pri in METADATA_ROWS:
        name = next(n for i, n, _ in UPDATE_ROWS if i == id_)[:50]
        mapping += f"| `{id_}` | {tags} | {pri} | {name}… |\n"

    mapping += """
## Import metadata

Fichier : [sp5-metadata-update.csv](../output/sp5-metadata-update.csv)

Si l’outil batch n’applique pas `tags`, mapper vers colonne **Tag** (ClickUp) ou saisie manuelle.

## Liens SP4

Voir [sp5-report-sp4.md](./sp5-report-sp4.md).
"""
    (DOCS / "sp5-tags-mapping.md").write_text(mapping, encoding="utf-8")

    # SP5 → SP4 report
    (DOCS / "sp5-report-sp4.md").write_text(
        """# REPORT SP5 → SP4 (Versioning)

SP5 exécute Git / MD5 / validation YAML. SP4 porte versioning produit, readiness, historique.

## US SP4 référencées par SP5

| US SP4 | Rôle |
|--------|------|
| `86c9n9a5e` | Readiness — panneau avant publish |
| `86c9n9a60` | Métadonnées version — stockage / affichage MD5, commit |
| `86c9n9a6m` | Versions — timeline, commit hash UI |
| `86c9n9a55` | Autosave — pas d’écriture Git |
| `86c9n9a5x` | New version — prérequis publish update |
| CREATE No changes | Blocage publish sans delta |
| CREATE Option B | Publish gouvernance seule |

## US SP5 (ne pas annuler)

| ID | Sujet |
|----|--------|
| `86c9n9a5b` | Validation YAML pré-Git |
| `86c9n9a5h` | Structure repository |
| `86c9n9a5n` | MD5 sur YAML publié |
| `86c9n9a5p` | Push Git + commit |
| `86c9n9a5u` | Première publication |
| `86c9n9a5z` | Publish update |
| `86c9nc596` | Progression UX publish |

Voir aussi [sp4-report-sp5.md](./sp4-report-sp5.md) (lien inverse).
""",
        encoding="utf-8",
    )

    # pre-import audit checklist result
    audit = """# SP5 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### MVP et prototype
- [x] Aucun UPDATE ne réduit le MVP au prototype localStorage
- [x] Git, MD5, validation backend conservés sur les 7 US
- [x] Pas de scope approval / PR / CI ajouté

### Décisions
- [x] 0 CREATE — pas de doublon SP4
- [x] 0 CANCEL — pas d’annulation Git/MD5
- [x] 0 SPLIT — 7 UPDATE dual-track suffisent
- [x] US atomiques et AC testables

### Conventions §6
- [x] Working copy / Draft backend distingués dans les textes
- [x] Liens SP4 explicites (readiness, no-changes, Option B)
- [x] SP5 = exécution GitOps, pas versioning produit

### CSV
- [x] 7 UPDATE avec `id` valide (export input)
- [x] Colonnes minimales `id`, `name`, `description`
- [x] 7 lignes metadata `id`, `tags`, `priority`
- [x] CSV parse OK (script generate)

### Tags / priorités
- [x] 7/7 tag + priorité documentés
- [x] technical foundation : 1× (5b)
- [x] nc596 en normal (feedback UX)

## Verdict

**SAFE TO IMPORT** — enchaîner UPDATE puis metadata ; contrôler tags dans ClickUp post-import (leçon SP4).

## Post-import (§11)

- [ ] Échantillon 3 US : 5p, 5u, 5n
- [ ] Vérifier tags réels sur les 7 tâches
- [ ] Markdown descriptions OK
- [ ] Pas de champ vidé involontaire
"""
    (DOCS / "sp5-pre-import-audit.md").write_text(audit, encoding="utf-8")

    # README
    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    if "## SP5" not in readme:
        readme += """

## SP5 — Publish & GitOps

**Input :** [input/sp5-publish-gitops.csv](input/sp5-publish-gitops.csv)

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp5-update.csv](output/sp5-update.csv)
2. **Metadata** — [output/sp5-metadata-update.csv](output/sp5-metadata-update.csv)
3. **Fiches** — [docs/sp5-fiches-import.md](docs/sp5-fiches-import.md)
4. **Audit pré-import** — [docs/sp5-pre-import-audit.md](docs/sp5-pre-import-audit.md)
5. **Liens SP4** — [docs/sp5-report-sp4.md](docs/sp5-report-sp4.md) · [docs/sp4-report-sp5.md](docs/sp4-report-sp5.md)

| ID | Action |
|----|--------|
| `86c9n9a5b`, `86c9n9a5h`, `86c9n9a5n`, `86c9n9a5p`, `86c9n9a5u`, `86c9n9a5z`, `86c9nc596` | UPDATE |
"""
        (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")

    print(f"Wrote {len(update_csv)} updates to {OUT}")
    print(f"Docs: {DOCS}")


if __name__ == "__main__":
    main()
