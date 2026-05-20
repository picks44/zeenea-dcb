# Fiches SP5 — import ClickUp (Publish & GitOps)

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

## Matrice ownership QA (publish)

Éviter de dupliquer les tests d’étapes visuelles sur `5u` ou `5z` — les renvoyer à `nc596`.

| US | Responsabilité QA |
|----|-------------------|
| `86c9n9a5u` | Première publication : validation, création version initiale, passage published/active |
| `86c9n9a5z` | Publication d’une mise à jour : changelog, SemVer, version précédente dépréciée |
| `86c9nc596` | États visuels de progression, erreurs, feedback utilisateur pendant le publish |

## Ordre d’import ClickUp

1. **UPDATE** — [../output/sp5-update.csv](../output/sp5-update.csv)
2. **Metadata** — [../output/sp5-metadata-update.csv](../output/sp5-metadata-update.csv) (vérifier mapping colonne `tags` / `Tag` selon outil)
3. **REPORT SP4** — [sp5-report-sp4.md](./sp5-report-sp4.md)
4. Contrôle post-import — [sp5-pre-import-audit.md](./sp5-pre-import-audit.md) § Post-import

---

## `86c9n9a5b`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `technical foundation` |
| Priorité | `high` |
| Titre | ETQ système, je veux valider le YAML ODCS avant publication … |

---

## `86c9n9a5h`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `gitops` |
| Priorité | `high` |
| Titre | ETQ système, je veux définir la structure Git des contrats a… |

---

## `86c9n9a5n`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `checksum` |
| Priorité | `high` |
| Titre | ETQ système, je veux générer et stocker un checksum MD5 à l’… |

---

## `86c9n9a5p`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `gitops` |
| Priorité | `high` |
| Titre | ETQ système, je veux publier le YAML dans Git afin de versio… |

---

## `86c9n9a5u`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `publication` |
| Priorité | `high` |
| Titre | ETQ utilisateur, je veux publier une première version afin d… |

---

## `86c9n9a5z`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `publication` |
| Priorité | `high` |
| Titre | ETQ utilisateur, je veux publier une mise à jour afin de cré… |

---

## `86c9nc596`

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** |
| Fichier | `output/sp5-update.csv` |
| Tag | `publication` |
| Priorité | `normal` |
| Titre | ETQ utilisateur, je veux suivre le processus de publication … |

---

