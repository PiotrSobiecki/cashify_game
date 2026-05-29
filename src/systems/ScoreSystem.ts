/**
 * Wynik rundy w PLN — suma valuePln złapanych przedmiotów.
 */
import { ITEMS, type ItemType } from "../data/items";

export class ScoreSystem {
  private _score = 0;

  /** Skumulowana wartość w PLN. */
  get score(): number {
    return this._score;
  }

  /** Łapanie: dodaje valuePln z katalogu. Zwraca przyznaną kwotę. */
  addCatch(type: ItemType): number {
    const value = ITEMS[type].valuePln;
    this._score += value;
    return value;
  }

  addBonus(valuePln: number): number {
    this._score += valuePln;
    return valuePln;
  }

  /** Strata życia — wynik zostaje (bez kary). */
  onDeath(): void {}
}
