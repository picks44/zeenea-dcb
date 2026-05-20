# Gouvernance backlog — Data Contract Builder / DCS

Document de référence pour réaligner le backlog ClickUp après la phase prototype.  
**Compléments :** [Documentation produit](../../docs/product-documentation.md) · [Notes techniques](../../docs/technical-notes.md) · [README backlog](../README.md)

---

## 1. Objectif du document

Ce document fixe les **règles de réalignement** du backlog MVP ClickUp une fois le prototype DCB disponible.

Il sert à :

- conduire les **audits liste par liste** (SP1–SP6) de façon cohérente ;
- guider les **prompts Cursor** et les revues PM/PO ;
- trancher **UPDATE / CREATE / CANCEL / REPORT / SPLIT** sans reposer les mêmes débats ;
- séparer ce que le **prototype valide** (UX/métier) de ce que le **MVP réel** doit livrer (backend, Git, audit) ;
- appliquer les **gates qualité** : audit final pré-import et contrôle post-import (voir [§10](#10-audit-final-pré-import) et [§11](#11-contrôle-post-import)).

**Ce document n’est pas** un audit de liste ni un export ClickUp. Pour l’exemple appliqué SP4, voir [§13](#13-référence-sp4).

---

## 2. Rôle du prototype

Le prototype React (persistance locale, publication simulée) est une **preuve UX et métier**, pas l’architecture cible.

### Le prototype valide

| Domaine | Exemples |
|---------|----------|
| **UX / UI** | Navigation, libellés, modales, badges, empty states |
| **Parcours** | Création, import, édition, publish, Versions |
| **Vocabulaire métier** | Working copy, Revision open, Discard changes |
| **Interactions** | New version, Compare, Publish, readiness |
| **Lifecycle métier** | `proposed` → `draft` → `active` → `deprecated` → `retired` |
| **Readiness** | Score 70/25/5, navigation vers champs manquants |
| **Compare** | Export-only (Form / YAML) |
| **Publish flow** | Changelog, minor/major, blocage sans changement |
| **Gouvernance app vs YAML** | Owner/contacts versionnés hors export ; Option B gouvernance seule |

Référence comportement : [docs/product-documentation.md](../../docs/product-documentation.md) (comportement décrit ; mentions « simulé » = limite prototype explicite).

### Le prototype ne valide pas

| Domaine | Conséquence backlog |
|---------|---------------------|
| **Backend final** | Les US API/persistance restent pertinentes |
| **Modèle de persistance définitif** | Draft/PublishedVersion en base ≠ projection UI unique |
| **Git réel** | SP5 et métadonnées SP4 conservent push/checksum |
| **Sécurité / auth entreprise** | SP6 ou transverse — pas annulé par l’absence de SSO |
| **APIs** | Critères « backend rejette… » restent valides |
| **Architecture technique** | Ne pas déduire le schéma BDD du code React |
| **Infrastructure** | K8s, conteneurs — hors démo frontend |

**Règle :** « Non implémenté dans le prototype » → **pas** « obsolète pour le MVP », sauf décision produit explicite (ex. Save draft P0).

---

## 3. Rôle du backlog MVP

Le backlog ClickUp décrit le **produit Zeenea cible** : ce qui sera livré avec backend, persistance, audit et intégration repository.

Il doit couvrir :

- workflows métier **confirmés** par le prototype ;
- exigences **backend** (modèle, APIs, immutabilité) ;
- **Git / export** (structure repo, push YAML, échec publish) ;
- **audit** (snapshots, MD5, commit hash, historique append-only) ;
- **sécurité** et droits (quand portés par les listes concernées) ;
- **persistance** réelle (autosave, brouillon, versions publiées).

**Formulation impérative :** le backlog MVP **ne doit pas** devenir un backlog du prototype React/localStorage.

Chaque US significative peut distinguer (dans la description ou les hypothèses) :

1. **Validé sur prototype UX** — référence scénarios doc / démo.
2. **Implémentation MVP cible** — backend, Git, etc.
3. **Hors périmètre prototype** — exigence conservée malgré la démo partielle.

---

## 3bis. Protection des User Stories avancées

### Principe

Les US déjà engagées dans le workflow ClickUp **ne doivent pas être modifiées directement** comme de simples US « à faire ». Le réalignement backlog après prototype/MVP se fait par **US complémentaires** qui référencent l’US source.

### Statuts protégés (non exhaustif)

- `qa`
- `en cours`
- `prêt à déployer` / `ready`
- `done` / `terminé`
- Tout statut équivalent indiquant implémentation, revue ou validation **déjà engagée**

### Règles

| Situation | Action |
|-----------|--------|
| US en **à faire** (ou équivalent non engagé) | **UPDATE** direct autorisé si le backlog est obsolète |
| US en statut **protégé** | **Ne pas** réécrire titre, description ni AC par UPDATE massif |
| AC obsolètes / faux / incomplets sur US protégée | **CREATE** d’une US séparée : `[Alignement]`, `[Complément]`, `[Correctif]`, `[QA Fix]`… |
| Nouvelle US complémentaire | Doit **référencer explicitement** l’ID de l’US d’origine ; préciser ce qui est corrigé, ajouté, exclu, et ce qui reste porté par l’US source |

### Exceptions (modification directe d’une US protégée)

Uniquement avec **validation PO/PM explicite** :

- correction **typo** mineure ;
- ajout d’un **lien** documentaire non destructif ;
- **commentaire** ClickUp (pas réécriture du corps de l’US) ;
- micro-clarification sans changement de scope testé.

**Par défaut :** créer une US complémentaire.

### Objectif

Éviter :

- perte de traçabilité QA ;
- modification silencieuse du scope ;
- confusion dev / QA ;
- clôture d’une US sur un référentiel mouvant ;
- réécriture d’une US déjà travaillée ou validée en QA.

---

## 4. Règles de décision

### Contrôle préalable : statut ClickUp

**Avant** de choisir UPDATE / CREATE / CANCEL / SPLIT, lire le **statut** de l’US dans l’export ClickUp.

| Statut source | Action par défaut |
|---------------|-------------------|
| **À faire** (non engagé) | **UPDATE** si réalignement nécessaire |
| **Protégé** (`qa`, `en cours`, etc.) | **CREATE** complémentaire (référence US source) — **pas** UPDATE du corps de l’US |
| **Protégé** + décision PO explicite | UPDATE direct exceptionnel (voir §3bis) |

### Matrice des actions

| Statut | Quand l’utiliser |
|--------|------------------|
| **UPDATE** | US en **à faire** (ou non protégée) toujours pertinente mais à réaligner : vocabulaire, parcours validés, AC, périmètre, hypothèses, dual-track prototype/MVP. Modification **non destructive** validée. |
| **CREATE** | Manque une US **atomique** ; comportement validé proto absent du CSV ; **correctif / alignement** pour une US **protégée** ; fix UX ; branche d’un **SPLIT**. Les CREATE portent `name`, `description`, `tags`, `priority` (CSV unifié recommandé). |
| **CANCEL / OBSOLETE** | Logique **métier/UX** abandonnée. **À éviter** sur US protégée sauf décision PO explicite. *Ne pas* annuler une exigence technique seulement parce qu’elle est simulée au proto. |
| **REPORT** | Sujet **nécessaire au MVP** mais autre liste/phase. **REPORT ≠ suppression.** |
| **SPLIT** | US fourre-tout. Produire UPDATE (volet produit, si US non protégée) + CREATE (volet technique). Sur US protégée : plutôt **CREATE** complémentaires ciblées. |

### Exemple SPLIT (SP4)

| US | Décision |
|----|----------|
| `86c9n9a4t` | **A** UPDATE — modèle logique (working copy, versions publiées) · **B** CREATE — persistance Contract/Draft/PublishedVersion, MD5, immutabilité API |

Détail : [sp4-split-86c9n9a4t.md](./sp4-split-86c9n9a4t.md).

### Matrice rapide (erreurs fréquentes)

| Observation | Mauvaise décision | Bonne décision |
|-------------|-------------------|----------------|
| Git simulé au proto | CANCEL US Git | **KEEP** + **REPORT** exécution → SP5 |
| Pas de bouton Save draft | CANCEL persistance | **CANCEL** Save draft P0 ; **UPDATE** autosave + backend |
| `inRevision` au lieu d’entité Draft UI | CANCEL modèle backend | **UPDATE** UX + **KEEP** brouillon serveur |
| Compare sans owner dans l’UI | Ajouter owner au Compare | **UPDATE** export-only ; gouvernance dans changelog |
| US en **qa** / **en cours** obsolète | UPDATE massif de la description | **CREATE** `[Alignement]` référençant l’US source |
| Corriger comportement déjà validé en QA | Réécrire l’US en qa | **CREATE** correctif ; commentaire sur US source |

---

## 5. Règles de rédaction des User Stories

### Titre

```text
ETQ [type d’utilisateur], je veux [objectif] afin de [valeur métier]
```

Types courants : utilisateur, publisher, contributor, système, équipe produit/tech.

### Sections obligatoires

1. **Titre**
2. **Description métier**
3. **Périmètre** — *Inclus* / *Exclus*
4. **Critères d’acceptation** (testables, Given/When/Then si utile)
5. **Cas d’erreur / limites**
6. **Règles de gestion**
7. **Validation fonctionnelle** (UX prototype vs intégration MVP si pertinent)
8. **Hypothèses** (arbitrages ouverts, pas des faits)

Sections optionnelles recommandées après SP4 :

- **Validé sur prototype UX**
- **Implémentation MVP cible**
- **Hors périmètre prototype**

### Règles

- **Une US = une fonctionnalité atomique.**
- Ne pas mélanger UX, backend, infra et Git dans une seule US si cela empêche l’estimation et le QA.
- Ne pas inventer de logique métier non validée (proto ou doc produit).
- Les **hypothèses** portent les points non arbitrés — ne pas les présenter comme livrés.
- Mentionner **publication simulée** dans le proto vs **publication réelle** dans le MVP quand la US touche publish.
- Mentionner **Compare export-only** quand la US touche la comparaison de versions.

---

## 6. Conventions produit à préserver

Conventions alignées sur le prototype et [product-documentation.md](../../docs/product-documentation.md) — à répercuter dans les UPDATE, pas à contredire sans arbitrage PO.

| Convention | Règle |
|------------|--------|
| **Working copy** | Préférer ce terme (ou « révision ouverte ») à *Draft* comme **objet UX / ligne d’historique** |
| **Revision open** | Badge / état UI ; **n’est pas** un statut lifecycle ODCS |
| **Compare** | **Export-only** — pas owner, governance contacts, collaborators |
| **Gouvernance versionnée** | Owner / contacts peuvent changer entre publications ; **hors YAML** ; visibles changelog / working copy summary |
| **YAML vs app-only** | Export = livrable ODCS ; historique app, collaborateurs, `inRevision` = app-only |
| **Readiness** | Qualité / complétude **avant publish** — pas un mécanisme de sauvegarde |
| **Save draft** | **Pas** d’action P0 ; persistance via autosave / API |
| **Publish sans delta** | Bloqué si aucun changement export + gouvernance versionnée depuis dernière publication |
| **Publication gouvernance seule** | Autorisée si validée produit (Option B) — YAML inchangé |
| **Git réel** | Exigence **MVP** ; prototype affiche sync non connectée — ne pas retirer des US SP5 |
| **MD5 / checksum / commit** | Exigences **techniques MVP** si US backend/historique ; proto peut mocker l’affichage |
| **Versions (section)** | Pas d’onglets Form/YAML du bandeau ; timeline + Compare + Discard |
| **SemVer minor/major** | Choix à **Publish update**, pas à l’ouverture de New version |

*Arbitrage encore possible :* granularité des indicateurs autosave globaux (saving/saved) — documenter en hypothèse si non tranché.

---

## 6bis. Tags et epics ClickUp

Les **tags** ClickUp servent d’**epic métier** : regroupement transverse, filtres backlog et lecture roadmap. Ils sont **obligatoires** pour toute User Story importée ou réalignée.

### Règle obligatoire

Chaque US présente dans ClickUp doit avoir :

- **au moins 1** tag epic ;
- **cohérent** avec son domaine fonctionnel principal ;
- **validé** avant import (étape 7) et **contrôlé** après import (étape 10).

**Absence de tag = import incomplet** — ne pas passer à la liste suivante tant que les tâches concernées ne sont pas taguées (manuellement ou via CSV tags-only).

Les tags ne remplacent pas la description métier ; ils structurent le backlog pour le PM/PO et la roadmap.

### Taxonomie officielle (tags autorisés)

Utiliser **uniquement** les tags existants dans l’espace ClickUp DCB :

| Tag | Usage typique |
|-----|----------------|
| auth | Authentification, SSO, droits plateforme |
| checksum | MD5, intégrité YAML, audit checksum |
| contract creation | Parcours création, import DDL, mode choice |
| contract fundamentals | Fundamentals, métadonnées contrat |
| contract structure | Structure ODCS, sections éditeur |
| contracts registry | Liste / registry des contrats |
| ddl parser | Import SQL, parser DDL |
| delivery | Livraison, release, hors produit pur |
| design system | UI Kit, composants, tokens |
| draft management | Brouillon, autosave, persistance édition non publiée |
| gitops | Push Git, repository, exécution SP5 |
| lifecycle & locking | Statuts lifecycle, verrouillage, Discard |
| publication | Publish, readiness, changelog, blocage sans delta |
| quality rules | Règles qualité données, SLA, validation métier |
| schema editor | Schéma, tables, propriétés, relations |
| technical foundation | Modèle backend, APIs persistance, sérialisation ODCS (**SP3** `86c9n9a54`), fondations techniques |
| versioning & history | Versions, working copy, Compare, timeline |
| yaml view | Prévisualisation / export YAML (UI **SP1**) ; cohérence YAML post-import (**SP3** `86c9n9a53`) — pas un doublon à annuler systématiquement |

### YAML — tri-domaine (SP1 / SP3 / SP5)

Ne pas confondre trois périmètres distincts :

| Domaine | Liste | Exemple US | Périmètre |
| ------- | ----- | ---------- | --------- |
| **UI preview YAML** | **SP1** | `86c9nw8br` (+ CREATE alignement) | Onglet lecture seule, Copy/Download, working copy affichée |
| **Cohérence YAML après import** | **SP3** | `86c9n9a53` | YAML généré cohérent avec schéma importé / mapping — pas l’UI globale |
| **Sérialisation backend** | **SP3** | `86c9n9a54` | `odcsYamlGenerator`, export P1 depuis modèle |
| **Validation publish / Git / MD5** | **SP5** | `86c9n9a5b`, `5n`, `5p`… | YAML publié, checksum, push Git |

**Règle :** une US SP3 sur le YAML **fonctionnel** post-import n’est **pas** un doublon de l’US SP1 « yaml view » UI — **ne pas CANCEL** sans arbitrage PO.

**Règles d’attribution :**

- **Préférer 1 epic principal** par US.
- **Second tag** uniquement si le sujet est **transversal fort** (ex. métadonnées publication + `checksum`) — **maximum 2 tags** par US.
- **Ne pas créer** de nouveaux tags sans validation PO + espace ClickUp.
- **Éviter** les tags techniques opportunistes ou le fourre-tout.

### Mapping et livrables tags

- **Par défaut** : inclure `tags` et `priority` dans le **CSV UPDATE unifié** (§8) si le mapping ClickUp est fiable.
- **Correctif metadata-only** : `output/{liste}-metadata-update.csv` — colonnes **`id`**, **`tags`**, **`priority`** uniquement (mesure de sécurité, pas obligation systématique).
- Fichier **tags-only** legacy : `output/{liste}-tags-update.csv` — si seuls les tags doivent être rejoués.
- Tâches **CREATE** sans `id` : checklist manuelle ou mapping par **titre** — voir `docs/{liste}-tags-mapping.md`.

Référence appliquée : [sp4-tags-mapping.md](./sp4-tags-mapping.md) · [sp5-tags-mapping.md](./sp5-tags-mapping.md).

### Priorités backlog

Les **priorités** ClickUp structurent la roadmap et l’ordonnancement MVP. Elles sont **obligatoires** sur chaque US active, au même titre que les tags.

#### Niveaux autorisés (observés dans l’espace DCB)

| Priorité | Signification (déduite du backlog existant) | Exemples typiques |
|----------|---------------------------------------------|-------------------|
| **high** | Fondation MVP, parcours bloquant produit, backend critique, publication cœur | `technical foundation`, `publication` (readiness, publish), `gitops`, `ddl parser`, New version, métadonnées MD5 |
| **normal** | Feature MVP standard, parcours utilisateur non bloquant global | Compare, historique Versions, Discard, autosave, schema editor |
| **low** | Polish UX, signal visuel secondaire, dette non bloquante court terme | Badge Revision open, alignement design secondaire |

**Ne pas inventer** d’autres niveaux (pas de `urgent`, `critical`, etc.) tant qu’ils n’existent pas dans ClickUp.

#### Règles d’attribution

- **Une priorité par US** — champ obligatoire avant import.
- **Cohérence tag ↔ priorité** :
  - `technical foundation` → **high** (modèle, API, persistance).
  - `publication` (publish, readiness, blocage sans delta, Option B) → **high** sauf polish documentaire explicite.
  - `versioning & history` → **high** si cœur du parcours (New version, métadonnées audit) ; **normal** si consultation / Compare.
  - `lifecycle & locking` → **high** si verrouillage global ; **normal** si action ponctuelle (Discard).
  - `draft management` → **normal** (autosave — standard MVP).
  - Polish badge / hint UX → **low**.
- **Homogénéité inter-listes** : une US du même domaine qu’une autre liste doit partager la même logique de priorité (ex. Compare SP4 = **normal** comme parcours consultation).
- Les **CREATE** importées doivent recevoir **tag + priorité** dans la même passe metadata que les UPDATE historiques.

#### Contrôle

- Absence de priorité = **import incomplet** (comme absence de tag).
- **high** sur micro-polish sans impact MVP = anti-pattern.
- **normal** ou vide sur `technical foundation` / publish cœur = anti-pattern.

### Homogénéité backlog ISO (inter-listes)

Chaque liste réalignée doit être **ISO** avec les listes déjà conformes :

| Critère ISO | Règle |
|-------------|--------|
| Tag epic | ≥ 1 tag, ≤ 2, taxonomie §6bis |
| Priorité | `high` \| `normal` \| `low` renseignée |
| Statut | Cohérent avec le cycle (pas de tâche active orpheline sans métadonnées) |
| CREATE vs UPDATE | Mêmes conventions tag/priorité que les US historiques de la liste |
| Couverture | 100 % des tâches **actives** de la liste (hors CANCEL explicite) |

**Écart observé type SP4 post-import :** descriptions à jour mais CREATE sans tag ni priorité ; UPDATE avec tags hérités pré-recadrage. Corriger via `*-metadata-update.csv` (§8), pas via re-import description.

Référence audit : [sp4-tags-mapping.md](./sp4-tags-mapping.md) (état export + mapping cible).

---

## 7. Ordre de traitement des listes

Ordre recommandé pour limiter les dépendances et le rework :

| # | Liste | Focus réalignement |
|---|--------|-------------------|
| 1 | **SP4 — Versioning** | Référence méthodologique — **traité** (voir [§13](#13-référence-sp4)) |
| 2 | **SP5 — Publish & Gitops** | Conserver Git réel ; aligner workflows sur UX publish/changelog validée |
| 3 | **SP1 — Interfaces** | Création, backlog, navigation — **US en QA sensibles** : ne pas clôturer sans UPDATE |
| 4 | **SP3 — DDL Import** | Parser, mapping, fixtures ; YAML fonctionnel post-import (`53`) distinct de l’UI YAML **SP1** ; CANCEL doublon exact uniquement (`86c9nw8d1`) |
| 5 | **SP2 — Editor & Lifecycle** | Schema editor, relations, quality rules, lifecycle actions, lock/delete — distinguer verrouillage UI vs API |
| 6 | **SP6 — Auth & Devops** | Probable **REPORT/freeze** si hors périmètre MVP court terme — ne pas confondre avec rôles collaborateurs prototype |

**Notes :**

- Traiter **SP5 juste après SP4** pour enchaîner métadonnées versioning et exécution Git ([sp4-report-sp5.md](./sp4-report-sp5.md)).
- **SP1** : risque élevé de clôture QA sur AC obsolètes (Draft à la création, absence de recherche, etc.).
- **SP6** : documenter REPORT plutôt que CANCEL si le MVP plateforme n’est pas dans la vague courante.

---

## 8. Convention CSV ClickUp

Fichiers sous `backlog/output/` — un type par fichier, sauf **UPDATE unifié** (recommandé par défaut).

### Doctrine : CSV unifié vs metadata-only

**Par défaut**, privilégier un **CSV UPDATE unifié** incluant contenu **et** metadata lorsque l’import est fiable :

| Colonnes typiques | `id`, `name`, `description`, `tags`, `priority` |
|-------------------|--------------------------------------------------|

Le **split** UPDATE (description) + `*-metadata-update.csv` est une **mesure de sécurité**, pas une obligation systématique.

Utiliser un fichier **metadata-only** séparé **uniquement** si :

- les tags ou priorités n’ont pas été appliqués lors d’un import précédent (ex. colonne `tags` non mappée par l’outil batch) ;
- une correction metadata **post-import** est nécessaire sans toucher aux descriptions ;
- le risque d’overwrite des champs métier est jugé élevé ;
- l’outil d’import ne mappe pas correctement `tags`, `Tag` ou `priority` ;
- on veut rejouer **uniquement** les métadonnées.

Si **deux fichiers** sont utilisés (`sp*-update.csv` puis `sp*-metadata-update.csv`), l’audit pré-import doit vérifier que leur **combinaison couvre 100 %** des tâches actives de la liste (mêmes `id`, aucune tâche oubliée).

### UPDATE (`sp*-update.csv`)

| Règle | Détail |
|-------|--------|
| Colonne **`id`** | **Obligatoire** — ID ClickUp existant uniquement |
| Colonnes | **Uniquement** celles modifiées ; peut inclure `name`, `description`, `tags`, `priority` (CSV unifié) ou `name`, `description` seuls (split sécurisé) |
| ID | **Ne jamais inventer** |
| Cellule vide | **Efface** le champ dans ClickUp — ne pas inclure de colonnes inutiles |

### UPDATE unifié (`sp*-update.csv` avec metadata)

| Règle | Détail |
|-------|--------|
| Usage | **Recommandé** quand le batch mappe `tags` / `priority` / `Tag` correctement |
| Colonnes | `id`, `name`, `description`, `tags`, `priority` (minimum métier + metadata) |
| Risque | Modéré — tester sur 1 tâche avant import massif ; contrôle post-import tags **obligatoire** |

### UPDATE tags-only (`sp*-tags-update.csv`)

| Règle | Détail |
|-------|--------|
| Usage | Correctif **tags** seuls (legacy) — ou `*-metadata-update.csv` si priorité aussi à corriger |
| Colonnes | **`id`**, **`tags`** **uniquement** |
| Risque | Faible sur `description` / custom fields — **ne pas** mélanger avec UPDATE description dans le même fichier |
| Format `tags` | Un tag, ou deux tags séparés par une **virgule** (ex. `versioning & history, checksum`) |

### UPDATE metadata-only (`sp*-metadata-update.csv`)

| Règle | Détail |
|-------|--------|
| Usage | Correctif **après** import (split ou échec metadata) — tags + priorités, sans toucher au métier |
| Colonnes | **`id`**, **`tags`**, **`priority`** **uniquement** |
| Risque | Faible — ne pas inclure `description`, `status`, assignees |
| Priorité | Valeurs exactes : `high`, `normal`, `low` (minuscules, comme l’export ClickUp) |
| Couverture | **Toutes** les tâches actives de la liste concernée (UPDATE + CREATE déjà créées) |

### CREATE (`sp*-create.csv`)

| Règle | Détail |
|-------|--------|
| **`id`** | **Absent** — création par import |
| **`name`** | **Obligatoire** |
| Description | `description` et/ou `markdown_content` selon outil d’import |
| Granularité | **Une ligne = une US** |

### CANCEL

- Traitement **manuel** dans ClickUp (statut Cancelled / Obsolète + commentaire).
- Fichier `sp*-cancel.csv` optionnel : `id`, `action`, `reason` — référence pour l’équipe, pas toujours importable.

### Ne pas mélanger

- **Pas** d’UPDATE et CREATE dans le **même** fichier CSV.

---

## 9. Process recommandé par liste

Pipeline standard — **ne pas sauter** les étapes 7 à 10.

```text
 1. Export ClickUp de la liste           → backlog/input/{liste}.csv
 2. Audit lecture seule                 → écarts proto / doc / US
 2b. Classification statuts             → US protégées vs modifiables (§3bis)
 3. Recadrage stratégique (si besoin)   → matrice UPDATE / CREATE / CANCEL / REPORT / SPLIT
 4. Matrice de décision                 → fiches par ID, actions validées
 5. Review humaine de la stratégie      → valider CANCEL / SPLIT / REPORT (pas les CSV)
 6. Génération CSV UPDATE / CREATE / CANCEL → backlog/output/
 7. Audit final pré-import              → gate qualité diff-aware (§10)
 8. Validation humaine finale           → GO / NO-GO import (PM/PO)
 9. Import ClickUp                      → UPDATE puis CREATE ; CANCEL manuel
10. Contrôle post-import               → échantillon tâches ClickUp (§11)
11. Passage à la liste suivante        → seulement si post-import OK
```

| Étape | Responsable typique | Sortie |
|-------|---------------------|--------|
| 1–4 | PM/PO + agent (audit) | Décisions documentées |
| 5 | PM/PO | Stratégie validée |
| 6 | Agent / dev | Fichiers CSV |
| 7 | Agent + relecteur | Checklist §10 complétée |
| 8 | PM/PO | Approbation explicite import |
| 9 | PM/PO | Tâches mises à jour dans ClickUp |
| 10 | PM/PO | Écarts tracés ou corrigés |
| 11 | PM/PO | Liste clôturée côté réalignement |

**Livrables doc optionnels par liste :** fiches par ID (`docs/{liste}-fiches-import.md`), SPLIT, REPORT — comme pour SP4.

**Génération CSV (étape 6) :** après review stratégie (étape 5), **avant** audit final pré-import (étape 7).

---

## 10. Audit final pré-import

### Objectif

Contrôle qualité **ciblé**, réalisé **après** génération des CSV et **avant** import ClickUp.

Il **ne refait pas** :

- l’audit initial (étape 2) ;
- le recadrage stratégique (étape 3) ;
- les débats produit déjà tranchés en review (étape 5).

Il **vérifie** :

- la **sécurité** d’import (colonnes, cellules vides, IDs) ;
- la **cohérence** des CSV générés avec la matrice de décision ;
- l’**absence de régression** par rapport aux décisions validées (KEEP backend/Git/MD5, etc.) ;
- la **conformité** aux règles de ce document (§4–§8).

### Positionnement

**L’audit final pré-import est un gate qualité.** Il est **diff-aware** : il vérifie *ce que les CSV vont changer*, sans rouvrir les décisions produit déjà validées.

En cas d’écart bloquant : corriger les CSV (étape 6) et relancer la checklist — **pas** d’import tant que l’étape 8 n’est pas GO.

### Checklist obligatoire

Cocher avant l’étape 8 (validation humaine finale) :

**MVP et prototype**

- [ ] Aucun UPDATE ne réduit le MVP au prototype React/localStorage.
- [ ] Aucune exigence backend, Git, API, audit ou MD5 supprimée par erreur (sauf CANCEL produit explicite).
- [ ] Aucun scope collaboration temps réel, approval workflow, auth plateforme ou infra ajouté hors liste concernée.

**Statuts protégés (§3bis)**

- [ ] Chaque US du périmètre est classée : **modifiable** vs **protégée** (`qa`, `en cours`, etc.).
- [ ] **Aucune US protégée** n’est modifiée directement (titre / description / AC) sans justification PO/PM explicite.
- [ ] Les écarts sur US protégées sont portés par des **CREATE** complémentaires référençant l’US source.
- [ ] Chaque US complémentaire précise : corrigé, ajouté, exclu, reste sur US source.

**Décisions et structure**

- [ ] Aucun CREATE ne duplique une UPDATE existante (même comportement, deux lignes).
- [ ] Aucun UPDATE fourre-tout qui devrait être un **SPLIT** (produit + backend + Git).
- [ ] Les US restent **atomiques** (une capacité testable par tâche).
- [ ] Les critères d’acceptation sont **testables** (pas de formulations vagues seules).
- [ ] Pas de logique métier inventée non validée (proto ou doc produit).

**Conventions produit (§6)**

- [ ] Wording lifecycle cohérent : working copy, Revision open, published version, etc.
- [ ] **Compare** reste export-only (pas owner / governance contacts dans Compare).
- [ ] Séparation **SP4 / SP5** respectée (Git push détaillé pas absorbé par erreur dans une US versioning seule, sauf lien REPORT).

**CSV ClickUp (§8)**

- [ ] Tous les **UPDATE** ont un `id` ClickUp valide (présent dans l’export input).
- [ ] Aucun **CREATE** ne contient de colonne `id`.
- [ ] **Stratégie CSV documentée** : unifié (contenu + metadata) **ou** split (UPDATE + metadata-only) — choix justifié.
- [ ] Si **unifié** : `tags` et `priority` présents dans le fichier réellement importé.
- [ ] Si **split** : combinaison `*-update.csv` + `*-metadata-update.csv` couvre **100 %** des tâches actives (mêmes IDs).
- [ ] Colonnes CSV **minimales** pour le périmètre choisi (pas de colonnes inutiles qui risquent d’écraser des champs).
- [ ] Aucune **cellule vide** sur une colonne incluse → ne vide pas un champ ClickUp par erreur.
- [ ] Descriptions **non tronquées** (longueur cohérente avec la fiche / le générateur).
- [ ] Contenus **multilignes** correctement quotés (CSV valide).
- [ ] Fichiers **séparés** : UPDATE et CREATE dans des CSV distincts (ne pas mélanger CREATE avec UPDATE).
- [ ] Fichier compatible avec l’**import batch** prévu (encodage UTF-8, en-têtes ; mapper `tags` → **Tag** si requis par l’outil).

**Tags / epics (§6bis)**

- [ ] Chaque US **UPDATE** a un tag epic documenté (fiche, CSV unifié ou `*-metadata-update.csv`).
- [ ] Chaque US **CREATE** a un tag epic assigné (CSV tags si `id` connu, sinon checklist manuelle).
- [ ] Tag epic **cohérent** avec le périmètre métier principal de l’US (pas de tag contradictoire).
- [ ] **Aucune US sans tag** dans le périmètre importé.
- [ ] **Maximum 2 tags** par US ; second tag justifié (transversal fort).
- [ ] Homogénéité des tags sur la **même liste** (US équivalentes → même epic principal).
- [ ] Aucun tag hors **taxonomie officielle** (§6bis).
- [ ] `technical foundation` réservé aux US **backend / modèle / API** — pas comme epic UX versioning.

**Priorités (§6bis — priorités)**

- [ ] Chaque US active a une **priorité** (`high` / `normal` / `low`).
- [ ] Priorité **cohérente** avec l’impact métier et le tag epic (§6bis).
- [ ] Les **CREATE** ont la même rigueur tag + priorité que les UPDATE historiques.
- [ ] Pas de **high** sur polish UX isolé ; pas de **normal** vide sur fondation backend / publish cœur.

**Homogénéité ISO (§6bis)**

- [ ] 100 % des tâches actives de la liste : tag + priorité renseignés.
- [ ] Conventions alignées avec les listes voisines déjà conformes (export multi-listes de référence).
- [ ] Fichier `*-metadata-update.csv` généré si écart post-import détecté.

**Cohérence inter-listes (si plusieurs listes déjà traitées)**

- [ ] Pas de contradiction avec les conventions déjà importées sur une autre liste (vocabulaire, REPORT SP5, etc.).

---

## 11. Contrôle post-import

### Objectif

Vérification **rapide dans ClickUp** après import (étape 9), avant de passer à la liste suivante.

Complète l’audit pré-import : confirme que l’outil d’import a bien appliqué les changements attendus, sans corruption des champs non ciblés.

### Checklist courte

- [ ] Ouvrir **3 à 5** tâches **UPDATE** (échantillon + toute US à haut risque : QA, SPLIT, KEEP MD5/Git).
- [ ] Ouvrir **toutes** les tâches **CREATE** si le volume est faible (sinon échantillon + 100 % des CREATE critiques).
- [ ] Vérifier le **rendu Markdown** des descriptions (titres, listes, pas de caractères cassés).
- [ ] Vérifier que les **IDs** des UPDATE correspondent aux tâches attendues (titre / historique cohérents).
- [ ] Vérifier que les **CREATE** sont dans la **bonne liste** ClickUp.
- [ ] Vérifier **titres** et **statuts** (pas de régression involontaire sur statut QA/en cours).
- [ ] Vérifier qu’**aucun champ critique** n’a été vidé (custom fields, assignees — si colonnes non importées, ils doivent rester intacts).
- [ ] Vérifier que **chaque tâche** (UPDATE + CREATE) a **au moins 1 tag epic** cohérent (§6bis) **visible dans l’UI ClickUp** — un succès d’import CSV ne suffit pas.
- [ ] Vérifier que **chaque tâche active** a une **priorité** (`high` / `normal` / `low`) **visible dans ClickUp**.
- [ ] Vérifier que les **CREATE** ont les mêmes conventions tag/priorité que les UPDATE de la liste.
- [ ] Si tags/priorités absents : appliquer `*-metadata-update.csv`, mapper colonne **Tag**, ou correction manuelle — puis re-contrôler.
- [ ] Traiter les tâches **CANCEL** manuellement (statut + commentaire renvoyant vers la gouvernance).
- [ ] **Documenter** tout écart (commentaire tâche, note dans `docs/{liste}-post-import-notes.md` ou ticket) **avant** étape 11.

Si écart majeur : corriger dans ClickUp ou régénérer CSV + ré-import ciblé — **ne pas** enchaîner la liste suivante sans traçabilité.

---

## 12. Anti-patterns

| Anti-pattern | Pourquoi c’est bloquant |
|--------------|-------------------------|
| Backlog MVP = backlog prototype | Perte Git, MD5, APIs, persistance serveur |
| CANCEL Git car simulé | MVP reste versionné dans un dépôt réel |
| CANCEL backend car frontend-only | Écart entre démo et livrable Zeenea |
| Réintroduire **Save draft** P0 sans décision PO | Contredit parcours autosave validé |
| US fourre-tout (produit + infra + Git) | Impossible SPLIT, QA flou |
| UPDATE + CREATE dans un même CSV | Risque d’import et de relecture |
| Clôturer US **QA** sans UPDATE | Tests sur un produit qui n’existe plus |
| Fermer une US parce que la **démo** existe | La démo ne couvre pas le backend |
| Inventer des **ID ClickUp** | Casse la traçabilité |
| CSV avant **review humaine** | Import massif d’erreurs |
| Compare incluant gouvernance app-only | Contredit convention export-only |
| Retirer MD5/commit des AC « parce que proto mock » | Confond validation UX et exigence audit MVP |
| Annuler `86c9n9a4t`-like en bloc | Préférer **SPLIT** produit / technique |
| **Importer sans audit final pré-import** (étape 7) | UPDATE agressifs, régressions MVP non détectées |
| **Sauter le contrôle post-import** (étape 10) | Corruption ou troncature découverte tardivement |
| **Corriger ClickUp sans tracer l’écart** | Perte de sync CSV ↔ outil ; dette méthodo |
| **Liste suivante avant post-import OK** | Propagation d’erreurs et vocabulaire incohérent |
| **Import sans tag epic** | Filtrage roadmap et regroupement métier impossibles ; dette de tri |
| **`technical foundation` comme fourre-tout** | Masque le domaine métier (versioning, publication, draft) |
| **Multiplication de tags** (> 2 ou tags faibles) | Bruit backlog, filtres ClickUp inutilisables |
| **Tags différents pour US équivalentes** | Incohérence roadmap (ex. deux US Compare avec epics différents) |
| **CSV UPDATE description pour corriger les tags** | Risque d’écraser des champs — préférer metadata-only ou CSV unifié initial |
| **Imposer systématiquement deux passes UPDATE + metadata** | Coût inutile si l’outil mappe correctement un CSV unifié |
| **Succès batch import = tags appliqués** | Faux positif fréquent — contrôle visuel ClickUp obligatoire |
| **Import CREATE sans priorité** | CREATE invisibles dans la roadmap ; hétérogénéité vs UPDATE |
| **Import CREATE sans tag epic** | Filtres backlog et regroupement métier cassés |
| **`technical foundation` sans high** | Sous-priorisation du backend MVP |
| **high sur micro-polish** (badge, hint) | Bruit roadmap ; dette high fausse |
| **Priorité incohérente avec tag** (ex. publication en normal pour readiness) | Ordonnancement faux entre listes |
| **Backlog hétérogène intra-liste** | UPDATE conformes, CREATE sans métadonnées |
| **UPDATE direct sur US en qa / en cours** | Perte traçabilité QA, scope mouvant |
| **Réécrire une US en cours** | Confusion dev, historique perdu |
| **Faire disparaître l’historique QA via UPDATE massif** | Clôture sur référentiel invalide |
| **Corriger un comportement validé en QA sans US de correction** | Tests et dev désalignés |
| **CANCEL une US SP3 YAML fonctionnelle** en la traitant comme doublon UI SP1 | Trou QA import → YAML ; confusion ownership |
| **Sur-promettre le coverage parser MVP** | ANSI SQL complet, dialecte vendor exhaustif — tenir dialecte **TBD** + subset documenté |

---

## 13. Référence SP4

SP4 — Versioning est le **premier cycle** appliqué avec cette gouvernance.

| Décision | Exemple |
|----------|---------|
| **SPLIT** | `86c9n9a4t` → UPDATE modèle logique + CREATE persistance backend |
| **CANCEL** | `86c9n9a52` — Save draft P0 |
| **UPDATE** | 7 US (New version, historique, Compare, Discard, autosave, readiness, métadonnées) |
| **CREATE** | Revision open ; No changes to publish ; Option B gouvernance ; modèle backend (branche B) |
| **KEEP technique** | MD5, commit hash, Draft/PublishedVersion — malgré simulation proto |
| **REPORT** | Exécution Git détaillée → SP5 |

**Ne pas recopier** le détail des fiches ici. Voir :

- [sp4-fiches-import.md](./sp4-fiches-import.md) — actions par ID
- [sp4-split-86c9n9a4t.md](./sp4-split-86c9n9a4t.md) — SPLIT
- [sp4-report-sp5.md](./sp4-report-sp5.md) — liens SP5
- SP2 — Editor & Lifecycle : prochaine liste schema/lifecycle après SP1/SP3 ; garder les liens vers schema editor, quality rules, lifecycle & locking et contract structure
- [../output/sp4-update.csv](../output/sp4-update.csv) · [../output/sp4-create.csv](../output/sp4-create.csv) — exports générés (ne pas modifier via ce document)
- [sp4-tags-mapping.md](./sp4-tags-mapping.md) · [../output/sp4-metadata-update.csv](../output/sp4-metadata-update.csv) — epics/tags + priorités post-import SP4

---

## Historique

| Date | Changement |
|------|------------|
| 2026-05 | Création après recadrage SP4 — Versioning |
| 2026-05 | Ajout audit final pré-import, contrôle post-import, pipeline 11 étapes |
| 2026-05 | Tags/epics obligatoires (§6bis), checklist pré-import, livrables `*-tags-update.csv` |
| 2026-05 | Priorités + homogénéité ISO (§6bis), `*-metadata-update.csv`, audit post-import SP4 |
| 2026-05 | Doctrine CSV unifié vs metadata-only (§8) ; post-import tags visuels obligatoires |
| 2026-05 | Protection US avancées (§3bis) — CREATE complémentaires vs UPDATE direct |
| 2026-05 | Rappel explicite SP2 — Editor & Lifecycle dans l’ordre de traitement et les références cross-listes |
| 2026-05 | Tri-domaine YAML SP1/SP3/SP5 ; anti-patterns CANCEL YAML SP3 et sur-promesse parser |
