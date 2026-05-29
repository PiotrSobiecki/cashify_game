import { describe, it, expect } from "vitest";
import { InventorySystem } from "./InventorySystem";

describe("InventorySystem — zliczanie zdobyczy", () => {
  it("counts a caught item type", () => {
    const inv = new InventorySystem();
    inv.add("btc");
    expect(inv.count("btc")).toBe(1);
  });

  it("tracks multiple items and distinct types separately", () => {
    const inv = new InventorySystem();
    inv.add("btc");
    inv.add("btc");
    inv.add("pln");
    expect(inv.count("btc")).toBe(2);
    expect(inv.count("pln")).toBe(1);
    expect(inv.count("eth")).toBe(0); // niezłapany typ
    expect(inv.total).toBe(3);
  });

  it("serializes caught types with counts for the end screen", () => {
    const inv = new InventorySystem();
    inv.add("pln");
    inv.add("btc");
    inv.add("pln");
    const entries = inv.entries();
    expect(entries).toContainEqual({ type: "pln", count: 2 });
    expect(entries).toContainEqual({ type: "btc", count: 1 });
    expect(entries).toHaveLength(2); // tylko złapane typy
  });
});
