import Phaser from "phaser";
import { COLOR_HEX, COLORS, WIN_SCORE, GAME_WIDTH } from "../config";

/**
 * HUD rozgrywki Cashify. Czytelne wskaźniki:
 *  - WYNIK x / 3000 + złoty pasek postępu do celu,
 *  - HP (zielony→żółty→czerwony),
 *  - czas wyścigu i pozostałe życia (prawy górny róg).
 */
export class HUD {
  private label: Phaser.GameObjects.Text;
  private progressFill: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;
  private energyFill: Phaser.GameObjects.Rectangle;
  private timeText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;

  private readonly progressWidth = GAME_WIDTH - 32;
  private readonly barX = 56;
  private readonly barWidth = GAME_WIDTH - 56 - 16;

  constructor(scene: Phaser.Scene) {
    // panel tła HUD
    scene.add.rectangle(0, 0, GAME_WIDTH, 100, COLORS.panel, 0.88).setOrigin(0, 0).setDepth(14);
    scene.add.rectangle(0, 100, GAME_WIDTH, 2, COLORS.gold, 0.35).setOrigin(0, 0).setDepth(14);

    // czas + życia (prawy górny róg)
    this.timeText = scene.add
      .text(GAME_WIDTH - 16, 12, "0:00", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: COLOR_HEX.gold,
      })
      .setOrigin(1, 0)
      .setDepth(15);
    this.livesText = scene.add
      .text(GAME_WIDTH - 16, 60, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: COLOR_HEX.cash,
      })
      .setOrigin(1, 0)
      .setDepth(15);

    // WYNIK + pasek postępu do celu (3000)
    this.label = scene.add
      .text(16, 12, `WYNIK 0 / ${WIN_SCORE}`, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: COLOR_HEX.gold,
      })
      .setDepth(15);
    scene.add.rectangle(16, 38, this.progressWidth, 5, COLORS.panel).setOrigin(0, 0).setDepth(15);
    this.progressFill = scene.add
      .rectangle(16, 38, 0, 5, COLORS.gold)
      .setOrigin(0, 0)
      .setDepth(16);

    // HP
    scene.add
      .text(16, 53, "HP", { fontFamily: "monospace", fontSize: "11px", color: COLOR_HEX.fiat })
      .setDepth(15);
    scene.add.rectangle(this.barX, 54, this.barWidth, 11, COLORS.panel).setOrigin(0, 0).setDepth(15);
    this.hpFill = scene.add
      .rectangle(this.barX, 54, this.barWidth, 11, COLORS.cash)
      .setOrigin(0, 0)
      .setDepth(16);

    // WOREK (energia otwarcia)
    scene.add
      .text(16, 71, "WÓR", { fontFamily: "monospace", fontSize: "11px", color: COLOR_HEX.gold })
      .setDepth(15);
    scene.add.rectangle(this.barX, 72, this.barWidth, 9, COLORS.panel).setOrigin(0, 0).setDepth(15);
    this.energyFill = scene.add
      .rectangle(this.barX, 72, this.barWidth, 9, COLORS.goldLight)
      .setOrigin(0, 0)
      .setDepth(16);
  }

  /** Pasek energii worka; gdy wyczerpany — sygnał magenta. */
  setEnergy(ratio: number, exhausted: boolean): void {
    const r = Phaser.Math.Clamp(ratio, 0, 1);
    this.energyFill.width = this.barWidth * r;
    this.energyFill.fillColor = exhausted ? COLORS.warn : COLORS.goldLight;
  }

  /** WYNIK + złoty pasek postępu do celu (WIN_SCORE). */
  setRaceProgress(score: number): void {
    const ratio = Phaser.Math.Clamp(score / WIN_SCORE, 0, 1);
    this.progressFill.width = this.progressWidth * ratio;
    this.label.setText(`WYNIK ${score} / ${WIN_SCORE}`);
  }

  setHp(ratio: number): void {
    const r = Phaser.Math.Clamp(ratio, 0, 1);
    this.hpFill.width = this.barWidth * r;
    this.hpFill.fillColor = r > 0.4 ? COLORS.cash : r > 0.2 ? COLORS.gold : COLORS.warn;
  }

  setLives(lives: number): void {
    this.livesText.setText(lives > 0 ? "♦".repeat(lives) : "—");
  }

  setTime(elapsedMs: number, maxMs: number): void {
    const totalSec = Math.floor(elapsedMs / 1000);
    const mm = Math.floor(totalSec / 60);
    const ss = (totalSec % 60).toString().padStart(2, "0");
    this.timeText.setText(`${mm}:${ss}`);
    const ratio = maxMs > 0 ? elapsedMs / maxMs : 0;
    this.timeText.setColor(
      ratio > 0.85 ? COLOR_HEX.warn : ratio > 0.6 ? COLOR_HEX.gold : COLOR_HEX.text,
    );
  }
}
