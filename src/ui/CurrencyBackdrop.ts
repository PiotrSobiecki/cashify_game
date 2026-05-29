import Phaser from "phaser";
import { COLORS, COLOR_HEX, GAME_WIDTH, GAME_HEIGHT } from "../config";

interface Floater {
  text: Phaser.GameObjects.Text;
  speed: number;
  phase: number;
  amp: number;
  baseX: number;
}

/**
 * Tło planszy Cashify: jednolite ciemne tło + wolno spadające symbole walut.
 */
export class CurrencyBackdrop {
  private readonly floaters: Floater[] = [];
  private readonly gfx: Phaser.GameObjects.Graphics;
  private baseDrawn = false;
  private readonly glyphs = ["$", "€", "£", "¥", "₿", "zł", "PLN"] as const;

  constructor(private scene: Phaser.Scene) {
    this.gfx = scene.add.graphics().setDepth(-2);
    this.drawBase();

    for (let i = 0; i < 18; i++) {
      const glyph = Phaser.Utils.Array.GetRandom([...this.glyphs]);
      const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
      const y = Phaser.Math.Between(-40, GAME_HEIGHT);
      const color = i % 3 === 0 ? COLOR_HEX.gold : i % 3 === 1 ? COLOR_HEX.fiat : COLOR_HEX.crypto;
      const text = scene.add
        .text(x, y, glyph, {
          fontFamily: "monospace",
          fontSize: `${Phaser.Math.Between(18, 28)}px`,
          color,
        })
        .setAlpha(Phaser.Math.FloatBetween(0.04, 0.09))
        .setDepth(-1);
      this.floaters.push({
        text,
        speed: Phaser.Math.FloatBetween(40, 70),
        phase: Math.random() * Math.PI * 2,
        amp: Phaser.Math.FloatBetween(6, 14),
        baseX: x,
      });
    }
  }

  update(dtSec: number): void {
    const t = this.scene.time.now * 0.001;
    for (const f of this.floaters) {
      f.text.y += f.speed * dtSec;
      f.text.x = f.baseX + Math.sin(t * 0.7 + f.phase) * f.amp;
      if (f.text.y > GAME_HEIGHT + 36) {
        f.text.y = Phaser.Math.Between(-70, -16);
        f.baseX = Phaser.Math.Between(20, GAME_WIDTH - 20);
        f.text.x = f.baseX;
      }
    }
  }

  /** Jednolite tło — bez gradientów i elips. */
  private drawBase(): void {
    if (this.baseDrawn) return;
    this.baseDrawn = true;
    this.gfx.fillStyle(COLORS.bg, 1);
    this.gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}
