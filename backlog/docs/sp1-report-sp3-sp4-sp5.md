# REPORT SP1 → SP3 / SP4 / SP5 / SP2

Coordination cross-listes avant import des **CREATE** complémentaires SP1.  
Gouvernance : [backlog-governance.md](./backlog-governance.md) §3bis — **0 UPDATE** sur US sources `qa` / `en cours`.

## Principe SP1

| Règle | Détail |
| ----- | ------ |
| US sources SP1 | **7 US inchangées** (6 `qa` + 1 `en cours`) |
| Delta backlog | **~5 CREATE** `[Alignement]` dans liste **SP1 — Interfaces** |
| Doublon YAML | `86c9nw8br` (SP1) vs `86c9n9a53` (SP3) — **SP3** porte sérialisation ; SP1 = preview UI + copy/download |

---

## SP3 — DDL Import (propriétaire parser)

**Ne pas dupliquer dans CREATE SP1.**

| US SP3 | Rôle | Lien CREATE-1 |
| ------ | ---- | ------------- |
| `86c9n9a44` | Import DDL, génération schéma initial | REPORT — parser, validation SQL |
| `86c9n9a47` | DDL → schéma ODCS éditable | REPORT — tables/FK après import |
| `86c9n9a40` | Sous-ensemble DDL supporté MVP | REPORT — périmètre parser |
| `86c9n9a42` | Fixtures DDL tests | REPORT — non UI |
| `86c9n9a54` / `86c9nw8d1` | Sérialisation YAML ODCS | Distinct de preview SP1 (`nw8br`) |

**Dédoublonnage CREATE flow :**

- CREATE-1 (`86c9n9a3v`, `86c9n9a48`) = **shell** mode choice, statuts `proposed`/`draft`, non-persistance.
- **Pas** de logique parser `CREATE TABLE`, preview tables, types inconnus → **SP3** uniquement.

---

## SP4 — Versioning (readiness, autosave, Versions)

| US SP4 | Rôle | Lien SP1 |
| ------ | ---- | -------- |
| `86c9n9a55` | Autosave — remplace Save draft P0 | CREATE-3 **exclut** Save draft |
| `86c9n9a5e` | Readiness **panel** (score, navigation champs) | CREATE-3 **cues sidebar** uniquement — pas le panel |
| `86c9n9a6m` | Section Versions (timeline) | CREATE-3 : accès Versions **sans** Form/YAML switch |
| `86c9n9a4t` | Modèle logique working copy | CREATE-1 : `proposed` → Start drafting (**SP4**) |

**Distinction QA :**

- **SP1 CREATE-3** : navigation + cues légers si contrat éditable.
- **SP4** : panneau readiness complet, compare, discard, publish update.

---

## SP5 — Publish & GitOps

| US SP5 | Rôle | Lien SP1 |
| ------ | ---- | -------- |
| `86c9n9a5b` | Validation YAML pré-Git | CREATE-5 REPORT — pas validation publish dans Fundamentals US |
| `86c9n9a5u` / `86c9n9a5z` | Publish / update | CREATE-1 REPORT — hors create |
| `86c9n9a5n` / `86c9n9a5p` | MD5 / push Git | CREATE-4 REPORT — pas MD5 dans YAML view US |

**YAML SP1 :** preview = **working copy courante** ; checksum/Git = **SP5**.

---

## SP2 — Editor & Lifecycle (frontière critique)

**SP1 ne réimplémente pas l’éditeur schema.**

| US SP2 (exemples) | Rôle | Lien CREATE-3 (`86c9n9a4a`) |
| ----------------- | ---- | --------------------------- |
| `86c9n9a4e` | Édition schéma tables/champs | REPORT — comportement section Schema |
| `86c9n9a4h` / `86c9n9a4p` | Ajout / suppression table | REPORT |
| `86c9n9a4r` | Relations entre tables | REPORT |
| `86c9nc597` | Suppression champ | REPORT |
| `86c9nw8cy` | Quality rules (note) | REPORT |
| `86c9nw8fj` / `86c9nw8d4` | Lock actif / immutabilité backend | REPORT — lock UI vs API |

**Frontière `86c9n9a4a` :**

- **SP1** : sidebar, section active, cues readiness, accès YAML/Versions/Schema/Fundamentals.
- **SP2** : édition détaillée, validations structurelles, lifecycle actions, lock/delete.

**Risque à éviter :** étendre CREATE-3 avec AC tables/colonnes/relations → **refuser** ; renvoyer SP2.

---

## SP6 — Auth (registry)

- CREATE-2 : auth liste contrats, filtrage par utilisateur → **REPORT SP6** si auth plateforme hors scope proto.

---

## US sources SP1 — statut (non modifiées)

| ID | Statut | CREATE |
| -- | ------ | ------ |
| `86c9n9a3v` | qa | CREATE-1 |
| `86c9n9a48` | qa | Couvert CREATE-1 |
| `86c9n9a3w` | qa | CREATE-2 |
| `86c9n9a4a` | qa | CREATE-3 |
| `86c9nw8br` | qa | CREATE-4 |
| `86c9nw8bu` | qa | CREATE-5 |
| `86c9n9a6f` | en cours | **DO NOT TOUCH** |

Voir [sp1-corrections-mapping.md](./sp1-corrections-mapping.md).
