/**
 * Czas wyścigu (czysta logika, bez Phasera). Mierzy upływ od startu z
 * możliwością PAUZY — popup pracownika kantoru zamraża zegar, więc przerywnik
 * fabularny nie kosztuje gracza czasu. `now` podawany z zewnątrz (zegar sceny).
 */
export class RaceClock {
  private startedAt = 0;
  private pausedTotal = 0;
  private pausedAt: number | null = null;

  start(now: number): void {
    this.startedAt = now;
    this.pausedTotal = 0;
    this.pausedAt = null;
  }

  /** Zamraża zegar (idempotentnie — kolejne pause bez resume nie liczą się). */
  pause(now: number): void {
    if (this.pausedAt === null) this.pausedAt = now;
  }

  /** Wznawia zegar, dopisując czas pauzy do puli pominiętej. */
  resume(now: number): void {
    if (this.pausedAt !== null) {
      this.pausedTotal += now - this.pausedAt;
      this.pausedAt = null;
    }
  }

  get isPaused(): boolean {
    return this.pausedAt !== null;
  }

  /** Upływ czasu od startu (ms), z pominięciem pauz; zamrożony gdy w pauzie. */
  elapsed(now: number): number {
    const ref = this.pausedAt ?? now;
    return ref - this.startedAt - this.pausedTotal;
  }
}
