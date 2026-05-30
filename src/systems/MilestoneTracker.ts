/**
 * Śledzi progi punktowe (bossy / NPC z config).
 * `crossed` tylko zwraca kandydatów — `markFired` po udanym pokazaniu,
 * żeby nie „zużyć” progu gdy popup się nie wyświetlił.
 */
export class MilestoneTracker {
  private readonly fired = new Set<number>();

  constructor(private readonly thresholds: number[]) {}

  /** Progi spełnione przy tym wyniku, jeszcze nie oznaczone jako obsłużone. */
  crossed(score: number): number[] {
    return this.thresholds.filter((t) => score >= t && !this.fired.has(t));
  }

  markFired(threshold: number): void {
    this.fired.add(threshold);
  }
}
