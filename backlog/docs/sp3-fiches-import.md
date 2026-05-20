# Fiches SP3 — import ClickUp (DDL Import)

Référence : [backlog-governance.md](./backlog-governance.md) · plan SP3 figé.

## Matrice

| Action | Nombre |
| ------ | ------ |
| UPDATE | 6 |
| CANCEL | 1 |
| CREATE | 0 |

## Ownership QA

| US | Tester ici | REPORT |
| -- | ---------- | ------ |
| `40` | Matrice syntaxe | — |
| `42` | Fixtures CI | Create shell SP1 |
| `44` | Import UX, preview, re-import | SP1 create, SP5 publish |
| `47` | Mapping + FK | SP2 schema editor |
| `53` | YAML cohérent post-import | SP1 UI, SP5 MD5 |
| `54` | Sérialisation P1 | SP1 UI, SP5 publish |

## Ordre import

1. **UPDATE** — [sp3-update.csv](../output/sp3-update.csv) (6 lignes, unifié tags+priority)
2. **CANCEL** — [sp3-cancel.csv](../output/sp3-cancel.csv) — manuel `86c9nw8d1`
3. [sp3-report-sp1-sp2-sp4-sp5.md](./sp3-report-sp1-sp2-sp4-sp5.md)

---

## `86c9n9a40`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `ddl parser` |
| Priorité | `high` |
| Titre | ETQ équipe produit/tech, je veux définir le sous-ensemble DDL supporté… |

---

## `86c9n9a42`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `ddl parser` |
| Priorité | `high` |
| Titre | ETQ équipe produit/tech, je veux disposer de fixtures DDL afin de test… |

---

## `86c9n9a44`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `ddl parser` |
| Priorité | `high` |
| Titre | ETQ utilisateur, je veux importer un DDL afin de générer automatiqueme… |

---

## `86c9n9a47`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `ddl parser` |
| Priorité | `high` |
| Titre | ETQ utilisateur, je veux que le DDL soit converti en schéma ODCS édita… |

---

## `86c9n9a53`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `yaml view` |
| Priorité | `high` |
| Titre | ETQ système, je veux garantir la cohérence du YAML généré après import… |

---

## `86c9n9a54`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `technical foundation` |
| Priorité | `high` |
| Titre | ETQ système, je veux sérialiser le modèle interne en YAML ODCS v3.1.0 … |

---

## `86c9nw8d1` — CANCEL manuel

Doublon exact de `86c9n9a54`. Annuler dans ClickUp avec commentaire renvoi vers 54.

