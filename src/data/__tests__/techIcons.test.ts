import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { techIcons } from "../techIcons";
import { experience } from "../experience";

// Technologies without a usable logo; shown as text only.
const WITHOUT_ICON = new Set(["MCP"]);

describe("techIcons", () => {
  it("every icon file exists in public/", () => {
    for (const { path } of Object.values(techIcons)) {
      expect(existsSync(`public${path}`), path).toBe(true);
    }
  });

  it("every experience tech has an icon (or is explicitly text-only)", () => {
    for (const job of experience) {
      for (const tech of job.techs) {
        if (!WITHOUT_ICON.has(tech)) expect(techIcons[tech], tech).toBeDefined();
      }
    }
  });
});
