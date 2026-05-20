# SP1 — Mapping corrections (US source → CREATE)

Gouvernance §3bis : **0 UPDATE direct** sur US protégées.  
**7 US sources inchangées** · **5 CREATE** complémentaires · **`86c9n9a6f` DO NOT TOUCH**.

| CREATE | US source(s) | Statut source | Raison du correctif | Tag | Priorité |
| ------ | ------------ | ------------- | ------------------- | --- | -------- |
| CREATE-1 | `86c9n9a3v, 86c9n9a48` | qa, qa | Create two-step, proposed/draft, non-persistance | `contract creation` | high |
| CREATE-2 | `86c9n9a3w` | qa | Recherche MVP absente de l’US source | `contracts registry` | high |
| CREATE-3 | `86c9n9a4a` | qa | Cues, Versions sans Form/YAML, pas Save draft | `contract structure` | normal |
| CREATE-4 | `86c9nw8br` | qa | Copy/Download, working copy | `yaml view` | high |
| CREATE-5 | `86c9nw8bu` | qa | Lifecycle 5 statuts, owner, API PATCH | `contract fundamentals` | high |

| — | `86c9n9a6f` | en cours | **DO NOT TOUCH** — pas de CREATE à ce stade | `design system` | normal |

## Fichier import

[sp1-create.csv](../output/sp1-create.csv) — colonnes : `name`, `description`, `tags`, `priority` (pas de colonne `id`).

## Cross-listes

[sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md)
