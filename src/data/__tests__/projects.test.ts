import { describe, it, expect } from "vitest";
import { projects } from "../projects";

describe("projects", () => {
  it("has at least one project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("each project has required fields", () => {
    for (const project of projects) {
      expect(project.url).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.imgPath).toBeTruthy();
      expect(Array.isArray(project.sources)).toBe(true);
      expect(Array.isArray(project.techs)).toBe(true);
    }
  });

  it("each project has valid imgPath", () => {
    for (const project of projects) {
      expect(project.imgPath).toMatch(/^\/assets\//);
    }
  });

  it("each project has at least one source", () => {
    for (const project of projects) {
      expect(project.sources.length).toBeGreaterThan(0);
    }
  });

  it("each source has url and text", () => {
    for (const project of projects) {
      for (const source of project.sources) {
        expect(source.url).toBeTruthy();
        expect(source.text).toBeTruthy();
      }
    }
  });

  it("each tech entry has path and name", () => {
    for (const project of projects) {
      for (const tech of project.techs) {
        expect(tech.path).toBeTruthy();
        expect(tech.name).toBeTruthy();
      }
    }
  });

  it("has unique titles", () => {
    const titles = projects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("each url is valid", () => {
    for (const project of projects) {
      expect(project.url).toMatch(/^https?:\/\//);
    }
  });
});
