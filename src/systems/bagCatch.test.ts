import { describe, it, expect } from "vitest";
import { resolveCatch } from "./bagCatch";

describe("resolveCatch — decyzja worka", () => {
  it("catches an overlapping item when the bag is open", () => {
    expect(resolveCatch(true, true)).toBe("catch");
  });

  it("bounces an overlapping item when the bag is closed", () => {
    expect(resolveCatch(false, true)).toBe("bounce");
  });

  it("does nothing without overlap, regardless of bag state", () => {
    expect(resolveCatch(true, false)).toBe("none");
    expect(resolveCatch(false, false)).toBe("none");
  });
});
