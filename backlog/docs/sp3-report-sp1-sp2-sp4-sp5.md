# REPORT SP3 → SP1 / SP2 / SP4 / SP5

Coordination cross-listes — import CREATE/UPDATE SP3.  
Gouvernance : [backlog-governance.md](./backlog-governance.md) · tri-domaine YAML §6bis.

## Principe SP3

| Règle | Détail |
| ----- | ------ |
| US actives après import | **6 UPDATE** · **1 CANCEL** (`86c9nw8d1`) |
| Parser / mapping | `40`, `42`, `44`, `47` — tag **ddl parser** |
| YAML | `53` cohérence post-import · `54` sérialisation · **pas** doublon UI SP1 |

## SP1 — Interfaces

| US SP3 | Lien SP1 |
| ------ | -------- |
| `86c9n9a44` | Shell create / mode choice — **SP1** CREATE alignement |
| `86c9n9a53` | **Distinct** de `86c9nw8br` — cohérence YAML vs UI preview |

## SP2 — Editor & Lifecycle

| US SP3 | Lien SP2 |
| ------ | -------- |
| `86c9n9a47` | Mapping import uniquement — édition schema **SP2** (`4e`, `4r`, …) |

## SP4 — Versioning

| US SP3 | Lien SP4 |
| ------ | -------- |
| `86c9n9a44` | `proposed`, re-import, Start drafting |

## SP5 — Publish & GitOps

| US SP3 | Lien SP5 |
| ------ | -------- |
| `86c9n9a54` / `53` | Sérialisation ≠ publish ; validation **5b**, MD5 **5n** |

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) (lien inverse).
