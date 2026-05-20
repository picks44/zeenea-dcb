# Global cross-SP — Mapping des corrections

**Source audit :** audit global final SP1–SP6 (export `*-2026-05-20-133003.csv`)  
**Verdict backlog :** READY WITH MINOR GAPS  
**Périmètre de cette passe :** correctifs metadata uniquement — pas de contenu métier, pas de CREATE, pas de déplacement ClickUp.

Gouvernance : [backlog-governance.md](./backlog-governance.md) §8 (CSV metadata-only) · §6bis (tags / priorités).

---

## Synthèse

| Type | Nombre | Fichier |
| ---- | ------ | ------- |
| **metadata** | **4** | [global-cross-sp-metadata-update.csv](../output/global-cross-sp-metadata-update.csv) |
| **create** | **0** | — (aucun `global-cross-sp-create.csv`) |
| **report** | **1** | `86c9nw8d4` — commentaire manuel (hors CSV) |
| **move recommendation** | **0 obligatoire** | [global-cross-sp-move-recommendations.md](./global-cross-sp-move-recommendations.md) |

---

## Corrections metadata (import ClickUp)

| ID | Liste | Problème détecté (export 133003) | Correction appliquée | Type | Risque si non corrigé | Import |
| -- | ----- | -------------------------------- | -------------------- | ---- | --------------------- | ------ |
| `86c9n9a4t` | SP4 — Versioning | Tag `technical foundation` (pré-recadrage) | `versioning & history` · `high` | metadata | Filtres epic faux ; confusion avec CREATE backend `wjvmn` | **Importer** |
| `86c9n9a55` | SP4 — Versioning | Tag `lifecycle & locking` | `draft management` · `normal` | metadata | Regroupement incorrect vs autosave / lifecycle | **Importer** |
| `86c9n9a5e` | SP4 — Versioning | Tag `lifecycle & locking` | `publication` · `high` | metadata | Readiness confondu avec locking ; roadmap publication sous-priorisée | **Importer** |
| `86c9n9a60` | SP4 — Versioning | Tag `versioning & history` sans `checksum` | `versioning & history,checksum` · `high` | metadata | Lien MD5/SP5 non visible dans les filtres | **Importer** |

**Référence alignée :** [sp4-metadata-update.csv](../output/sp4-metadata-update.csv) (lignes UPDATE identiques — import global unique).

---

## Report manuel (hors CSV)

| ID | Liste | Problème | Action | Type | Risque | Import |
| -- | ----- | -------- | ------ | ---- | ------ | ------ |
| `86c9nw8d4` | SP2 — Editor & Lifecycle | US `prêt à déployer` — immutabilité API portée SP4, hors `sp2-update.csv` | Ajouter **commentaire** ClickUp selon [sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md) — ne pas UPDATE la description | report | Duplication dev/QA immutabilité SP2 vs SP4 | **Manuel** |

---

## Non-corrections explicites (audit P1/P2 — hors scope CSV)

| Sujet | Décision | Justification |
| ----- | -------- | ------------- |
| US SP1 en `qa` / `en cours` | **Aucun UPDATE** | §3bis — références historiques ; QA doit utiliser les 5 CREATE `[Alignement]` |
| CREATE SP1 sans section « Hors périmètre prototype » | **Aucune action** | P2 polish — pas bloquant ; pas de modification description |
| `sp4-tags-mapping.md` obsolète | **Aucune action fichier** | Les 4 CREATE `wjvm*` ont déjà tags/priorités corrects dans l’export 133003 |
| Contenu métier SP2–SP6 | **Aucun UPDATE** | Déjà importé et conforme (dual-track, doctrine SP6 OK) |

---

## CREATE global

**Aucun trou fonctionnel P1** justifiant un CREATE cross-SP :

- Registry auth → couvert SP6 `86c9n9a3q` + SP1 CREATE-2
- Immutabilité backend → SP4 CREATE `86c9wjvmn` + REPORT `86c9nw8d4`
- RBAC contrat → SP1 + produit (pas SP6)

Fichier `global-cross-sp-create.csv` : **non généré**.

---

## Ordre d’import recommandé

1. [global-cross-sp-metadata-update.csv](../output/global-cross-sp-metadata-update.csv) — **4 lignes**
2. Contrôle visuel ClickUp sur les 4 US SP4
3. Commentaire REPORT sur `86c9nw8d4` (SP2)
4. Brief QA : campagnes SP1 sur CREATE `[Alignement]`, pas sur US `qa` sources

Voir [global-cross-sp-pre-import-audit.md](./global-cross-sp-pre-import-audit.md).
