import { describe, expect, it } from "vitest";
import { isCollectibleItemType, ITEM_TYPES, weightedPick } from "./items";

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

describe("weightedPick", () => {
  it("picks first type when roll is 0", () => {
    expect(weightedPick(ITEM_TYPES, 0)).toBe(ITEM_TYPES[0]);
  });

  it("picks last type when roll is just below 1", () => {
    expect(weightedPick(ITEM_TYPES, 0.999999)).toBe(ITEM_TYPES[ITEM_TYPES.length - 1]);
  });
});
