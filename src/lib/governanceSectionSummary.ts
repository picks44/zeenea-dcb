import type { CustomProperty } from "@/types/odcsShared";
import type { OdcsAccessRole, SlaProperty, Stakeholder } from "@/types/odcs";
import { countAssignedStakeholders } from "@/lib/stakeholders";
import {
  customPropertyRowHasContent,
  isRoleRowExportable,
  isSlaRowExportable,
  isValidCustomPropertyName,
  roleRowHasContent,
  slaRowHasContent,
} from "@/lib/p1Validation";

/** Rows included in ODCS YAML (`customProperties`). */
export function isCustomPropertyExportable(row: CustomProperty): boolean {
  return Boolean(row.property?.trim() && row.value?.trim());
}

/** Row has user content but is not exportable or not publishable as-is. */
export function isCustomPropertyRowIncomplete(row: CustomProperty): boolean {
  if (!customPropertyRowHasContent(row)) return false;
  if (!isCustomPropertyExportable(row)) return true;
  return !isValidCustomPropertyName(row.property);
}

export function isAccessRoleRowIncomplete(row: OdcsAccessRole): boolean {
  return roleRowHasContent(row) && !isRoleRowExportable(row);
}

export function isSlaRowIncomplete(row: SlaProperty): boolean {
  return slaRowHasContent(row) && !isSlaRowExportable(row);
}

export interface StakeholdersSectionSummary {
  saved: number;
  counted: number;
}

export function summarizeStakeholders(
  stakeholders: Stakeholder[] | undefined,
): StakeholdersSectionSummary {
  const rows = stakeholders ?? [];
  return {
    saved: rows.length,
    counted: countAssignedStakeholders(rows),
  };
}

export interface AccessRolesSectionSummary {
  saved: number;
  includedInYaml: number;
  incomplete: number;
}

export function summarizeAccessRoles(
  roles: OdcsAccessRole[] | undefined,
): AccessRolesSectionSummary {
  const rows = roles ?? [];
  let includedInYaml = 0;
  let incomplete = 0;
  for (const row of rows) {
    if (isRoleRowExportable(row)) includedInYaml++;
    else if (isAccessRoleRowIncomplete(row)) incomplete++;
  }
  return { saved: rows.length, includedInYaml, incomplete };
}

export interface SlaSectionSummary {
  saved: number;
  includedInYaml: number;
  incomplete: number;
}

export function summarizeSlaProperties(
  slaProperties: SlaProperty[] | undefined,
): SlaSectionSummary {
  const rows = slaProperties ?? [];
  let includedInYaml = 0;
  let incomplete = 0;
  for (const row of rows) {
    if (isSlaRowExportable(row)) includedInYaml++;
    else if (isSlaRowIncomplete(row)) incomplete++;
  }
  return { saved: rows.length, includedInYaml, incomplete };
}

export function countExportableSlaProperties(
  slaProperties: SlaProperty[] | undefined,
): number {
  return summarizeSlaProperties(slaProperties).includedInYaml;
}

export interface CustomPropertiesSectionSummary {
  saved: number;
  includedInYaml: number;
  incomplete: number;
}

export function summarizeCustomProperties(
  properties: CustomProperty[] | undefined,
): CustomPropertiesSectionSummary {
  const rows = properties ?? [];
  let includedInYaml = 0;
  let incomplete = 0;
  for (const row of rows) {
    if (isCustomPropertyExportable(row) && isValidCustomPropertyName(row.property)) {
      includedInYaml++;
    } else if (isCustomPropertyRowIncomplete(row)) {
      incomplete++;
    }
  }
  return { saved: rows.length, includedInYaml, incomplete };
}

/** Custom properties included in ODCS YAML (property + value, valid camelCase). */
export function countExportableCustomProperties(
  properties: CustomProperty[] | undefined,
): number {
  return summarizeCustomProperties(properties).includedInYaml;
}
