/**
 * Ekwipunek rundy (czysta logika): zlicza złapane przedmioty wg typu.
 * Serializacja do ekranu końca przez `entries()`. Bez Phasera.
 */
import type { ItemType } from "../data/items";

export class InventorySystem {
  private readonly counts = new Map<ItemType, number>();

  /** Dodaje jeden złapany przedmiot danego typu. */
  add(type: ItemType): void {
    this.counts.set(type, (this.counts.get(type) ?? 0) + 1);
  }

  /** Ile sztuk danego typu złapano. */
  count(type: ItemType): number {
    return this.counts.get(type) ?? 0;
  }

  /** Łączna liczba złapanych przedmiotów (wszystkie typy). */
  get total(): number {
    let sum = 0;
    for (const n of this.counts.values()) sum += n;
    return sum;
  }

  /** Złapane typy z liczbą sztuk — do listy zdobyczy na ekranie końca. */
  entries(): Array<{ type: ItemType; count: number }> {
    return [...this.counts].map(([type, count]) => ({ type, count }));
  }
}
