# SP5 — Checklist import ClickUp (à exécuter par PM/PO)

Livrables générés — **pas d’import automatique** depuis ce dépôt.

## Prérequis

- [ ] GO sur [sp5-pre-import-audit.md](./sp5-pre-import-audit.md) (verdict SAFE TO IMPORT)
- [ ] Matrice validée dans [sp5-fiches-import.md](./sp5-fiches-import.md)

## Ordre

1. **Import UPDATE** — [../output/sp5-update.csv](../output/sp5-update.csv)  
   - Colonnes : `id`, `name`, `description` uniquement  
   - 7 lignes

2. **Import metadata** — [../output/sp5-metadata-update.csv](../output/sp5-metadata-update.csv)  
   - Colonnes : `id`, `tags`, `priority`  
   - Si les étiquettes ne s’appliquent pas : mapper `tags` → **Tag** (ClickUp) ou saisie manuelle ([sp5-tags-mapping.md](./sp5-tags-mapping.md))

3. **Contrôle post-import** (gouvernance §11)

| ID | Tag attendu | Priorité |
|----|-------------|----------|
| `86c9n9a5b` | technical foundation | high |
| `86c9n9a5h` | gitops | high |
| `86c9n9a5n` | checksum | high |
| `86c9n9a5p` | gitops | high |
| `86c9n9a5u` | publication | high |
| `86c9n9a5z` | publication | high |
| `86c9nc596` | publication | normal |

- [ ] 3 tâches échantillon : `86c9n9a5p`, `86c9n9a5u`, `86c9n9a5n`
- [ ] 7/7 avec tag epic visible dans ClickUp
- [ ] Descriptions dual-track (sections Validé prototype / MVP cible / Liens SP4)
- [ ] Exporter CSV post-import et archiver dans le dépôt si écart

## Après SP5

- Liste suivante selon gouvernance §7 : **SP1 — Interfaces** (ou priorité PO)
