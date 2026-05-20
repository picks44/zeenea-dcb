# REPORT SP4 → SP5 (GitOps)

Les exigences **Git réel** restent dans le **MVP global**. SP4 couvre le **versioning produit** et les **métadonnées** ; SP5 couvre l’**exécution repository**.

## Liens explicites à ajouter dans les US SP4 (UPDATE)

| US SP4 | Mention SP5 |
|--------|-------------|
| `86c9n9a60` | Push YAML, échec publish si Git down → **SP5** (`86c9n9a5p`, `86c9n9a5h`, `86c9nc596`) |
| `86c9n9a6m` | Affichage commit hash production → alimenté par SP5 |
| US CREATE `4t-B` | Intégration push → **SP5** |

## US SP5 à ne pas annuler (recadrage global)

- `86c9n9a5p` — publier YAML dans Git
- `86c9n9a5h` — structure Git des contrats
- `86c9n9a5n` — checksum MD5 à l’activation (complémentaire à `86c9n9a60`)
- `86c9nc596` — suivi processus publication / écriture Git

## Distinction QA

| Couche | Liste | Tests |
|--------|-------|-------|
| UX / métier versioning | SP4 | Prototype + scénarios doc S11, S22 |
| GitOps exécution | SP5 | Intégration repository, échec Git |

Livrables SP5 générés : [sp5-fiches-import.md](./sp5-fiches-import.md) · [sp5-report-sp4.md](./sp5-report-sp4.md) (lien inverse).
