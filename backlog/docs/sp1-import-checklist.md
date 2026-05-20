# SP1 — Checklist import ClickUp (à exécuter par PM/PO)

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
