/**
 * Wytrzymałość otwartego worka (czysta logika, bez Phasera) — analogicznie do
 * dawnej tarczy. Otwarty worek (przytrzymanie) zużywa energię; po wyczerpaniu
 * zamyka się i jest zablokowany, aż energia odbije do progu reactivateAt.
 * Po puszczeniu energia się regeneruje.
 */
import { BAG } from "../config";

export class BagEnergy {
  private energy: number = BAG.maxEnergy;
  private exhausted = false;

  /** Stosunek energii 0..1 (do paska HUD). */
  get ratio(): number {
    return this.energy / BAG.maxEnergy;
  }

  get isExhausted(): boolean {
    return this.exhausted;
  }

  /**
   * Aktualizuje energię wg wejścia. Zwraca, czy worek jest OTWARTY w tej klatce
   * (trzymany, jest energia, nie zablokowany). `dtSec` = czas klatki w sekundach.
   */
  update(holding: boolean, dtSec: number): boolean {
    if (holding && !this.exhausted && this.energy > 0) {
      this.energy = Math.max(0, this.energy - BAG.drainPerSec * dtSec);
      if (this.energy <= 0) {
        this.exhausted = true;
        return false;
      }
      return true;
    }
    this.energy = Math.min(BAG.maxEnergy, this.energy + BAG.regenPerSec * dtSec);
    if (this.exhausted && this.energy >= BAG.reactivateAt) this.exhausted = false;
    return false;
  }
}
