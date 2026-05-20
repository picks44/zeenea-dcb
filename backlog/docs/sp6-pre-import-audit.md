# SP6 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### Doctrine auth vs métier
- [x] SP6 = auth plateforme + session + packaging uniquement
- [x] Collaborators / publish / lifecycle / schema → REPORT SP1–SP5
- [x] `86c9n9a3q` sans « utilisateur authentifié = Owner » ni « collaboration hors MVP »
- [x] `CURRENT_USER` documenté prototype seulement

### Décisions
- [x] 3 UPDATE · 0 CREATE · 0 CANCEL · 0 SPLIT
- [x] §51 — pas de CANCEL auth car proto sans SSO
- [x] US atomiques et AC testables

### Conventions §6
- [x] Dual-track sur 3 UPDATE (proto_valide + mvp_cible + hors_proto)
- [x] `6u` reste tag `delivery` (pas `auth`)
- [x] QA SP6 ne reteste pas publish/lifecycle/schema/Share

### CSV
- [x] 3 UPDATE avec `id` valide (export input)
- [x] Colonnes `id`, `name`, `description`, `tags`, `priority`
- [x] Script generate parse OK

### Tags / priorités
- [x] 3/3 tag + priorité : auth high ×2, delivery low ×1

## Verdict

**SAFE TO IMPORT** — import `sp6-update.csv` ; contrôler tags ClickUp post-import ; ne pas rejouer tests métier dans vague SP6.

## Post-import (§11)

- [ ] Échantillon : `3q`, `41`, `6u`
- [ ] Tags `auth` / `delivery` visibles
- [ ] Description `3q` sans wording Owner/hors MVP collaborateurs
- [ ] SP1–SP5 US non modifiées par import SP6
