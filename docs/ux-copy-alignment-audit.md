# UX copy alignment audit — Data Contract Builder MVP

**Date:** 2026-05-18 (terminology pass)  
**Scope:** Interface language only — no data model, YAML field names, or export mapping changes.

## Vocabulary strategy

| Layer | Principle | Examples |
|-------|-----------|----------|
| **Structural / ODCS** | Keep industry-standard terms users may see in YAML | Schema, Foreign key, Relationship, Service levels, Data contract, ODCS YAML |
| **Governance / business** | Prefer plain language in UI; ODCS term in pills/tooltips when needed | Governance contacts (not vague “Stakeholders”), Reference links (not “Authoritative links”), Contract owner (not “Governance owner”) |
| **Workflow-only** | Say clearly what is not in YAML | Contract owner, governance contacts, members, version history |

**Source of truth for UI strings:** `src/lib/uxCopy.ts`

---

## Audit — changes applied

| Area | Before | After | Rationale |
|------|--------|-------|-----------|
| Nav / section | Stakeholders | **Contacts** (nav) / **Governance contacts** (section title) | Clearer accountability; avoids vague ODCS-adjacent jargon |
| Fundamentals field | Governance owner | **Contract owner** | Matches validation copy; distinct from Publisher role |
| Readiness check | Governance owner defined | **Contract owner defined** | Consistency |
| Readiness check | Stakeholders assigned | **Governance contacts assigned** | Aligns with section rename |
| Metadata label | Authoritative links | **Reference links** | “Authoritative” is opaque; ODCS `authoritativeDefinitions` unchanged in export |
| Quality helper | Natural language quality expectations… | **Describe what good data should look like…** | Less AI/engineering tone |
| Reference helper | (catalog-focused) | Glossary, policies, documentation, catalog pages | Broader, business-readable |
| SLA CTA | Add SLA property | **Add service level** | Matches section name “Service levels” |
| Contacts empty | No stakeholders assigned | **No contacts assigned** | Coherent with section |
| Contacts CTA | Add stakeholder | **Add contact** | Shorter, consistent |
| Export coverage footer | authoritative links, governance owner, stakeholders | **reference links**, **contract owner**, **governance contacts** | Human labels in disclaimers |
| Compare summary | authoritative link(s) | **reference link(s)** | Business-readable changelog |
| Compare summary | SLA property / SLAs | **service level(s)** | Consistent with UI section |
| Changelog lines | Added authoritative link… | **Added reference link…** | Same |
| Changelog lines | Added/Removed SLA property | **service level** | Same |
| Validation | publish an authoritative link | **publish a reference link** | Same |
| Validation | add stakeholders for governance | **add governance contacts** | Same |
| Table relationships intro | Composite foreign keys and many-to-many… | **Multi-column foreign keys and many-to-many links** | Slightly plainer |
| Legacy belongs hint | Single-column relationships | **Single-column links** | Less jargon overload |
| Field/table property tooltips | authoritative links | **reference links** | Parity |

---

## Kept as-is (intentional)

| Term | Why |
|------|-----|
| **Schema** | ODCS-standard; users expect it |
| **Foreign key** / **Composite FK** | Industry-standard; maps to YAML |
| **Fundamentals** | Established section; groups contract identity |
| **Data access** | Distinguishes ODCS roles from Members permissions |
| **Service levels** | Clearer than raw “SLA”; section already renamed |
| **Quality rules** | Understood in governance context; helper text simplified |
| **Publisher / Contributor / Reader** | App permissions; distinct from contract owner |
| **Not in ODCS YAML** pills | Export honesty without hiding ODCS |

---

## ODCS alignment rule (unchanged)

- UI uses human labels (`Reference links`, `Governance contacts`).
- YAML export still uses `authoritativeDefinitions`, `relationships`, `foreignKey`, etc.
- WorkflowMetadataPill and export footers explain what is excluded from ODCS YAML.

---

## Files updated (terminology pass)

- `src/lib/uxCopy.ts` — expanded labels, helpers, changelog constants
- `docs/ux-copy-alignment-audit.md` — this document
- `src/components/ContractSectionNav.tsx`
- `src/components/sections/StakeholdersSection.tsx`
- `src/components/sections/FundamentalsSection.tsx`
- `src/components/shared/FundamentalsReadOnlyView.tsx`
- `src/components/shared/MetadataModalReadOnly.tsx`
- `src/components/shared/AuthoritativeLinkReadOnly.tsx`
- `src/components/schema/ColumnAdvancedDialog.tsx`
- `src/components/schema/TableAdvancedDialog.tsx`
- `src/components/schema/TableBlock.tsx`
- `src/components/sections/SlaSection.tsx`
- `src/lib/exportedContractDiff.ts`
- `src/lib/metadataExportDiff.ts`
- `src/lib/contractValidation.ts`
- `src/lib/publicationReadiness.ts`

---

## Remaining recommendations (future)

- Glossary drawer: UI label → ODCS YAML path (e.g. Reference links → `authoritativeDefinitions`)
- French UI strings per README
- Inline tooltip on “Reference links” mentioning ODCS field name for power users

---

## Success criteria

- [x] Terminology consistent across nav, modals, validation, compare/changelog
- [x] ODCS concepts recognizable where structural (schema, FK, YAML)
- [x] Business-facing sections use plainer language
- [x] No YAML / type / export mapping changes
- [x] `npm run build` passes
