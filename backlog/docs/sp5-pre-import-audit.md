# SP5 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### MVP et prototype
- [x] Aucun UPDATE ne réduit le MVP au prototype localStorage
- [x] Git, MD5, validation backend conservés sur les 7 US
- [x] Pas de scope approval / PR / CI ajouté

### Décisions
- [x] 0 CREATE — pas de doublon SP4
- [x] 0 CANCEL — pas d’annulation Git/MD5
- [x] 0 SPLIT — 7 UPDATE dual-track suffisent
- [x] US atomiques et AC testables

### Conventions §6
- [x] Working copy / Draft backend distingués dans les textes
- [x] Liens SP4 explicites (readiness, no-changes, Option B)
- [x] SP5 = exécution GitOps, pas versioning produit

### CSV
- [x] 7 UPDATE avec `id` valide (export input)
- [x] Colonnes minimales `id`, `name`, `description`
- [x] 7 lignes metadata `id`, `tags`, `priority`
- [x] CSV parse OK (script generate)

### Tags / priorités
- [x] 7/7 tag + priorité documentés
- [x] technical foundation : 1× (5b)
- [x] nc596 en normal (feedback UX)

## Verdict

**SAFE TO IMPORT** — enchaîner UPDATE puis metadata ; contrôler tags dans ClickUp post-import (leçon SP4).

## Post-import (§11)

- [ ] Échantillon 3 US : 5p, 5u, 5n
- [ ] Vérifier tags réels sur les 7 tâches
- [ ] Markdown descriptions OK
- [ ] Pas de champ vidé involontaire
