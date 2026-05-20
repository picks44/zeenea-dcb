import { describe, expect, it } from "vitest";
import {
  classificationIconButtonClass,
  classificationShortLabel,
  classificationTooltip,
  cycleClassification,
} from "@/components/schema/classificationCycle";

describe("classificationCycle", () => {
  it("cycles none → public → restricted → confidential → none", () => {
    expect(cycleClassification(undefined)).toBe("public");
    expect(cycleClassification("public")).toBe("restricted");
    expect(cycleClassification("restricted")).toBe("confidential");
    expect(cycleClassification("confidential")).toBeUndefined();
    expect(cycleClassification(undefined)).toBe("public");
  });

  it("maps short labels and tooltips", () => {
    expect(classificationShortLabel(undefined)).toBe("-");
    expect(classificationShortLabel("public")).toBe("PUB");
    expect(classificationShortLabel("restricted")).toBe("RES");
    expect(classificationShortLabel("confidential")).toBe("CONF");
    expect(classificationTooltip("restricted")).toBe(
      "Classification: restricted",
    );
    expect(classificationTooltip(undefined)).toBe("Classification: none");
  });

  it("maps icon button classes per state", () => {
    expect(classificationIconButtonClass(undefined, false)).toContain(
      "neutral-300",
    );
    expect(classificationIconButtonClass("public", false)).toContain(
      "cyan-700",
    );
    expect(classificationIconButtonClass("restricted", false)).toContain(
      "orange-700",
    );
    expect(classificationIconButtonClass("confidential", false)).toContain(
      "red-700",
    );
    expect(classificationIconButtonClass("confidential", true)).toContain(
      "neutral-300",
    );
  });
});
