# SP6 — Checklist import ClickUp

## Prérequis

- [ ] [sp6-pre-import-audit.md](./sp6-pre-import-audit.md) — SAFE TO IMPORT
- [ ] [sp6-actions-mapping.md](./sp6-actions-mapping.md)
- [ ] [sp6-fiches-import.md](./sp6-fiches-import.md)
- [ ] [sp6-report-sp1-sp3-sp4-sp5.md](./sp6-report-sp1-sp3-sp4-sp5.md)

## Import UPDATE (3)

[../output/sp6-update.csv](../output/sp6-update.csv)

| ID | Tag | Priorité |
| -- | --- | -------- |
| `86c9n9a3q` | auth | high |
| `86c9n9a41` | auth | high |
| `86c9n9a6u` | delivery | low |

## Post-import

- [ ] 3 UPDATE : tags/priorités visibles dans ClickUp
- [ ] `3q` : pas de « auth = Owner » dans la description
- [ ] SP1–SP5 : aucune US auth/RBAC modifiée par erreur
- [ ] QA vague SP6 : login/logout/container uniquement

## Regénération

```bash
python3 backlog/scripts/generate_sp6_deliverables.py
```

**Input :** [input/sp6-auth-devops.csv](../input/sp6-auth-devops.csv)
