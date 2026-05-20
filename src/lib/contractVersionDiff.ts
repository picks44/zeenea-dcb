import type { DataContract, DataContractSnapshot } from "@/types/odcs";
import {
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
import {
  buildFirstPublishChangelog,
  buildSubsequentPublishChangelog,
  buildWorkingCopySummaryFromComparison,
  getPublishChangeKind,
  type PublishChangeKind,
} from "./publishChangelog";

export type { ExportedContractDiff, GovernanceSnapshotDiff, FormDiffSection };
export type { PublishChangeKind };
export { buildFirstPublishChangelog, getPublishChangeKind } from "./publishChangelog";

export interface ContractVersionComparison {
  exportDiff: ExportedContractDiff;
  governanceDiff: GovernanceSnapshotDiff;
  hasAnyChange: boolean;
  hasExportChange: boolean;
  hasGovernanceChange: boolean;
  /** @deprecated Prefer buildWorkingCopySummaryLines for display-aligned copy. */
  summaryLines: string[];
  previousSnapshot: DataContractSnapshot;
  currentSnapshot: DataContractSnapshot;
  publishChangeKind: PublishChangeKind;
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

  const summaryLines = buildWorkingCopySummaryFromComparison(
    exportDiff,
    governanceDiff,
    hasExportChange,
    hasGovernanceChange,
    left,
    right,
  );

  return {
    exportDiff,
    governanceDiff,
    hasAnyChange,
    hasExportChange,
    hasGovernanceChange,
    summaryLines,
    previousSnapshot: left,
    currentSnapshot: right,
    publishChangeKind: getPublishChangeKind(
      hasExportChange,
      hasGovernanceChange,
    ),
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

/** Default changelog for the publish modal (first publish or since last snapshot). */
export function buildDefaultPublishChangelog(contract: DataContract): string {
  if (contract.gitHistory.length === 0) {
    return buildFirstPublishChangelog(contract);
  }
  const lastCommit = contract.gitHistory[contract.gitHistory.length - 1];
  if (!lastCommit?.snapshot) {
    return buildFirstPublishChangelog(contract);
  }
  const comparison = summarizeChangesSince(contract, lastCommit.snapshot);
  return buildPublishChangelog(comparison);
}

/** Multiline changelog for publish - never returns empty when hasAnyChange is true. */
export function buildPublishChangelog(
  comparison: ContractVersionComparison,
): string {
  if (!comparison.hasAnyChange) return "";

  return buildSubsequentPublishChangelog(
    comparison.previousSnapshot,
    comparison.currentSnapshot,
    comparison.exportDiff,
    comparison.governanceDiff,
    comparison.hasExportChange,
    comparison.hasGovernanceChange,
  );
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
