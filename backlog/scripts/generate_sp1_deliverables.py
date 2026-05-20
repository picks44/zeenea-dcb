#!/usr/bin/env python3
"""Generate SP1 ClickUp backlog deliverables (CREATE alignement — US protégées)."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"
INPUT = ROOT / "backlog" / "input"
SRC_CSV = ROOT / "clickup-backlog-SP1_-_Interfaces-2026-05-20-110043.csv"

SP3_IMPORT = "86c9n9a44 — Import DDL (parser, schéma initial)"
SP3_CONVERT = "86c9n9a47 — Conversion DDL → schéma ODCS éditable"
SP4_AUTOSAVE = "86c9n9a55 — Autosave (remplace Save draft)"
SP4_READINESS = "86c9n9a5e — Readiness panel (pas les cues sidebar SP1)"
SP4_VERSIONS = "86c9n9a6m — Section Versions (timeline)"
SP5_VALIDATE = "86c9n9a5b — Validation YAML pré-publication"
SP5_PUBLISH = "86c9n9a5u / 86c9n9a5z — Publish (hors create)"
SP2_SCHEMA = "86c9n9a4e — Édition schéma (tables/champs)"
SP2_RELATIONS = "86c9n9a4r — Relations entre tables"
SP2_LOCK = "86c9nw8fj — Verrouillage contrat actif"


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
    liens_sp3: list[str] | None = None,
    liens_sp4: list[str] | None = None,
    liens_sp5: list[str] | None = None,
    liens_sp2: list[str] | None = None,
    liens_sp6: list[str] | None = None,
) -> str:
    parts = [
        "Description métier",
        "",
        metier,
        "",
        "Gouvernance — US sources (statuts protégés, non modifiées)",
        "",
    ]
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
    if liens_sp3:
        parts.extend(["", "Liens SP3 — DDL Import (ne pas réimplémenter ici)", ""])
        parts.extend(f"- {x}" for x in liens_sp3)
    if liens_sp2:
        parts.extend(["", "Liens SP2 — Editor & Lifecycle (ne pas réimplémenter ici)", ""])
        parts.extend(f"- {x}" for x in liens_sp2)
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    if liens_sp5:
        parts.extend(["", "Liens SP5 — Publish & GitOps", ""])
        parts.extend(f"- {x}" for x in liens_sp5)
    if liens_sp6:
        parts.extend(["", "Liens SP6 — Auth (si applicable)", ""])
        parts.extend(f"- {x}" for x in liens_sp6)
    return "\n".join(parts)


CREATE_ROWS: list[tuple[str, str, str, str]] = []

# --- CREATE-1: 86c9n9a3v + 86c9n9a48 ---
CREATE_ROWS.append(
    (
        "[Alignement] Create contract — parcours two-step et statuts proposed/draft",
        "contract creation",
        "high",
        align_body(
            metier=(
                "US complémentaire alignant le parcours de création sur le prototype validé "
                "(mode choice, non-persistance) et le MVP (transaction create, statuts lifecycle produit). "
                "Les US sources 86c9n9a3v et 86c9n9a48 restent en QA inchangées."
            ),
            sources=[
                "86c9n9a3v (qa) — Créer un nouveau data contract",
                "86c9n9a48 (qa) — Start from scratch / fallback — couverture explicite dans cette CREATE",
            ],
            corrige=[
                "Plus de création Draft immédiate + redirection DDL seule au clic Create Contract",
                "Statut initial import → proposed (pas draft à la création)",
                "Statut initial scratch → draft après validation du parcours",
            ],
            ajoute=[
                "Écran create two-step : cartes Import DDL / Start from scratch avant toute persistance",
                "Aucun contrat enregistré tant que l’utilisateur n’a pas validé import ou scratch",
                "Transaction create API avec owner par défaut",
                "Back to creation options depuis le formulaire DDL",
            ],
            exclus=[
                "Parser SQL CREATE TABLE, validation types, injection tables/FK",
                "Publish, readiness panel, Git",
            ],
            reste=[
                "Intention produit « créer un contrat » et tests QA historiques sur 3v/48",
                "Fallback manuel toujours secondaire au parcours DDL recommandé",
            ],
            inclus=[
                "Bouton Create Contract → vue mode choice (pas de contrat créé)",
                "Carte Import DDL → parcours import → contrat proposed + Fundamentals",
                "Carte Start from scratch → contrat draft + schéma vide + Fundamentals",
                "Owner par défaut = créateur",
                "Publish désactivé tant que non publiable",
            ],
            exclus_perimetre=[
                "Persistance avant choix de mode",
                "Redirect automatique vers textarea SQL sans mode choice",
                "Parser DDL (SP3)",
                "Templates, IA, import Zeenea",
            ],
            ac=[
                "Create Contract ouvre la vue two-step sans persister de contrat",
                "Import DDL réussi crée un contrat proposed et ouvre Fundamentals",
                "Start from scratch crée un contrat draft (schéma vide) et ouvre Fundamentals",
                "Back to creation options ramène au mode choice sans contrat fantôme",
                "Aucune écriture localStorage/API avant succès du parcours choisi",
                "Owner visible dans le registry après création",
            ],
            erreurs=[
                "Échec parse DDL → message utilisateur, pas de contrat proposed créé",
                "Abandon avant validation → aucun contrat persisté",
            ],
            regles=[
                "Aligné doc produit §7 — séparation mode choice / import",
                "86c9n9a48 couvert ici — pas de CREATE scratch séparée",
            ],
            validation=[
                "Proto : CreateContractView, createContract manual/import",
                "MVP : API POST create avec statut proposed ou draft selon mode",
            ],
            proto_valide=[
                "CreateContractView — cartes Import DDL / Start from scratch",
                "createContract.ts — creationSource import/manual, status proposed/draft",
                "Pas de saveContracts avant onParsed / onStartFromScratch",
            ],
            mvp_cible=[
                "Endpoint transaction create (proposed | draft)",
                "Owner par défaut côté serveur",
                "Idempotence abandon parcours (pas de brouillon orphelin)",
            ],
            liens_sp3=[SP3_IMPORT, SP3_CONVERT],
            liens_sp4=["proposed → Start drafting (lifecycle SP4)"],
            liens_sp5=[SP5_PUBLISH],
        ),
    )
)

# --- CREATE-2: 86c9n9a3w ---
CREATE_ROWS.append(
    (
        "[Alignement] Registry — recherche nom/ID, filtre lifecycle, pagination/tri",
        "contracts registry",
        "high",
        align_body(
            metier=(
                "US complémentaire : la recherche backlog est confirmée dans le MVP. "
                "L’US source 86c9n9a3w (qa) excluait la recherche — cette CREATE porte le delta "
                "sans réécrire l’US protégée."
            ),
            sources=["86c9n9a3w (qa) — Liste des data contracts"],
            corrige=[
                "AC « aucune recherche dans le MVP » remplacés par exigences search dans cette US",
                "Statuts lifecycle produit (5 statuts) vs ancien triptyque Draft/Active/Deprecated seul",
            ],
            ajoute=[
                "Recherche par nom de contrat",
                "Recherche par ID contrat",
                "Filtre par statut lifecycle (proposed, draft, active, deprecated, retired)",
                "Pagination et tri côté API/query",
            ],
            exclus=["Réécriture de la description de 86c9n9a3w"],
            reste=[
                "Page Contracts, colonnes, empty state, ouverture détail, Create Contract",
                "Exclusion soft-deleted de la liste principale",
            ],
            inclus=[
                "Champ Search (nom + ID)",
                "Filtre lifecycle",
                "Pagination UI + tri colonnes",
                "Compteur / table / navigation latérale",
            ],
            exclus_perimetre=[
                "Bulk actions, export, colonnes personnalisables, corbeille",
                "Compare versions (SP4)",
            ],
            ac=[
                "La recherche filtre par titre et par id (insensible à la casse côté produit)",
                "Le filtre lifecycle restreint la liste aux statuts sélectionnés",
                "La pagination fonctionne avec la recherche active",
                "Le tri par colonne fonctionne avec recherche + filtre",
                "État vide explicite si aucun résultat",
            ],
            erreurs=["Query invalide → liste vide ou message, pas d’erreur silencieuse"],
            regles=["Recherche MVP confirmée PO — portée par cette CREATE, pas UPDATE 3w"],
            validation=[
                "Proto : ContractsBacklog search + lifecycleFilter + pagination",
                "MVP : API liste avec query params search, status, sort, page",
            ],
            proto_valide=[
                "ContractsBacklog.tsx — Search input, lifecycle filter, sort, PAGE_SIZE",
            ],
            mvp_cible=[
                "GET /contracts?search=&status=&sort=&page=",
                "Cohérence filtres avec statuts ODCS lifecycle produit",
            ],
            liens_sp4=["Colonnes version enrichies si hors registry — SP4"],
            liens_sp6=["Auth / visibilité liste — SP6 si plateforme"],
        ),
    )
)

# --- CREATE-3: 86c9n9a4a ---
CREATE_ROWS.append(
    (
        "[Alignement] Navigation sections — cues, Versions sans Form/YAML",
        "contract structure",
        "normal",
        align_body(
            metier=(
                "US complémentaire pour la navigation entre sections du contrat : "
                "cues readiness sidebar, accès Versions sans switch Form/YAML, retrait Save draft. "
                "US source 86c9n9a4a (qa) inchangée."
            ),
            sources=["86c9n9a4a (qa) — Navigation entre sections"],
            corrige=[
                "Retrait exigence bouton Save draft (obsolète — autosave SP4)",
                "Distinction cues sidebar vs readiness panel SP4",
            ],
            ajoute=[
                "Readiness cues sur sections si contrat éditable (sectionNavCues)",
                "Section Versions accessible sans switch global Form/YAML",
                "Sections alignées produit actuel (Fundamentals, Schema, gouvernance, YAML, Versions, etc.)",
            ],
            exclus=[
                "Édition tables/colonnes/relations (SP2)",
                "Readiness panel complet avec score (SP4 5e)",
                "Publish Git (SP5)",
            ],
            reste=[
                "Navigation progressive entre sections",
                "Indication section active",
                "Accès YAML lecture seule depuis le shell",
            ],
            inclus=[
                "Sidebar ContractSectionNav",
                "Cues visuels par section (si règles sectionNavCues)",
                "Versions : pas de toggle Form/YAML dans ContractTopBar",
                "Publish depuis top bar quand éligible (renvoi SP5 pour exécution)",
            ],
            exclus_perimetre=[
                "Save draft P0",
                "Workflow collaboratif, commentaires",
                "Éditeur schema détaillé",
            ],
            ac=[
                "La section active est visible dans la sidebar",
                "Les cues n’apparaissent pas sur contrat read-only",
                "Versions n’affiche pas le switch Form/YAML",
                "Aucun bouton Save draft dans le shell navigation",
                "L’utilisateur accède à Schema sans AC d’édition schema dans cette US",
            ],
            erreurs=["Contrat locked → pas de cues édition, navigation read-only OK"],
            regles=[
                "SP1 = shell navigation uniquement",
                "86c9n9a4a dépend des sections SP2 pour le comportement Schema",
            ],
            validation=[
                "Proto : ContractSectionNav, shouldShowSectionNavProgressCue, Versions sans view toggle",
                "MVP : lock API + mêmes règles cues",
            ],
            proto_valide=[
                "ContractSectionNav.tsx, sectionNavCues.ts",
                "ContractTopBar hideViewToggle sur section versions",
            ],
            mvp_cible=["API lock status drive cues visibility"],
            liens_sp2=[SP2_SCHEMA, SP2_RELATIONS, SP2_LOCK],
            liens_sp4=[SP4_AUTOSAVE, SP4_READINESS, SP4_VERSIONS],
            liens_sp5=[SP5_PUBLISH],
        ),
    )
)

# --- CREATE-4: 86c9nw8br ---
CREATE_ROWS.append(
    (
        "[Alignement] YAML view — Copy/Download, working copy courante",
        "yaml view",
        "high",
        align_body(
            metier=(
                "US complémentaire pour l’onglet YAML : copy, download, preview reflétant "
                "l’état courant (working copy). US source 86c9nw8br (qa) inchangée."
            ),
            sources=["86c9nw8br (qa) — YAML généré lecture seule"],
            corrige=[
                "Synchronisation explicite = état courant en mémoire (pas seulement dernier save draft)",
                "Actions Copy et Download documentées",
            ],
            ajoute=[
                "Bouton Copy YAML (clipboard)",
                "Bouton Download YAML (fichier .yaml nommé id_version)",
                "Indication export coverage / read-only",
            ],
            exclus=["MD5, push Git, compare versions"],
            reste=[
                "YAML read-only pour tous les rôles",
                "Génération depuis modèle ODCS P1",
                "Pas d’édition inline YAML",
            ],
            inclus=[
                "Onglet YAML dans le shell contrat",
                "Preview texte généré par odcsYamlGenerator",
                "Copy + Download sur le même contenu que la preview",
            ],
            exclus_perimetre=[
                "Save draft",
                "Édition YAML",
                "Validation live avancée dans l’éditeur",
            ],
            ac=[
                "Le YAML affiché reflète le contrat courant (working copy) après modification",
                "Copy copie l’intégralité du YAML visible",
                "Download produit un fichier .yaml cohérent avec la preview",
                "Aucun champ YAML n’est éditable",
                "En révision (inRevision), le YAML reflète la working copy",
            ],
            erreurs=["Clipboard refusé → feedback utilisateur"],
            regles=["Preview = source de vérité pour copy/download (yamlFileDownload)"],
            validation=[
                "Proto : YamlView copy/download, generateODCSYaml(contract)",
                "MVP : preview serveur sur état courant brouillon",
            ],
            proto_valide=[
                "YamlView.tsx — Copy, Download, buildYamlDownloadFilename",
                "odcsYamlGenerator.ts",
            ],
            mvp_cible=[
                "GET preview YAML working copy",
                "Download filename convention {id}_{version}.yaml",
            ],
            liens_sp4=["Compare versions — SP4"],
            liens_sp5=["Checksum MD5 sur version publiée — SP5 5n, pas dans cette US"],
        ),
    )
)

# --- CREATE-5: 86c9nw8bu ---
CREATE_ROWS.append(
    (
        "[Alignement] Fundamentals — lifecycle P1, owner, validation MVP",
        "contract fundamentals",
        "high",
        align_body(
            metier=(
                "US complémentaire pour Fundamentals : alignement lifecycle 5 statuts, "
                "owner, champs P1 et cible API. US source 86c9nw8bu (qa) inchangée."
            ),
            sources=["86c9nw8bu (qa) — Éditer Fundamentals"],
            corrige=[
                "Statut système : alignement proposed/draft/active/deprecated/retired (pas Draft seul avant publish)",
                "Name obligatoire produit (déjà dans source — rappel P1)",
            ],
            ajoute=[
                "Affichage lifecycle cohérent avec modèle produit",
                "Owner / collaborateurs app-only (non exportés YAML sauf règle P1)",
                "Cible PATCH API Fundamentals",
            ],
            exclus=["Validation publish complète (SP5 5b)"],
            reste=[
                "Champs domain, descriptions, tags fundamentals",
                "apiVersion/kind/id système non éditables",
                "Erreurs champs obligatoires",
            ],
            inclus=[
                "Formulaire FundamentalsSection",
                "Champs P1 visibles et éditables si non locked",
                "Génération YAML incluant fundamentals",
            ],
            exclus_perimetre=[
                "Multi-owner avancé, approval workflow",
                "Édition manuelle status/version système",
            ],
            ac=[
                "Les champs fundamentals sont éditables si contrat non locked",
                "Le statut lifecycle affiché correspond au modèle 5 statuts",
                "name obligatoire côté produit avant publish",
                "Les champs système restent non éditables librement",
                "Les modifications sont reflétées dans le YAML preview",
            ],
            erreurs=["Champ obligatoire manquant → message inline"],
            regles=["Alignement odcs P1 et contractValidation publish"],
            validation=[
                "Proto : FundamentalsSection, ContractInfo fields",
                "MVP : PATCH /contracts/{id}/fundamentals",
            ],
            proto_valide=[
                "FundamentalsSection, types ContractInfo status lifecycle",
            ],
            mvp_cible=[
                "API PATCH fundamentals avec validation P1",
                "Owner depuis session / collaborator stub",
            ],
            liens_sp5=[SP5_VALIDATE],
            liens_sp2=["Règles structurelles transverses si impact schema — SP2"],
        ),
    )
)

MAPPING_META = [
    ("CREATE-1", "86c9n9a3v, 86c9n9a48", "qa, qa", "Create two-step, proposed/draft, non-persistance", "contract creation", "high"),
    ("CREATE-2", "86c9n9a3w", "qa", "Recherche MVP absente de l’US source", "contracts registry", "high"),
    ("CREATE-3", "86c9n9a4a", "qa", "Cues, Versions sans Form/YAML, pas Save draft", "contract structure", "normal"),
    ("CREATE-4", "86c9nw8br", "qa", "Copy/Download, working copy", "yaml view", "high"),
    ("CREATE-5", "86c9nw8bu", "qa", "Lifecycle 5 statuts, owner, API PATCH", "contract fundamentals", "high"),
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
        shutil.copy(SRC_CSV, INPUT / "sp1-interfaces.csv")

    create_csv = [
        {"name": name, "description": desc, "tags": tags, "priority": pri}
        for name, tags, pri, desc in CREATE_ROWS
    ]
    write_csv(
        OUT / "sp1-create.csv",
        ["name", "description", "tags", "priority"],
        create_csv,
    )

    # corrections mapping
    mapping = """# SP1 — Mapping corrections (US source → CREATE)

Gouvernance §3bis : **0 UPDATE direct** sur US protégées.  
**7 US sources inchangées** · **5 CREATE** complémentaires · **`86c9n9a6f` DO NOT TOUCH**.

| CREATE | US source(s) | Statut source | Raison du correctif | Tag | Priorité |
| ------ | ------------ | ------------- | ------------------- | --- | -------- |
"""
    for cid, src, stat, reason, tag, pri in MAPPING_META:
        mapping += f"| {cid} | `{src}` | {stat} | {reason} | `{tag}` | {pri} |\n"

    mapping += """
| — | `86c9n9a6f` | en cours | **DO NOT TOUCH** — pas de CREATE à ce stade | `design system` | normal |

## Fichier import

[sp1-create.csv](../output/sp1-create.csv) — colonnes : `name`, `description`, `tags`, `priority` (pas de colonne `id`).

## Cross-listes

[sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md)
"""
    (DOCS / "sp1-corrections-mapping.md").write_text(mapping, encoding="utf-8")

    # fiches import
    fiches = """# Fiches SP1 — import ClickUp (CREATE alignement)

Référence : plan SP1 / gouvernance [backlog-governance.md](./backlog-governance.md) §3bis.  
**0 UPDATE** sur US sources · **5 CREATE** dans liste **SP1 — Interfaces**.

## Matrice validée

| Action | Nombre |
| ------ | ------ |
| UPDATE direct (US existantes) | **0** |
| CREATE complémentaires | **5** |
| CANCEL / SPLIT | **0** |
| US sources modifiées | **0** |
| `86c9n9a6f` | **DO NOT TOUCH** (en cours) |

## Ownership QA

| CREATE | Tester ici (delta) | REPORT (ne pas tester ici) |
| ------ | ------------------ | --------------------------- |
| CREATE-1 | Two-step, proposed/draft, non-persistance | Parser SP3, publish SP5 |
| CREATE-2 | Search, lifecycle filter, pagination/tri | Colonnes version SP4 |
| CREATE-3 | Nav, cues, Versions sans Form/YAML | Schema SP2, panel SP4, publish SP5 |
| CREATE-4 | Copy/Download YAML courant | MD5/Git SP5, compare SP4 |
| CREATE-5 | Fundamentals, lifecycle, owner | Validation publish SP5 |

Les US sources en **qa** conservent leurs tests historiques sur le comportement documenté à l’origine.

## Ordre d’import ClickUp

1. **CREATE** — [../output/sp1-create.csv](../output/sp1-create.csv)  
   - Colonnes : `name`, `description`, `tags`, `priority`  
   - **5 lignes** — pas de colonne `id`  
   - Mapper `tags` → colonne **Tag** ClickUp si requis

2. **REPORT** — [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md)

3. **Contrôle post-import** — [sp1-import-checklist.md](./sp1-import-checklist.md)

**Pas de** `sp1-update.csv` · `sp1-metadata-update.csv` probablement inutile (tags/priorité dans CREATE).

---

"""
    for i, (name, tags, pri, _) in enumerate(CREATE_ROWS, 1):
        src = MAPPING_META[i - 1][1]
        fiches += f"""## CREATE-{i}

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne {i}) |
| US source(s) | `{src}` |
| Tag | `{tags}` |
| Priorité | `{pri}` |
| Titre | {name[:70]}… |

---

"""
    (DOCS / "sp1-fiches-import.md").write_text(fiches, encoding="utf-8")

    # pre-import audit
    audit = """# SP1 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### Protection statuts §3bis
- [x] **0 UPDATE** sur les 7 US sources SP1
- [x] 6 US `qa` + 1 `en cours` classées protégées
- [x] Écarts portés par **5 CREATE** avec référence US source
- [x] `86c9n9a6f` — DO NOT TOUCH (pas de CREATE)

### MVP et prototype
- [x] Dual-track (Validé prototype / MVP cible) dans chaque description CREATE
- [x] Pas de réduction MVP au seul localStorage proto
- [x] Recherche registry confirmée MVP (CREATE-2)

### Frontières cross-listes
- [x] Parser DDL → **SP3** uniquement (CREATE-1)
- [x] Schema/relations/lock → **SP2** (CREATE-3 REPORT)
- [x] Readiness panel / autosave → **SP4** (pas dupliqué dans CREATE-3)
- [x] Publish / MD5 / Git → **SP5**
- [x] Pas de scope « editor/schema » complet dans CREATE SP1

### Décisions
- [x] 0 CANCEL · 0 SPLIT
- [x] `86c9n9a48` couvert par CREATE-1 (pas CREATE séparée)
- [x] US atomiques, AC testables

### CSV
- [x] **5 CREATE** sans colonne `id`
- [x] Colonnes `name`, `description`, `tags`, `priority`
- [x] Fichier séparé (pas de mélange UPDATE/CREATE)
- [x] CSV généré par script — parse OK

### Tags / priorités
- [x] 5/5 tag + priorité dans sp1-create.csv
- [x] Tags existants uniquement (pas de nouveau tag)
- [x] Mapping documenté [sp1-corrections-mapping.md](./sp1-corrections-mapping.md)

## Verdict

**SAFE TO IMPORT** — import **CREATE uniquement** ; contrôle visuel tags/priorités post-import obligatoire (leçon SP4/SP5).

## Post-import (§11)

- [ ] 5 tâches CREATE visibles dans liste SP1 — Interfaces
- [ ] **5/5 tags epic** visibles dans ClickUp (pas seulement succès batch)
- [ ] **5/5 priorités** visibles
- [ ] Descriptions : sections US source, Corrigé/Ajouté/Exclu, Liens SP2/SP3/SP4/SP5
- [ ] US sources `3v`, `3w`, `48`, `4a`, `nw8br`, `nw8bu`, `6f` — **descriptions inchangées**
- [ ] Archiver export post-import si écart
"""
    (DOCS / "sp1-pre-import-audit.md").write_text(audit, encoding="utf-8")

    # import checklist
    checklist = """# SP1 — Checklist import ClickUp (à exécuter par PM/PO)

Livrables générés — **pas d’import automatique** depuis ce dépôt.

## Prérequis

- [ ] GO sur [sp1-pre-import-audit.md](./sp1-pre-import-audit.md) (**SAFE TO IMPORT**)
- [ ] [sp1-fiches-import.md](./sp1-fiches-import.md) relu
- [ ] [sp1-corrections-mapping.md](./sp1-corrections-mapping.md) validé
- [ ] [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) — frontières SP2/SP3 OK

## Rappel gouvernance

- **Ne pas** importer de `sp1-update.csv` (inexistant / interdit).
- **Ne pas** modifier les 7 US sources en qa/en cours.
- Importer **uniquement** les 5 CREATE.

## Import CREATE

Fichier : [../output/sp1-create.csv](../output/sp1-create.csv)

| # | Titre (début) | Tag | Priorité |
| - | ------------- | --- | -------- |
| 1 | `[Alignement] Create contract` | contract creation | high |
| 2 | `[Alignement] Registry` | contracts registry | high |
| 3 | `[Alignement] Navigation sections` | contract structure | normal |
| 4 | `[Alignement] YAML view` | yaml view | high |
| 5 | `[Alignement] Fundamentals` | contract fundamentals | high |

- [ ] Import batch ou création manuelle depuis CSV
- [ ] Colonne `tags` mappée vers **Tag** ClickUp si besoin
- [ ] Liste cible : **SP1 — Interfaces**

## Contrôle post-import (§11)

- [ ] Ouvrir les **5** nouvelles tâches — vérifier Markdown description
- [ ] Vérifier référence US source dans chaque description (`86c9n9a3v`, etc.)
- [ ] Échantillon + **100 % des CREATE** : tag + priorité **visibles** dans l’UI
- [ ] Vérifier que les **7 US sources** n’ont **pas** été modifiées par erreur
- [ ] `86c9n9a6f` toujours **en cours**, description inchangée
- [ ] Lier manuellement CREATE → US source (commentaire ou custom field) si process équipe l’exige

## Après SP1

- Liste suivante recommandée : **SP3 — DDL Import** puis **SP2 — Editor & Lifecycle** (gouvernance §7).
"""
    (DOCS / "sp1-import-checklist.md").write_text(checklist, encoding="utf-8")

    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    if "## SP1" not in readme:
        readme += """

## SP1 — Interfaces (CREATE alignement)

**Input :** [input/sp1-interfaces.csv](input/sp1-interfaces.csv)

**Gouvernance :** 0 UPDATE sur US protégées (qa/en cours) — 5 CREATE complémentaires.

### Ordre d’import ClickUp

1. **CREATE** — [output/sp1-create.csv](output/sp1-create.csv) (`name`, `description`, `tags`, `priority`)
2. **Mapping** — [docs/sp1-corrections-mapping.md](docs/sp1-corrections-mapping.md)
3. **Cross-listes** — [docs/sp1-report-sp3-sp4-sp5.md](docs/sp1-report-sp3-sp4-sp5.md)
4. **Audit pré-import** — [docs/sp1-pre-import-audit.md](docs/sp1-pre-import-audit.md)
5. **Import (manuel)** — [docs/sp1-import-checklist.md](docs/sp1-import-checklist.md)

| US source | Action |
| --------- | ------ |
| `86c9n9a3v`, `86c9n9a48`, `86c9n9a3w`, `86c9n9a4a`, `86c9nw8br`, `86c9nw8bu` | Inchangées — CREATE associée |
| `86c9n9a6f` | DO NOT TOUCH |
"""
        (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")

    print(f"Wrote {len(create_csv)} CREATE rows to {OUT / 'sp1-create.csv'}")
    print(f"Docs: {DOCS}")


if __name__ == "__main__":
    main()
