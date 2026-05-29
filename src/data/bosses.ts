/**
 * Fazy bossów (progi z BOSS_MILESTONES w config). Okienko kantoru — tylko głowa NPC.
 */
export interface BossEncounterDef {
  npcKey: string;
  fallbackTexture: string;
  /** Krótki komunikat na starcie fazy. */
  shout: string;
  /** Pozycja pionowa w okienku (0=góra, 1=dół); domyślnie 0.44. */
  centerRatio?: number;
  /** Kotwica od dołu okienka — wypełnia szybę bez przerwy pod postacią. */
  anchor?: "center" | "bottom";
  /** Dodatkowa korekta Y (ujemna = wyżej). */
  yOffset?: number;
  /** Góra PNG — domyślnie z LAYOUT (mniejsze = mniej tułowia u dołu). */
  torsoCropRatio?: number;
  /** Powiększenie w szybie (domyślnie z LAYOUT). */
  scaleBoost?: number;
}

/** Kolejność = boss 1, 2, 3 w sesji (indeks 0..2). */
export const BOSS_ENCOUNTERS: readonly BossEncounterDef[] = [
  {
    npcKey: "npc_jacek",
    fallbackTexture: "boss",
    shout: "Łap sztabki!",
    anchor: "bottom",
    torsoCropRatio: 0.64,
    scaleBoost: 1.34,
    yOffset: 0,
  },
  { npcKey: "npc_weronika", fallbackTexture: "boss", shout: "Złoto leci!" },
  {
    npcKey: "npc_jakub",
    fallbackTexture: "boss",
    shout: "Ostatnia fala!",
    anchor: "bottom",
    torsoCropRatio: 0.66,
    scaleBoost: 1.36,
    yOffset: 0,
  },
] as const;

export function getBossEncounter(index: number): BossEncounterDef {
  return BOSS_ENCOUNTERS[Math.min(index, BOSS_ENCOUNTERS.length - 1)];
}
