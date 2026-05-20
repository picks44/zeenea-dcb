import { describe, expect, it } from "vitest";
import {
  SECTIONS_WITHOUT_NAV_PROGRESS_CUE,
  shouldShowSectionNavProgressCue,
} from "@/lib/sectionNavCues";

describe("shouldShowSectionNavProgressCue", () => {
  it("hides all cues when contract is read-only", () => {
    expect(shouldShowSectionNavProgressCue("fundamentals", false)).toBe(false);
    expect(shouldShowSectionNavProgressCue("custom", false)).toBe(false);
    expect(shouldShowSectionNavProgressCue("schema", false)).toBe(false);
  });

  it("never shows cues for Versions even when editable", () => {
    expect(shouldShowSectionNavProgressCue("versions", true)).toBe(false);
    expect(SECTIONS_WITHOUT_NAV_PROGRESS_CUE).toContain("versions");
  });

  it("shows cues for editable contract sections except Versions", () => {
    expect(shouldShowSectionNavProgressCue("fundamentals", true)).toBe(true);
    expect(shouldShowSectionNavProgressCue("custom", true)).toBe(true);
    expect(shouldShowSectionNavProgressCue("sla", true)).toBe(true);
    expect(shouldShowSectionNavProgressCue("versions", true)).toBe(false);
  });
});
