import Phaser from "phaser";
import { BAG, COLORS } from "../config";

const BAG_DISPLAY_H = BAG.displayHeight;
import type { Player } from "../entities/Player";
import type { FallingItem } from "../entities/FallingItem";
import { BOSS_DROP } from "../data/items";
import { getBossPanelBottomY } from "../ui/BossEncounterDisplay";
import { BagEnergy } from "./BagEnergy";

/** Klucze sprite'ów worka (ładowane w BootScene z public/assets/bags/). */
const FRAME_KEY = {
  closed: "bag_closed",
  middle: "bag_middle",
  open: "bag_open",
} as const;

type Frame = keyof typeof FRAME_KEY;

/** Logo na worku — udział szerokości względem wysokości worka. */
const LOGO_WIDTH_RATIO = 0.34;
const LOGO_Y_OFFSET_RATIO = 0.3;

/**
 * Worek (Cashify). Przytrzymanie Spacji otwiera worek; przedmioty nad otworem
 * są nad workiem, w strefie łapania schodzą pod sprite worka (depth).
 */
export class BagSystem {
  private energy = new BagEnergy();
  private open = false;
  private lastOpen = false;
  private lastToggleAt = 0;
  private currentFrame: Frame | null = null;
  private readonly hasSprites: boolean;
  private gfx?: Phaser.GameObjects.Graphics;
  private logo?: Phaser.GameObjects.Image;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
  ) {
    this.hasSprites = scene.textures.exists(FRAME_KEY.closed);
    this.player.setDepth(BAG.depth.bag);

    if (this.hasSprites) {
      this.applyFrame("closed");
    } else {
      this.gfx = scene.add.graphics();
      this.gfx.setDepth(BAG.depth.bag);
    }

    if (scene.textures.exists("cashify_logo")) {
      const logoW = BAG_DISPLAY_H * LOGO_WIDTH_RATIO;
      const logoH = logoW * (32 / 128);
      this.logo = scene.add
        .image(player.x, player.y, "cashify_logo")
        .setDepth(BAG.depth.logo)
        .setDisplaySize(logoW, logoH);
    }
  }

  get isOpen(): boolean {
    return this.open;
  }

  /** Zamknięty na stałe (nie klatka pośrednia open↔closed) — tylko wtedy liczy się odbicie + HP. */
  isClosedForContact(now: number): boolean {
    if (this.open) return false;
    return now - this.lastToggleAt >= BAG.transitionMs;
  }

  get energyRatio(): number {
    return this.energy.ratio;
  }

  get isExhausted(): boolean {
    return this.energy.isExhausted;
  }

  /** Cel animacji — środek czarnego otworu na sprite worka. */
  get mouthPoint(): { x: number; y: number } {
    return {
      x: this.player.x,
      y: this.player.y - BAG_DISPLAY_H * BAG.mouthTargetUp,
    };
  }

  /** Strefa łapania / kontaktu — `open` przy otwartym, `closed` przy zamkniętym worku. */
  overlaps(obj: { x: number; y: number }, mode: "open" | "closed"): boolean {
    const centerUp = mode === "open" ? BAG.catchCenterUp : BAG.catchCenterUpClosed;
    const cy = this.player.y - BAG_DISPLAY_H * centerUp;
    const dx = obj.x - this.player.x;
    const dy = obj.y - cy;

    if (mode === "closed") {
      if (dy < -BAG.closedContactMinBelowPx) return false;
      if (dy > BAG.closedContactMaxBelowPx) return false;
      const maxDx = this.player.displayWidth * BAG.closedContactMaxDxRatio;
      if (Math.abs(dx) > maxDx) return false;
      const rx = BAG.catchRadiusClosedX;
      const ry = BAG.catchRadiusClosedY;
      return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
    }

    const r = BAG.catchRadius;
    return dx * dx + dy * dy <= r * r;
  }

  update(holding: boolean, dtSec: number, now: number): void {
    this.open = this.energy.update(holding, dtSec);
    if (this.open !== this.lastOpen) {
      this.lastOpen = this.open;
      this.lastToggleAt = now;
    }

    if (this.hasSprites) {
      const inTransition = now - this.lastToggleAt < BAG.transitionMs;
      this.applyFrame(inTransition ? "middle" : this.open ? "open" : "closed");
    } else {
      this.drawFallback();
    }

    this.logo?.setPosition(this.player.x, this.player.y + BAG_DISPLAY_H * LOGO_Y_OFFSET_RATIO);
  }

  /**
   * Nad otworem przedmiot jest przed workiem; w strefie łapania szybko wpada
   * w czarne otwarcie (za sprite) i jest ciągnięty do mouthPoint.
   */
  updateItemLayer(item: FallingItem, dtSec: number): void {
    // Sztabki bossa nad okienkiem kantoru — updateItemLayer nie może ich zrzucać na warstwę 7.
    if (item.itemType === BOSS_DROP && item.y < getBossPanelBottomY()) {
      item.setDepth(BAG.depth.bossDrop);
      return;
    }

    if (!this.hasSprites || !this.open) {
      item.setDepth(BAG.depth.itemFront);
      return;
    }

    const layerLineY = this.player.y - BAG_DISPLAY_H * BAG.mouthLayerThresholdUp;
    if (!this.overlaps(item, "open") || item.y < layerLineY) {
      item.setDepth(BAG.depth.itemFront);
      return;
    }

    const mouth = this.mouthPoint;
    const pull = 1 - Math.exp(-dtSec * BAG.mouthPullSpeed);
    item.x += (mouth.x - item.x) * pull * BAG.mouthPullX;
    item.y += (mouth.y - item.y) * pull * BAG.mouthPullY;

    const dist = Phaser.Math.Distance.Between(item.x, item.y, mouth.x, mouth.y);
    item.setDepth(dist > BAG.mouthHideDistance ? BAG.depth.itemFront : BAG.depth.itemBehind);

    const body = item.body as Phaser.Physics.Arcade.Body | null;
    if (body?.enable) {
      body.setVelocity(
        Phaser.Math.Linear(body.velocity.x, mouth.x - item.x, 0.3),
        Phaser.Math.Linear(body.velocity.y, Math.max(body.velocity.y, 70), 0.15) +
          (mouth.y - item.y) * 5,
      );
    }
  }

  private applyFrame(frame: Frame): void {
    if (frame === this.currentFrame) return;
    this.currentFrame = frame;
    const key = FRAME_KEY[frame];
    this.player.setTexture(key);
    const src = this.scene.textures.get(key).getSourceImage();
    const w = src.height > 0 ? BAG_DISPLAY_H * (src.width / src.height) : BAG_DISPLAY_H;
    this.player.setDisplaySize(w, BAG_DISPLAY_H);
    this.player.refreshHitbox();
    this.syncLogoSize();
  }

  private syncLogoSize(): void {
    if (!this.logo) return;
    const logoW = BAG_DISPLAY_H * LOGO_WIDTH_RATIO;
    this.logo.setDisplaySize(logoW, logoW * (32 / 128));
  }

  private drawFallback(): void {
    if (!this.gfx) return;
    const px = this.player.x;
    const py = this.player.y - 6;
    const r = BAG.catchRadius;
    this.gfx.clear();
    if (this.open) {
      const half = Phaser.Math.DegToRad(78);
      const center = -Math.PI / 2;
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i <= 26; i++) {
        const a = center - half + (2 * half * i) / 26;
        pts.push(new Phaser.Math.Vector2(px + Math.cos(a) * r, py + Math.sin(a) * r));
      }
      this.gfx.lineStyle(3, COLORS.gold, 0.95);
      this.gfx.strokePoints(pts, false, false);
    } else {
      this.gfx.lineStyle(3, COLORS.fiat, 0.55);
      this.gfx.lineBetween(px - 14, py - r * 0.5, px + 14, py - r * 0.5);
    }
  }
}
