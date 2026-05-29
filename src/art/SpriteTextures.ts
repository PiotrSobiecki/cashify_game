import Phaser from "phaser";
import { COLORS } from "../config";

/** Klucze tekstur generowanych proceduralnie w BootScene. */
export const TEXTURE = {
  player: "player",
  boss: "boss",
  particle: "particle",
  /** Placeholder przedmiotu (barwiony wg kategorii), gdy brak PNG z katalogu. */
  itemFallback: "item_fallback",
} as const;

export const SPRITE = {
  player: { w: 56, h: 56 },
  boss: { w: 92, h: 80 },
  particle: { w: 10, h: 10 },
  item: { w: 28, h: 28 },
} as const;

const DARK = 0x1a2238;
const SHIELD_FILL = 0x0d3d4a;

/**
 * Proceduralne sprite'y. Gracz (worek/statek), boss-event, particle oraz
 * placeholder przedmiotu — reszta (logo krypto/fiat/metale) to PNG z public/.
 */
export function registerGameTextures(scene: Phaser.Scene): void {
  createPlayerTexture(scene);
  createBossTexture(scene);
  createParticleTexture(scene);
  createItemFallbackTexture(scene);
}

/** Heraldyczny kontur tarczy jako lista wierzchołków (Phaser 4: Vector2). */
function shieldOutline(
  cx: number,
  topY: number,
  halfW: number,
  shoulderY: number,
  hipY: number,
  tipY: number,
): Phaser.Math.Vector2[] {
  return [
    new Phaser.Math.Vector2(cx, topY),
    new Phaser.Math.Vector2(cx + halfW, shoulderY),
    new Phaser.Math.Vector2(cx + halfW * 0.85, hipY),
    new Phaser.Math.Vector2(cx, tipY),
    new Phaser.Math.Vector2(cx - halfW * 0.85, hipY),
    new Phaser.Math.Vector2(cx - halfW, shoulderY),
  ];
}

/** Świecący „rdzeń” gracza (czytelny w skali ~14px). */
function drawCore(g: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
  g.fillStyle(COLORS.green, 0.22);
  g.fillCircle(cx, cy, 10);
  const hex: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    hex.push(new Phaser.Math.Vector2(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8));
  }
  g.fillStyle(0x06241c, 1);
  g.fillPoints(hex, true, true);
  g.lineStyle(1.5, COLORS.green, 1);
  g.strokePoints(hex, true, true);
  g.fillStyle(COLORS.yellow, 1);
  g.fillCircle(cx, cy, 4);
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(cx, cy - 1, 1.6);
}

function createPlayerTexture(scene: Phaser.Scene): void {
  const { w, h } = SPRITE.player;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const cx = w / 2;

  // silniki + poświata (dolny segment)
  g.fillStyle(COLORS.cyan, 0.16);
  g.fillEllipse(cx, h - 4, 30, 12);
  g.fillStyle(DARK, 1);
  g.fillRoundedRect(cx - 12, h - 16, 24, 11, 3);
  g.lineStyle(2, COLORS.cyan, 0.9);
  g.strokeRoundedRect(cx - 12, h - 16, 24, 11, 3);
  for (const ox of [-7, 7]) {
    g.fillStyle(COLORS.yellow, 0.55);
    g.fillEllipse(cx + ox, h - 4, 8, 8);
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(cx + ox, h - 6, 3, 5);
  }

  // korpus heraldyczny (worek/statek)
  const outline = shieldOutline(cx, 3, 21, 16, 35, 47);
  g.lineStyle(5, COLORS.yellow, 0.18);
  g.strokePoints(outline, true, true);
  g.fillStyle(DARK, 1);
  g.fillPoints(outline, true, true);
  g.fillStyle(SHIELD_FILL, 0.9);
  g.fillPoints(shieldOutline(cx, 7, 16, 18, 32, 42), true, true);
  g.lineStyle(2.5, COLORS.yellow, 1);
  g.strokePoints(outline, true, true);

  drawCore(g, cx, 23);

  g.generateTexture(TEXTURE.player, w, h);
  g.destroy();
}

/** Boss-event — duży świecący rdzeń (placeholder zdarzenia bossa). */
function createBossTexture(scene: Phaser.Scene): void {
  const { w, h } = SPRITE.boss;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const cx = w / 2;
  const cy = h / 2;

  g.fillStyle(COLORS.magenta, 0.12);
  g.fillEllipse(cx, cy, w, h);

  const hex = (r: number, ry: number): Phaser.Math.Vector2[] => {
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * ry));
    }
    return pts;
  };
  g.fillStyle(0x1a0a26, 1);
  g.fillPoints(hex(26, 30), true, true);
  g.lineStyle(3, COLORS.magenta, 1);
  g.strokePoints(hex(26, 30), true, true);
  g.lineStyle(1.5, COLORS.yellow, 0.5);
  g.strokePoints(hex(18, 21), true, true);

  g.fillStyle(COLORS.yellow, 1);
  g.fillCircle(cx, cy, 12);
  g.fillStyle(0x1a0010, 1);
  g.fillCircle(cx, cy, 6);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(cx - 2, cy - 2, 2.5);

  g.generateTexture(TEXTURE.boss, w, h);
  g.destroy();
}

/** Placeholder przedmiotu — moneta (biała, barwiona setTint wg kategorii). */
function createItemFallbackTexture(scene: Phaser.Scene): void {
  const { w, h } = SPRITE.item;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const cx = w / 2;
  const cy = h / 2;
  g.fillStyle(0xffffff, 0.18);
  g.fillCircle(cx, cy, 13);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx, cy, 10);
  g.fillStyle(0x0d1622, 1);
  g.fillCircle(cx, cy, 7);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx, cy, 3);
  g.generateTexture(TEXTURE.itemFallback, w, h);
  g.destroy();
}

function createParticleTexture(scene: Phaser.Scene): void {
  const { w, h } = SPRITE.particle;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const cx = w / 2;
  const cy = h / 2;
  g.fillStyle(0xffffff, 1);
  g.beginPath();
  g.moveTo(cx, 0);
  g.lineTo(w, cy);
  g.lineTo(cx, h);
  g.lineTo(0, cy);
  g.closePath();
  g.fillPath();
  g.fillStyle(COLORS.yellow, 0.5);
  g.fillCircle(cx, cy, 2);
  g.generateTexture(TEXTURE.particle, w, h);
  g.destroy();
}
