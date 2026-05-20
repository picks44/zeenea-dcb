#!/usr/bin/env python3
"""Generate SP3 ClickUp backlog deliverables (UPDATE dual-track + CANCEL doublon)."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"
INPUT = ROOT / "backlog" / "input"
SRC_CSV = ROOT / "clickup-backlog-SP3_-_DDL_Import-2026-05-20-110043.csv"

SP1_CREATE = "86c9n9a3v — Create flow (mode choice, non-persistance) — CREATE alignement SP1"
SP1_YAML_UI = "86c9nw8br — YAML preview UI (Copy/Download) — SP1 CREATE alignement"
SP2_SCHEMA = "86c9n9a4e — Édition schéma post-import (CRUD tables/colonnes)"
SP2_RELATIONS = "86c9n9a4r — Relations — édition manuelle SP2"
SP4_PROPOSED = "86c9n9a4t / lifecycle — proposed, Start drafting, re-import proposed"
SP4_AUTOSAVE = "86c9n9a55 — Autosave (hors import)"
SP5_VALIDATE = "86c9n9a5b — Validation YAML pré-publication"
SP5_PUBLISH = "86c9n9a5u / 86c9n9a5z — Publish (hors import)"
SP5_MD5 = "86c9n9a5n — MD5 sur YAML publié"


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
    liens_sp1: list[str] | None = None,
    liens_sp2: list[str] | None = None,
    liens_sp4: list[str] | None = None,
    liens_sp5: list[str] | None = None,
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
    if liens_sp1:
        parts.extend(["", "Liens SP1 — Interfaces (shell create / YAML UI)", ""])
        parts.extend(f"- {x}" for x in liens_sp1)
    if liens_sp2:
        parts.extend(["", "Liens SP2 — Editor & Lifecycle", ""])
        parts.extend(f"- {x}" for x in liens_sp2)
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    if liens_sp5:
        parts.extend(["", "Liens SP5 — Publish & GitOps", ""])
        parts.extend(f"- {x}" for x in liens_sp5)
    return "\n".join(parts)


UPDATE_ROWS: list[tuple[str, str, str]] = []

# --- 86c9n9a40 ---
UPDATE_ROWS.append(
    (
        "86c9n9a40",
        "ETQ équipe produit/tech, je veux définir le sous-ensemble DDL supporté afin de cadrer précisément le parser MVP",
        us_body(
            metier=(
                "Le MVP doit documenter un sous-ensemble SQL pragmatique (CREATE TABLE) sans promettre "
                "un support ANSI ou vendor exhaustif. Le dialecte cible reste TBD jusqu’à validation Zeenea."
            ),
            inclus=[
                "Dialecte DDL cible marqué TBD tant qu’il n’est pas arbitré",
                "Liste des syntaxes supportées (multi CREATE TABLE, colonnes, types courants)",
                "Liste des syntaxes explicitement non supportées",
                "PRIMARY KEY, NOT NULL, UNIQUE simple",
                "FOREIGN KEY inline simple et composite (aligné prototype)",
                "Types inconnus → logicalType string + flag isUnknownType",
                "Messages d’erreur utilisateur compréhensibles",
            ],
            exclus=[
                "Support multi-dialectes exhaustif",
                "Procédures stockées, index avancés, contraintes complexes vendor-specific",
                "Connexion directe à une base",
                "Promesse « ANSI SQL complet » ou « PostgreSQL exhaustif »",
            ],
            ac=[
                "Le dialecte cible est documenté TBD sans choix arbitraire PostgreSQL/Snowflake/SQL Server",
                "La matrice supporté / non supporté est lisible par dev et QA",
                "Les FK DDL inline sont dans le périmètre documenté",
                "Les erreurs de parsing sont formulées pour l’utilisateur final",
                "Le parser ne promet pas un support SQL universel",
            ],
            erreurs=[
                "Syntaxe hors subset → message explicite, pas de crash",
            ],
            regles=[
                "Ne pas sur-promettre le coverage parser MVP (anti-pattern gouvernance)",
                "Aucun dialecte prioritaire sans validation PO/Zeenea",
            ],
            validation=[
                "Revue doc + tests parser sur fixtures 42",
                "MVP : contrat API parser documente le même subset",
            ],
            hypotheses=[
                "Le dialecte cible sera tranché avant industrialisation parser service",
            ],
            proto_valide=[
                "ddlParser.ts — CREATE TABLE, nettoyage commentaires, mapSqlType, isUnknownType",
                "FK simple et composite parsées",
            ],
            mvp_cible=[
                "Spécification parser service versionnée",
                "Catalogue erreurs API aligné messages UX",
                "Tests de non-régression sur subset documenté",
            ],
            hors_proto=[
                "Parser distribué multi-tenant haute dispo",
                "Support DDL hors CREATE TABLE",
            ],
            liens_sp2=[SP2_RELATIONS],
        ),
    )
)

# --- 86c9n9a42 ---
UPDATE_ROWS.append(
    (
        "86c9n9a42",
        "ETQ équipe produit/tech, je veux disposer de fixtures DDL afin de tester le parser MVP de manière reproductible",
        us_body(
            metier=(
                "Bibliothèque DDL de référence pour tests parser, bouton Load example et CI. "
                "Le prototype expose demo.sql ; le MVP exige fixtures versionnées et couverture tests."
            ),
            inclus=[
                "Fixtures DDL versionnées dans le repo (simple, multi-table, PK/FK, types courants)",
                "Fixture invalide avec erreur contrôlée attendue",
                "Load example alimenté par une fixture canonique",
                "Tests automatisés Vitest/Jest sur parseDDLMulti",
                "Documentation des résultats attendus par fixture",
            ],
            exclus=[
                "Jeu exhaustif par dialecte vendor",
                "Données client sensibles dans les fixtures",
                "Benchmark performance parser en CI P0",
            ],
            ac=[
                "Au moins cinq fichiers DDL de référence existent (MVP)",
                "Load example injecte un DDL valide issu des fixtures",
                "La fixture invalide produit une erreur contrôlée",
                "Les tests CI utilisent les fixtures sans données sensibles",
                "Chaque fixture a un snapshot ou assertion de tables/colonnes attendues",
            ],
            erreurs=[
                "Fixture modifiée sans mise à jour snapshot → CI en échec explicite",
            ],
            regles=[
                "Fixtures alignées sur le subset documenté dans 40",
                "demo.sql reste la référence UX Load example au prototype",
            ],
            validation=[
                "Proto : demo.sql + ddlParser.schemaOdcs.test.ts",
                "MVP : dossier fixtures + pipeline CI",
            ],
            hypotheses=[
                "Les DDL clients remplaceront progressivement les exemples synthétiques",
            ],
            proto_valide=[
                "demo.sql importé dans ImportSection (Load example)",
                "src/lib/__tests__/ddlParser.schemaOdcs.test.ts",
            ],
            mvp_cible=[
                "Répertoire backlog/fixtures ou tests/fixtures/ddl/",
                "Job CI parse-all-fixtures",
            ],
            hors_proto=[
                "Import automatique de DDL production client",
            ],
        ),
    )
)

# --- 86c9n9a44 ---
UPDATE_ROWS.append(
    (
        "86c9n9a44",
        "ETQ utilisateur, je veux importer un DDL afin de générer automatiquement un schéma initial",
        us_body(
            metier=(
                "Parcours d’import DDL : saisie, upload, preview, validation, création contrat proposed. "
                "Le shell create two-step et le routing sont portés par SP1 ; cette US couvre le formulaire "
                "import et le déclenchement parser côté SP3."
            ),
            inclus=[
                "Zone SQL (paste, upload .sql, drag-and-drop)",
                "Load example (fixture)",
                "Preview tables/colonnes/FK avant validation (summarizeDDLImport)",
                "Bouton Import schema (uxCopy)",
                "Messages d’erreur exploitables",
                "Import réussi → contrat proposed + schéma injecté",
                "Re-import DDL tant que contrat proposed (section Import éditable)",
                "Progression UX import (prototype simulée)",
            ],
            exclus=[
                "Mode choice create (cartes Import / Scratch) — SP1",
                "Parser SQL complet multi-dialecte",
                "Publish, readiness panel",
                "Connexion base distante",
            ],
            ac=[
                "Un DDL valide génère un schéma initial affiché en preview",
                "Un DDL invalide affiche une erreur sans persister de contrat corrompu",
                "Load example et upload .sql fonctionnent",
                "Après import, le contrat est en statut proposed et ouvre Fundamentals",
                "Re-import en proposed remplace le schéma importé",
                "Les types non supportés sont signalés (unknown type)",
            ],
            erreurs=[
                "DDL vide → message invitant à coller du SQL",
                "Parse échoué → pas de contrat proposed créé",
                "Abandon parcours create → aucun contrat (SP1)",
            ],
            regles=[
                "DDL recommandé ; Start from scratch reste secondaire (SP1)",
                "Ne pas référencer « casser le Draft » — flux proposed",
                "Tag epic ddl parser (plus contract creation seul)",
            ],
            validation=[
                "Proto : ImportSection layout creation + default, parseDDLMulti preview",
                "MVP : API POST import-parse + transaction create proposed",
            ],
            hypotheses=[
                "Le dialecte SQL reste TBD (voir US 40)",
            ],
            proto_valide=[
                "ImportSection.tsx — preview, phases loading/success, demo.sql",
                "CreateContractView → ImportSection layout creation",
                "docs/product-documentation.md §6.3, §7",
            ],
            mvp_cible=[
                "API import DDL avec validation serveur",
                "Stockage temporaire fichier .sql si requis sécurité",
                "Idempotence abandon parcours",
            ],
            hors_proto=[
                "Import asynchrone file d’attente",
                "Multi-fichiers batch",
            ],
            liens_sp1=[SP1_CREATE],
            liens_sp4=[SP4_PROPOSED],
        ),
    )
)

# --- 86c9n9a47 ---
UPDATE_ROWS.append(
    (
        "86c9n9a47",
        "ETQ utilisateur, je veux que le DDL soit converti en schéma ODCS éditable afin de compléter le contrat sans ressaisie",
        us_body(
            metier=(
                "Après parsing, transformation des tables/colonnes/contraintes DDL en modèle ODCS (SchemaTable, "
                "properties, relationships). L’édition continue du schéma relève de SP2."
            ),
            inclus=[
                "Mapping table → schema object (stableSchemaId)",
                "Mapping colonne → property (stablePropertyId)",
                "physicalType conservé, logicalType mappé",
                "required, primaryKey, unique depuis DDL",
                "FOREIGN KEY inline → foreignKey ou composite relationship",
                "Ordre des colonnes conservé",
                "Schéma modifiable après import (via SP2)",
            ],
            exclus=[
                "Édition relation graphique avancée — SP2",
                "Mapping sémantique Zeenea / glossaire",
                "Quality rules exécutables",
                "Édition YAML inline",
            ],
            ac=[
                "Chaque CREATE TABLE supporté produit une table schema",
                "Chaque colonne supportée produit une property",
                "NOT NULL → required ; PK → primaryKey",
                "FK DDL produit foreignKey ou relationship composite",
                "Le YAML généré reflète le schéma importé (cohérence 53/54)",
            ],
            erreurs=[
                "Table sans colonnes valides → rejet ou table vide signalée",
            ],
            regles=[
                "Champs enrichis non déductibles du DDL restent vides",
                "Tag epic ddl parser",
            ],
            validation=[
                "Proto : ddlParser + schemaOdcsMapping + relationshipExport",
                "MVP : API map-to-odcs avec mêmes règles IDs",
            ],
            hypotheses=[
                "Self-referencing FK supportées (proto)",
            ],
            proto_valide=[
                "parseDDLMulti, applyForeignKeys, stablePropertyId/stableSchemaId",
                "schemaOdcsMapping migrate helpers",
            ],
            mvp_cible=[
                "Service mapping documenté + tests snapshot ODCS",
                "Propagation rename/delete via schemaRelationshipRefs (SP2)",
            ],
            hors_proto=[
                "Inférence automatique descriptions colonnes",
            ],
            liens_sp2=[SP2_SCHEMA, SP2_RELATIONS],
            liens_sp5=[SP5_VALIDATE],
        ),
    )
)

# --- 86c9n9a53 (UPDATE léger) ---
UPDATE_ROWS.append(
    (
        "86c9n9a53",
        "ETQ système, je veux garantir la cohérence du YAML généré après import DDL afin de valider la chaîne parse → map → serialize",
        us_body(
            metier=(
                "Cette US couvre la cohérence fonctionnelle du YAML produit après un import DDL réussi — "
                "pas l’UI preview/copy/download (SP1) ni la validation publish/Git (SP5). "
                "Évite un trou QA sur la chaîne import → serialization."
            ),
            inclus=[
                "YAML généré depuis le schéma importé reflète tables/colonnes/FK mappées",
                "Cohérence entre modèle in-memory post-import et export ODCS P1",
                "Vérification après import proposed et après Start drafting",
                "Read-only : pas d’édition YAML directe",
            ],
            exclus=[
                "Onglet YAML UI, boutons Copy/Download — SP1",
                "MD5, push Git, validation publish — SP5",
                "Comparaison versions historiques — SP4",
                "Édition schéma — SP2",
            ],
            ac=[
                "Après import DDL, le YAML preview contient les tables/colonnes importées",
                "Les FK importées apparaissent dans le YAML exporté (relationships)",
                "Aucune régression sur champs P1 fundamentals après import",
                "Le YAML reste non éditable (tous rôles)",
            ],
            erreurs=[
                "Schéma importé vide → YAML schema section vide explicite",
            ],
            regles=[
                "Ownership SP3 : cohérence serialization post-import",
                "Ne pas dupliquer les AC UI de SP1 nw8br",
                "Tag yaml view conservé avec périmètre fonctionnel réduit",
            ],
            validation=[
                "Proto : generateODCSYaml après import dans le parcours proposed",
                "MVP : test API export YAML post-import",
            ],
            hypotheses=[
                "La preview UI reste testée via SP1 CREATE alignement",
            ],
            proto_valide=[
                "odcsYamlGenerator.ts / generateODCSYaml",
                "Parcours import → proposed documenté product-documentation §7",
            ],
            mvp_cible=[
                "Tests intégration import → YAML snapshot",
                "Service serialization aligné odcsYamlGenerator",
            ],
            hors_proto=[
                "Éditeur YAML WYSIWYG",
            ],
            liens_sp1=[SP1_YAML_UI],
            liens_sp5=[SP5_VALIDATE, SP5_MD5],
        ),
    )
)

# --- 86c9n9a54 ---
UPDATE_ROWS.append(
    (
        "86c9n9a54",
        "ETQ système, je veux sérialiser le modèle interne en YAML ODCS v3.1.0 afin de produire le contrat technique",
        us_body(
            metier=(
                "Sérialisation backend du modèle applicatif vers YAML ODCS P1 (apiVersion, kind, schema, "
                "governance export rules). Distinct de la preview UI SP1."
            ),
            inclus=[
                "Sérialisation Fundamentals + schema + governance selon règles P1",
                "apiVersion/kind fixes ; champs app-only exclus de l’export",
                "Stable ordering et format lisible",
                "Alignement odcsYamlGenerator / buildOdcsDocument",
                "Utilisé après import, édition et avant publish",
            ],
            exclus=[
                "UI onglet YAML — SP1",
                "Validation publish complète — SP5 5b",
                "MD5 / Git push — SP5",
                "Doublon 86c9nw8d1 — annulé",
            ],
            ac=[
                "Le YAML généré est valide ODCS P1 pour un contrat importé type",
                "Les champs non exportables (owner app-only, inRevision) sont absents du YAML",
                "La sérialisation est déterministe pour un même modèle",
                "Les relationships/FK exportées passent par relationshipExport",
            ],
            erreurs=[
                "Modèle incohérent → erreur sérialisation remontée à l’UI",
            ],
            regles=[
                "Tag technical foundation",
                "86c9nw8d1 annulée — doublon exact",
            ],
            validation=[
                "Proto : odcsYamlGenerator tests",
                "MVP : service serialization API",
            ],
            hypotheses=[],
            proto_valide=[
                "odcsYamlGenerator.ts, buildOdcsDocument",
                "relationshipExport.ts",
            ],
            mvp_cible=[
                "Microservice ou module serialization versionné",
                "Contrat OpenAPI export preview",
            ],
            hors_proto=[
                "Sérialisation incrémentale temps réel multi-utilisateur",
            ],
            liens_sp1=[SP1_YAML_UI],
            liens_sp5=[SP5_VALIDATE, SP5_PUBLISH],
        ),
    )
)

METADATA_ROWS = [
    ("86c9n9a40", "ddl parser", "high"),
    ("86c9n9a42", "ddl parser", "high"),
    ("86c9n9a44", "ddl parser", "high"),
    ("86c9n9a47", "ddl parser", "high"),
    ("86c9n9a53", "yaml view", "high"),
    ("86c9n9a54", "technical foundation", "high"),
]

CANCEL_ROWS = [
    (
        "86c9nw8d1",
        "ETQ système, je veux sérialiser le modèle interne en YAML ODCS v3.1.0 afin de produire le contrat technique",
        "Doublon exact de 86c9n9a54 (description identique). Sérialisation portée par 54 UPDATE — tag technical foundation. Ne pas maintenir deux US actives.",
    ),
]


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(rows)


def main() -> None:
    INPUT.mkdir(parents=True, exist_ok=True)
    if SRC_CSV.exists():
        shutil.copy(SRC_CSV, INPUT / "sp3-ddl-import.csv")

    meta = {id_: (t, p) for id_, t, p in METADATA_ROWS}
    update_csv = [
        {
            "id": id_,
            "name": name,
            "description": desc,
            "tags": meta[id_][0],
            "priority": meta[id_][1],
        }
        for id_, name, desc in UPDATE_ROWS
    ]
    write_csv(
        OUT / "sp3-update.csv",
        ["id", "name", "description", "tags", "priority"],
        update_csv,
    )

    cancel_csv = [
        {"id": id_, "name": name, "action": "CANCEL", "reason": reason}
        for id_, name, reason in CANCEL_ROWS
    ]
    write_csv(OUT / "sp3-cancel.csv", ["id", "name", "action", "reason"], cancel_csv)

    # sp3-report (inverse of sp1-report)
    report = """# REPORT SP3 → SP1 / SP2 / SP4 / SP5

Coordination cross-listes — import CREATE/UPDATE SP3.  
Gouvernance : [backlog-governance.md](./backlog-governance.md) · tri-domaine YAML §6bis.

## Principe SP3

| Règle | Détail |
| ----- | ------ |
| US actives après import | **6 UPDATE** · **1 CANCEL** (`86c9nw8d1`) |
| Parser / mapping | `40`, `42`, `44`, `47` — tag **ddl parser** |
| YAML | `53` cohérence post-import · `54` sérialisation · **pas** doublon UI SP1 |

## SP1 — Interfaces

| US SP3 | Lien SP1 |
| ------ | -------- |
| `86c9n9a44` | Shell create / mode choice — **SP1** CREATE alignement |
| `86c9n9a53` | **Distinct** de `86c9nw8br` — cohérence YAML vs UI preview |

## SP2 — Editor & Lifecycle

| US SP3 | Lien SP2 |
| ------ | -------- |
| `86c9n9a47` | Mapping import uniquement — édition schema **SP2** (`4e`, `4r`, …) |

## SP4 — Versioning

| US SP3 | Lien SP4 |
| ------ | -------- |
| `86c9n9a44` | `proposed`, re-import, Start drafting |

## SP5 — Publish & GitOps

| US SP3 | Lien SP5 |
| ------ | -------- |
| `86c9n9a54` / `53` | Sérialisation ≠ publish ; validation **5b**, MD5 **5n** |

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) (lien inverse).
"""
    (DOCS / "sp3-report-sp1-sp2-sp4-sp5.md").write_text(report, encoding="utf-8")

    # mapping
    mapping = """# SP3 — Mapping actions (UPDATE / CANCEL)

| ID | Action | Tag | Priorité | Raison |
| -- | ------ | --- | -------- | ------ |
| `86c9n9a40` | UPDATE | ddl parser | high | Subset DDL TBD + FK |
| `86c9n9a42` | UPDATE | ddl parser | high | Fixtures + CI |
| `86c9n9a44` | UPDATE | ddl parser | high | Import UX + proposed |
| `86c9n9a47` | UPDATE | ddl parser | high | Mapping ODCS + FK |
| `86c9n9a53` | UPDATE léger | yaml view | high | Cohérence YAML post-import |
| `86c9n9a54` | UPDATE | technical foundation | high | Sérialisation ODCS |
| `86c9nw8d1` | **CANCEL** | — | — | Doublon exact `54` |

Fichiers : [sp3-update.csv](../output/sp3-update.csv) · [sp3-cancel.csv](../output/sp3-cancel.csv)
"""
    (DOCS / "sp3-actions-mapping.md").write_text(mapping, encoding="utf-8")

    # fiches
    fiches = """# Fiches SP3 — import ClickUp (DDL Import)

Référence : [backlog-governance.md](./backlog-governance.md) · plan SP3 figé.

## Matrice

| Action | Nombre |
| ------ | ------ |
| UPDATE | 6 |
| CANCEL | 1 |
| CREATE | 0 |

## Ownership QA

| US | Tester ici | REPORT |
| -- | ---------- | ------ |
| `40` | Matrice syntaxe | — |
| `42` | Fixtures CI | Create shell SP1 |
| `44` | Import UX, preview, re-import | SP1 create, SP5 publish |
| `47` | Mapping + FK | SP2 schema editor |
| `53` | YAML cohérent post-import | SP1 UI, SP5 MD5 |
| `54` | Sérialisation P1 | SP1 UI, SP5 publish |

## Ordre import

1. **UPDATE** — [sp3-update.csv](../output/sp3-update.csv) (6 lignes, unifié tags+priority)
2. **CANCEL** — [sp3-cancel.csv](../output/sp3-cancel.csv) — manuel `86c9nw8d1`
3. [sp3-report-sp1-sp2-sp4-sp5.md](./sp3-report-sp1-sp2-sp4-sp5.md)

---

"""
    for id_, name, _ in UPDATE_ROWS:
        tag, pri = meta[id_]
        fiches += f"""## `{id_}`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `{tag}` |
| Priorité | `{pri}` |
| Titre | {name[:70]}… |

---

"""
    fiches += """## `86c9nw8d1` — CANCEL manuel

Doublon exact de `86c9n9a54`. Annuler dans ClickUp avec commentaire renvoi vers 54.

"""
    (DOCS / "sp3-fiches-import.md").write_text(fiches, encoding="utf-8")

    audit = """# SP3 — Audit final pré-import

Gate qualité §10 — **SAFE TO IMPORT**.

## Checklist

### Stratégie
- [x] 6 UPDATE · 1 CANCEL (`d1`) · 0 CREATE
- [x] `53` conservée (cohérence YAML) — pas CANCEL
- [x] Retag 44/47 → ddl parser ; 54 → technical foundation

### MVP / prototype
- [x] Dual-track sur 6 UPDATE
- [x] Parser service MVP documenté — pas frontend-only
- [x] Dialecte TBD — pas sur-promesse ANSI/vendor

### Frontières
- [x] SP1 shell / YAML UI REPORT
- [x] SP2 schema editor REPORT
- [x] SP5 publish/MD5 REPORT

### CSV
- [x] 6 UPDATE id valides
- [x] Colonnes id, name, description, tags, priority
- [x] 1 CANCEL d1

## Verdict

**SAFE TO IMPORT** — UPDATE unifié puis CANCEL manuel d1 ; contrôle tags visuel post-import.

## Post-import

- [ ] 6/6 tags visibles
- [ ] d1 Cancelled
- [ ] 53 périmètre cohérence post-import (pas doublon UI)
"""
    (DOCS / "sp3-pre-import-audit.md").write_text(audit, encoding="utf-8")

    checklist = """# SP3 — Checklist import ClickUp

## Prérequis

- [ ] [sp3-pre-import-audit.md](./sp3-pre-import-audit.md) — SAFE TO IMPORT
- [ ] [sp3-fiches-import.md](./sp3-fiches-import.md)
- [ ] [sp3-actions-mapping.md](./sp3-actions-mapping.md)

## Import UPDATE

Fichier : [../output/sp3-update.csv](../output/sp3-update.csv) — **6 lignes**

| ID | Tag | Priorité |
| -- | --- | -------- |
| `86c9n9a40` | ddl parser | high |
| `86c9n9a42` | ddl parser | high |
| `86c9n9a44` | ddl parser | high |
| `86c9n9a47` | ddl parser | high |
| `86c9n9a53` | yaml view | high |
| `86c9n9a54` | technical foundation | high |

- [ ] Mapper `tags` → Tag ClickUp si requis
- [ ] Liste : **SP3 - DDL Import**

## CANCEL manuel

- [ ] `86c9nw8d1` — statut Cancelled + commentaire doublon `86c9n9a54`

## Post-import §11

- [ ] 6 tâches : descriptions dual-track
- [ ] **6/6 tags + priorités visibles**
- [ ] `53` = cohérence YAML (pas preview UI)
- [ ] `d1` annulée
"""
    (DOCS / "sp3-import-checklist.md").write_text(checklist, encoding="utf-8")

    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    if "## SP3" not in readme:
        readme += """

## SP3 — DDL Import

**Input :** [input/sp3-ddl-import.csv](input/sp3-ddl-import.csv)

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp3-update.csv](output/sp3-update.csv) (6 US, unifié)
2. **CANCEL** — [output/sp3-cancel.csv](output/sp3-cancel.csv) — `86c9nw8d1` manuel
3. **Docs** — [docs/sp3-fiches-import.md](docs/sp3-fiches-import.md) · [docs/sp3-pre-import-audit.md](docs/sp3-pre-import-audit.md)

| ID | Action |
| -- | ------ |
| `40`, `42`, `44`, `47`, `53`, `54` | UPDATE |
| `86c9nw8d1` | CANCEL |
"""
        (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")

    print(f"Wrote {len(update_csv)} updates to {OUT / 'sp3-update.csv'}")
    print(f"Docs: {DOCS}")


if __name__ == "__main__":
    main()
