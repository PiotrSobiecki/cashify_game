/**
 * Czysta logika przebiegu rundy Cashify (testowalna bez Phasera).
 * Trzyma życia i wyznacza stan końcowy + powód:
 *  - win     — osiągnięto cel WIN_TARGET_PLN (10 mln zł); ranking po czasie,
 *  - death   — utracono ostatnie życie,
 *  - timeout — przekroczono twardy limit czasu (SESSION_MAX_MS).
 */
import { LIVES, WIN_TARGET_PLN, SESSION_MAX_MS } from "../config";

export type EndReason = "win" | "death" | "timeout";

export class RunController {
  private _lives: number;
  private _ended: EndReason | null = null;

  constructor(lives: number = LIVES) {
    this._lives = lives;
  }

  get lives(): number {
    return this._lives;
  }

  get isOver(): boolean {
    return this._ended !== null;
  }

  get endReason(): EndReason | null {
    return this._ended;
  }

  /** Utrata życia: true = respawn (zostały życia), false = koniec (death). */
  loseLife(): boolean {
    if (this._ended) return false;
    this._lives = Math.max(0, this._lives - 1);
    if (this._lives <= 0) {
      this._ended = "death";
      return false;
    }
    return true;
  }

  /**
   * Sprawdza warunki końca. Wygrana (≥ WIN_TARGET_PLN) ma priorytet nad timeoutem.
   */
  update(score: number, elapsedMs: number): EndReason | null {
    if (this._ended) return this._ended;
    if (score >= WIN_TARGET_PLN) this._ended = "win";
    else if (elapsedMs >= SESSION_MAX_MS) this._ended = "timeout";
    return this._ended;
  }
}
