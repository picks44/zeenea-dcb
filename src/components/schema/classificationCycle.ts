import type { ClassificationValue } from "@/lib/p1Constants";

/** UI cycle order: none → public → restricted → confidential → none */
export function cycleClassification(
  current?: ClassificationValue,
): ClassificationValue | undefined {
  if (!current) return "public";
  if (current === "public") return "restricted";
  if (current === "restricted") return "confidential";
  return undefined;
}

export function classificationShortLabel(value?: ClassificationValue): string {
  if (!value) return "-";
  if (value === "public") return "PUB";
  if (value === "restricted") return "RES";
  return "CONF";
}

export function classificationTooltip(value?: ClassificationValue): string {
  return `Classification: ${value ?? "none"}`;
}

/** Standalone icon button styles (separate from PK/REQ flag segment). */
export function classificationIconButtonClass(
  value: ClassificationValue | undefined,
  disabled: boolean,
): string {
  if (disabled) {
    return "border-neutral-200 bg-transparent text-neutral-300";
  }
  if (!value) {
    return "border-neutral-200 bg-neutral-25 text-neutral-300 hover:border-neutral-300 hover:text-neutral-400";
  }
  if (value === "public") {
    return "border-cyan-100 bg-blue-50 text-cyan-700 hover:border-cyan-200";
  }
  if (value === "restricted") {
    return "border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-200";
  }
  return "border-red-100 bg-red-25 text-red-700 hover:border-red-200";
}
