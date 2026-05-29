import { describe, it, expect } from "vitest";
import { ScoreSystem } from "./ScoreSystem";
import { RESPAWN_PENALTY } from "../config";
import { ITEMS } from "../data/items";

describe("ScoreSystem — łapanie i wynik", () => {
  it("starts with a score of zero", () => {
    expect(new ScoreSystem().score).toBe(0);
  });

  it("awards flat catalog points for a caught item", () => {
    const s = new ScoreSystem();
    expect(s.addCatch("btc")).toBe(ITEMS.btc.points);
    expect(s.score).toBe(ITEMS.btc.points);
  });

  it("sums catalog points across different item types", () => {
    const s = new ScoreSystem();
    s.addCatch("btc");
    s.addCatch("pln");
    expect(s.score).toBe(ITEMS.btc.points + ITEMS.pln.points);
  });

  it("adds an arbitrary bonus", () => {
    const s = new ScoreSystem();
    s.addCatch("pln");
    expect(s.addBonus(50)).toBe(50);
    expect(s.score).toBe(ITEMS.pln.points + 50);
  });
});

describe("ScoreSystem — kara za śmierć", () => {
  it("subtracts the penalty on death, never below zero", () => {
    const s = new ScoreSystem();
    s.addCatch("btc"); // 30
    s.onDeath();
    expect(s.score).toBe(ITEMS.btc.points - RESPAWN_PENALTY);

    const t = new ScoreSystem();
    t.addBonus(10);
    t.onDeath(); // 10 - 15 → 0
    expect(t.score).toBe(0);
  });
});
