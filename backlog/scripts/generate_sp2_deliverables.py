#!/usr/bin/env python3
"""Generate SP2 ClickUp backlog deliverables (UPDATE dual-track + CREATE alignement)."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"
INPUT = ROOT / "backlog" / "input"
SRC_CSV = ROOT / "clickup-backlog-SP2_-_Editor_&_Lifecycle-2026-05-20-110043.csv"

SP1_NAV = "86c9n9a4a — Navigation sections (CREATE alignement SP1)"
SP1_REGISTRY = "86c9n9a3w — Registry (liste contrats)"
SP3_IMPORT = "86c9n9a44 — Import DDL (SP3)"
SP3_MAPPING = "86c9n9a47 — Mapping DDL → schéma (détection relations importées)"
SP4_PROPOSED = "86c9n9a4t — proposed, Start drafting, re-import"
SP4_REVISION = "86c9n9a5x — New version / Revision open"
SP4_AUTOSAVE = "86c9n9a55 — Autosave (pas Save draft)"
SP4_READINESS = "86c9n9a5e — Readiness panel (score, publiable)"
SP4_SOFT_DELETE = "86c9n9a4t — soft delete contrat (métier audit)"
SP4_IMMUT = "CREATE 4t-B / 86c9wjvmn — immutabilité API (SP4 — pas SP2)"
SP5_VALIDATE = "86c9n9a5b — Validation YAML pré-publication"
SP5_PUBLISH = "86c9n9a5u / 86c9n9a5z — Publish / Git (SP5)"

LIFECYCLE_EDITABLE = (
    "Contrat éditable en statut draft OU active avec Revision open (inRevision) — "
    "pas « Draft-only » ; proposed = import seulement ; active publié = lecture seule"
)


def us_body(
    metier: str,
    inclus: list[str],
    exclus: list[str],
    ac: list[str],
    erreurs: list[str],
    regles: list[str],
    validation: list[str],
    hypotheses: list[str] | None = None,
    proto_valide: list[str] | None = None,
    mvp_cible: list[str] | None = None,
    hors_proto: list[str] | None = None,
    liens_sp1: list[str] | None = None,
    liens_sp3: list[str] | None = None,
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
    parts.extend(f"- {x}" for x in (hypotheses or []))
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
        parts.extend(["", "Liens SP1 — Interfaces", ""])
        parts.extend(f"- {x}" for x in liens_sp1)
    if liens_sp3:
        parts.extend(["", "Liens SP3 — DDL Import", ""])
        parts.extend(f"- {x}" for x in liens_sp3)
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    if liens_sp5:
        parts.extend(["", "Liens SP5 — Publish & GitOps", ""])
        parts.extend(f"- {x}" for x in liens_sp5)
    return "\n".join(parts)


def align_body(
    metier: str,
    sources: list[str],
    corrige: list[str],
    ajoute: list[str],
    exclus: list[str],
    reste: list[str],
    inclus: list[str],
    exclus_perimetre: list[str],
    ac: list[str],
    erreurs: list[str],
    regles: list[str],
    validation: list[str],
    proto_valide: list[str] | None = None,
    mvp_cible: list[str] | None = None,
    liens_sp1: list[str] | None = None,
    liens_sp3: list[str] | None = None,
    liens_sp4: list[str] | None = None,
    liens_sp5: list[str] | None = None,
) -> str:
    parts = ["Description métier", "", metier, "", "Gouvernance — US sources (statuts protégés, non modifiées)", ""]
    parts.extend(f"- {x}" for x in sources)
    parts.extend(["", "Corrigé / aligné par rapport aux US sources", ""])
    parts.extend(f"- {x}" for x in corrige)
    parts.extend(["", "Ajouté (delta backlog MVP)", ""])
    parts.extend(f"- {x}" for x in ajoute)
    parts.extend(["", "Exclu de cette US (autre liste ou obsolète)", ""])
    parts.extend(f"- {x}" for x in exclus)
    parts.extend(["", "Reste porté par l’US source (QA historique)", ""])
    parts.extend(f"- {x}" for x in reste)
    parts.extend(["", "Périmètre", "", "Inclus", ""])
    parts.extend(f"- {x}" for x in inclus)
    parts.extend(["", "Exclus", ""])
    parts.extend(f"- {x}" for x in exclus_perimetre)
    parts.extend(["", "Critères d’acceptation", ""])
    parts.extend(f"- {x}" for x in ac)
    parts.extend(["", "Cas d’erreur / limites", ""])
    parts.extend(f"- {x}" for x in erreurs)
    parts.extend(["", "Règles de gestion", ""])
    parts.extend(f"- {x}" for x in regles)
    parts.extend(["", "Validation fonctionnelle", ""])
    parts.extend(f"- {x}" for x in validation)
    if proto_valide:
        parts.extend(["", "Validé sur prototype UX (référence démo)", ""])
        parts.extend(f"- {x}" for x in proto_valide)
    if mvp_cible:
        parts.extend(["", "Implémentation MVP cible", ""])
        parts.extend(f"- {x}" for x in mvp_cible)
    if liens_sp1:
        parts.extend(["", "Liens SP1 — Interfaces", ""])
        parts.extend(f"- {x}" for x in liens_sp1)
    if liens_sp3:
        parts.extend(["", "Liens SP3 — DDL Import", ""])
        parts.extend(f"- {x}" for x in liens_sp3)
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    if liens_sp5:
        parts.extend(["", "Liens SP5 — Publish & GitOps", ""])
        parts.extend(f"- {x}" for x in liens_sp5)
    return "\n".join(parts)


UPDATE_ROWS: list[tuple[str, str, str]] = []

UPDATE_ROWS.append(
    (
        "86c9n9a4h",
        "ETQ utilisateur, je veux ajouter une table afin de couvrir plusieurs datasets dans un même contrat",
        us_body(
            metier="Ajout manuel d’une table/schema object pour compléter ou corriger le schéma importé ou créé from scratch.",
            inclus=[
                "Bouton Add table (SchemaSection)",
                "Nom table obligatoire, description optionnelle",
                "Ajout colonnes initiales via TableBlock",
                "Validation doublon de nom table",
                "Stable schema ID (stableSchemaId)",
                LIFECYCLE_EDITABLE,
            ],
            exclus=[
                "Import DDL (SP3)",
                "Templates table avancés / génération IA",
                "Publish / readiness panel (SP4/SP5)",
            ],
            ac=[
                "Add table crée une table éditable si contrat non verrouillé",
                "Doublon de nom table refusé avec message clair",
                "Au moins une colonne ajoutable immédiatement",
                "Table visible dans YAML preview (SP1) après modification",
            ],
            erreurs=["Nom vide → message validation", "Contrat verrouillé → action masquée"],
            regles=[LIFECYCLE_EDITABLE, "Tag epic schema editor"],
            validation=["Proto SchemaSection + TableBlock", "MVP API dataset create table"],
            proto_valide=["SchemaSection.tsx — makeTable, add flow", "idDerivation stableSchemaId"],
            mvp_cible=["POST/PATCH dataset tables", "Validation unicité noms serveur"],
            liens_sp3=[SP3_MAPPING, "Import initial — pas re-parser ici"],
            liens_sp4=[SP4_PROPOSED, SP4_AUTOSAVE],
            liens_sp1=[SP1_NAV],
        ),
    )
)

UPDATE_ROWS.append(
    (
        "86c9n9a4p",
        "ETQ utilisateur, je veux supprimer une table afin de retirer un dataset du contrat",
        us_body(
            metier="Suppression table avec confirmation ; propagation suppression des références FK/relations entrantes (schemaRelationshipRefs).",
            inclus=[
                "Delete table + ConfirmDialog",
                "syncDatasetAfterTableDelete — inbound FK/relationships retirés",
                "Blocage si contrat verrouillé (proposed, active sans révision, deprecated, retired)",
                LIFECYCLE_EDITABLE,
            ],
            exclus=[
                "Suppression version publiée immutable (SP4)",
                "Restauration table fine / corbeille",
                "Re-import DDL (SP3) — REPORT",
            ],
            ac=[
                "Confirmation avant suppression",
                "Annuler conserve la table",
                "Après suppression, plus de références vers la table supprimée dans le modèle",
                "Impossible si isContractLocked",
                "Readiness recalculée (SP4) après changement",
            ],
            erreurs=["Dernière table → impact publishability (readiness SP4)"],
            regles=[LIFECYCLE_EDITABLE, "Pas Save draft — autosave SP4"],
            validation=["Proto syncDatasetAfterTableDelete", "MVP même règles ref serveur"],
            proto_valide=["SchemaSection handleDeleteTable", "schemaRelationshipRefs.ts"],
            mvp_cible=["API delete table transactionnelle", "Cleanup références FK côté serveur"],
            liens_sp3=[SP3_IMPORT, "Re-import proposed remplace schéma — SP3/SP4"],
            liens_sp4=[SP4_READINESS, SP4_REVISION],
            liens_sp5=[SP5_VALIDATE],
        ),
    )
)

UPDATE_ROWS.append(
    (
        "86c9n9a4r",
        "ETQ utilisateur, je veux définir des relations entre tables afin de représenter les liens métier",
        us_body(
            metier=(
                "Édition et manipulation des relations entre tables du contrat — pas la détection initiale "
                "depuis DDL (SP3). MVP UI : composite_foreign_key et many_to_many uniquement."
            ),
            inclus=[
                "Section Relationships dans TableBlock",
                "Types MVP : composite_foreign_key, many_to_many (picker REL_OPTIONS)",
                "Sélection table cible et colonnes de jointure",
                "Suppression relation si éditable",
                "syncDatasetAfterTableUpdate pour propagation rename colonnes/tables",
                "Export via relationshipExport (lecture SP5 validation)",
                LIFECYCLE_EDITABLE,
            ],
            exclus=[
                "Détection/mapping relations depuis DDL import (SP3 — 47)",
                "Graphe relationnel avancé / inférence automatique",
                "Validation référentielle exécutable / impact analysis consommateurs",
                "Mega relation system (anti-pattern gouvernance)",
                "Has many / Belongs to / Has one legacy comme AC principaux UI",
            ],
            ac=[
                "Ajout relation composite FK avec paires colonnes égales",
                "Ajout relation M2M avec colonnes de jointure optionnelles",
                "Relations read-only si contrat verrouillé",
                "Rename table/colonne met à jour les refs (schemaRelationshipRefs)",
                "YAML export contient relationships/FK cohérents",
            ],
            erreurs=["Relation incomplète → avertissement publish (SP5)", "Cible FK manquante → stale target UX"],
            regles=[
                "Anti-pattern : ne pas absorber parser SP3 ni validation publish SP5 dans cette US",
                LIFECYCLE_EDITABLE,
            ],
            validation=["Proto TableBlock REL_OPTIONS", "relationshipExport tests"],
            proto_valide=[
                "TableBlock.tsx — composite_foreign_key, many_to_many",
                "schemaRelationshipRefs sync rename/delete",
                "TableRelationshipRow navigation",
            ],
            mvp_cible=[
                "API relations CRUD alignée types MVP",
                "Tests propagation rename/delete",
            ],
            liens_sp3=[SP3_MAPPING, "FK inline importées — édition ici post-import"],
            liens_sp5=[SP5_VALIDATE, "Export YAML relationships — pas UI ici"],
            liens_sp4=[SP4_READINESS],
        ),
    )
)

UPDATE_ROWS.append(
    (
        "86c9nc597",
        "ETQ utilisateur, je veux supprimer un champ afin de retirer une colonne du schéma",
        us_body(
            metier="Suppression colonne en contexte éditable ; impact sur FK/relations ; pas de Save draft.",
            inclus=[
                "Delete field sur ligne colonne (TableBlock)",
                "syncDatasetAfterTableUpdate / impact relations",
                "Avertissement si colonne référencée par relation",
                LIFECYCLE_EDITABLE,
            ],
            exclus=[
                "Suppression sur version publiée immutable",
                "Undo multi-étapes / rollback Git",
                "Résolution automatique relations sans confirmation UX",
            ],
            ac=[
                "Suppression colonne possible si non verrouillé",
                "Impossible si contrat verrouillé",
                "Relations utilisant la colonne nettoyées ou signalées",
                "Readiness recalculée après suppression",
            ],
            erreurs=["Dernière colonne d’une table → table non publiable"],
            regles=[LIFECYCLE_EDITABLE, "Autosave SP4 — pas Save draft P0"],
            validation=["Proto TableBlock delete column", "schemaRelationshipRefs column delete"],
            proto_valide=["TableBlock trash action", "schemaRelationshipRefs"],
            mvp_cible=["API delete property + relation cleanup"],
            liens_sp4=[SP4_AUTOSAVE, SP4_READINESS],
            liens_sp5=[SP5_VALIDATE],
        ),
    )
)

UPDATE_ROWS.append(
    (
        "86c9nw8cy",
        "ETQ utilisateur, je veux définir des quality rules sur tables et colonnes afin de documenter la qualité des données",
        us_body(
            metier=(
                "Édition et saisie des quality rules structurées (table et colonne) via QualityRulesEditor. "
                "Distinct de la readiness globale (SP4) et de la validation publish backend (SP5). "
                "Interdit : note libre, non bloquante, sans impact publish."
            ),
            inclus=[
                "Quality rules colonne (jusqu’à 3) dans ColumnAdvancedDialog",
                "Quality rules table dans TableAdvancedDialog",
                "aiVerified sur rules table (mock Verify with AI prototype)",
                "Dimensions / severity / businessImpact (p1Constants)",
                "Export quality[] dans YAML",
            ],
            exclus=[
                "Readiness panel score global (SP4 — 5e)",
                "Validation publish YAML complète (SP5 — 5b)",
                "SEMQL / moteur qualité exécutable",
                "SLA / slaProperties (section gouvernance séparée)",
                "Note libre non structurée sans aiVerified",
            ],
            ac=[
                "Saisie quality rule structurée table et colonne",
                "Table rules : aiVerified requis pour publish (proto contractValidation)",
                "Colonne : descriptions field quality comptent dans readiness SP4 (distinct)",
                "Publish bloqué côté produit si table rules non vérifiées (via readiness/validation SP4/SP5)",
                "Wording UI ne promet pas un moteur exécutable",
            ],
            erreurs=["Publish tenté sans aiVerified table rules → message readiness/validation"],
            regles=[
                "SP2 = saisie locale ; SP4 = readiness ; SP5 = validation publish",
                "Ne pas documenter « sans impact publish »",
                LIFECYCLE_EDITABLE,
            ],
            validation=[
                "Proto QualityRulesEditor + validateQualityRules requireAiVerified",
                "MVP règles alignées contractValidation serveur",
            ],
            proto_valide=[
                "QualityRulesEditor.tsx",
                "contractValidation.ts validateQualityRules",
                "TableAdvancedDialog showAiVerification",
            ],
            mvp_cible=[
                "Persistance quality[] ODCS",
                "Intégration readiness API + pre-publish validation",
            ],
            liens_sp4=[SP4_READINESS, "Field quality descriptions — score SP4"],
            liens_sp5=[SP5_VALIDATE, SP5_PUBLISH],
        ),
    )
)

UPDATE_ROWS.append(
    (
        "86c9nw8dw",
        "ETQ utilisateur, je veux supprimer un contrat afin de le retirer de la liste principale sans perdre l’audit",
        us_body(
            metier=(
                "Parcours UX de suppression logique (soft delete) depuis l’UI — métier audit et conservation "
                "versions/Git/checksums portés par SP4. Priorité normal (lifecycle + registry)."
            ),
            inclus=[
                "Bouton Delete contrat + ConfirmDialog",
                "Soft delete — retrait liste principale",
                "Conservation historique technique (REPORT exécution SP4)",
                LIFECYCLE_EDITABLE,
            ],
            exclus=[
                "Hard delete versions publiées / commits Git",
                "Règles immutabilité API (SP4 — 86c9nw8d4 REPORT)",
                "Implémentation backend soft delete complète (SP4 4t)",
            ],
            ac=[
                "Confirmation obligatoire",
                "Après succès, contrat absent de la liste registry (SP1)",
                "Versions publiées et audit conservés (SP4)",
            ],
            erreurs=["Erreur backend → contrat reste visible"],
            regles=[
                "REPORT métier soft delete → SP4",
                "Priorité normal — impact lifecycle et visibilité registry",
            ],
            validation=["Proto ConfirmDialog pattern", "MVP API soft delete + registry filter"],
            proto_valide=["ConfirmDialog usage pattern dans App"],
            mvp_cible=["API DELETE soft + deletedAt", "Registry SP1 filtre entrées supprimées"],
            hors_proto=["Purge RGPD automatisée", "Corbeille restauration UI"],
            liens_sp1=[SP1_REGISTRY],
            liens_sp4=[SP4_SOFT_DELETE, "Métier audit — ownership SP4"],
            liens_sp5=["Conservation commits/checksums SP5"],
        ),
    )
)

CREATE_ROWS: list[tuple[str, str, str]] = []

CREATE_ROWS.append(
    (
        "[Alignement] Schema editor — CRUD tables, colonnes, FK et metadata",
        align_body(
            metier=(
                "US complémentaire pour l’édition schéma complète alignée prototype : tables, colonnes, "
                "dialogs metadata, FK colonne, propagation rename/delete. US source 86c9n9a4e (en cours) inchangée."
            ),
            sources=["86c9n9a4e — en cours — schema editor"],
            corrige=[
                LIFECYCLE_EDITABLE,
                "Renommage table/colonne avec propagation schemaRelationshipRefs",
                "FK colonne via ColumnForeignKeyEditor",
            ],
            ajoute=[
                "ColumnAdvancedDialog / TableAdvancedDialog (tags, auth defs, array items)",
                "Classification, PK/REQ/UQ/CDE flags inline",
                "Readiness anchors colonnes (descriptions) — score SP4",
            ],
            exclus=[
                "Import DDL (SP3)",
                "Relations table-level (86c9n9a4r)",
                "Quality rules structurées (86c9nw8cy)",
                "Publish / Git",
            ],
            reste=["Titre et périmètre historique US 4e en QA en cours"],
            inclus=[
                "Liste tables, édition nom/description/type table",
                "CRUD colonnes, logical/physical types",
                "Field properties dialog",
                "stablePropertyId / stableSchemaId",
            ],
            exclus_perimetre=[
                "Édition YAML directe",
                "Graphe relations obligatoire",
                "Glossaire Zeenea automatique",
            ],
            ac=[
                "Modification table/colonne si editable status",
                "FK colonne partielle bloquée à la sauvegarde",
                "Rename propage FK et relationships",
                "Verrouillage si proposed/active sans révision",
            ],
            erreurs=["handleSchemaChange no-op si locked"],
            regles=["Référence US source 86c9n9a4e", "Dual-track obligatoire"],
            validation=["Proto SchemaSection + TableBlock + dialogs", "MVP API dataset CRUD"],
            proto_valide=[
                "SchemaSection.tsx, TableBlock.tsx",
                "ColumnAdvancedDialog, TableAdvancedDialog",
                "ColumnForeignKeyEditor, schemaRelationshipRefs",
                "contractLifecycle isContractLocked",
            ],
            mvp_cible=["API CRUD schema ODCS", "Validation structurelle serveur"],
            liens_sp1=[SP1_NAV, "Section Schema — pas navigation ici"],
            liens_sp3=[SP3_MAPPING, "Schéma initial import — édition continue SP2"],
            liens_sp4=[SP4_PROPOSED, SP4_REVISION, SP4_AUTOSAVE],
            liens_sp5=[SP5_VALIDATE],
        ),
    )
)

CREATE_ROWS.append(
    (
        "[Alignement] Schema editability — lock UX et guards",
        align_body(
            metier=(
                "Application UX des règles de verrouillage sur la section Schema — pas les règles "
                "lifecycle backend (SP4). US source 86c9nw8fj (prêt à déployer) inchangée."
            ),
            sources=["86c9nw8fj — prêt à déployer — lifecycle & locking"],
            corrige=[
                "Schema read-only en active sans Revision open",
                "Schema éditable en draft ou active+inRevision",
                "Pas Save draft — autosave SP4",
            ],
            ajoute=[
                "isContractLocked appliqué SchemaSection/TableBlock",
                "Masquage Add/Delete/Rename si verrouillé",
                "denseReadOnly sur vue publiée compacte",
            ],
            exclus=[
                "Immutabilité API backend (86c9nw8d4 — REPORT SP4)",
                "New version workflow détaillé (SP4 5x)",
                "Publish exécution (SP5)",
            ],
            reste=["Intention verrouillage Active historique US fj"],
            inclus=[
                "Guards UI sur toutes actions schema",
                "Feedback visuel lecture seule",
                "New version disponible depuis UI (lien SP4)",
            ],
            exclus_perimetre=[
                "Override admin déverrouillage",
                "Modification silencieuse version publiée",
            ],
            ac=[
                "En active sans révision : schema non éditable",
                "En inRevision : schema éditable",
                "En proposed : schema locked, import section seule",
                "Viewer toujours read-only",
            ],
            erreurs=[],
            regles=["SP2 = UX locks ; SP4 = règles métier lifecycle", "Référence US source 86c9nw8fj"],
            validation=["Proto isContractLocked sur SchemaSection", "MVP permissions + lifecycle API"],
            proto_valide=["contractLifecycle.ts", "App.tsx isLocked → SchemaSection"],
            mvp_cible=["Policy engine + UI disable states"],
            liens_sp4=[SP4_REVISION, SP4_PROPOSED, SP4_AUTOSAVE, "Règles métier — pas ici"],
            liens_sp1=[SP1_NAV],
            liens_sp5=[SP5_PUBLISH, "Publish disabled UI — exécution SP5"],
        ),
    )
)

UPDATE_META = [
    ("86c9n9a4h", "schema editor", "high"),
    ("86c9n9a4p", "schema editor", "normal"),
    ("86c9n9a4r", "schema editor", "normal"),
    ("86c9nc597", "schema editor", "normal"),
    ("86c9nw8cy", "quality rules", "normal"),
    ("86c9nw8dw", "lifecycle & locking", "normal"),
]

CREATE_META = [
    ("[Alignement] Schema editor — CRUD tables, colonnes, FK et metadata", "schema editor", "high"),
    ("[Alignement] Schema editability — lock UX et guards", "lifecycle & locking", "high"),
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
        shutil.copy(SRC_CSV, INPUT / "sp2-editor-lifecycle.csv")

    meta = {id_: (t, p) for id_, t, p in UPDATE_META}
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
    write_csv(OUT / "sp2-update.csv", ["id", "name", "description", "tags", "priority"], update_csv)

    create_meta = {n: (t, p) for n, t, p in CREATE_META}
    create_csv = [
        {
            "name": name,
            "description": desc,
            "tags": create_meta[name][0],
            "priority": create_meta[name][1],
        }
        for name, desc in CREATE_ROWS
    ]
    write_csv(OUT / "sp2-create.csv", ["name", "description", "tags", "priority"], create_csv)

    mapping = """# SP2 — Mapping actions

| ID / livrable | Action | Tag | Priorité | Notes |
| ------------- | ------ | --- | -------- | ----- |
| `86c9n9a4e` | **CREATE** alignement | schema editor | high | US source en cours — non UPDATE |
| `86c9n9a4h` | UPDATE | schema editor | high | |
| `86c9n9a4p` | UPDATE | schema editor | normal | |
| `86c9n9a4r` | UPDATE | schema editor | normal | Frontière SP3/SP5 |
| `86c9nc597` | UPDATE | schema editor | normal | |
| `86c9nw8cy` | UPDATE fort | quality rules | normal | aiVerified · pas note libre |
| `86c9nw8fj` | **CREATE** alignement | lifecycle & locking | high | Lock UX — US source prêt à déployer |
| `86c9nw8d4` | **REPORT → SP4** | — | — | Pas de CSV — manuel |
| `86c9nw8dw` | UPDATE + REPORT SP4 | lifecycle & locking | **normal** | Relevé depuis low |

| Total | **6 UPDATE** · **2 CREATE** · **0 CANCEL** · **2 REPORT** |

Fichiers : [sp2-update.csv](../output/sp2-update.csv) · [sp2-create.csv](../output/sp2-create.csv)
"""
    (DOCS / "sp2-actions-mapping.md").write_text(mapping, encoding="utf-8")

    report = """# REPORT SP2 → SP1 / SP3 / SP4 / SP5

Gouvernance : [backlog-governance.md](./backlog-governance.md) · relations §6bis · quality rules §6bis.

## Principe SP2

| Domaine | SP2 | Autre liste |
| ------- | --- | ----------- |
| CRUD schema | `4e` CREATE, `4h`, `4p`, `nc597` | SP3 import initial |
| Relations édition | `4r` | SP3 détection/mapping |
| Quality rules saisie | `nw8cy` | SP4 readiness · SP5 validation |
| Lock UX schema | CREATE `fj` | SP4 lifecycle métier |
| Soft delete UX | `nw8dw` UPDATE | SP4 métier audit |
| Immutabilité API | — | **SP4** (`86c9nw8d4` REPORT) |

## SP1

| US SP2 | Lien SP1 |
| ------ | -------- |
| Toutes schema | Navigation `86c9n9a4a` CREATE — pas CRUD ici |
| `nw8dw` | Registry `86c9n9a3w` — filtre liste |

## SP3

| US SP2 | Lien SP3 |
| ------ | -------- |
| `4r`, CREATE `4e` | `47` mapping · `44` import — pas parser ici |

## SP4

| US SP2 | Lien SP4 |
| ------ | -------- |
| CREATE `fj`, UPDATE schema | `5x` Revision open, `4t` lifecycle, `55` autosave |
| `nw8cy` | `5e` readiness — pas panel ici |
| `nw8dw` | Soft delete métier `4t` |
| `86c9nw8d4` | **REPORT** → CREATE `4t-B` / `wjvmn` |

## SP5

| US SP2 | Lien SP5 |
| ------ | -------- |
| `4r`, CREATE `4e` | Export/validation `5b` — pas UI |
| `nw8cy` | Publish blocking via validation |

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) · [sp3-report-sp1-sp2-sp4-sp5.md](./sp3-report-sp1-sp2-sp4-sp5.md).
"""
    (DOCS / "sp2-report-sp1-sp3-sp4-sp5.md").write_text(report, encoding="utf-8")

    report_d4 = """# REPORT manuel — `86c9nw8d4` → SP4

**Ne pas** inclure dans `sp2-update.csv`.

## Action ClickUp

1. Ouvrir `86c9nw8d4` (prêt à déployer).
2. Ajouter commentaire :

> REPORT SP4 — Immutabilité API versions publiées portée par SP4 CREATE branche B (`86c9n9a4t` backend) et `86c9wjvmn`. SP2 ne duplique pas cette exigence. Référence : [sp4-split-86c9n9a4t.md](./sp4-split-86c9n9a4t.md).

3. Laisser l’US source **inchangée** (statut protégé §3bis).
4. Tests immutabilité : **SP4 uniquement**.

## SP2 conserve

CREATE `[Alignement] Schema editability` — locks **UX** schema uniquement.
"""
    (DOCS / "sp2-report-d4-sp4.md").write_text(report_d4, encoding="utf-8")

    fiches = """# Fiches SP2 — import ClickUp

## Matrice

| Action | Nombre |
| ------ | ------ |
| UPDATE | 6 |
| CREATE | 2 |
| CANCEL | 0 |
| REPORT manuel | 1 (`86c9nw8d4`) |

## Ordre

1. [sp2-update.csv](../output/sp2-update.csv)
2. [sp2-create.csv](../output/sp2-create.csv)
3. [sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md)
4. [sp2-report-sp1-sp3-sp4-sp5.md](./sp2-report-sp1-sp3-sp4-sp5.md)

---

"""
    for id_, name, _ in UPDATE_ROWS:
        t, p = meta[id_]
        fiches += f"## `{id_}` — UPDATE\n\nTag `{t}` · priorité `{p}`\n\n---\n\n"
    for name, desc in CREATE_ROWS:
        t, p = create_meta[name]
        fiches += f"## CREATE — {name[:60]}…\n\nTag `{t}` · priorité `{p}`\n\n---\n\n"
    fiches += "## `86c9nw8d4` — REPORT manuel SP4\n\nVoir [sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md).\n"
    (DOCS / "sp2-fiches-import.md").write_text(fiches, encoding="utf-8")

    audit = """# SP2 — Audit final pré-import

**SAFE TO IMPORT**

## Checklist

- [x] 6 UPDATE · 2 CREATE · 0 CANCEL
- [x] `86c9nw8cy` UPDATE fort — pas note libre / non bloquante
- [x] `86c9nw8dw` priorité normal
- [x] `86c9n9a4r` frontière SP3/SP2/SP5 · anti mega relation system
- [x] `86c9nw8d4` hors CSV — REPORT manuel
- [x] US protégées `4e`, `fj` → CREATE alignement
- [x] Dual-track sur 6 UPDATE + 2 CREATE

## Verdict

**SAFE TO IMPORT**
"""
    (DOCS / "sp2-pre-import-audit.md").write_text(audit, encoding="utf-8")

    checklist = """# SP2 — Checklist import ClickUp

## Prérequis

- [ ] [sp2-pre-import-audit.md](./sp2-pre-import-audit.md) — SAFE TO IMPORT
- [ ] [sp2-actions-mapping.md](./sp2-actions-mapping.md)
- [ ] [sp2-fiches-import.md](./sp2-fiches-import.md)

## Import UPDATE (6)

[../output/sp2-update.csv](../output/sp2-update.csv)

| ID | Tag | Priorité |
| -- | --- | -------- |
| `86c9n9a4h` | schema editor | high |
| `86c9n9a4p` | schema editor | normal |
| `86c9n9a4r` | schema editor | normal |
| `86c9nc597` | schema editor | normal |
| `86c9nw8cy` | quality rules | normal |
| `86c9nw8dw` | lifecycle & locking | normal |

## Import CREATE (2)

[../output/sp2-create.csv](../output/sp2-create.csv)

## REPORT manuel

- [ ] [sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md) — `86c9nw8d4` commentaire SP4

## Post-import

- [ ] 6 UPDATE + 2 CREATE : tags/priorités visibles
- [ ] `86c9n9a4e`, `86c9nw8fj` sources protégées inchangées
- [ ] `nw8dw` = normal (plus low)

## Regénération

```bash
python3 backlog/scripts/generate_sp2_deliverables.py
```
"""
    (DOCS / "sp2-import-checklist.md").write_text(checklist, encoding="utf-8")

    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    if "## SP2" not in readme:
        readme += """

## SP2 — Editor & Lifecycle

**Input :** [input/sp2-editor-lifecycle.csv](input/sp2-editor-lifecycle.csv)

**Gouvernance :** 6 UPDATE · 2 CREATE [Alignement] · 0 CANCEL · REPORT `86c9nw8d4` manuel.

**Regénérer :** `python3 backlog/scripts/generate_sp2_deliverables.py`

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp2-update.csv](output/sp2-update.csv)
2. **CREATE** — [output/sp2-create.csv](output/sp2-create.csv)
3. **REPORT** — [docs/sp2-report-d4-sp4.md](docs/sp2-report-d4-sp4.md)
4. **Docs** — [docs/sp2-fiches-import.md](docs/sp2-fiches-import.md) · [docs/sp2-pre-import-audit.md](docs/sp2-pre-import-audit.md)
"""
        (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")

    print(f"Wrote {len(update_csv)} updates, {len(create_csv)} creates")


if __name__ == "__main__":
    main()
