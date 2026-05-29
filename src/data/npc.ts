/**
 * Pracownicy kantoru — dymki z kwestią pojawiają się 100 tys. PRZED każdym
 * bossem (zapowiedź postaci). Osobna kwestia Jakuba przy wygranej (10 mln).
 */
export interface NpcDef {
  key: string;
  asset: string;
  name: string;
  line: string;
}

/** Klucz = próg PLN dymka (100k przed bossem): 400k / 1,9 mln / 4,9 mln. */
export const NPCS: Record<number, NpcDef> = {
  400_000: {
    key: "npc_jacek",
    asset: "assets/npc/jacek.png",
    name: "Jacek",
    line: "Dawaj, dawaj, nie poddawaj się! Ja w twoim wieku lepiej grałem.",
  },
  1_900_000: {
    key: "npc_weronika",
    asset: "assets/npc/weronika.png",
    name: "Weronika",
    line: "No złotko, jeszcze trochę a będziesz bogaty.",
  },
  4_900_000: {
    key: "npc_jakub",
    asset: "assets/npc/jakub.png",
    name: "Jakub",
    line: "Ostatnia prosta — zgarniaj wszystko, co leci!",
  },
};

/** Kwestia przy wygranej (osiągnięcie 5 mln zł). */
export const WIN_NPC: NpcDef = {
  key: "npc_jakub",
  asset: "assets/npc/jakub.png",
  name: "Jakub",
  line: "Udało ci się osiągnąć cel! Teraz możesz się skeszować w Cashify.",
};
