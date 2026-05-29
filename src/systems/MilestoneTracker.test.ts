import { describe, it, expect } from "vitest";
import { MilestoneTracker } from "./MilestoneTracker";

describe("MilestoneTracker", () => {
  it("reports a threshold when the score first crosses it", () => {
    const m = new MilestoneTracker([500_000, 2_000_000, 5_000_000]);
    expect(m.crossed(499_999)).toEqual([]);
    expect(m.crossed(500_000)).toEqual([500_000]);
  });

  it("fires each threshold only once", () => {
    const m = new MilestoneTracker([500_000, 2_000_000, 5_000_000]);
    expect(m.crossed(2_500_000)).toEqual([500_000, 2_000_000]);
    expect(m.crossed(3_000_000)).toEqual([]);
  });

  it("does not re-fire after the score dips and climbs back", () => {
    const m = new MilestoneTracker([500_000, 2_000_000, 5_000_000]);
    m.crossed(5_000_000);
    expect(m.crossed(4_000_000)).toEqual([]);
    expect(m.crossed(5_000_000)).toEqual([]);
  });

  it("reports multiple thresholds crossed in one jump", () => {
    const m = new MilestoneTracker([500_000, 2_000_000, 5_000_000]);
    expect(m.crossed(5_000_000)).toEqual([500_000, 2_000_000, 5_000_000]);
  });
});
