import { describe, it, expect } from "vitest";
import { MilestoneTracker } from "./MilestoneTracker";

describe("MilestoneTracker — jednorazowe progi", () => {
  it("reports a threshold when the score first crosses it", () => {
    const m = new MilestoneTracker([1000, 2000, 3000]);
    expect(m.crossed(1000)).toEqual([1000]);
  });

  it("fires each threshold only once", () => {
    const m = new MilestoneTracker([1000, 2000, 3000]);
    expect(m.crossed(1000)).toEqual([1000]);
    expect(m.crossed(1500)).toEqual([]); // 1000 już odpalony, 2000 jeszcze nie
  });

  it("does not re-fire after the score dips (respawn −15) and climbs back", () => {
    const m = new MilestoneTracker([1000, 2000, 3000]);
    m.crossed(1005);
    expect(m.crossed(990)).toEqual([]); // śmierć: −15 schodzi pod próg
    expect(m.crossed(1010)).toEqual([]); // powrót nad 1000 NIE odpala ponownie
  });

  it("returns every threshold newly crossed in one jump", () => {
    const m = new MilestoneTracker([1000, 2000, 3000]);
    expect(m.crossed(2500)).toEqual([1000, 2000]);
  });
});
