# SPLIT — `86c9n9a4t`

## Décision

| Branche | Action ClickUp | ID |
|---------|----------------|-----|
| **A — Modèle logique produit** | **UPDATE** tâche existante | `86c9n9a4t` |
| **B — Persistance backend** | **CREATE** nouvelle tâche | _(pas d’ID — import `sp4-create.csv`)_ |

## Rationale

- Le prototype valide le **parcours** (working copy, révision, snapshots) — branche A.
- Le MVP réel conserve **Contract / Draft / PublishedVersion**, MD5, Git — branche B.
- Ne pas annuler `86c9n9a4t` en bloc.

## Fichiers

- UPDATE A : [../output/sp4-update.csv](../output/sp4-update.csv) (ligne `86c9n9a4t`)
- CREATE B : [../output/sp4-create.csv](../output/sp4-create.csv) (dernière ligne)
