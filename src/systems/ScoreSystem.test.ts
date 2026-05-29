import { describe, it, expect } from "vitest";
import { ScoreSystem } from "./ScoreSystem";
import { ITEMS } from "../data/items";

describe("ScoreSystem — łapanie i wynik w PLN", () => {
  it("starts with a score of zero", () => {
    expect(new ScoreSystem().score).toBe(0);
  });

  it("adds catalog valuePln for a caught item", () => {
    const s = new ScoreSystem();
    expect(s.addCatch("btc")).toBe(ITEMS.btc.valuePln);
    expect(s.score).toBe(ITEMS.btc.valuePln);
  });

  it("sums valuePln across different item types", () => {
    const s = new ScoreSystem();
    s.addCatch("btc");
    s.addCatch("pln");
    expect(s.score).toBe(ITEMS.btc.valuePln + ITEMS.pln.valuePln);
  });

  it("adds an arbitrary bonus in PLN", () => {
    const s = new ScoreSystem();
    s.addCatch("pln");
    expect(s.addBonus(50_000)).toBe(50_000);
    expect(s.score).toBe(ITEMS.pln.valuePln + 50_000);
  });
});

describe("ScoreSystem — strata życia", () => {
  it("keeps score on death (no penalty)", () => {
    const s = new ScoreSystem();
    s.addCatch("btc");
    s.onDeath();
    expect(s.score).toBe(ITEMS.btc.valuePln);
  });
});
