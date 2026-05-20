# SP4 — Audit métadonnées backlog (tags + priorités)

**Source :** export ClickUp `clickup-backlog-901523203490-2026-05-20-113754.csv` (12 tâches actives).  
**Référence comparative :** export multi-listes (42 US) — conventions `high` / `normal` / `low` + 1 tag par US.  
**Aucune modification** des descriptions métier.

Gouvernance : [backlog-governance.md](./backlog-governance.md) §6bis (tags, priorités, ISO).

---

## Audit synthétique (état réel post-import)

### A. Tags / epics

| Constat | Détail |
|---------|--------|
| **4 US sans tag** | CREATE `86c9wjvmf`, `86c9wjvmh`, `86c9wjvmj`, `86c9wjvmn` |
| **Tags non importés / obsolètes** | `sp4-tags-update.csv` non appliqué sur 4 UPDATE |
| `86c9n9a4t` | Encore `technical foundation` (pré-recadrage) au lieu de `versioning & history` |
| `86c9n9a55` | `lifecycle & locking` → devrait être `draft management` |
| `86c9n9a5e` | `lifecycle & locking` → devrait être `publication` |
| `86c9n9a60` | Manque second tag `checksum` |
| **OK** | `86c9n9a5x`, `86c9n9a66`, `86c9n9a6m`, `86c9nc7t1` |
| **Trop de tags** | Aucune (0 multi-tag dans l’export) |
| **vs autres listes** | SP1–SP6 : 100 % taguées sur export de référence ; SP4 CREATE = rupture ISO |

### B. Priorités

| Constat | Détail |
|---------|--------|
| **Niveaux observés (backlog DCB)** | `high` (28), `normal` (12), `low` (2) — pas d’autre valeur |
| **4 US sans priorité** | Mêmes CREATE que ci-dessus |
| **8 UPDATE** | 4× `high`, 4× `normal` — cohérent avec conventions pré-import |
| **CREATE** | Aucune priorité → **non ISO** |
| **Incohérences** | Aucune priorité « fausse » sur les UPDATE ; écart principal = CREATE vierges |

### C. Homogénéité backlog

| Critère | SP4 actuel | Autres listes (référence) |
|---------|------------|---------------------------|
| Tag epic | 67 % (8/12) | 100 % |
| Priorité | 67 % (8/12) | 100 % |
| CREATE = UPDATE metadata | Non | Oui |
| `technical foundation` | 1× sur 4t (à déplacer vers CREATE `86c9wjvmn`) | Toujours `high` quand utilisé |
| CANCEL `86c9n9a52` | Absent de l’export (OK) | — |

---

## Conventions backlog détectées (déduites, non inventées)

### Priorités

| Priorité | Quand l’utiliser (observé) |
|----------|----------------------------|
| **high** | Fondation MVP, backend, publish/readiness, New version, métadonnées audit MD5, gitops, ddl parser |
| **normal** | Parcours standard : Compare, timeline Versions, Discard, autosave |
| **low** | Polish UX non bloquant (équivalent `design system` / badge secondaire) |

### Tags × priorité (SP4 cible)

| Tag | Priorité typique SP4 |
|-----|----------------------|
| `versioning & history` | `high` (cœur) ou `normal` (consultation / Compare) ou `low` (badge) |
| `publication` | `high` |
| `technical foundation` | `high` |
| `lifecycle & locking` | `normal` (Discard) |
| `draft management` | `normal` |
| `checksum` | Second tag sur `86c9n9a60` uniquement ; priorité portée par l’US parent (`high`) |

---

## Stratégie retenue

| Livrable | Usage |
|----------|--------|
| **[sp4-metadata-update.csv](../output/sp4-metadata-update.csv)** | **Canonical** — `id`, `tags`, `priority` — 12 lignes, import batch |
| [sp4-tags-update.csv](../output/sp4-tags-update.csv) | Alias identique (même contenu) pour compatibilité nommage précédent |

**Risque :** faible — colonnes metadata uniquement, pas de `description`.

**Ordre :** importer `sp4-metadata-update.csv` une fois ; contrôle post-import §11.

---

## Mapping final — 12 tâches actives

| ID | Titre (abrégé) | Tag(s) cible | Priorité | État export | Action |
|----|----------------|--------------|----------|-------------|--------|
| `86c9n9a4t` | Modèle logique versioning | `versioning & history` | high | `technical foundation` / high | Corriger tag |
| `86c9n9a5x` | New version / révision | `versioning & history` | high | OK | — |
| `86c9n9a60` | Métadonnées publication MD5 | `versioning & history, checksum` | high | 1 tag / high | + `checksum` |
| `86c9n9a6m` | Historique + working copy | `versioning & history` | normal | OK | — |
| `86c9nc7t1` | Discard changes | `lifecycle & locking` | normal | OK | — |
| `86c9n9a66` | Compare export-only | `versioning & history` | normal | OK | — |
| `86c9n9a55` | Autosave | `draft management` | normal | `lifecycle & locking` / normal | Corriger tag |
| `86c9n9a5e` | Publication readiness | `publication` | high | `lifecycle & locking` / high | Corriger tag |
| `86c9wjvmf` | Badge Revision open | `versioning & history` | low | vide | Tag + priorité |
| `86c9wjvmj` | No changes to publish | `publication` | high | vide | Tag + priorité |
| `86c9wjvmh` | Option B gouvernance | `publication` | high | vide | Tag + priorité |
| `86c9wjvmn` | Modèle backend Contract/Draft | `technical foundation` | high | vide | Tag + priorité |

### CREATE — IDs renseignés (export 2026-05-20)

| Titre | ID ClickUp |
|-------|------------|
| Revision open badge | `86c9wjvmf` |
| No changes to publish | `86c9wjvmj` |
| Option B gouvernance | `86c9wjvmh` |
| Modèle backend | `86c9wjvmn` |

### Annulée (hors périmètre actif)

| ID | Action |
|----|--------|
| `86c9n9a52` | CANCEL Save draft P0 — absente de l’export actuel |

---

## Validation post-correctif (attendue)

- [ ] 12/12 tâches : ≥ 1 tag, ≤ 2 tags
- [ ] 12/12 tâches : priorité renseignée
- [ ] `technical foundation` : uniquement `86c9wjvmn` + **high**
- [ ] Seul polish `low` : `86c9wjvmf`
- [ ] Descriptions métier : inchangées
