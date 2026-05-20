import type { DataContract, DataContractSnapshot } from "@/types/odcs";
import { isRoleRowExportable, slaRowHasContent } from "@/lib/p1Validation";
import type { ExportedContractDiff, FormDiffRow } from "./exportedContractDiff";
import {
  buildGroupedSchemaChangelogBullets,
  buildPublishChangelogFromExportDiff,
  flattenSchemaPropertyKeys,
} from "./exportedContractDiff";
import type { GovernanceSnapshotDiff } from "./governanceSnapshotDiff";

const MAX_CHANGELOG_LINES = 12;
const MAX_BULLETS_AFTER_HEADLINE = 10;

export type PublishChangeKind =
  | "export_only"
  | "governance_only"
  | "mixed"
  | null;

export function getPublishChangeKind(
  hasExportChange: boolean,
  hasGovernanceChange: boolean,
): PublishChangeKind {
  if (!hasExportChange && !hasGovernanceChange) return null;
  if (hasExportChange && hasGovernanceChange) return "mixed";
  if (hasGovernanceChange) return "governance_only";
  return "export_only";
}

function tableLabel(table: { physicalName?: string; quantumName?: string; name?: string }): string {
  return (table.physicalName ?? table.quantumName ?? table.name ?? "table").trim();
}

function countExportableRoles(contract: DataContract): number {
  return (contract.roles ?? []).filter(isRoleRowExportable).length;
}

function countExportableSla(contract: DataContract): number {
  return (contract.slaProperties ?? []).filter(slaRowHasContent).length;
}

function countFilledCustomProperties(contract: DataContract): number {
  return (contract.customProperties ?? []).filter((cp) =>
    Boolean(cp.property?.trim()),
  ).length;
}

/** First publication changelog from current contract content (no snapshot diff). */
export function buildFirstPublishChangelog(contract: DataContract): string {
  const title = contract.info.title.trim() || contract.id || "this contract";
  const version = contract.info.version;
  const tableCount = contract.dataset.length;
  const fieldCount = contract.dataset.reduce((a, t) => a + t.columns.length, 0);
  const tableNames = contract.dataset.map(tableLabel).filter(Boolean);
  const shownTables = tableNames.slice(0, 3);
  const extraTables = tableCount - shownTables.length;

  const lines: string[] = [];
  lines.push(`Initial publication of ${title} (v${version}).`);

  if (contract.creationSource === "import" && tableCount > 0) {
    const namesPart = shownTables.join(", ");
    const morePart = extraTables > 0 ? ` (+${extraTables} more)` : "";
    lines.push(
      `Schema imported from DDL: ${namesPart}${morePart} (${fieldCount} field${fieldCount === 1 ? "" : "s"}).`,
    );
  } else if (tableCount > 0) {
    const namesSuffix =
      shownTables.length > 0
        ? ` (${shownTables.join(", ")}${extraTables > 0 ? `, +${extraTables} more` : ""})`
        : "";
    lines.push(
      `Schema: ${tableCount} table${tableCount === 1 ? "" : "s"}, ${fieldCount} field${fieldCount === 1 ? "" : "s"}${namesSuffix}.`,
    );
  } else {
    lines.push("Manual draft published with no schema tables yet.");
  }

  if (contract.info.domain?.trim()) {
    lines.push(`Domain: ${contract.info.domain.trim()}.`);
  }
  if (contract.info.owner?.trim()) {
    lines.push(`Contract owner: ${contract.info.owner.trim()}.`);
  }

  const roleCount = countExportableRoles(contract);
  if (roleCount > 0) {
    lines.push(
      `${roleCount} data access role${roleCount === 1 ? "" : "s"} included in the export.`,
    );
  }
  const slaCount = countExportableSla(contract);
  if (slaCount > 0) {
    lines.push(
      `${slaCount} service level${slaCount === 1 ? "" : "s"} included in the export.`,
    );
  }
  const cpCount = countFilledCustomProperties(contract);
  if (cpCount > 0) {
    lines.push(
      `${cpCount} custom propert${cpCount === 1 ? "y" : "ies"} included in the export.`,
    );
  }

  return capChangelogLines(lines).join("\n");
}

function buildPublishHeadline(
  kind: PublishChangeKind,
  exportDiff: ExportedContractDiff,
): string {
  const breaking =
    exportDiff.schema.removed > 0 ||
    exportDiff.formSections.some(
      (s) =>
        s.id === "schema" &&
        s.rows.some((r) => r.kind === "removed"),
    );

  switch (kind) {
    case "governance_only":
      return "Governance-only update.";
    case "export_only":
      return breaking
        ? "Breaking update: exported contract changes."
        : "Minor update: exported contract changes.";
    case "mixed":
      return breaking
        ? "Breaking update: exported contract and governance changes."
        : "Update: exported contract and governance changes.";
    default:
      return "Contract update.";
  }
}

function buildGovernanceBullets(diff: GovernanceSnapshotDiff): string[] {
  const lines: string[] = [];
  if (diff.ownerChanged) lines.push("Updated contract owner.");
  const { stakeholders } = diff;
  if (
    stakeholders.added > 0 ||
    stakeholders.removed > 0 ||
    stakeholders.updated > 0
  ) {
    lines.push("Governance contacts updated.");
  }
  return lines;
}

function buildNonSchemaExportBullets(
  diff: ExportedContractDiff,
  previous: DataContractSnapshot,
  current: DataContractSnapshot,
): string[] {
  const schemaKeys = new Set([
    ...flattenSchemaPropertyKeys(previous),
    ...flattenSchemaPropertyKeys(current),
  ]);
  const detailLines = buildPublishChangelogFromExportDiff(diff).filter(
    (line) => {
      if (!line) return false;
      for (const key of schemaKeys) {
        const col = key.includes(".") ? key.split(".").pop()! : key;
        if (line.includes(col) && /field/i.test(line)) return false;
      }
      return true;
    },
  );

  const lines: string[] = [];
  const { customProperties, roles, sla } = diff;

  if (customProperties.added) {
    lines.push(
      `Added ${customProperties.added} custom propert${customProperties.added === 1 ? "y" : "ies"} to the export.`,
    );
  }
  if (customProperties.removed) {
    lines.push(
      `Removed ${customProperties.removed} custom propert${customProperties.removed === 1 ? "y" : "ies"} from the export.`,
    );
  }
  if (customProperties.updated) {
    const cpRows = diff.formSections.find((s) => s.id === "customProperties")?.rows ?? [];
    for (const row of cpRows.filter((r) => r.kind === "modified").slice(0, 3)) {
      lines.push(`Updated custom property ${row.label}.`);
    }
    if (customProperties.updated > cpRows.filter((r) => r.kind === "modified").length) {
      lines.push("Additional custom properties updated in the export.");
    }
  }

  if (roles.added || roles.removed || roles.updated) {
    lines.push("Data access roles updated in the export.");
  }
  if (sla.added || sla.removed || sla.updated) {
    lines.push("Service levels updated in the export.");
  }

  const metadataRows =
    diff.formSections.find((s) => s.id === "metadata")?.rows ?? [];
  for (const row of metadataRows) {
    const line = metadataChangelogLine(row);
    if (line) lines.push(line);
  }

  for (const section of diff.formSections) {
    if (
      section.id === "schema" ||
      section.id === "metadata" ||
      section.id === "customProperties" ||
      section.id === "roles" ||
      section.id === "sla"
    ) {
      continue;
    }
    for (const row of section.rows.slice(0, 2)) {
      const line = sectionChangelogLine(section.id, row);
      if (line && !lines.includes(line)) lines.push(line);
    }
  }

  if (lines.length === 0 && detailLines.length > 0) {
    return detailLines.slice(0, 4);
  }

  if (
    lines.length === 0 &&
    !diff.identical &&
    diff.summaryLines.some((l) => l.includes("metadata"))
  ) {
    lines.push("Contract metadata updated in the export.");
  }

  return lines;
}

function metadataChangelogLine(row: FormDiffRow): string {
  switch (row.label) {
    case "Purpose":
      return "Updated contract purpose in the export.";
    case "Usage":
      return "Updated contract usage in the export.";
    case "Limitations":
      return "Updated contract limitations in the export.";
    case "Tags":
      return "Updated contract tags in the export.";
    case "Domain":
      return `Updated domain to ${row.right} in the export.`;
    case "Title":
      return "Updated contract title in the export.";
    case "Contract ID":
      return "Updated contract ID in the export.";
    default:
      return row.label ? `Updated ${row.label} in the export.` : "";
  }
}

function sectionChangelogLine(sectionId: string, row: FormDiffRow): string {
  if (sectionId === "quality") {
    return row.kind === "added"
      ? `Added quality rule on ${row.label}.`
      : row.kind === "removed"
        ? `Removed quality rule from ${row.label}.`
        : `Updated quality rule on ${row.label}.`;
  }
  if (sectionId === "authLinks") {
    return row.kind === "added"
      ? `Added reference link on ${row.label}.`
      : row.kind === "removed"
        ? `Removed reference link from ${row.label}.`
        : `Updated reference link on ${row.label}.`;
  }
  if (sectionId === "relationships") {
    return row.kind === "added"
      ? `Added relationship on ${row.label}.`
      : row.kind === "removed"
        ? `Removed relationship from ${row.label}.`
        : `Updated relationship on ${row.label}.`;
  }
  return "";
}

function syntheticExportBullets(diff: ExportedContractDiff): string[] {
  const lines: string[] = [];
  const { schema, roles, sla, customProperties } = diff;

  if (
    schema.added ||
    schema.removed ||
    schema.updated ||
    diff.schemaTables.changed
  ) {
    lines.push("Schema updated in the export.");
  }
  if (
    customProperties.added ||
    customProperties.removed ||
    customProperties.updated
  ) {
    lines.push("Custom properties updated in the export.");
  }
  if (roles.added || roles.removed || roles.updated) {
    lines.push("Data access roles updated in the export.");
  }
  if (sla.added || sla.removed || sla.updated) {
    lines.push("Service levels updated in the export.");
  }
  if (diff.summaryLines.some((l) => l.includes("quality"))) {
    lines.push("Quality rules updated in the export.");
  }
  if (
    diff.summaryLines.some(
      (l) => l.includes("reference") || l.includes("Reference"),
    )
  ) {
    lines.push("Reference links updated in the export.");
  }
  if (diff.summaryLines.some((l) => l.includes("relationship"))) {
    lines.push("Relationships updated in the export.");
  }
  if (
    diff.summaryLines.some(
      (l) => l.includes("description") || l.includes("metadata"),
    )
  ) {
    lines.push("Contract metadata updated in the export.");
  }
  if (lines.length === 0 && !diff.identical) {
    lines.push("Exported contract content updated.");
  }
  return lines;
}

function capChangelogLines(lines: string[]): string[] {
  if (lines.length <= MAX_CHANGELOG_LINES) return lines;
  const kept = lines.slice(0, MAX_CHANGELOG_LINES - 1);
  kept.push(
    `… and ${lines.length - (MAX_CHANGELOG_LINES - 1)} more change${lines.length - MAX_CHANGELOG_LINES + 1 === 1 ? "" : "s"} (see Compare).`,
  );
  return kept;
}

/** Multiline changelog for publish after a prior snapshot — never empty when hasAnyChange. */
export function buildSubsequentPublishChangelog(
  previous: DataContractSnapshot,
  current: DataContractSnapshot,
  exportDiff: ExportedContractDiff,
  governanceDiff: GovernanceSnapshotDiff,
  hasExportChange: boolean,
  hasGovernanceChange: boolean,
): string {
  if (!hasExportChange && !hasGovernanceChange) return "";

  const kind = getPublishChangeKind(hasExportChange, hasGovernanceChange);
  const headline = buildPublishHeadline(kind, exportDiff);
  const bullets: string[] = [];

  if (hasExportChange) {
    const schemaBullets = buildGroupedSchemaChangelogBullets(previous, current);
    const otherBullets = buildNonSchemaExportBullets(
      exportDiff,
      previous,
      current,
    );
    if (schemaBullets.length > 0) {
      bullets.push(...schemaBullets);
    } else if (
      exportDiff.schema.added ||
      exportDiff.schema.removed ||
      exportDiff.schema.updated ||
      exportDiff.schemaTables.changed
    ) {
      bullets.push(...syntheticExportBullets(exportDiff));
    } else if (otherBullets.length === 0) {
      bullets.push(...syntheticExportBullets(exportDiff));
    }
    for (const line of otherBullets) {
      if (!bullets.includes(line)) bullets.push(line);
    }
  }

  if (hasGovernanceChange) {
    bullets.push(...buildGovernanceBullets(governanceDiff));
  }

  const trimmedBullets = bullets.slice(0, MAX_BULLETS_AFTER_HEADLINE);
  const lines = [headline, ...trimmedBullets];
  if (bullets.length > MAX_BULLETS_AFTER_HEADLINE) {
    lines.push(
      `… and ${bullets.length - MAX_BULLETS_AFTER_HEADLINE} more change${bullets.length - MAX_BULLETS_AFTER_HEADLINE === 1 ? "" : "s"} (see Compare).`,
    );
  }

  return capChangelogLines(lines).join("\n");
}

/** Short summary lines for Working copy (aligned vocabulary, no headline). */
export function buildWorkingCopySummaryFromComparison(
  exportDiff: ExportedContractDiff,
  governanceDiff: GovernanceSnapshotDiff,
  hasExportChange: boolean,
  hasGovernanceChange: boolean,
  previous: DataContractSnapshot,
  current: DataContractSnapshot,
): string[] {
  if (!hasExportChange && !hasGovernanceChange) return [];

  const bullets: string[] = [];
  if (hasExportChange) {
    const schemaBullets = buildGroupedSchemaChangelogBullets(previous, current);
    if (schemaBullets.length > 0) {
      bullets.push(...schemaBullets.slice(0, 3));
    } else if (exportDiff.summaryLines.length > 0) {
      bullets.push(
        ...exportDiff.summaryLines.slice(0, 3).map((l) => `${l} in the export`),
      );
    } else {
      bullets.push("Exported contract changes pending");
    }
  }
  if (hasGovernanceChange) {
    bullets.push(...buildGovernanceBullets(governanceDiff));
  }
  return bullets.slice(0, 4);
}
