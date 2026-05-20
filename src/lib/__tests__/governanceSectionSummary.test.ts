import { describe, expect, it } from "vitest";
import {
  countExportableCustomProperties,
  countExportableSlaProperties,
  isAccessRoleRowIncomplete,
  isCustomPropertyExportable,
  isCustomPropertyRowIncomplete,
  isSlaRowIncomplete,
  summarizeAccessRoles,
  summarizeCustomProperties,
  summarizeSlaProperties,
  summarizeStakeholders,
} from "@/lib/governanceSectionSummary";

describe("summarizeStakeholders", () => {
  it("counts saved rows and contacts with a name", () => {
    const summary = summarizeStakeholders([
      { id: "1", name: "Ada", role: "Data Owner", email: "", team: "", notes: "" },
      { id: "2", name: "", role: "Data Consumer", email: "", team: "", notes: "" },
    ]);
    expect(summary).toEqual({ saved: 2, counted: 1 });
  });
});

describe("summarizeAccessRoles", () => {
  it("counts exportable and incomplete rows", () => {
    const summary = summarizeAccessRoles([
      { id: "1", role: "analyst", access: "read", description: "" },
      { id: "2", role: "", access: "read", description: "Notes only" },
      { id: "3", role: "", access: "read", description: "" },
    ]);
    expect(summary.includedInYaml).toBe(1);
    expect(summary.incomplete).toBe(1);
    expect(summary.saved).toBe(3);
  });

  it("marks description-only rows as incomplete", () => {
    const row = { id: "1", role: "", access: "read" as const, description: "x" };
    expect(isAccessRoleRowIncomplete(row)).toBe(true);
  });
});

describe("summarizeSlaProperties", () => {
  it("counts exportable SLA rows with property and value", () => {
    const summary = summarizeSlaProperties([
      { id: "1", property: "latency", value: "4", unit: "h" },
      { id: "2", property: "retention", value: "", unit: "" },
      { id: "3", value: "", unit: "", element: "", driver: "", description: "" },
    ]);
    expect(summary.includedInYaml).toBe(1);
    expect(summary.incomplete).toBe(1);
  });

  it("exportable count matches YAML rules", () => {
    expect(
      countExportableSlaProperties([
        { id: "1", property: "latency", value: " 4 ", unit: "" },
        { id: "2", value: "1", unit: "d" },
      ]),
    ).toBe(1);
  });

  it("flags partial SLA rows as incomplete", () => {
    const row = {
      id: "1",
      property: "latency" as const,
      value: "",
      unit: "",
      element: "",
      driver: "",
      description: "",
    };
    expect(isSlaRowIncomplete(row)).toBe(true);
  });
});

describe("summarizeCustomProperties", () => {
  it("counts YAML-ready and incomplete custom properties", () => {
    const summary = summarizeCustomProperties([
      { id: "1", property: "dataSteward", value: "a@b.com", description: "" },
      { id: "2", property: "bad name", value: "x", description: "" },
      { id: "3", property: "solo", value: "", description: "" },
    ]);
    expect(summary.includedInYaml).toBe(1);
    expect(summary.incomplete).toBe(2);
  });

  it("exportable requires property and value", () => {
    expect(
      isCustomPropertyExportable({ id: "1", property: "x", value: "", description: "" }),
    ).toBe(false);
  });

  it("incomplete when camelCase invalid with both fields", () => {
    expect(
      isCustomPropertyRowIncomplete({
        id: "1",
        property: "Bad-Name",
        value: "v",
        description: "",
      }),
    ).toBe(true);
  });

  it("counts exportable custom properties for nav completion", () => {
    expect(
      countExportableCustomProperties([
        { id: "1", property: "dataSteward", value: "a@b.com", description: "" },
        { id: "2", property: "x", value: "", description: "" },
      ]),
    ).toBe(1);
  });
});
