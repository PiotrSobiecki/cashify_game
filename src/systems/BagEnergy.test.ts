import { describe, it, expect } from "vitest";
import { BagEnergy } from "./BagEnergy";
import { BAG } from "../config";

describe("BagEnergy — wytrzymałość otwartego worka", () => {
  it("opens while held and drains energy", () => {
    const b = new BagEnergy();
    expect(b.ratio).toBe(1);
    expect(b.update(true, 1)).toBe(true); // trzymanie → otwarty
    expect(b.ratio).toBeCloseTo(1 - BAG.drainPerSec / BAG.maxEnergy, 5);
  });

  it("exhausts and closes when energy runs out under continuous holding", () => {
    const b = new BagEnergy();
    let open = true;
    for (let i = 0; i < 10; i++) open = b.update(true, 1); // 10 s trzymania
    expect(open).toBe(false);
    expect(b.isExhausted).toBe(true);
    expect(b.ratio).toBe(0);
  });

  it("stays closed while exhausted until energy recovers to the threshold", () => {
    const b = new BagEnergy();
    for (let i = 0; i < 10; i++) b.update(true, 1); // wyczerpany
    expect(b.update(true, 0.1)).toBe(false); // trzymanie nic nie da — zablokowany
    // regeneracja przy puszczeniu aż do progu reactivateAt
    while (b.isExhausted) b.update(false, 0.1);
    expect(b.ratio).toBeGreaterThanOrEqual(BAG.reactivateAt / BAG.maxEnergy);
    expect(b.update(true, 0.01)).toBe(true); // znów można otworzyć
  });

  it("regenerates when released", () => {
    const b = new BagEnergy();
    b.update(true, 2); // zużyj trochę
    const low = b.ratio;
    b.update(false, 1); // puść → regeneracja
    expect(b.ratio).toBeGreaterThan(low);
  });
});
