import type { SectionId } from "@/types/odcs";

/** Sections that never show sidebar progress cues (even when the contract is editable). */
export const SECTIONS_WITHOUT_NAV_PROGRESS_CUE: readonly SectionId[] = [
  "versions",
];

/**
 * Whether the sidebar should render complete/incomplete/empty progress cues.
 * Read-only contracts and Versions never show progression semantics.
 */
export function shouldShowSectionNavProgressCue(
  sectionId: SectionId,
  isContractEditable: boolean,
): boolean {
  if (!isContractEditable) return false;
  return !SECTIONS_WITHOUT_NAV_PROGRESS_CUE.includes(sectionId);
}
