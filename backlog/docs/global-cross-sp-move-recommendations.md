# Global cross-SP — Recommandations de déplacement (aucun move automatique)

**Principe :** le backlog est structuré par epic/liste. Un déplacement ClickUp est **coûteux** (historique, filtres, QA) et **non exécuté** dans cette passe.

Export de référence : `clickup-backlog-SP{1..6}_*-2026-05-20-133003.csv`.

---

## Synthèse

| Recommandation | Nombre |
| -------------- | ------ |
| **do not move** | 6 |
| **comment only** | 1 |
| **move** (obligatoire) | **0** |

**Verdict :** aucun déplacement de liste requis pour fermer les écarts P1 de l’audit global.

---

## Détail par US / sujet

| ID | Liste actuelle | Liste cible proposée | Justification | Recommandation |
| -- | -------------- | -------------------- | ------------- | -------------- |
| `86c9nw8d4` | SP2 — Editor & Lifecycle | SP4 — Versioning (tentation) | Immutabilité API versions publiées = domaine SP4 (`86c9wjvmn`, SPLIT `4t`) | **comment only** — rester SP2 ; ajouter commentaire REPORT vers SP4 ([sp2-report-d4-sp4.md](./sp2-report-d4-sp4.md)). US `prêt à déployer` protégée §3bis. |
| `86c9n9a3v` | SP1 — Interfaces | SP3 (tentation) | Create flow lié à l’import | **do not move** — shell create = SP1 ; parser = SP3. CREATE `[Alignement]` `86c9wmdnb` porte le recadrage. |
| `86c9nw8br` | SP1 — Interfaces | SP3 / SP5 (tentation) | YAML | **do not move** — preview UI = SP1 ; sérialisation = SP3 `54` ; publish/MD5 = SP5. |
| `86c9n9a5e` | SP4 — Versioning | SP5 (tentation) | Readiness avant publish | **do not move** — panel readiness = SP4 ; validation Git = SP5 `5b`. Séparation QA documentée. |
| `86c9n9a5u` / `86c9n9a5z` | SP5 — Publish & Gitops | SP4 (tentation) | Publish bouton | **do not move** — exécution Git = SP5 ; versioning produit = SP4. |
| `86c9n9a3q` | SP6 — Auth & Devops | SP1 (tentation) | Registry filtré | **do not move** — login/session = SP6 ; filtrage registry métier = SP1 CREATE-2 + backend. |
| US SP1 `qa` (`3v`, `48`, `3w`, `4a`, `nw8br`, `nw8bu`) | SP1 | SP1 (inchangé) | Sources protégées | **do not move** — ne pas fusionner avec CREATE `[Alignement]` ; **utiliser les CREATE comme référence QA** (`86c9wmdnb` … `86c9wmdpm`). |
| CREATE `[Alignement]` SP1 | SP1 | SP1 | Déjà au bon endroit | **do not move** |
| CREATE `[Alignement]` SP2 (`86c9wp7a8`, `86c9wp7a9`) | SP2 | SP2 | Alignement schema | **do not move** |
| CREATE SP4 (`86c9wjvmf/h/j/n`) | SP4 | SP4 | Versioning / publish | **do not move** |

---

## Cas où un move pourrait être reconsidéré (PO uniquement)

| Sujet | Condition | Action |
| ----- | --------- | ------ |
| Doublon visuel epic | PO constate que les filtres ClickUp par liste ne suffisent pas | Workshop PO — pas de move sans décision explicite |
| Enterprise auth / tenant | Nouvelle epic transverse hors DCB | Nouvelle liste ou tag — hors scope actuel |

---

## Liens

- Mapping correctifs : [global-cross-sp-corrections-mapping.md](./global-cross-sp-corrections-mapping.md)
- Audit pré-import : [global-cross-sp-pre-import-audit.md](./global-cross-sp-pre-import-audit.md)
