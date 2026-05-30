import { describe, it, expect } from "vitest";
import { NPC_MILESTONES } from "../config";
import { getNpcForMilestone, NPCS } from "./npc";

describe("npc milestones", () => {
  it("maps every NPC_MILESTONES entry to a character", () => {
    for (const at of NPC_MILESTONES) {
      expect(getNpcForMilestone(at)?.name).toBeTruthy();
      expect(NPCS[at]).toBe(getNpcForMilestone(at));
    }
  });

  it("includes Weronika at 2_400_000", () => {
    expect(getNpcForMilestone(2_400_000)?.key).toBe("npc_weronika");
  });
});
