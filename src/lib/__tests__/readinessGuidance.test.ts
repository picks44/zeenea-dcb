import { describe, expect, it } from "vitest";
import type { DataContract } from "@/types/odcs";
import {
  buildReadinessGuidanceItems,
  computeSectionGuidance,
  hasExploitableDataAccessRole,
} from "@/lib/readinessGuidance";
import {
  computePublicationReadiness,
  READINESS_RECOMMENDED_WEIGHT,
} from "@/lib/publicationReadiness";
import { buildP1FixtureContract } from "@/lib/__tests__/p1-fixture";

function recommendedKeys(
  contract: DataContract,
  allContracts?: DataContract[],
): string[] {
  return buildReadinessGuidanceItems(contract, allContracts)
    .filter((i) => i.variant === "recommended")
    .map((i) => i.key);
}

function recommendedByKey(contract: DataContract, key: string) {
  return buildReadinessGuidanceItems(contract).find(
    (i) => i.variant === "recommended" && i.key === key,
  );
}

describe("buildReadinessGuidanceItems - Suggested improvements", () => {
  it("does not include field-docs in recommended checks", () => {
    const contract = buildP1FixtureContract();
    expect(recommendedKeys(contract)).not.toContain("field-docs");
  });

  it("always includes access-roles in recommended checks", () => {
    const contract = buildP1FixtureContract();
    expect(recommendedKeys(contract)).toContain("access-roles");
  });

  it("marks access-roles incomplete when no exploitable data access role exists", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      roles: [],
    };
    expect(hasExploitableDataAccessRole(contract)).toBe(false);
    expect(recommendedByKey(contract, "access-roles")?.ok).toBe(false);
  });

  it("marks access-roles complete when at least one role has name and access", () => {
    const contract = buildP1FixtureContract();
    expect(hasExploitableDataAccessRole(contract)).toBe(true);
    expect(recommendedByKey(contract, "access-roles")?.ok).toBe(true);
  });

  it("does not count role name without access as complete", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      roles: [
        { id: "r1", role: "analyst", access: "" as "read", description: "" },
      ],
    };
    expect(hasExploitableDataAccessRole(contract)).toBe(false);
    expect(recommendedByKey(contract, "access-roles")?.ok).toBe(false);
  });

  it("lists the five suggested axes when reference links are missing", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      roles: [],
      info: {
        ...buildP1FixtureContract().info,
        domain: "",
        description: "",
        descriptionAuthoritativeDefinitions: [],
      },
      stakeholders: [],
    };
    expect(recommendedKeys(contract)).toEqual([
      "domain",
      "desc",
      "stakeholders",
      "access-roles",
      "ref-links",
    ]);
  });
});

describe("computeSectionGuidance - Custom nav", () => {
  it("marks Custom complete when at least one exportable property exists", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      customProperties: [
        { id: "c1", property: "dataSteward", value: "owner@example.com", description: "" },
      ],
    };
    expect(computeSectionGuidance(contract).custom?.status).toBe("complete");
  });

  it("marks Custom empty when no exportable properties", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      customProperties: [
        { id: "c1", property: "solo", value: "", description: "" },
      ],
    };
    expect(computeSectionGuidance(contract).custom?.status).toBe("empty");
  });
});

describe("computeSectionGuidance - SLA nav", () => {
  it("marks SLA empty when only blank shell rows exist", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      slaProperties: [
        { id: "s1", value: "", unit: "", element: "", driver: "", description: "" },
      ],
    };
    expect(computeSectionGuidance(contract).sla?.status).toBe("empty");
  });

  it("marks SLA complete when at least one exportable row exists", () => {
    const contract: DataContract = {
      ...buildP1FixtureContract(),
      slaProperties: [
        { id: "s1", property: "latency", value: "4", unit: "h" },
      ],
    };
    expect(computeSectionGuidance(contract).sla?.status).toBe("complete");
  });
});

describe("computePublicationReadiness - recommended score cap", () => {
  it("keeps recommended.max at 5", () => {
    const readiness = computePublicationReadiness(
      buildP1FixtureContract(),
      "owner",
      true,
    );
    expect(readiness.scoreContributions.recommended.max).toBe(
      READINESS_RECOMMENDED_WEIGHT,
    );
    expect(readiness.scoreContributions.recommended.max).toBe(5);
  });
});
