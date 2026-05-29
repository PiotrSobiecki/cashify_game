import { describe, expect, it } from "vitest";
import {
  isCollectibleItemType,
  ITEM_TYPES,
  weightedPick,
  spawnWeightForValue,
  getSpawnWeight,
  ITEMS,
} from "./items";

describe("isCollectibleItemType", () => {
  it("accepts catalog types", () => {
    expect(isCollectibleItemType("btc")).toBe(true);
    expect(isCollectibleItemType("boss_bar")).toBe(true);
  });

  it("rejects unknown strings", () => {
    expect(isCollectibleItemType("malware")).toBe(false);
    expect(isCollectibleItemType("")).toBe(false);
  });
});

describe("spawnWeightForValue", () => {
  it("gives higher weight to cheaper items", () => {
    expect(spawnWeightForValue(1)).toBeGreaterThan(spawnWeightForValue(400_000));
  });

  it("gives boss_bar zero weight", () => {
    expect(getSpawnWeight("boss_bar")).toBe(0);
  });
});

describe("weightedPick", () => {
  it("picks first type when roll is 0", () => {
    expect(weightedPick(ITEM_TYPES, 0)).toBe(ITEM_TYPES[0]);
  });

  it("picks last type when roll is just below 1", () => {
    expect(weightedPick(ITEM_TYPES, 0.999999)).toBe(ITEM_TYPES[ITEM_TYPES.length - 1]);
  });

  it("favors common items over btc at mid roll", () => {
    const counts: Record<"btc" | "pln", number> = { btc: 0, pln: 0 };
    for (let i = 0; i < 500; i++) {
      const t = weightedPick(["btc", "pln"], Math.random());
      if (t === "btc") counts.btc += 1;
      else counts.pln += 1;
    }
    expect(counts.pln).toBeGreaterThan(counts.btc);
    expect(ITEMS.btc.valuePln).toBeGreaterThan(ITEMS.pln.valuePln);
  });
});
