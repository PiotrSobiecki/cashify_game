import { describe, expect, it } from "vitest";
import { BOSS_ENCOUNTERS, getBossEncounter } from "./bosses";

describe("getBossEncounter", () => {
  it("maps index 0 to Jacek", () => {
    expect(getBossEncounter(0).npcKey).toBe("npc_jacek");
  });

  it("maps index 1 and 2 to Weronika and Jakub", () => {
    expect(getBossEncounter(1).npcKey).toBe("npc_weronika");
    expect(getBossEncounter(2).npcKey).toBe("npc_jakub");
  });

  it("clamps past last boss", () => {
    expect(getBossEncounter(99).npcKey).toBe(BOSS_ENCOUNTERS[2].npcKey);
  });
});
