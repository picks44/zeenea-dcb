# SP1 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### Protection statuts §3bis
- [x] **0 UPDATE** sur les 7 US sources SP1
- [x] 6 US `qa` + 1 `en cours` classées protégées
- [x] Écarts portés par **5 CREATE** avec référence US source
- [x] `86c9n9a6f` — DO NOT TOUCH (pas de CREATE)

### MVP et prototype
- [x] Dual-track (Validé prototype / MVP cible) dans chaque description CREATE
- [x] Pas de réduction MVP au seul localStorage proto
- [x] Recherche registry confirmée MVP (CREATE-2)

### Frontières cross-listes
- [x] Parser DDL → **SP3** uniquement (CREATE-1)
- [x] Schema/relations/lock → **SP2** (CREATE-3 REPORT)
- [x] Readiness panel / autosave → **SP4** (pas dupliqué dans CREATE-3)
- [x] Publish / MD5 / Git → **SP5**
- [x] Pas de scope « editor/schema » complet dans CREATE SP1

### Décisions
- [x] 0 CANCEL · 0 SPLIT
- [x] `86c9n9a48` couvert par CREATE-1 (pas CREATE séparée)
- [x] US atomiques, AC testables

### CSV
- [x] **5 CREATE** sans colonne `id`
- [x] Colonnes `name`, `description`, `tags`, `priority`
- [x] Fichier séparé (pas de mélange UPDATE/CREATE)
- [x] CSV généré par script — parse OK

### Tags / priorités
- [x] 5/5 tag + priorité dans sp1-create.csv
- [x] Tags existants uniquement (pas de nouveau tag)
- [x] Mapping documenté [sp1-corrections-mapping.md](./sp1-corrections-mapping.md)

## Verdict

**SAFE TO IMPORT** — import **CREATE uniquement** ; contrôle visuel tags/priorités post-import obligatoire (leçon SP4/SP5).

## Post-import (§11)

- [ ] 5 tâches CREATE visibles dans liste SP1 — Interfaces
- [ ] **5/5 tags epic** visibles dans ClickUp (pas seulement succès batch)
- [ ] **5/5 priorités** visibles
- [ ] Descriptions : sections US source, Corrigé/Ajouté/Exclu, Liens SP2/SP3/SP4/SP5
- [ ] US sources `3v`, `3w`, `48`, `4a`, `nw8br`, `nw8bu`, `6f` — **descriptions inchangées**
- [ ] Archiver export post-import si écart
