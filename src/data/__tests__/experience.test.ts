import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { experience } from "../experience";

describe("experience", () => {
  it("has at least one job", () => {
    expect(experience.length).toBeGreaterThan(0);
  });

  it("each job has required fields, a description and techs", () => {
    for (const job of experience) {
      expect(job.place).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.start).toBeTruthy();
      expect(job.end).toBeTruthy();
      expect(existsSync(`public${job.logo}`), job.logo).toBe(true);
      expect(job.description.length).toBeGreaterThan(0);
      expect(job.techs.length).toBeGreaterThan(0);
    }
  });
});
