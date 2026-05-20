#!/usr/bin/env python3
"""Generate SP6 ClickUp backlog deliverables (auth plateforme + DevOps)."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"
INPUT = ROOT / "backlog" / "input"
SRC_CSV = ROOT / "clickup-backlog-SP6_-_Auth_&_Devops-2026-05-20-110043.csv"

SP1_REGISTRY = "86c9n9a3w — Registry (filtrage utilisateur — SP1 CREATE alignement)"
SP1_SHARE = "SP1 — Collaborateurs / Share / Fundamentals (Publisher, Contributor, Reader)"
SP1_YAML = "86c9nw8br — YAML preview UI (SP1)"
SP2_LOCK = "SP2 — Schema editability / locks UX (CREATE fj, lifecycle locks)"
SP3_IMPORT = "86c9n9a44 — Import DDL (SP3)"
SP4_LC = "SP4 — Lifecycle, Revision open, Discard, immutabilité"
SP4_READINESS = "86c9n9a5e — Readiness panel (SP4)"
SP4_PUBLISH_ELIG = "SP4/SP5 — canPublish = validation + myRole === owner"
SP5_GIT = "SP5 — Publish, Git push, credentials (86c9n9a5p, 5h)"


def us_body(
    metier: str,
    inclus: list[str],
    exclus: list[str],
    ac: list[str],
    erreurs: list[str],
    regles: list[str],
    validation: list[str],
    hypotheses: list[str] | None = None,
    proto_valide: list[str] | None = None,
    mvp_cible: list[str] | None = None,
    hors_proto: list[str] | None = None,
    liens_sp1: list[str] | None = None,
    liens_sp2: list[str] | None = None,
    liens_sp3: list[str] | None = None,
    liens_sp4: list[str] | None = None,
    liens_sp5: list[str] | None = None,
) -> str:
    parts = ["Description métier", "", metier, "", "Périmètre", "", "Inclus", ""]
    parts.extend(f"- {x}" for x in inclus)
    parts.extend(["", "Exclus", ""])
    parts.extend(f"- {x}" for x in exclus)
    parts.extend(["", "Critères d’acceptation", ""])
    parts.extend(f"- {x}" for x in ac)
    parts.extend(["", "Cas d’erreur / limites", ""])
    parts.extend(f"- {x}" for x in erreurs)
    parts.extend(["", "Règles de gestion", ""])
    parts.extend(f"- {x}" for x in regles)
    parts.extend(["", "Validation fonctionnelle", ""])
    parts.extend(f"- {x}" for x in validation)
    parts.extend(["", "Hypothèses", ""])
    parts.extend(f"- {x}" for x in (hypotheses or []))
    if proto_valide:
        parts.extend(["", "Validé sur prototype UX (référence démo)", ""])
        parts.extend(f"- {x}" for x in proto_valide)
    if mvp_cible:
        parts.extend(["", "Implémentation MVP cible", ""])
        parts.extend(f"- {x}" for x in mvp_cible)
    if hors_proto:
        parts.extend(["", "Hors périmètre prototype (exigence MVP conservée)", ""])
        parts.extend(f"- {x}" for x in hors_proto)
    if liens_sp1:
        parts.extend(["", "Liens SP1 — Interfaces (REPORT — ne pas réimplémenter ici)", ""])
        parts.extend(f"- {x}" for x in liens_sp1)
    if liens_sp2:
        parts.extend(["", "Liens SP2 — Editor & Lifecycle (REPORT)", ""])
        parts.extend(f"- {x}" for x in liens_sp2)
    if liens_sp3:
        parts.extend(["", "Liens SP3 — DDL Import (REPORT)", ""])
        parts.extend(f"- {x}" for x in liens_sp3)
    if liens_sp4:
        parts.extend(["", "Liens SP4 — Versioning (REPORT)", ""])
        parts.extend(f"- {x}" for x in liens_sp4)
    if liens_sp5:
        parts.extend(["", "Liens SP5 — Publish & GitOps (REPORT)", ""])
        parts.extend(f"- {x}" for x in liens_sp5)
    return "\n".join(parts)


UPDATE_ROWS: list[tuple[str, str, str]] = []

# --- 86c9n9a3q — UPDATE fort ---
UPDATE_ROWS.append(
    (
        "86c9n9a3q",
        "ETQ utilisateur, je veux me connecter via l’authentification Zeenea afin d’accéder au Data Contract Studio",
        us_body(
            metier=(
                "L’utilisateur accède au Data Contract Studio via le framework d’authentification Zeenea. "
                "Cette US couvre **uniquement l’auth plateforme** : identité, session, protection des routes. "
                "Les permissions **par contrat** (Publisher / Contributor / Reader, publish, lifecycle) sont "
                "déjà modélisées dans le produit et portées par **SP1–SP5** — pas par SP6."
            ),
            inclus=[
                "Page ou redirection de login Zeenea",
                "Flux SSO / OIDC Zeenea (selon documentation plateforme)",
                "Récupération identité session (id, email, name minimum)",
                "Route guards globaux — routes internes inaccessibles sans session valide",
                "Redirection vers registry / liste contrats après login réussi",
                "Mapping identité session → résolution utilisateur pour collaborateurs (consommation SP1)",
                "Fallback dev/local documenté (prototype uniquement)",
            ],
            exclus=[
                "Création de compte ou mot de passe oublié (Zeenea)",
                "RBAC contrat : Owner / Contributor / Viewer — **SP1** Share + Fundamentals",
                "Publish, New version, Deprecate, Retire — **SP4** + rôle owner **SP5**",
                "Schema editability, locks, quality rules — **SP2** / **SP4**",
                "Readiness panel, validation publish métier — **SP4** / **SP5**",
                "DDL import, parser — **SP3**",
                "Git push, credentials, MD5 — **SP5**",
                "Enterprise admin / tenant provisioning (hors export actuel)",
                "Équivalence « utilisateur authentifié = Owner » ou « login = publish »",
            ],
            ac=[
                "Utilisateur non authentifié → redirect login ; routes internes bloquées",
                "Utilisateur authentifié → accès app ; identité disponible (id + email ou name)",
                "Échec auth → message compréhensible ; pas d’accès routes protégées",
                "Après login → registry accessible (filtrage scope utilisateur = **SP1**/backend si applicable)",
                "Session expiration / refresh gérés par provider Zeenea",
                "Aucun changement aux droits collaborateurs existants sur un contrat",
            ],
            erreurs=[
                "Provider indisponible → message + pas d’accès app",
                "Session expirée → redirect login sans perte données contrat localStorage proto",
            ],
            regles=[
                "Auth déléguée à Zeenea — SP6 ne redéfinit pas le modèle collaborateurs",
                "canPublish et isViewer restent côté produit (App.tsx) — REPORT SP4/SP5",
                "Registry filtré par utilisateur → REPORT SP1 CREATE-2, pas règle SP6 seule",
            ],
            validation=[
                "Tests SP6 : non auth, login OK, login KO, route protégée, expiration session",
                "**Ne pas** rejouer publish / lifecycle / schema / Share comme tests SP6",
            ],
            hypotheses=[
                "Documentation Zeenea auth fournie avant implémentation MVP",
                "Un seul tenant MVP suffit pour la vague courante",
            ],
            proto_valide=[
                "Pas de login UI — accès direct app",
                "CURRENT_USER stub (src/lib/currentUser.ts) — identité fixe démo uniquement",
                "getMyRole / canPublish / isViewer via collaborators[] — modèle complet prototype",
            ],
            mvp_cible=[
                "Intégration IdP Zeenea + session applicative",
                "Middleware ou guards backend + frontend sur routes DCB",
                "Identité exposée aux services SP1 (registry) et mapping collaborateurs",
            ],
            hors_proto=[
                "SSO Zeenea réel",
                "Invalidation session provider",
                "Filtrage registry backend par utilisateur",
            ],
            liens_sp1=[
                SP1_SHARE,
                SP1_REGISTRY,
                "Contract owner Fundamentals — distinct Publisher collaborateur",
            ],
            liens_sp2=[SP2_LOCK, "isContractLocked + isViewer — pas contrôle SSO"],
            liens_sp3=[SP3_IMPORT, "Import proposed — lifecycle, pas auth upload"],
            liens_sp4=[
                SP4_LC,
                SP4_READINESS,
                SP4_PUBLISH_ELIG,
            ],
            liens_sp5=[SP5_GIT, "Publish exécution — owner only"],
        ),
    )
)

# --- 86c9n9a41 ---
UPDATE_ROWS.append(
    (
        "86c9n9a41",
        "ETQ utilisateur, je veux me déconnecter afin de quitter l’application",
        us_body(
            metier=(
                "L’utilisateur connecté termine sa session plateforme et revient à l’état non authentifié. "
                "Logout = **auth plateforme uniquement** ; aucune modification des contrats, collaborateurs "
                "ou lifecycle."
            ),
            inclus=[
                "Action Logout visible une fois authentifié",
                "Invalidation session applicative",
                "Délégation logout provider Zeenea (OIDC end_session si applicable)",
                "Redirection login ou page Zeenea prévue",
                "Routes internes inaccessibles après logout",
            ],
            exclus=[
                "Modification données contrat (localStorage / base)",
                "Révocation droits collaborateurs par contrat",
                "Publish / lifecycle / schema — **SP4** / **SP2**",
                "Multi-session avancée, audit connexions détaillé",
            ],
            ac=[
                "Clic Logout → session terminée côté app + provider si requis",
                "Après logout → redirect écran auth",
                "URL interne protégée → redirect login",
                "Aucune donnée contrat modifiée par logout",
                "Collaborateurs et statuts contrats inchangés en base",
            ],
            erreurs=[
                "Provider logout partiel → session app quand même invalidée",
            ],
            regles=[
                "Logout ne déclenche pas publish, discard, ni autosave",
                "Distinction session plateforme vs permissions contrat (SP1–SP5)",
            ],
            validation=[
                "Tests SP6 : logout depuis app, accès route après logout, données contrat intactes",
                "Ne pas tester publish/schema/readiness dans cette US",
            ],
            hypotheses=["Provider Zeenea expose endpoint logout standard"],
            proto_valide=["Pas de logout UI au prototype"],
            mvp_cible=[
                "Bouton Logout + invalidation cookie/token",
                "Intégration end_session Zeenea",
            ],
            hors_proto=["Logout réel provider"],
            liens_sp1=[SP1_SHARE, "Share UI inchangée par logout"],
            liens_sp4=[SP4_LC, "Revision open / WC non affectés par logout seul"],
        ),
    )
)

# --- 86c9n9a6u ---
UPDATE_ROWS.append(
    (
        "86c9n9a6u",
        "ETQ équipe technique, je veux packager l’application pour un déploiement conteneurisé afin de préparer l’exécution Kubernetes cible",
        us_body(
            metier=(
                "Livrer l’application DCB en conteneur prêt pour déploiement Kubernetes : build reproductible, "
                "configuration runtime externalisée (auth Zeenea, endpoints Git). **DevOps / delivery** — "
                "pas RBAC contrat ni logique publish."
            ),
            inclus=[
                "Dockerfile ou équivalent build reproductible",
                "Configuration runtime via variables d’environnement",
                "Variables auth Zeenea (issuer, client, redirect URIs) injectées — pas en dur",
                "Variables Git/repo (URL, chemins) injectées — secrets hors image",
                "Healthcheck HTTP simple",
                "Documentation lancement local + cible K8s minimale",
                "Préparation déploiement Kubernetes (manifeste ou notes — Helm complet optionnel)",
            ],
            exclus=[
                "RBAC contrat, collaborateurs, publish — produit SP1–SP5",
                "Helm chart production complet si non demandé PO",
                "Observabilité avancée, autoscaling, multi-tenant",
                "CI/CD pipeline production complet",
                "Secrets Git ou auth embarqués dans l’image",
            ],
            ac=[
                "Build conteneur OK en CI/local",
                "Conteneur démarre avec config env exemple (sans secrets)",
                "Healthcheck répond sur endpoint documenté",
                "Auth et Git configurables par env — pas hardcodés",
                "Documentation : build, run, variables requises",
                "Aucun secret dans l’image ou le repo livré",
            ],
            erreurs=[
                "Config manquante → fail fast au démarrage avec message clair",
                "Healthcheck KO → orchestrateur peut redémarrer",
            ],
            regles=[
                "Tag delivery — ne pas reclasser en auth",
                "Credentials Git opérationnels → **SP5** ; SP6 = injection config seulement",
            ],
            validation=[
                "Tests : build image, run avec .env exemple, healthcheck, pas de secret dans layers",
                "Ne pas valider publish/schema dans cette US",
            ],
            hypotheses=["Un environnement K8s cible Zeenea documenté"],
            proto_valide=["Pas de packaging conteneur au prototype (Vite dev local)"],
            mvp_cible=[
                "Image Docker MVP + doc déploiement",
                "ConfigMap/Secret K8s pour auth + Git (références SP6 login + SP5 push)",
            ],
            hors_proto=["Cluster K8s production Zeenea"],
            liens_sp1=["Runtime frontend/backend DCB — pas logique registry"],
            liens_sp5=[SP5_GIT, "Credentials et push Git — SP5 ; injection URL/credentials via env"],
        ),
    )
)

UPDATE_META = [
    ("86c9n9a3q", "auth", "high"),
    ("86c9n9a41", "auth", "high"),
    ("86c9n9a6u", "delivery", "low"),
]


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(rows)


def main() -> None:
    INPUT.mkdir(parents=True, exist_ok=True)
    if SRC_CSV.exists():
        shutil.copy(SRC_CSV, INPUT / "sp6-auth-devops.csv")

    meta = {id_: (t, p) for id_, t, p in UPDATE_META}
    update_csv = [
        {
            "id": id_,
            "name": name,
            "description": desc,
            "tags": meta[id_][0],
            "priority": meta[id_][1],
        }
        for id_, name, desc in UPDATE_ROWS
    ]
    write_csv(
        OUT / "sp6-update.csv",
        ["id", "name", "description", "tags", "priority"],
        update_csv,
    )

    mapping = """# SP6 — Mapping actions

| ID | Action | Tag | Priorité | Notes |
| -- | ------ | --- | -------- | ----- |
| `86c9n9a3q` | **UPDATE fort** | auth | high | Auth plateforme ; REPORT RBAC → SP1–SP5 ; supprime « auth = Owner » |
| `86c9n9a41` | UPDATE | auth | high | Logout session ; pas effet métier contrat |
| `86c9n9a6u` | UPDATE | delivery | low | Packaging K8s ; config auth/Git injectée ; pas RBAC |

| Total | **3 UPDATE** · **0 CREATE** · **0 CANCEL** · **0 SPLIT** |

Fichier : [sp6-update.csv](../output/sp6-update.csv)
"""
    (DOCS / "sp6-actions-mapping.md").write_text(mapping, encoding="utf-8")

    report = """# REPORT SP6 → SP1 / SP2 / SP3 / SP4 / SP5

Coordination cross-listes — liste SP6 (auth plateforme + DevOps).  
Gouvernance : [backlog-governance.md](./backlog-governance.md) §6bis auth plateforme vs permissions métier.

## Principe SP6

| Règle | Détail |
| ----- | ------ |
| Périmètre SP6 | **3 US** — login, logout, packaging (`86c9n9a3q`, `41`, `6u`) |
| Pas dans SP6 | RBAC contrat, lifecycle, publish, schema locks, readiness, GitOps métier |
| Prototype | `CURRENT_USER` stub ; collaborateurs complets — **ne pas** annuler US auth car proto sans SSO |

## SP1 — Interfaces

| Sujet | Lien |
| ----- | ---- |
| Collaborateurs Publisher / Contributor / Reader | **SP1** Share + Fundamentals — `getMyRole` produit |
| Contract owner (champ) | **SP1** Fundamentals |
| Registry filtrage utilisateur | **SP1** `86c9n9a3w` CREATE — REPORT depuis `3q` si filtre auth backend |
| YAML preview UI | **SP1** `86c9nw8br` |

**Ne pas** déplacer collaborateurs vers SP6.

## SP2 — Editor & Lifecycle

| Sujet | Lien |
| ----- | ---- |
| Schema editability / locks | **SP2** + lifecycle **SP4** |
| `isContractLocked` + `isViewer` | Produit — pas SSO SP6 |

## SP3 — DDL Import

| Sujet | Lien |
| ----- | ---- |
| Import section `proposed` | **SP3** + **SP4** lifecycle |

## SP4 — Versioning

| Sujet | Lien |
| ----- | ---- |
| Lifecycle, Revision open, Discard | **SP4** |
| Readiness panel | **SP4** `86c9n9a5e` |
| Publish eligibility UI | **SP4** + `canPublish` (rôle owner) |

## SP5 — Publish & GitOps

| Sujet | Lien |
| ----- | ---- |
| Publish exécution, Git push | **SP5** |
| Credentials Git | **SP5** — `6u` injecte config env seulement |

## SP6 — Auth inverse (depuis SP1 report)

Voir [sp1-report-sp3-sp4-sp5.md](./sp1-report-sp3-sp4-sp5.md) § SP6 — CREATE-2 registry auth → couvert par `3q` + SP1.

## Ownership QA SP6

| Tester SP6 | Ne pas tester SP6 |
| ---------- | ----------------- |
| Login, logout, session, route guards | Publish, lifecycle, schema edit, Share, readiness |
| Container build, healthcheck, env config | Git push, MD5, validate YAML |

## Trous documentés (pas de CREATE sans PO)

- Enterprise admin / tenant
- Provisioning utilisateurs plateforme
- Audit connexions avancé
"""
    (DOCS / "sp6-report-sp1-sp3-sp4-sp5.md").write_text(report, encoding="utf-8")

    fiches = """# Fiches SP6 — import ClickUp (Auth & Devops)

Référence : [backlog-governance.md](./backlog-governance.md) · plan SP6 figé.

## Matrice

| Action | Nombre |
| ------ | ------ |
| UPDATE | 3 |
| CREATE | 0 |
| CANCEL | 0 |
| SPLIT | 0 |

## Ownership QA

| US | Tester ici | REPORT |
| -- | ---------- | ------ |
| `3q` | Login, session, routes | SP1 collabs, SP4/SP5 publish |
| `41` | Logout, redirect | Publish, lifecycle, schema |
| `6u` | Build, healthcheck, env | SP5 Git credentials |

## Ordre import

1. **UPDATE** — [sp6-update.csv](../output/sp6-update.csv) (3 lignes, tags+priority)
2. [sp6-report-sp1-sp3-sp4-sp5.md](./sp6-report-sp1-sp3-sp4-sp5.md)
3. [sp6-pre-import-audit.md](./sp6-pre-import-audit.md)

---

## `86c9n9a3q`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE fort** |
| Tag | `auth` |
| Priorité | `high` |
| Correction | Supprime « auth = Owner » ; REPORT SP1–SP5 |

---

## `86c9n9a41`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `auth` |
| Priorité | `high` |

---

## `86c9n9a6u`

| Champ | Valeur |
| ----- | ------ |
| Action | **UPDATE** |
| Tag | `delivery` |
| Priorité | `low` |
"""
    (DOCS / "sp6-fiches-import.md").write_text(fiches, encoding="utf-8")

    audit = """# SP6 — Audit final pré-import

Gate qualité avant import ClickUp (gouvernance §10).

## Checklist

### Doctrine auth vs métier
- [x] SP6 = auth plateforme + session + packaging uniquement
- [x] Collaborators / publish / lifecycle / schema → REPORT SP1–SP5
- [x] `86c9n9a3q` sans « utilisateur authentifié = Owner » ni « collaboration hors MVP »
- [x] `CURRENT_USER` documenté prototype seulement

### Décisions
- [x] 3 UPDATE · 0 CREATE · 0 CANCEL · 0 SPLIT
- [x] §51 — pas de CANCEL auth car proto sans SSO
- [x] US atomiques et AC testables

### Conventions §6
- [x] Dual-track sur 3 UPDATE (proto_valide + mvp_cible + hors_proto)
- [x] `6u` reste tag `delivery` (pas `auth`)
- [x] QA SP6 ne reteste pas publish/lifecycle/schema/Share

### CSV
- [x] 3 UPDATE avec `id` valide (export input)
- [x] Colonnes `id`, `name`, `description`, `tags`, `priority`
- [x] Script generate parse OK

### Tags / priorités
- [x] 3/3 tag + priorité : auth high ×2, delivery low ×1

## Verdict

**SAFE TO IMPORT** — import `sp6-update.csv` ; contrôler tags ClickUp post-import ; ne pas rejouer tests métier dans vague SP6.

## Post-import (§11)

- [ ] Échantillon : `3q`, `41`, `6u`
- [ ] Tags `auth` / `delivery` visibles
- [ ] Description `3q` sans wording Owner/hors MVP collaborateurs
- [ ] SP1–SP5 US non modifiées par import SP6
"""
    (DOCS / "sp6-pre-import-audit.md").write_text(audit, encoding="utf-8")

    checklist = """# SP6 — Checklist import ClickUp

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
"""
    (DOCS / "sp6-import-checklist.md").write_text(checklist, encoding="utf-8")

    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    if "## SP6" not in readme:
        readme += """

## SP6 — Auth & Devops

**Input :** [input/sp6-auth-devops.csv](input/sp6-auth-devops.csv)

**Gouvernance :** 3 UPDATE · 0 CREATE · 0 CANCEL · auth plateforme uniquement (RBAC contrat = SP1–SP5).

**Regénérer :** `python3 backlog/scripts/generate_sp6_deliverables.py`

### Ordre d’import ClickUp

1. **UPDATE** — [output/sp6-update.csv](output/sp6-update.csv)
2. **Cross-listes** — [docs/sp6-report-sp1-sp3-sp4-sp5.md](docs/sp6-report-sp1-sp3-sp4-sp5.md)
3. **Docs** — [docs/sp6-fiches-import.md](docs/sp6-fiches-import.md) · [docs/sp6-pre-import-audit.md](docs/sp6-pre-import-audit.md)
4. **Import (manuel)** — [docs/sp6-import-checklist.md](docs/sp6-import-checklist.md)

| ID | Action |
| -- | ------ |
| `86c9n9a3q`, `86c9n9a41`, `86c9n9a6u` | UPDATE |
"""
        (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")

    print(f"Wrote {len(update_csv)} updates to {OUT}")
    print(f"Docs: {DOCS}")


if __name__ == "__main__":
    main()
