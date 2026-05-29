import Phaser from "phaser";
import { COLORS } from "../config";
import { ITEMS, type ItemType } from "../data/items";

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
  item: { w: 36, h: 36 }, // wyświetlanie; tekstury rysowane w niskiej rozdz. (pixel-art)
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
  createItemTextures(scene);
}

const GOLD = { base: 0xf5c542, dark: 0x9c7a16, hi: 0xfff0b0 };
const SILVER = { base: 0xd8dde6, dark: 0x9aa1ad, hi: 0xffffff };

/** Symbol i barwa monety waluty fiat. */
const FIAT_GLYPH: Record<string, { text: string; rim: number; hex: string }> = {
  usd: { text: "$", rim: 0x2e9e5b, hex: "#7CFFB0" },
  eur: { text: "€", rim: 0x3a6ee0, hex: "#9CC2FF" },
  pln: { text: "zł", rim: 0xd23a4f, hex: "#FFB0BC" },
  mxn: { text: "$", rim: 0x1aa0a0, hex: "#9CF0F0" },
  czk: { text: "Kč", rim: 0xe08a2a, hex: "#FFD79C" },
};

/**
 * Sprite'y przedmiotów spoza krypto (krypto = PNG): sztabki (ingoty), monety
 * z połyskiem, monety walut z symbolem. Rejestrowane pod kluczami assetów z
 * katalogu (np. "metals/gold_bar"), więc FallingItem użyje ich wprost.
 */
/** Czy pod kluczem jest PRAWDZIWA tekstura (wczytany PNG), a nie pusta/uszkodzona. */
function isRealTexture(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  const img = scene.textures.get(key).getSourceImage() as { width?: number; height?: number };
  return !!img && (img.width ?? 0) > 1 && (img.height ?? 0) > 1;
}

function createItemTextures(scene: Phaser.Scene): void {
  for (const type of Object.keys(ITEMS) as ItemType[]) {
    const def = ITEMS[type];
    if (def.category === "crypto") continue; // krypto = PNG z public/
    const key = def.asset;
    if (isRealTexture(scene, key)) continue; // prawdziwy PNG (np. metale) ma pierwszeństwo
    // nieudany load (np. brak PNG waluty) mógł zostawić pustą teksturę — usuń ją,
    // inaczej FallingItem pokaże niewidoczny sprite, a generateTexture rzuci błąd.
    if (scene.textures.exists(key)) scene.textures.remove(key);
    if (type === "gold_bar") drawIngot(scene, key, GOLD);
    else if (type === "silver_bar") drawIngot(scene, key, SILVER);
    else if (type === "boss_bar") drawIngot(scene, key, GOLD, true);
    else if (type === "gold_coin") drawCoin(scene, key, GOLD);
    else if (type === "silver_coin") drawCoin(scene, key, SILVER);
    else if (def.category === "fiat") drawFiatCoin(scene, key, type);
  }
}

// Tekstury rysowane w NISKIEJ rozdzielczości — przy pixelArt skalują się do
// SPRITE.item (36px) z efektem chunky-pixeli (retro, jak worek).

/** Sztabka (ingot) — niska rozdz. 24×18, blokowa; boss = z iskrami. */
function drawIngot(
  scene: Phaser.Scene,
  key: string,
  c: { base: number; dark: number; hi: number },
  boss = false,
): void {
  const w = 24;
  const h = 18;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const body = [
    new Phaser.Math.Vector2(5, 8),
    new Phaser.Math.Vector2(w - 5, 8),
    new Phaser.Math.Vector2(w - 2, h - 2),
    new Phaser.Math.Vector2(2, h - 2),
  ];
  g.fillStyle(c.base, 1);
  g.fillPoints(body, true, true);
  g.lineStyle(1, c.dark, 1);
  g.strokePoints(body, true, true);
  const top = [
    new Phaser.Math.Vector2(5, 8),
    new Phaser.Math.Vector2(w - 5, 8),
    new Phaser.Math.Vector2(w - 8, 3),
    new Phaser.Math.Vector2(8, 3),
  ];
  g.fillStyle(c.hi, 1);
  g.fillPoints(top, true, true);
  g.lineStyle(1, c.dark, 1);
  g.strokePoints(top, true, true);
  g.fillStyle(0xffffff, 0.6);
  g.fillRect(7, 10, 4, 2);
  if (boss) {
    g.fillStyle(0xffffff, 0.95);
    g.fillRect(3, 4, 1, 1);
    g.fillRect(w - 4, 5, 1, 1);
    g.fillRect(w - 7, h - 4, 1, 1);
  }
  g.generateTexture(key, w, h);
  g.destroy();
}

/** Moneta — krążek z rantem i połyskiem, niska rozdz. 16×16. */
function drawCoin(
  scene: Phaser.Scene,
  key: string,
  c: { base: number; dark: number; hi: number },
): void {
  const s = 16;
  const cx = s / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(c.dark, 1);
  g.fillCircle(cx, cx, 7);
  g.fillStyle(c.base, 1);
  g.fillCircle(cx, cx, 5.5);
  g.lineStyle(1, c.hi, 0.9);
  g.strokeCircle(cx, cx, 4);
  g.fillStyle(c.hi, 0.9);
  g.fillRect(5, 5, 1, 1);
  g.generateTexture(key, s, s);
  g.destroy();
}

/**
 * Moneta waluty fiat — krążek w barwie waluty + symbol ($ € zł Kč).
 * CanvasTexture (kontekst 2D) zamiast RenderTexture — pewny rendering w WebGL
 * (RenderTexture potrafił wyjść pusty/niewidoczny przy pixelArt).
 */
function drawFiatCoin(scene: Phaser.Scene, key: string, type: string): void {
  const s = 28;
  const cx = s / 2;
  const spec = FIAT_GLYPH[type] ?? { text: "?", rim: 0x888888, hex: "#ffffff" };
  const rimHex = "#" + spec.rim.toString(16).padStart(6, "0");

  const tex = scene.textures.createCanvas(key, s, s);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = rimHex;
  ctx.beginPath();
  ctx.arc(cx, cx, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d1622";
  ctx.beginPath();
  ctx.arc(cx, cx, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = spec.hex;
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(spec.text, cx, cx + 1);
  tex.refresh();
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
