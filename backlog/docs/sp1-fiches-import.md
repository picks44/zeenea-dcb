# Fiches SP1 — import ClickUp (CREATE alignement)

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

## CREATE-1

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne 1) |
| US source(s) | `86c9n9a3v, 86c9n9a48` |
| Tag | `contract creation` |
| Priorité | `high` |
| Titre | [Alignement] Create contract — parcours two-step et statuts proposed/d… |

---

## CREATE-2

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne 2) |
| US source(s) | `86c9n9a3w` |
| Tag | `contracts registry` |
| Priorité | `high` |
| Titre | [Alignement] Registry — recherche nom/ID, filtre lifecycle, pagination… |

---

## CREATE-3

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne 3) |
| US source(s) | `86c9n9a4a` |
| Tag | `contract structure` |
| Priorité | `normal` |
| Titre | [Alignement] Navigation sections — cues, Versions sans Form/YAML… |

---

## CREATE-4

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne 4) |
| US source(s) | `86c9nw8br` |
| Tag | `yaml view` |
| Priorité | `high` |
| Titre | [Alignement] YAML view — Copy/Download, working copy courante… |

---

## CREATE-5

| Champ | Valeur |
| ----- | ------ |
| Action | **CREATE** |
| Fichier | `output/sp1-create.csv` (ligne 5) |
| US source(s) | `86c9nw8bu` |
| Tag | `contract fundamentals` |
| Priorité | `high` |
| Titre | [Alignement] Fundamentals — lifecycle P1, owner, validation MVP… |

---

