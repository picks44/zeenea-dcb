# Backlog ClickUp — alignement MVP

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


## SP5 — Publish & GitOps

**Input :** [input/sp5-publish-gitops.csv](input/sp5-publish-gitops.csv)

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp5-update.csv](output/sp5-update.csv)
2. **Metadata** — [output/sp5-metadata-update.csv](output/sp5-metadata-update.csv)
3. **Fiches** — [docs/sp5-fiches-import.md](docs/sp5-fiches-import.md)
4. **Audit pré-import** — [docs/sp5-pre-import-audit.md](docs/sp5-pre-import-audit.md)
5. **Import (manuel)** — [docs/sp5-import-checklist.md](docs/sp5-import-checklist.md)
6. **Liens SP4** — [docs/sp5-report-sp4.md](docs/sp5-report-sp4.md) · [docs/sp4-report-sp5.md](docs/sp4-report-sp5.md)

| ID | Action |
|----|--------|
| `86c9n9a5b`, `86c9n9a5h`, `86c9n9a5n`, `86c9n9a5p`, `86c9n9a5u`, `86c9n9a5z`, `86c9nc596` | UPDATE |


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


## SP3 — DDL Import

**Input :** [input/sp3-ddl-import.csv](input/sp3-ddl-import.csv)  
**Gouvernance :** 6 UPDATE (US `à faire`) · 1 CANCEL doublon · 0 CREATE · tri-domaine YAML §6bis.

**Regénérer :** `python3 backlog/scripts/generate_sp3_deliverables.py`

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp3-update.csv](output/sp3-update.csv) (`id`, `name`, `description`, `tags`, `priority`)
2. **CANCEL** — [output/sp3-cancel.csv](output/sp3-cancel.csv) — `86c9nw8d1` **manuel**
3. **Mapping** — [docs/sp3-actions-mapping.md](docs/sp3-actions-mapping.md)
4. **Cross-listes** — [docs/sp3-report-sp1-sp2-sp4-sp5.md](docs/sp3-report-sp1-sp2-sp4-sp5.md)
5. **Audit pré-import** — [docs/sp3-pre-import-audit.md](docs/sp3-pre-import-audit.md)
6. **Import (manuel)** — [docs/sp3-import-checklist.md](docs/sp3-import-checklist.md)

| ID | Action |
| -- | ------ |
| `86c9n9a40`, `86c9n9a42`, `86c9n9a44`, `86c9n9a47`, `86c9n9a53`, `86c9n9a54` | UPDATE |
| `86c9nw8d1` | CANCEL (doublon `54`) |


## SP2 — Editor & Lifecycle

**Input :** [input/sp2-editor-lifecycle.csv](input/sp2-editor-lifecycle.csv)

**Gouvernance :** 6 UPDATE · 2 CREATE [Alignement] · 0 CANCEL · REPORT `86c9nw8d4` manuel.

**Regénérer :** `python3 backlog/scripts/generate_sp2_deliverables.py`

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp2-update.csv](output/sp2-update.csv)
2. **CREATE** — [output/sp2-create.csv](output/sp2-create.csv)
3. **REPORT** — [docs/sp2-report-d4-sp4.md](docs/sp2-report-d4-sp4.md)
4. **Docs** — [docs/sp2-fiches-import.md](docs/sp2-fiches-import.md) · [docs/sp2-pre-import-audit.md](docs/sp2-pre-import-audit.md)


## SP6 — Auth & Devops

**Input :** [input/sp6-auth-devops.csv](input/sp6-auth-devops.csv)

**Gouvernance :** 3 UPDATE · 0 CREATE · 0 CANCEL · auth plateforme uniquement (RBAC contrat = SP1–SP5).

**Regénérer :** `python3 backlog/scripts/generate_sp6_deliverables.py`

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp6-update.csv](output/sp6-update.csv)
2. **Cross-listes** — [docs/sp6-report-sp1-sp3-sp4-sp5.md](docs/sp6-report-sp1-sp3-sp4-sp5.md)
3. **Docs** — [docs/sp6-fiches-import.md](docs/sp6-fiches-import.md) · [docs/sp6-pre-import-audit.md](docs/sp6-pre-import-audit.md)
4. **Import (manuel)** — [docs/sp6-import-checklist.md](docs/sp6-import-checklist.md)

| ID | Action |
| -- | ------ |
| `86c9n9a3q`, `86c9n9a41`, `86c9n9a6u` | UPDATE |


## Global cross-SP cleanup (post-audit final)

**Contexte :** audit global SP1–SP6 — verdict **READY WITH MINOR GAPS**.  
**Correctif :** metadata SP4 uniquement (4 US) — pas de CREATE, pas de déplacement automatique.

### Ordre d’import

1. **Metadata** — [output/global-cross-sp-metadata-update.csv](output/global-cross-sp-metadata-update.csv)
2. **Mapping** — [docs/global-cross-sp-corrections-mapping.md](docs/global-cross-sp-corrections-mapping.md)
3. **Moves (recommandations seulement)** — [docs/global-cross-sp-move-recommendations.md](docs/global-cross-sp-move-recommendations.md)
4. **Audit pré-import** — [docs/global-cross-sp-pre-import-audit.md](docs/global-cross-sp-pre-import-audit.md)

| ID | Correction |
| -- | ---------- |
| `86c9n9a4t`, `86c9n9a55`, `86c9n9a5e`, `86c9n9a60` | Tags / priorité (SP4) |

**Manuel post-import :** commentaire REPORT `86c9nw8d4` (SP2 → SP4) · QA SP1 sur CREATE `[Alignement]`.


## Global Markdown formatting cleanup

**Objectif :** corriger le rendu ClickUp en important le corps via **`markdown_content`** (pas `description` seul).

**Regénérer :** `python3 backlog/scripts/generate_global_markdown_cleanup.py`

### Import

1. [output/global-cross-sp-markdown-content-update.csv](output/global-cross-sp-markdown-content-update.csv) — colonnes `id`, `markdown_content` uniquement
2. [docs/global-cross-sp-markdown-formatting-mapping.md](docs/global-cross-sp-markdown-formatting-mapping.md)
3. [docs/global-cross-sp-markdown-pre-import-audit.md](docs/global-cross-sp-markdown-pre-import-audit.md)

**Mapper :** `id` → tâche · `markdown_content` → Markdown (prioritaire).

**Post-import :** contrôle visuel 5 échantillons (SP1 CREATE, SP2, SP3, SP4, SP6).
