import { cn } from "@/lib/utils";
import {
  qualityRuleFieldLabelClass,
  qualityRuleListShellClass,
  qualityRuleRemoveButtonClass,
  qualityRuleRowClass,
  qualityRuleRowCompactClass,
} from "@/components/shared/qualityRuleUx";

/** Shared list shell - same rhythm as quality rules metadata rows. */
export const authoritativeLinkListShellClass = qualityRuleListShellClass;

export const authoritativeLinkRowClass = qualityRuleRowClass;

export const authoritativeLinkRowCompactClass = qualityRuleRowCompactClass;

export const authoritativeLinkFieldLabelClass = qualityRuleFieldLabelClass;

export const authoritativeLinkRemoveButtonClass = qualityRuleRemoveButtonClass;

export const authoritativeLinkInputClass = "h-7 text-xs";

export const authoritativeLinkSelectTriggerClass = "h-7 text-xs";

export const authoritativeLinkTextareaClass = (compact?: boolean) =>
  cn("text-xs resize-y w-full", compact ? "min-h-[56px]" : "min-h-[64px]");
