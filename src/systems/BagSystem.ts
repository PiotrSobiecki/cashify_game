import Phaser from "phaser";
import { BAG, COLORS } from "../config";
import type { Player } from "../entities/Player";

/**
 * Worek (Cashify). Zastępuje ShieldSystem: gracz przytrzymuje Spację, by
 * OTWORZYĆ worek nad sobą. Stan otwarty rysujemy jako świecącą „paszczę"
 * worka (łuk nad graczem); zamknięty — wąska kreska. Decyzję złap/odbij
 * podejmuje czysta funkcja resolveCatch w GameScene; tu trzymamy stan,
 * wizual i geometrię strefy łapania.
 */
export class BagSystem {
  private gfx: Phaser.GameObjects.Graphics;
  private open = false;

  constructor(
    scene: Phaser.Scene,
    private player: Player,
  ) {
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(7);
  }

  /** Czy worek jest otwarty w tej klatce. */
  get isOpen(): boolean {
    return this.open;
  }

  /** Czy obiekt nachodzi na strefę łapania worka (wokół gracza). */
  overlaps(obj: { x: number; y: number }): boolean {
    return Phaser.Math.Distance.Between(obj.x, obj.y, this.player.x, this.player.y) <= BAG.catchRadius;
  }

  /** Ustawia stan z wejścia (przytrzymanie) i odrysowuje worek. */
  update(holding: boolean): void {
    this.open = holding;
    this.draw();
  }

  private draw(): void {
    const px = this.player.x;
    const py = this.player.y - 6;
    const r = BAG.catchRadius;
    this.gfx.clear();

    if (this.open) {
      // otwarta „paszcza" worka — łuk nad graczem (akcent złota Cashify)
      const half = Phaser.Math.DegToRad(78);
      const center = -Math.PI / 2;
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i <= 26; i++) {
        const a = center - half + (2 * half * i) / 26;
        pts.push(new Phaser.Math.Vector2(px + Math.cos(a) * r, py + Math.sin(a) * r));
      }
      this.gfx.lineStyle(9, COLORS.yellow, 0.1);
      this.gfx.strokePoints(pts, false, false);
      this.gfx.lineStyle(3, COLORS.yellow, 0.95);
      this.gfx.strokePoints(pts, false, false);
      this.gfx.fillStyle(COLORS.yellow, 0.9);
      this.gfx.fillCircle(pts[0].x, pts[0].y, 2.5);
      this.gfx.fillCircle(pts[26].x, pts[26].y, 2.5);
    } else {
      // zamknięty worek — wąska kreska nad graczem (sygnał „nie łapie")
      this.gfx.lineStyle(3, COLORS.cyan, 0.55);
      this.gfx.lineBetween(px - 14, py - r * 0.5, px + 14, py - r * 0.5);
    }
  }
}
