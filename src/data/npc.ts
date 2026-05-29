/**
 * Pracownicy kantoru Cashify — popupy progowe (czyste dane). Klucz progu =
 * wynik, przy którym postać wyskakuje (NPC_MILESTONES). Avatary w public/.
 */
export interface NpcDef {
  /** Klucz tekstury załadowanej w BootScene. */
  key: string;
  /** Ścieżka PNG względem public/. */
  asset: string;
  name: string;
  /** Kwestia w chmurce. */
  line: string;
}

export const NPCS: Record<number, NpcDef> = {
  1000: {
    key: "npc_jacek",
    asset: "assets/npc/jacek.png",
    name: "Jacek",
    line: "Dawaj, dawaj, nie poddawaj się! Ja w twoim wieku lepiej grałem.",
  },
  2000: {
    key: "npc_weronika",
    asset: "assets/npc/weronika.png",
    name: "Weronika",
    line: "No złotko, jeszcze trochę a będziesz bogaty.",
  },
  3000: {
    key: "npc_jakub",
    asset: "assets/npc/jakub.png",
    name: "Jakub",
    line: "Udało ci się osiągnąć cel! Teraz możesz się skeszować w Cashify.",
  },
};
