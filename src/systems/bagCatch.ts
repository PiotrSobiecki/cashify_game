/**
 * Czysta decyzja worka (testowalna bez Phasera) — sedno rdzenia rozgrywki.
 * Geometrię (czy przedmiot nachodzi na strefę worka/gracza) liczy Phaser
 * w GameScene; tutaj zapada tylko decyzja, a punkty/obrażenia aplikuje caller.
 */

export type CatchOutcome = "catch" | "bounce" | "none";

/**
 * Bez nałożenia — nic. Z nałożeniem: otwarty worek łapie, zamknięty odbija
 * (caller nalicza punkty / zadaje obrażenia).
 */
export function resolveCatch(bagOpen: boolean, overlapping: boolean): CatchOutcome {
  if (!overlapping) return "none";
  return bagOpen ? "catch" : "bounce";
}
