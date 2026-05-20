# Fiches SP4 — import ClickUp (recadrage stratégique)

Référence : plan Recadrage SP4. Prototype = validation UX/métier ; MVP = backend + Git + MD5.

---

## `86c9n9a4t` — SPLIT branche A

| Champ | Valeur |
|-------|--------|
| Action | **UPDATE** (tâche existante) |
| Fichier | `output/sp4-update.csv` |
| Nouveau verdict | SPLIT → modèle logique produit |

**Changements clés :** working copy, révision ouverte, pas d’écran Draft séparé ; branche backend → CREATE dans `sp4-create.csv`.

---

## CREATE — branche B (`86c9n9a4t` technique)

| Champ | Valeur |
|-------|--------|
| Action | **CREATE** |
| Fichier | `output/sp4-create.csv` (dernière entrée) |
| Titre | Persister Contract / Draft / PublishedVersion |

---

## `86c9n9a52`

| Champ | Valeur |
|-------|--------|
| Action | **CANCEL** |
| Fichier | `output/sp4-cancel.csv` |
| Raison | Save draft P0 invalidé UX ; persistance via `86c9n9a55` + backend |

---

## `86c9n9a5x`

| Action | **UPDATE** |
| Fichier | `output/sp4-update.csv` |
| KEEP | Création brouillon backend depuis Active |
| Réécrire | New version → révision / Revision open |

---

## `86c9n9a60`

| Action | **UPDATE** + **KEEP** |
| KEEP | MD5, commit hash, immutabilité |
| REPORT | Exécution Git → `docs/sp4-report-sp5.md` |

---

## `86c9n9a6m`

| Action | **UPDATE** + **KEEP** |
| Réécrire | Draft → Working copy |
| KEEP | MD5 et commit visibles (MVP) |

---

## `86c9nc7t1`

| Action | **UPDATE** + **KEEP** |
| Réécrire | Discard changes, pas « abandonner Draft » |

---

## `86c9n9a66`

| Action | **UPDATE** + **KEEP** |
| Réécrire | Compare **export-only** ; sections Form élargies |

---

## `86c9n9a55`

| Action | **UPDATE** + **REPORT** |
| CANCEL lien | `86c9n9a52` |
| REPORT | Conflits multi-user → backlog ultérieur |

---

## `86c9n9a5e`

| Action | **UPDATE** + **KEEP** |
| Réécrire | Publication readiness panel ; validation API MVP |

---

## CREATE — compléments produit

| Titre (abrégé) | Fichier |
|----------------|---------|
| Badge Revision open | `sp4-create.csv` |
| No changes to publish | `sp4-create.csv` |
| Publish gouvernance seule (Option B) | `sp4-create.csv` |

---

## Risques QA

- Ne pas tester l’absence de MD5/Git sur MVP backend.
- Matrice séparée : acceptance UX (proto) vs intégration (API + SP5).
