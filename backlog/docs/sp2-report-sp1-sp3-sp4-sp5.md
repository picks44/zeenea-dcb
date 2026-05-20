# REPORT SP2 → SP1 / SP3 / SP4 / SP5

Gouvernance : [backlog-governance.md](./backlog-governance.md) · relations §6bis · quality rules §6bis.

## Principe SP2

| Domaine | SP2 | Autre liste |
| ------- | --- | ----------- |
| CRUD schema | `4e` CREATE, `4h`, `4p`, `nc597` | SP3 import initial |
| Relations édition | `4r` | SP3 détection/mapping |
| Quality rules saisie | `nw8cy` | SP4 readiness · SP5 validation |
| Lock UX schema | CREATE `fj` | SP4 lifecycle métier |
| Soft delete UX | `nw8dw` UPDATE | SP4 métier audit |
| Immutabilité API | — | **SP4** (`86c9nw8d4` REPORT) |

## SP1

| US SP2 | Lien SP1 |
| ------ | -------- |
| Toutes schema | Navigation `86c9n9a4a` CREATE — pas CRUD ici |
| `nw8dw` | Registry `86c9n9a3w` — filtre liste |

## SP3

| US SP2 | Lien SP3 |
| ------ | -------- |
| `4r`, CREATE `4e` | `47` mapping · `44` import — pas parser ici |

## SP4

| US SP2 | Lien SP4 |
| ------ | -------- |
| CREATE `fj`, UPDATE schema | `5x` Revision open, `4t` lifecycle, `55` autosave |
| `nw8cy` | `5e` readiness — pas panel ici |
| `nw8dw` | Soft delete métier `4t` |
| `86c9nw8d4` | **REPORT** → CREATE `4t-B` / `wjvmn` |

## SP5

| US SP2 | Lien SP5 |
| ------ | -------- |
| `4r`, CREATE `4e` | Export/validation `5b` — pas UI |
| `nw8cy` | Publish blocking via validation |

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) · [sp3-report-sp1-sp2-sp4-sp5.md](./sp3-report-sp1-sp2-sp4-sp5.md).
