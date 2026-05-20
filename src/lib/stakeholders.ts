import type { Stakeholder } from "@/types/odcs";

/** Stakeholders with a non-empty name - same rule as the Stakeholders section list. */
export function countAssignedStakeholders(
  stakeholders: Stakeholder[] | undefined,
): number {
  return (stakeholders ?? []).filter((s) => Boolean(s.name?.trim())).length;
}
