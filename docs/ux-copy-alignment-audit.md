# UX copy alignment audit — Data Contract Builder MVP

**Date:** 2026-05-18  
**Scope:** Terminology and microcopy only (no layout or feature changes).

## Terminology decisions

| Concept | UI label | Exported to ODCS YAML? |
|--------|----------|------------------------|
| Contract identity (id, name, version, domain, status, tags) | Fundamentals | Partial (not lifecycle `status` semantics in all tools) |
| Description (purpose, usage, limitations, auth links) | Fundamentals → Additional context | Yes (`description.*`) |
| Schema (tables, fields, relationships) | Schema | Yes (`schema`, `properties`) |
| Data access roles | Data access | Yes (`roles`) |
| Service levels | Service levels | Yes (`slaProperties`) |
| Contract owner | Fundamentals → **Contract owner** | **No** — workflow metadata |
| Stakeholders | Stakeholders | **No** — collaboration metadata |
| Members (publisher / contributor / reader) | Members (toolbar) | **No** — editing and publishing permissions |
| Version history / publish | Versions | **No** — simulated workflow |
| Lifecycle (draft / active / deprecated) | Status badge | Partial (`status` in YAML; revision state is app-only) |

**Application name:** Use **Data Contract Builder** when referring to the product. Avoid **Studio**.

**Shared copy module:** `src/lib/uxCopy.ts` — single source for export disclaimers and repeated helpers.

## Replaced wording (summary)

| Before | After |
|--------|--------|
| Studio owner… | Contract owner — governance accountability and publish eligibility in Data Contract Builder |
| Studio-only: owner, stakeholders… | Workflow metadata (not in YAML): contract owner, stakeholders, members, version history |
| Studio collaboration metadata | Collaboration metadata for governance contact |
| Studio edit access only | Members control editing access in Data Contract Builder. Separate from ODCS data access roles |
| To manage who can edit… in Studio | To manage who can edit… use Members in the toolbar |
| Only owners can publish | Only members with the Publisher role can publish |
| Members role: Contract owner | **Publisher** (app permission; internal role value remains `owner`) |
| Not exported (ambiguous) | **Not in YAML** (relationship badges) |
| not exported to YAML | **not exported to ODCS YAML** (validation and disclaimers) |
| not AI-verified | Removed from quality copy; focus on NL + type text export |
| Zeenea catalog reference (no picker) | External catalog reference. No integrated catalog picker in this MVP |

## Export honesty rules

1. Any field **not** in `buildOdcsDocument()` must say **not exported to ODCS YAML** (or **not in YAML** for compact badges).
2. Export coverage appears in:
   - Contract Health → Export YAML footer
   - YAML tab header area
3. Distinguish **ODCS data access roles** (exported) from **Members** (editing permissions, not exported).
4. Distinguish **Contract owner** (Fundamentals — governance accountability) from **Publisher** (Members — workflow permission to publish). Internal `CollaboratorRole` value `owner` is unchanged.

## Collaboration vs ODCS distinctions

- **Members:** Who can edit and publish in Data Contract Builder (**Publisher** / **Contributor** / **Reader**). Separate from ODCS data access roles.
- **Contract owner (Fundamentals):** Business governance accountability; required field for publish readiness; not in YAML.
- **Publisher (Members):** Workflow permission to edit, manage versions, and publish (`myRole === 'owner'`).
- **Stakeholders:** Governance contacts (name, role, email, team); recommended for PII; not in YAML.
- **Data access roles:** ODCS `roles[]` for consumers of the published data product.

## Files updated

- `src/lib/uxCopy.ts` (new)
- `src/components/sections/FundamentalsSection.tsx`
- `src/components/sections/StakeholdersSection.tsx`
- `src/components/sections/AccessRolesSection.tsx`
- `src/components/sections/ImportSection.tsx`
- `src/components/sections/SchemaSection.tsx`
- `src/components/sections/SlaSection.tsx`
- `src/components/ReadinessPanel.tsx`
- `src/components/YamlView.tsx`
- `src/components/ShareModal.tsx`
- `src/components/ContractTopBar.tsx`
- `src/components/VersionsView.tsx`
- `src/components/schema/TableBlock.tsx`
- `src/components/shared/QualityRulesEditor.tsx`
- `src/components/shared/AuthoritativeDefinitionsEditor.tsx`
- `src/lib/contractValidation.ts`
- `src/App.tsx`

## Remaining ambiguous areas

| Area | Note |
|------|------|
| **Contract owner vs Publisher** | Resolved: Fundamentals = governance; Members = Publisher / Contributor / Reader |
| **`status` in YAML** | Exported as ODCS field; `inRevision` and UI lifecycle nuances are application state |
| **Simulated Git** | Push/publish copy still references Git metaphor; not claiming real Git integration |
| **Zeenea** | Removed from primary auth-def helper; may remain in seed data / branding elsewhere |
| **English-only UI** | README is bilingual; product strings are English |

## Future recommendations (out of scope)

- Glossary panel linking UI labels → ODCS YAML paths
- French UI strings aligned with README
- Explicit “ODCS contract metadata” vs “Workflow metadata” section headers in Contract Health
- Tooltips on Fundamentals tags clarifying they are exported at contract root
- Rename internal `owner` field to `contractOwner` in model (breaking; not done)

## Success criteria check

- [x] No “Studio” / “Studio-only” in user-facing copy
- [x] Export vs workflow metadata explicit in Fundamentals, Stakeholders, Members, YAML/Health
- [x] ODCS YAML named consistently (not generic “YAML” alone where export scope matters)
- [x] Enterprise tone: neutral, concise, non-marketing
- [x] No new ODCS scope or layout changes
