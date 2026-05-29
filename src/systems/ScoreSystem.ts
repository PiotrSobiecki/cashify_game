/**
 * Czysta logika punktacji Cashify (testowalna bez Phasera).
 * - punkty za złapany przedmiot (katalog items.ts),
 * - dowolny bonus (np. specjalny drop),
 * - kara za śmierć (−RESPAWN_PENALTY, nie poniżej 0).
 */
import { RESPAWN_PENALTY } from "../config";
import { ITEMS, type ItemType } from "../data/items";

export class ScoreSystem {
  private _score = 0;

  get score(): number {
    return this._score;
  }

  /** Łapanie przedmiotu: płaskie punkty z katalogu. Zwraca przyznane punkty. */
  addCatch(type: ItemType): number {
    const points = ITEMS[type].points;
    this._score += points;
    return points;
  }

  /** Dowolny bonus punktowy. */
  addBonus(points: number): number {
    this._score += points;
    return points;
  }

  /** Kara za śmierć (PRD #18): odejmuje punkty (nie poniżej 0). */
  onDeath(): void {
    this._score = Math.max(0, this._score - RESPAWN_PENALTY);
  }
}
