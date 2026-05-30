/**
 * Pracownicy kantoru — dymki z kwestią (progi z {@link NPC_MILESTONES} w config).
 */
import { NPC_MILESTONES } from "../config";

export interface NpcDef {
  key: string;
  asset: string;
  name: string;
  line: string;
}

/** Kolejność = NPC_MILESTONES[0], [1], [2] — nie zmieniaj bez aktualizacji config. */
const NPC_ROSTER: readonly NpcDef[] = [
  {
    key: "npc_jacek",
    asset: "assets/npc/jacek.png",
    name: "Jacek",
    line: "Dawaj, dawaj, nie poddawaj się! Ja w twoim wieku lepiej grałem.",
  },
  {
    key: "npc_weronika",
    asset: "assets/npc/weronika.png",
    name: "Weronika",
    line: "No złotko, jeszcze trochę a będziesz bogaty.",
  },
  {
    key: "npc_jakub",
    asset: "assets/npc/jakub.png",
    name: "Jakub",
    line: "Ostatnia prosta — zgarniaj wszystko, co leci!",
  },
] as const;

/** Mapa progu → NPC (zsynchronizowana z config.NPC_MILESTONES). */
export const NPCS: Record<number, NpcDef> = Object.fromEntries(
  NPC_MILESTONES.map((at, i) => [at, NPC_ROSTER[i]!]),
);

export function getNpcForMilestone(milestone: number): NpcDef | undefined {
  return NPCS[milestone];
}

/** Kwestia przy wygranej (osiągnięcie celu rundy). */
export const WIN_NPC: NpcDef = {
  key: "npc_jakub",
  asset: "assets/npc/jakub.png",
  name: "Jakub",
  line: "Udało ci się osiągnąć cel! Teraz możesz się skeszować w Cashify.",
};
