# Notes techniques — Data Contract Builder

Documentation **développeurs** : implémentation, persistance, tests et maintenance. Pour le comportement produit et les workflows utilisateur, voir [Documentation produit](./product-documentation.md).

---

## Sommaire

1. [Stack et exécution](#1-stack-et-exécution)
2. [Architecture applicative](#2-architecture-applicative)
3. [Persistance et migrations](#3-persistance-et-migrations)
4. [Tests et conformité P1](#4-tests-et-conformité-p1)
5. [Guide de modification](#5-guide-de-modification)
6. [Checklist de maintien P1](#6-checklist-de-maintien-p1)
7. [Réinitialiser les données locales](#7-réinitialiser-les-données-locales)

---

## 1. Stack et exécution

| Couche | Technologie |
|--------|-------------|
| UI | React 19 |
| Langage | TypeScript 6 (strict) |
| Build | Vite 8 |
| Styles | Tailwind CSS 4 + tokens Actian |
| Composants | Base UI + `src/components/ui/` |
| YAML | js-yaml |
| Icônes | lucide-react |
| Tests | Vitest 4 |
| Persistance | `localStorage` (clé `data-contracts-v1`) |

### Commandes

```bash
npm install
npm run dev      # développement (défaut port 5173)
npm run build    # tsc + build production
npm run preview  # prévisualisation build
npm test         # Vitest run
npm run test:watch
```

### Déploiement

Configuration Netlify (`.netlify/netlify.toml`) : `npm run build`, publish `dist/`.

### Utilisateur courant (prototype)

Stub dans `src/lib/currentUser.ts` — modifier pour tester rôles et partage.

---

## 2. Architecture applicative

### Vues (`AppView`)

| Vue | Rôle |
|-----|------|
| `backlog` | Liste des contrats |
| `create` | Create contract — Import seul, pas de persistance avant choix |
| `editor` | Éditeur (sections, readiness, publication) |
| `components` | Galerie UI Kit |

### Fichiers clés

| Fichier / dossier | Rôle |
|-------------------|------|
| `src/App.tsx` | État global, lifecycle, routing |
| `src/types/odcs.ts` | Modèle métier |
| `src/lib/p1Constants.ts` | Constantes ODCS P1 |
| `src/lib/p1Validation.ts` | Validateurs atomiques |
| `src/lib/contractValidation.ts` | Validation publication |
| `src/lib/contractLifecycle.ts` | Statuts et transitions |
| `src/lib/odcsYamlGenerator.ts` | Export YAML |
| `src/lib/relationshipExport.ts` | Export FK / relationships |
| `src/lib/ddlParser.ts` | Import SQL |
| `src/lib/storage.ts` | Persistance + migrations |
| `src/lib/publicationReadiness.ts` | Score readiness |
| `src/lib/readinessGuidance.ts` | Guidance par section |
| `src/lib/uxCopy.ts` | Libellés UI |
| `src/lib/validationUserMessages.ts` | Messages utilisateur validation |
| `src/components/sections/` | Sections éditeur |
| `src/lib/__tests__/` | Tests unitaires |

### Séparation des responsabilités

```text
types (odcs.ts)       →  état contrat
p1Constants           →  enums / regex P1
p1Validation          →  règles atomiques
contractValidation    →  orchestration erreurs publish
odcsYamlGenerator     →  sortie ODCS
components/*          →  UI
App.tsx               →  orchestration + persistance
```

---

## 3. Persistance et migrations

| Paramètre | Valeur |
|-----------|--------|
| Clé | `data-contracts-v1` |
| API | `loadContracts` / `saveContracts` (`storage.ts`) |
| Format | JSON `DataContract[]` |
| Seed | `SEED_CONTRACTS` si clé absente ou erreur de parse |

### Migrations au chargement (`migrateContract`)

| Migration | Détail |
|-----------|--------|
| Lifecycle status | Normalisation 5 statuts P1 |
| Contract `id` | Slug-only legacy → `{slug}-{suffixe-8-hex}` ; voir [ID hybride P1](#id-hybride-p1) |
| SLA | Préservation et validation de `slaProperties[].property` (13 types ODCS) |
| Schema / property ids | `stableSchemaId` / `stablePropertyId` |
| Quality | `type: text`, `aiVerified`, migration `qualityRule` → `quality[]` |
| Git commits | `migrateGitCommit` |

**Risques :** pas de versioning explicite du schéma de stockage ; unicité `id` locale ; `saveContracts` échoue silencieusement si quota dépassé.

### ID hybride P1

Le prototype n’utilise pas un UUID ODCS pur pour `id`. Format attendu :

```text
{slug}-{8hex}
```

- **slug** : dérivé du nom du contrat (`info.title` → export YAML `name`) — lowercase, ASCII, sans caractères spéciaux (accents retirés).
- **suffixe 8 hex** : stable, dérivé du `uid` du contrat (ou du nom si seed absent) via `contractIdSuffix` / `deriveContractId` (`src/lib/idDerivation.ts`).
- **Unicité** : `isDuplicateContractId` dans `validateContract` à la publication (registre `localStorage`).
- **UI** : `id` et `version` affichés en lecture seule dans Fundamentals ; `status` dans la barre supérieure ; `apiVersion` / `kind` uniquement dans l’export YAML (onglet YAML).

`name` (ODCS) est optionnel dans la spec P1 mais **requis côté produit** pour publier (`contractValidation` code `title`) — la validation n’a pas été assouplie dans ce prototype.

### Mapping Schema app → export ODCS (P0/P1)

Source unique : `src/lib/schemaOdcsMapping.ts` (résolution) + `src/lib/odcsYamlGenerator.ts` (sérialisation).

| ODCS (export) | Champ app (`dataset` / `columns`) | Notes |
|---------------|-----------------------------------|--------|
| `schema[].name` | `SchemaTable.name` | Sync auto depuis `physicalName` à l’édition ; migration : `normalizeOdcsName(physicalName)` |
| `schema[].physicalName` | `physicalName` | Inchangé |
| `schema[].physicalType` | `physicalType` (miroir `tableType`) | `table` \| `view` \| `topic` \| `file` |
| `schema[].businessName` | `quantumName` | Libellé UI **Entity name** ; exporté sous `businessName` si renseigné |
| `properties[].name` | `ColumnDefinition.name` | Sync auto depuis `physicalName` |
| `properties[].businessName` | `logicalName` | Libellé UI **Business label** ; exporté sous `businessName` si renseigné |
| `properties[].primaryKey` | `isPrimaryKey` | Export si `true` (omit-if-false) |
| `properties[].unique` | `isUnique` | Export si `true` |
| `properties[].classification` | `classification` (+ sync `isPII`) | Export si `restricted` ou `confidential` ; `isPII` non exporté |
| `properties[].criticalDataElement` | `criticalDataElement` | Export si `true` |
| `properties[].logicalType` | `logicalType` | `unknown` bloqué au publish ; `time` supporté |

IDs stables (`id` table/colonne) et pointers FK `/schema/{id}/properties/{propertyId}` ne dépendent pas de `name`.

---

## 4. Tests et conformité P1

**Framework :** Vitest — `npm test`, `npm run test:watch`.

| Fichier | Rôle |
|---------|------|
| `p1-compliance.test.ts` | 55 lignes P1 + golden YAML |
| `createContract.test.ts` | Création, bannières proposed |
| `contractLifecycle.test.ts` | Transitions, lock, import |
| `contractValidation.test.ts` | Validation publish |
| `validationUserMessages.test.ts` | Messages UI |
| `odcsYamlGenerator.test.ts` | Structure export |
| `p1Validation.test.ts` | Helpers P1 |
| `idDerivation.test.ts` | IDs hybrides |
| `schemaOdcsMapping.test.ts` | Normalisation `name`, résolution export |
| `storageSchemaMigration.test.ts` | Migration legacy schema |
| `ddlParser.schemaOdcs.test.ts` | Import DDL → champs ODCS |
| `relationshipExport.rename.test.ts` | FK stable après rename |

**Total observé :** ~242 tests (19 fichiers).

**Limites :** pas de tests composants React ni e2e navigateur dans `__tests__/`.

Référence normative : [odcs-p1-reference.md](./odcs-p1-reference.md).

---

## 5. Guide de modification

| Besoin | Fichier(s) |
|--------|------------|
| Types métier | `src/types/odcs.ts`, `odcsShared.ts` |
| Constantes P1 | `src/lib/p1Constants.ts` |
| Validation publication | `src/lib/contractValidation.ts` |
| Export YAML | `odcsYamlGenerator.ts`, `odcsSharedMappers.ts`, `relationshipExport.ts` |
| Lifecycle | `contractLifecycle.ts`, handlers `App.tsx` |
| Import DDL | `ddlParser.ts` |
| Readiness | `publicationReadiness.ts`, `readinessGuidance.ts` |
| Diff / versioning publish | `contractVersionDiff.ts`, `exportedContractDiff.ts`, `governanceSnapshotDiff.ts` |
| Libellés UI | `uxCopy.ts` |
| Doc produit | `docs/product-documentation.md` |

Après changement métier visible : mettre à jour **d’abord** la [documentation produit](./product-documentation.md), puis cette annexe si besoin.

---

## 6. Checklist de maintien P1

### Ajout ou modification d’un champ P1

- [ ] Mettre à jour [odcs-p1-reference.md](./odcs-p1-reference.md)
- [ ] Types `odcs.ts` / `odcsShared.ts`
- [ ] `p1Constants.ts`, `p1Validation.ts`
- [ ] `contractValidation.ts` si bloquant publish
- [ ] UI section concernée
- [ ] Export `odcsYamlGenerator.ts` / mappers
- [ ] `p1-fixture.ts` + assertion `p1-compliance.test.ts`

### Modification export YAML

- [ ] Golden keys `p1-compliance.test.ts`
- [ ] Champs exclus YAML : owner, governance contacts (`stakeholders`), collaborateurs, `creationSource`, `inRevision`, `isPII`, `aiVerified`, historique app — owner/contacts via `governanceSnapshotDiff.ts` pour publish/changelog
- [ ] Champs exportés schema : `businessName`, `classification`, `primaryKey`, `unique`, `criticalDataElement`, `customProperties`, relations exportables — couverts par `exportedContractDiff.ts` / compare
- [ ] Publish gate : `hasAnyChangeSinceLastPublish` (export + gouvernance), pas le seul flag UI `hasEditedSincePublish` ; changelog jamais vide si `hasAnyChange`
- [ ] Modale Compare : `compareExportedSnapshots` uniquement (pas de diff gouvernance)
- [ ] Data access roles : `roleRowHasContent` (validation) vs `isRoleRowExportable` (YAML/diff) dans `p1Validation.ts`
- [ ] `npm test`

### Modification lifecycle

- [ ] `LIFECYCLE_TRANSITIONS`, `applyLifecycleAction`
- [ ] `App.tsx`, `ContractTopBar.tsx`
- [ ] `contractLifecycle.test.ts`, `createContract.test.ts`
- [ ] Section lifecycle dans [product-documentation.md](./product-documentation.md)

### Avant merge

- [ ] `npm test` vert
- [ ] `npm run build` sans erreur

---

## 7. Réinitialiser les données locales

```js
localStorage.removeItem('data-contracts-v1')
location.reload()
```

---

*Annexe technique — complément de [product-documentation.md](./product-documentation.md). L’ancienne documentation monolithique `prototype-functional-and-technical-documentation.md` a été scindée : produit dans le maître, technique ici.*
