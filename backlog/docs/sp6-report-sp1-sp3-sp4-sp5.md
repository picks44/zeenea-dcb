# REPORT SP6 → SP1 / SP2 / SP3 / SP4 / SP5

Coordination cross-listes — liste SP6 (auth plateforme + DevOps).  
Gouvernance : [backlog-governance.md](./backlog-governance.md) §6bis auth plateforme vs permissions métier.

## Principe SP6

| Règle | Détail |
| ----- | ------ |
| Périmètre SP6 | **3 US** — login, logout, packaging (`86c9n9a3q`, `41`, `6u`) |
| Pas dans SP6 | RBAC contrat, lifecycle, publish, schema locks, readiness, GitOps métier |
| Prototype | `CURRENT_USER` stub ; collaborateurs complets — **ne pas** annuler US auth car proto sans SSO |

## SP1 — Interfaces

| Sujet | Lien |
| ----- | ---- |
| Collaborateurs Publisher / Contributor / Reader | **SP1** Share + Fundamentals — `getMyRole` produit |
| Contract owner (champ) | **SP1** Fundamentals |
| Registry filtrage utilisateur | **SP1** `86c9n9a3w` CREATE — REPORT depuis `3q` si filtre auth backend |
| YAML preview UI | **SP1** `86c9nw8br` |

**Ne pas** déplacer collaborateurs vers SP6.

## SP2 — Editor & Lifecycle

| Sujet | Lien |
| ----- | ---- |
| Schema editability / locks | **SP2** + lifecycle **SP4** |
| `isContractLocked` + `isViewer` | Produit — pas SSO SP6 |

## SP3 — DDL Import

| Sujet | Lien |
| ----- | ---- |
| Import section `proposed` | **SP3** + **SP4** lifecycle |

## SP4 — Versioning

| Sujet | Lien |
| ----- | ---- |
| Lifecycle, Revision open, Discard | **SP4** |
| Readiness panel | **SP4** `86c9n9a5e` |
| Publish eligibility UI | **SP4** + `canPublish` (rôle owner) |

## SP5 — Publish & GitOps

| Sujet | Lien |
| ----- | ---- |
| Publish exécution, Git push | **SP5** |
| Credentials Git | **SP5** — `6u` injecte config env seulement |

## SP6 — Auth inverse (depuis SP1 report)

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) § SP6 — CREATE-2 registry auth → couvert par `3q` + SP1.

## Ownership QA SP6

| Tester SP6 | Ne pas tester SP6 |
| ---------- | ----------------- |
| Login, logout, session, route guards | Publish, lifecycle, schema edit, Share, readiness |
| Container build, healthcheck, env config | Git push, MD5, validate YAML |

## Trous documentés (pas de CREATE sans PO)

- Enterprise admin / tenant
- Provisioning utilisateurs plateforme
- Audit connexions avancé
