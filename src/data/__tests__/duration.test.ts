import { describe, it, expect } from "vitest";
import { formatDuration } from "../duration";

describe("formatDuration", () => {
  it("counts both start and end month", () => {
    expect(formatDuration("10/2019", "01/2020")).toBe("4 meses");
    expect(formatDuration("06/2020", "02/2022")).toBe("1 año y 9 meses");
    expect(formatDuration("02/2022", "06/2026")).toBe("4 años y 5 meses");
  });

  it("uses singular forms", () => {
    expect(formatDuration("01/2020", "01/2020")).toBe("1 mes");
    expect(formatDuration("01/2020", "12/2020")).toBe("1 año");
    expect(formatDuration("01/2020", "01/2021")).toBe("1 año y 1 mes");
  });

  it("uses the given date for the current job", () => {
    expect(formatDuration("06/2026", "Actualidad", new Date(2026, 10, 24))).toBe("6 meses");
  });
});
