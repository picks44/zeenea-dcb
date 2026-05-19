# Data Contract Builder (Zeenea DCB)

Application web pour **créer, éditer et publier des contrats de données** conformes à l’[Open Data Contract Standard (ODCS) v3.1.0](https://bitol-io.github.io/open-data-contract-standard/v3.1.0/). L’outil guide les équipes data d’un schéma SQL (ou d’une feuille blanche) jusqu’à un fichier YAML prêt pour Git.

> **Prototype MVP** : persistance dans le navigateur (`localStorage`), publication et push Git **simulés** (aucun dépôt distant), utilisateur de démonstration codé en dur — pas de backend ni d’authentification réelle.

---

## Périmètre MVP

| Inclus | Hors scope / simulé |
|--------|---------------------|
| Édition ODCS P0/P1 (55 champs prioritaires) | SSO, API Zeenea, registry global des IDs |
| Export YAML ODCS v3.1.0 en temps réel | Commit Git réel |
| Lifecycle `proposed` → `draft` → `active` → `deprecated` → `retired` | Collaboration temps réel |
| Readiness, validation publish, historique de versions **dans l’app** | Vérification AI qualité (mock local) |
| Import SQL `CREATE TABLE`, relations, diff/changelog unifiés | Sections ODCS hors P1 UI |

**Publication :** une nouvelle version est enregistrée lorsqu’il existe un **changement réel** sur le contenu exportable **ou** sur la gouvernance versionnée dans l’app (contract owner, governance contacts). Aucune publication « vide » ; le changelog n’est jamais silencieux.

**Export YAML** (extrait) : identité, schéma (`businessName`, `classification`, clés, relations, qualité, reference links), `roles`, `slaProperties`, `customProperties`, tags.

**App-only** (non exporté, mais versionné pour publish/changelog si applicable) : contract owner, governance contacts, collaborateurs, `creationSource`, `inRevision`, historique des versions, flag personal data brut (`isPII`), état AI mock sur règles qualité table.

---

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Vitest · `localStorage` — détail dans [notes techniques](./docs/technical-notes.md).

---

## Documentation

| Document | Public | Contenu |
|----------|--------|---------|
| **[Documentation produit](./docs/product-documentation.md)** | PM, QA, designer, client, dev | Vision, workflows, lifecycle, rôles, readiness, YAML, limitations — **source de vérité fonctionnelle** |
| [Référence ODCS P1](./docs/odcs-p1-reference.md) | Data / conformité | 55 champs prioritaires ODCS v3.1.0 |
| [Notes techniques](./docs/technical-notes.md) | Développeurs | Stack, persistance, tests, checklist maintien |

---

## Démarrage rapide (développeurs)

**Prérequis :** Node.js 18+ (recommandé 20+), npm.

```bash
npm install
npm run dev
```

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (défaut : http://localhost:5173) |
| `npm run build` | Build de production |
| `npm test` | Tests unitaires |

Réinitialiser les données de démo : voir [Notes techniques — Réinitialiser les données](./docs/technical-notes.md#réinitialiser-les-données-locales).

---

## Licence

ISC (voir `package.json`). Contacter l’équipe propriétaire du dépôt pour l’usage en entreprise.
