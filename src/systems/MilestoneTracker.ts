/**
 * Śledzi progi punktowe (bossy / NPC z config).
 * Każdy próg odpala się DOKŁADNIE RAZ na rundę: po przekroczeniu zostaje
 * trwale oznaczony, więc spadek wyniku (kara −15 po śmierci) i ponowne
 * dojście do progu już go nie wyzwala. Czysta logika — bez Phasera.
 */
export class MilestoneTracker {
  private readonly fired = new Set<number>();

  constructor(private readonly thresholds: number[]) {}

  /** Zwraca progi przekroczone właśnie teraz (każdy najwyżej raz w całej rundzie). */
  crossed(score: number): number[] {
    const now = this.thresholds.filter((t) => score >= t && !this.fired.has(t));
    for (const t of now) this.fired.add(t);
    return now;
  }
}
