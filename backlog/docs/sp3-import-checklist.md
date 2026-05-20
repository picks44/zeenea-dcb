# SP3 — Checklist import ClickUp (à exécuter par PM/PO)

Livrables générés — **pas d’import automatique** depuis ce dépôt.

## Prérequis

- [ ] GO sur [sp3-pre-import-audit.md](./sp3-pre-import-audit.md) (**SAFE TO IMPORT**)
- [ ] [sp3-fiches-import.md](./sp3-fiches-import.md) relu
- [ ] [sp3-actions-mapping.md](./sp3-actions-mapping.md) validé
- [ ] [sp3-report-sp1-sp2-sp4-sp5.md](./sp3-report-sp1-sp2-sp4-sp5.md) — frontières SP1/SP2/SP5 OK

## Rappel gouvernance

- **6 UPDATE** sur US `à faire` (§3bis) — pas de CREATE `[Alignement]`.
- **`86c9n9a53`** : UPDATE léger (cohérence YAML post-import) — **ne pas** annuler.
- **`86c9nw8d1`** : **CANCEL manuel** uniquement (doublon exact `86c9n9a54`).
- Dialecte SQL : **TBD** — ne pas sur-promettre coverage parser.

## Import UPDATE

Fichier : [../output/sp3-update.csv](../output/sp3-update.csv) — **6 lignes**

| ID | Tag cible | Priorité |
| -- | --------- | -------- |
| `86c9n9a40` | ddl parser | high |
| `86c9n9a42` | ddl parser | high |
| `86c9n9a44` | ddl parser | high |
| `86c9n9a47` | ddl parser | high |
| `86c9n9a53` | yaml view | high |
| `86c9n9a54` | technical foundation | high |

- [ ] Import batch ou mise à jour manuelle depuis CSV (colonne `id` obligatoire)
- [ ] Colonne `tags` mappée vers **Tag** ClickUp si besoin
- [ ] Liste cible : **SP3 - DDL Import**

## CANCEL manuel

Fichier référence : [../output/sp3-cancel.csv](../output/sp3-cancel.csv)

- [ ] `86c9nw8d1` → statut **Cancelled**
- [ ] Commentaire : doublon exact de `86c9n9a54` — sérialisation portée par 54

## Contrôle post-import (§11)

- [ ] Ouvrir les **6** US mises à jour — vérifier Markdown description (dual-track)
- [ ] **6/6** : tag + priorité **visibles** dans l’UI ClickUp
- [ ] `44` / `47` : tag **ddl parser** (plus `contract creation` seul)
- [ ] `54` : tag **technical foundation**
- [ ] `53` : périmètre **cohérence YAML post-import** (pas preview UI SP1)
- [ ] `86c9nw8d1` : **Cancelled**, pas de résurrection
- [ ] Cohérence avec **SP1 CREATE** (parser non retesté côté SP1 shell)

## Regénération

```bash
python3 backlog/scripts/generate_sp3_deliverables.py
```
