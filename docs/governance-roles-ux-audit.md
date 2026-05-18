# Governance roles UX copy audit

**Date:** 2026-05-18  
**Scope:** UX/copy only — no data model, permissions, or ODCS YAML export changes.

## Problem

Three distinct concepts could read as “people on the contract”:

| Concept | Data (unchanged) | User must understand |
|--------|------------------|----------------------|
| **Collaborators** | `contract.collaborators` | Who can work on the contract **in the app** |
| **Contract owner** | `contract.info.owner` | Who is **accountable** for the contract |
| **Governance contacts** | `contract.stakeholders` | Who to **contact** operationally |

## Wording decision: **Collaborators**

Evaluated: *Collaborators*, *Access*, *Team access*.

**Retained: Collaborators**

- Aligns with the existing type name (`Collaborator`) without renaming code.
- Avoids confusion with **Data access** (ODCS consumer roles).
- Clearer than “Members” (too generic) or “Team access” (sounds like org directory).
- Communicates: *people who can access or edit this contract in the application*.

## Rationale by area

### 1. Collaborators (was “Members”)

- Top bar button and modal title → **Collaborators**
- Intro stresses **application access only**, not contract owner or governance contacts
- Publisher role description explicitly **not** the Fundamentals contract owner
- Empty state invites people to work on the contract in the app

### 2. Contract owner

- Kept label **Contract owner**
- Helper: business accountability + publication approval; **not** an app login role
- Readiness/validation: pedagogical message about business owner before publish
- Fundamentals section tag: **Accountability**

### 3. Governance contacts

- Kept **Governance contacts** (nav short label **Contacts**; tooltip shows full title)
- Intro: operational/business contacts to reach out to — not app permissions
- Empty state distinguishes from owner and collaborators
- Section tag: **Communication & support**

### 4. Data access

- Kept section name **Data access**
- Intro: ODCS **consumer roles** in the contract; editing/publishing → **Collaborators**
- Empty state: does not grant app or live data platform access
- Section tag: **Data contract**

### 5. Visual differentiation

Muted uppercase **concept tags** above section titles (no new components):

- Fundamentals → Accountability  
- Governance contacts → Communication & support  
- Data access → Data contract  
- Collaborators modal → Application access  

## Files modified

| File | Changes |
|------|---------|
| `src/lib/uxCopy.ts` | Central copy: collaborators, owner, contacts, data access, readiness, export disclaimer |
| `src/lib/contractValidation.ts` | Owner + PII/contact validation messages |
| `src/lib/publicationReadiness.ts` | Next-step copy |
| `src/components/shared/GovernanceSectionHeader.tsx` | Optional `conceptTag` |
| `src/components/sections/FundamentalsSection.tsx` | Intro, accountability tag, owner helper |
| `src/components/sections/StakeholdersSection.tsx` | Communication tag (copy via uxCopy) |
| `src/components/sections/AccessRolesSection.tsx` | Data contract tag, CTA copy |
| `src/components/ShareModal.tsx` | Collaborators modal |
| `src/components/ContractTopBar.tsx` | Collaborators button, tooltips |
| `src/components/ContractSectionNav.tsx` | Full title tooltip for Contacts nav |
| `src/components/VersionBumpModal.tsx` | Version bump examples |
| `docs/governance-roles-ux-audit.md` | This document |

**Not changed:** `src/types/odcs.ts`, `src/lib/odcsYamlGenerator.ts`, permission logic, `CollaboratorRole` values.

## Impacted flows (manual QA)

1. **Draft contract** — Fundamentals owner helper vs Collaborators modal disclaimer  
2. **Publication readiness** — Owner required message; governance contacts recommendation  
3. **Data access** — Section intro vs Collaborators button  
4. **Read-only / published** — Fundamentals read-only owner helper; compact layouts  
5. **Viewer role** — Banner references collaborators, not members  
6. **Version bump modal** — Major/minor examples use governance contacts / business owner  

## Confirmation

- No automatic sync between collaborators, owner, and contacts  
- No ODCS YAML field renames or export mapping changes  
- `npm run build` — run after changes
