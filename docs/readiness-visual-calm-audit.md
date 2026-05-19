# Publication readiness — visual calm pass

**Date:** 2026-05-18  
**Scope:** Visual hierarchy and progressive emphasis only. No change to readiness logic, validation rules, navigation targets, or ODCS export.

## Problem (before)

Multiple orange signals stacked at once on an empty draft:

- Nav label text turned orange
- Section banners (card + border + icon)
- Field borders/backgrounds on every missing required field
- Orange helpers under every field
- Readiness panel rows styled like errors
- Validation block always visible in panel

**Perceived effect:** the form looked broken before the user did anything wrong.

## UX model (after) — 3 levels

| Level | Trigger | Form | Nav | Readiness panel |
|-------|---------|------|-----|-----------------|
| **1 — Draft** | Default editable draft | Normal inputs; muted “Required” on missing fields only | Icon/badge only; neutral labels | Neutral checklist; grey incomplete dots |
| **2 — Guided** | Click item in panel → navigate | Blue spotlight flash on label/focal target only (~1.2s); no orange, no helper | Unchanged | Click-to-scroll preserved |
| **3 — Blocking publish** | Click **Publish** (enabled or disabled) | Orange emphasis + helpers on **all** missing required fields | Unchanged | Warmer status line; “Details to fix” section appears |

## What was lightened

| Element | Before | After |
|---------|--------|-------|
| `GuidanceField` | Permanent orange border/bg/helper | Muted “Required” badge only; emphasis on focus or publish attempt |
| Section banners | Orange bordered cards | **Removed** (nav + panel sufficient) |
| Nav section labels | Orange text when incomplete | Neutral text; color in icon/count only |
| Nav incomplete icon | Bright `#d27b00` | Softer `#b8956a` / grey count |
| Readiness required rows | Orange icons/text/hover | Grey/neutral; soft hover |
| Panel status (not ready) | Always orange | Grey until publish attempted |
| Validation details block | Always visible | Only after publish attempt |
| PII callout in panel | Orange card | Neutral border/card |
| Schema empty state | Orange when empty | Normal dashed border; orange only on emphasis |

## Files modified

- `src/components/readiness/ReadinessNavigationContext.tsx` — `publishAttempted`, `focusedFieldId`, `markPublishAttempted`
- `src/components/readiness/GuidanceField.tsx` — progressive emphasis
- `src/components/readiness/SectionGuidanceBanner.tsx` — inline hint only (banners removed from sections)
- `src/components/ContractSectionNav.tsx` — calmer nav
- `src/components/ContractTopBar.tsx` — publish click → `markPublishAttempted`
- `src/components/ReadinessPanel.tsx` — calmer checklist + conditional validation block
- `src/components/sections/FundamentalsSection.tsx` — no section banner
- `src/components/sections/SchemaSection.tsx` — progressive schema empty state
- `src/components/sections/StakeholdersSection.tsx` — no section banner

**Unchanged:** `readinessGuidance.ts`, `contractValidation.ts`, `publicationReadiness.ts` scoring/rules, `schema-nav-flash` animation (already blue).

## Recommended screenshots

1. **Empty draft** — form looks normal; panel shows neutral checklist; nav shows soft icons  
2. **After panel click** — single field flash + brief orange highlight  
3. **After Publish click (blocked)** — missing fields emphasized; panel “Details to fix”  
4. **Published read-only** — no guidance provider signals  

## Build

Run `npm run build` after changes.

---

## Balance pass (2026-05-18)

**Problem:** Calm pass made required fields too invisible; panel too verbose; Improve mappings wrong.

### Required fields — intermediate draft scan

| State | Visual |
|-------|--------|
| Draft, missing | Warm grey border `#e4e2dc`, bg `#fafaf8`, semibold label, pill badge **Required** |
| Draft, suggested (recommended) | Lighter border, badge **Suggested** |
| Guided / publish emphasis | Orange border/bg + short helper (unchanged 3-level model) |

### Panel simplifications

- Rows: **label only** (no multiline `missingHelper` under each item)
- Shorter validation copy (e.g. owner → “Business owner required before publishing.”)
- Tighter padding (`px-3 py-2.5`)
- “Details to fix” still only after Publish click
- Field quality: compact link to first undocumented column

### Improve your contract — navigation targets

| Item | Target anchor |
|------|----------------|
| Domain | `contract-domain` |
| Business purpose | `contract-purpose` |
| Governance contacts | `stakeholders-root` |
| Field descriptions | `schema-field-{table}-{col}` (first undocumented) |
| Reference links | `fundamentals-ref-links` (+ opens Additional context) |

### New / updated files

- `src/lib/readinessAnchors.ts`
- `src/components/readiness/SchemaColumnReadinessAnchor.tsx`
- `src/lib/readinessGuidance.ts` (mappings + dynamic improve items)
- `GuidanceField.tsx`, `ReadinessPanel.tsx`, `FundamentalsSection.tsx`, `SchemaSection.tsx`, `StakeholdersSection.tsx`, `TableBlock.tsx`
