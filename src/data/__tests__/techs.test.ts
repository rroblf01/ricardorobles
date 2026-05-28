import { describe, it, expect } from "vitest";
import { techs } from "../techs";

describe("techs", () => {
  it("has at least one technology", () => {
    expect(techs.length).toBeGreaterThan(0);
  });

  it("each tech has required fields", () => {
    for (const tech of techs) {
      expect(tech.title).toBeTruthy();
      expect(tech.subtitle).toBeTruthy();
      expect(tech.imgPath).toBeTruthy();
    }
  });

  it("each tech has a valid imgPath starting with /assets/", () => {
    for (const tech of techs) {
      expect(tech.imgPath).toMatch(/^\/assets\//);
    }
  });

  it("has unique titles", () => {
    const titles = techs.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
