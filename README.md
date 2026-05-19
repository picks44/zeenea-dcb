# Data Contract Builder (Zeenea DCB)

Application web pour **créer, éditer et publier des contrats de données** conformes à l’[Open Data Contract Standard (ODCS) v3.1.0](https://bitol-io.github.io/open-data-contract-standard/v3.1.0/). L’outil guide les équipes data d’un schéma SQL (ou d’une feuille blanche) jusqu’à un fichier YAML prêt pour Git.

> **Prototype MVP** : persistance dans le navigateur, publication et Git **simulés**, utilisateur de démonstration codé en dur.

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
