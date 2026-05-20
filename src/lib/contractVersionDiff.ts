import type { DataContract, DataContractSnapshot } from "@/types/odcs";
import {
  buildPublishChangelogFromExportDiff,
  compareExportedSnapshots,
  contractToComparisonSnapshot,
  exportDocumentsEqualIgnoringPublishFields,
  type ExportedContractDiff,
  type FormDiffSection,
} from "./exportedContractDiff";
import {
  compareGovernanceSnapshots,
  type GovernanceSnapshotDiff,
} from "./governanceSnapshotDiff";

export type { ExportedContractDiff, GovernanceSnapshotDiff, FormDiffSection };

export interface ContractVersionComparison {
  exportDiff: ExportedContractDiff;
  governanceDiff: GovernanceSnapshotDiff;
  hasAnyChange: boolean;
  hasExportChange: boolean;
  hasGovernanceChange: boolean;
  summaryLines: string[];
}

export function compareContractVersions(
  left: DataContractSnapshot,
  right: DataContractSnapshot,
): ContractVersionComparison {
  const exportDiff = compareExportedSnapshots(left, right);
  const governanceDiff = compareGovernanceSnapshots(left, right);
  const hasExportChange = !exportDocumentsEqualIgnoringPublishFields(
    left,
    right,
  );
  const hasGovernanceChange = !governanceDiff.identical;
  const hasAnyChange = hasExportChange || hasGovernanceChange;

  const summaryLines = [
    ...(hasExportChange ? exportDiff.summaryLines : []),
    ...(hasGovernanceChange ? governanceDiff.summaryLines : []),
  ];

  return {
    exportDiff,
    governanceDiff,
    hasAnyChange,
    hasExportChange,
    hasGovernanceChange,
    summaryLines,
  };
}

/** True when the contract differs from the last published snapshot (export and/or governance). */
export function hasAnyChangeSinceLastPublish(contract: DataContract): boolean {
  const lastCommit = contract.gitHistory[contract.gitHistory.length - 1];
  if (!lastCommit?.snapshot) return true;

  const current = contractToComparisonSnapshot(contract);
  return compareContractVersions(lastCommit.snapshot, current).hasAnyChange;
}

export function summarizeChangesSince(
  current: DataContract,
  previous: DataContractSnapshot,
): ContractVersionComparison {
  return compareContractVersions(
    previous,
    contractToComparisonSnapshot(current),
  );
}

export function buildWorkingCopySummaryLines(
  comparison: ContractVersionComparison,
): string[] {
  if (!comparison.hasAnyChange) return [];
  return comparison.summaryLines;
}

/** Multiline changelog for publish - never returns empty when hasAnyChange is true. */
export function buildPublishChangelog(
  comparison: ContractVersionComparison,
): string {
  if (!comparison.hasAnyChange) return "";

  const lines: string[] = [];

  if (comparison.hasExportChange) {
    const exportLines = buildPublishChangelogFromExportDiff(
      comparison.exportDiff,
    );
    if (exportLines.length > 0) {
      lines.push(...exportLines);
    } else {
      lines.push(...syntheticExportChangelogLines(comparison.exportDiff));
    }
  }

  if (comparison.hasGovernanceChange) {
    if (comparison.governanceDiff.ownerChanged) {
      lines.push("Updated contract owner");
    }
    if (
      comparison.governanceDiff.stakeholders.added ||
      comparison.governanceDiff.stakeholders.removed ||
      comparison.governanceDiff.stakeholders.updated
    ) {
      lines.push("Updated governance contacts");
    }
  }

  return lines.join("\n");
}

function syntheticExportChangelogLines(diff: ExportedContractDiff): string[] {
  const lines: string[] = [];
  const { schema, roles, sla, customProperties } = diff;

  if (
    schema.added ||
    schema.removed ||
    schema.updated ||
    diff.schemaTables.changed
  ) {
    lines.push("Updated schema");
  }
  if (
    customProperties.added ||
    customProperties.removed ||
    customProperties.updated
  ) {
    lines.push("Updated custom properties");
  }
  if (roles.added || roles.removed || roles.updated) {
    lines.push("Updated data access roles");
  }
  if (sla.added || sla.removed || sla.updated) {
    lines.push("Updated service levels");
  }
  if (diff.summaryLines.some((l) => l.includes("quality"))) {
    lines.push("Updated quality rules");
  }
  if (
    diff.summaryLines.some(
      (l) => l.includes("reference") || l.includes("Reference"),
    )
  ) {
    lines.push("Updated reference links");
  }
  if (diff.summaryLines.some((l) => l.includes("relationship"))) {
    lines.push("Updated relationships");
  }
  if (
    diff.summaryLines.some(
      (l) => l.includes("description") || l.includes("metadata"),
    )
  ) {
    lines.push("Updated exported contract metadata");
  }

  if (lines.length === 0 && !diff.identical) {
    lines.push("Updated exported contract metadata");
  }

  return lines;
}

/**
 * Whether the Versions timeline should show a working-copy row.
 * inRevision always shows a row; draft without history is always shown.
 */
export function hasWorkingCopyDraft(contract: DataContract): boolean {
  if (contract.inRevision) return true;
  if (contract.info.status === "draft") {
    const lastCommit = contract.gitHistory[contract.gitHistory.length - 1];
    if (!lastCommit?.snapshot) return true;
    return hasAnyChangeSinceLastPublish(contract);
  }

  const lastCommit = contract.gitHistory[contract.gitHistory.length - 1];
  if (!lastCommit?.snapshot) return false;
  if (new Date(contract.updatedAt) <= new Date(lastCommit.timestamp))
    return false;

  return hasAnyChangeSinceLastPublish(contract);
}
