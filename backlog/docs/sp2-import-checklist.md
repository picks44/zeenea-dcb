# SP2 — Checklist import ClickUp

## Prérequis

- [ ] [sp2-pre-import-audit.md](./sp2-pre-import-audit.md) — SAFE TO IMPORT
- [ ] [sp2-actions-mapping.md](./sp2-actions-mapping.md)
- [ ] [sp2-fiches-import.md](./sp2-fiches-import.md)

## Import UPDATE (6)

[../output/sp2-update.csv](../output/sp2-update.csv)

| ID | Tag | Priorité |
| -- | --- | -------- |
| `86c9n9a4h` | schema editor | high |
| `86c9n9a4p` | schema editor | normal |
| `86c9n9a4r` | schema editor | normal |
| `86c9nc597` | schema editor | normal |
| `86c9nw8cy` | quality rules | normal |
| `86c9nw8dw` | lifecycle & locking | normal |

## Import CREATE (2)

[../output/sp2-create.csv](../output/sp2-create.csv)

## REPORT manuel

- [ ] [sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md) — `86c9nw8d4` commentaire SP4

## Post-import

- [ ] 6 UPDATE + 2 CREATE : tags/priorités visibles
- [ ] `86c9n9a4e`, `86c9nw8fj` sources protégées inchangées
- [ ] `nw8dw` = normal (plus low)

## Regénération

```bash
python3 backlog/scripts/generate_sp2_deliverables.py
```
