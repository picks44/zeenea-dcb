# Global cross-SP — Audit pré-import correctifs

Gate qualité avant import du CSV metadata global (gouvernance §10 — passe corrective post-audit).

**Fichier importé :** [global-cross-sp-metadata-update.csv](../output/global-cross-sp-metadata-update.csv)  
**Export de référence :** `clickup-backlog-SP{1..6}_*-2026-05-20-133003.csv`

---

## Checklist

### Périmètre

- [x] **4 lignes** metadata uniquement — pas de colonne `description`
- [x] **0 CREATE** — pas de `global-cross-sp-create.csv`
- [x] **0 UPDATE** contenu métier
- [x] Aucune US protégée `qa` / `en cours` / `prêt à déployer` dans le CSV (sauf exclusion : `86c9nw8d4` hors CSV → commentaire manuel)

### IDs

- [x] `86c9n9a4t`, `86c9n9a55`, `86c9n9a5e`, `86c9n9a60` — présents dans export SP4 `133003`
- [x] Aucun ID inconnu

### Tags / priorités

- [x] Tags dans taxonomie SP4 connue : `versioning & history`, `draft management`, `publication`, `checksum` (second tag sur `60`)
- [x] Priorités ∈ `high`, `normal`, `low`
- [x] Alignement avec [sp4-metadata-update.csv](../output/sp4-metadata-update.csv)

### Technique (validation script)

- [x] CSV UTF-8 parse OK
- [x] Colonnes `id`, `tags`, `priority` — aucune cellule vide sur les 4 lignes
- [x] Pas de guillemets cassés (ligne `60` : tag composé quoté)

### Risques régression

- [x] Ne modifie pas les descriptions importées SP2–SP6
- [x] Ne rouvre pas de débat stratégique liste par liste

---

## Écarts P0 / P1 / P2 (cette passe)

| Niveau | Détail |
| ------ | ------ |
| **P0** | Aucun |
| **P1** | Couvert par les 4 lignes metadata SP4 |
| **P2** | REPORT `86c9nw8d4`, brief QA SP1 — **hors CSV** (actions manuelles post-import) |

---

## Verdict

**SAFE TO IMPORT**

Importer uniquement `global-cross-sp-metadata-update.csv`, puis contrôle visuel des 4 tags dans ClickUp.

---

## Post-import (obligatoire)

- [ ] `86c9n9a4t` → tag `versioning & history` (plus `technical foundation`)
- [ ] `86c9n9a55` → tag `draft management`
- [ ] `86c9n9a5e` → tag `publication`
- [ ] `86c9n9a60` → tags `versioning & history` + `checksum`
- [ ] Commentaire REPORT sur `86c9nw8d4` ([sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md))
- [ ] Confirmer que les campagnes QA SP1 ciblent les CREATE `[Alignement]` (`86c9wmdnb` … `86c9wmdpm`)

---

## Non-objectifs de cet import

- Corriger les descriptions des US SP1 en `qa`
- Déplacer des tâches entre listes
- Ré-importer SP2–SP6 UPDATE
