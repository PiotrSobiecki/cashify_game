import Phaser from "phaser";
import { COLORS, COLOR_HEX, GAME_WIDTH } from "../config";
import { ensureNpcBossTorsoFrame } from "../assets/npcFrames";
import { getBossEncounter, type BossEncounterDef } from "../data/bosses";

/** Okienko kantoru — duża głowa + kawałek tułowia. */
const LAYOUT = {
  /** Tuż pod panelem HUD (~102 px). */
  topY: 106,
  winW: 184,
  winH: 118,
  /** Tło tylko wokół ramki portretu (bez szerokiej lady na dole). */
  padX: 12,
  padTop: 8,
  padBottom: 8,
  /** Góra PNG: głowa + barki / góra tułowia. */
  torsoCropRatio: 0.54,
  /** Dodatkowe powiększenie w szybie (1 = dopasowanie do ramki). */
  scaleBoost: 1.32,
  depth: {
    back: 10,
    npc: 11,
    glass: 12,
    frame: 13,
    banner: 17,
  },
} as const;

function panelRect(cx: number): { x: number; y: number; w: number; h: number } {
  const { topY, winW, winH, padX, padTop, padBottom } = LAYOUT;
  return {
    x: cx - winW / 2 - padX,
    y: topY - padTop,
    w: winW + padX * 2,
    h: winH + padTop + padBottom,
  };
}

/** Dolna krawędź tła okienka bossa — poniżej sztabki wracają na zwykłą warstwę. */
export function getBossPanelBottomY(): number {
  const p = panelRect(GAME_WIDTH / 2);
  return p.y + p.h + 4;
}

/** Otwór u dołu złotej ramki portretu (nie w szarej ladzie poniżej). */
function holeRect(cx: number): { x: number; y: number; w: number; h: number } {
  const { topY, winH } = LAYOUT;
  const w = 58;
  const h = 18;
  return {
    x: cx - w / 2,
    y: topY + winH - h,
    w,
    h,
  };
}

type GfxParts = {
  back: Phaser.GameObjects.Graphics;
  glass: Phaser.GameObjects.Graphics;
  frame: Phaser.GameObjects.Graphics;
  banner: Phaser.GameObjects.Text;
};

/**
 * Scenografia bossa: głowa + fragment tułowia za szybą (bez rozciągania).
 */
export class BossEncounterDisplay {
  private npc?: Phaser.GameObjects.Image;
  private gfx?: GfxParts;
  private npcBaseY = 0;
  private dropX = GAME_WIDTH / 2;
  private active = false;

  constructor(private scene: Phaser.Scene) {}

  get isActive(): boolean {
    return this.active;
  }

  show(bossIndex: number): void {
    this.hide();
    const def = getBossEncounter(bossIndex);
    this.build(def);
    this.active = true;
  }

  hide(): void {
    this.active = false;
    this.npc?.destroy();
    this.npc = undefined;
    if (this.gfx) {
      this.gfx.back.destroy();
      this.gfx.glass.destroy();
      this.gfx.frame.destroy();
      this.gfx.banner.destroy();
      this.gfx = undefined;
    }
  }

  /** Górna krawędź otworu — sztabka startuje stąd (origin 0.5,0 w spawnie). */
  getDropPoint(): { x: number; y: number } {
    const hole = holeRect(this.dropX);
    const margin = 8;
    const minX = hole.x + margin;
    const maxX = hole.x + hole.w - margin;
    return {
      x: Phaser.Math.Between(minX, maxX),
      y: hole.y + 3,
    };
  }

  playThrow(): void {
    if (!this.npc?.active) return;
    this.scene.tweens.killTweensOf(this.npc);
    this.npc.setPosition(this.npc.x, this.npcBaseY);
    const s = this.npc.scale;
    this.scene.tweens.add({
      targets: this.npc,
      y: this.npcBaseY - 3,
      scale: s * 1.03,
      duration: 90,
      yoyo: true,
      ease: "Quad.out",
      onComplete: () => this.npc?.setScale(s),
    });
  }

  private build(def: BossEncounterDef): void {
    const cx = GAME_WIDTH / 2;
    const { topY, winW, winH, depth } = LAYOUT;
    this.dropX = cx;

    const back = this.scene.add.graphics().setDepth(depth.back);
    this.drawCounter(back, cx);

    const npcKey = this.scene.textures.exists(def.npcKey) ? def.npcKey : def.fallbackTexture;
    const cropRatio = def.torsoCropRatio ?? LAYOUT.torsoCropRatio;
    const headFrame = ensureNpcBossTorsoFrame(this.scene, npcKey, cropRatio);
    const frame = this.scene.textures.get(npcKey).get(headFrame);

    const anchorBottom = def.anchor === "bottom";
    const padTop = anchorBottom ? 2 : 6;
    const padBottom = anchorBottom ? 0 : 6;
    const innerH = winH - padTop - padBottom;
    const innerW = winW - 8;
    const fit = Math.min(innerW / frame.width, innerH / frame.height);
    const scale = fit * (def.scaleBoost ?? LAYOUT.scaleBoost);

    const npcY =
      (anchorBottom ? topY + winH - padBottom : topY + winH * (def.centerRatio ?? 0.44)) +
      (def.yOffset ?? 0);

    this.npcBaseY = npcY;
    this.npc = this.scene.add
      .image(cx, npcY, npcKey, headFrame)
      .setOrigin(0.5, anchorBottom ? 1 : 0.5)
      .setScale(scale)
      .setDepth(depth.npc);

    const glass = this.scene.add.graphics().setDepth(depth.glass);
    this.drawGlass(glass, cx);

    const frameGfx = this.scene.add.graphics().setDepth(depth.frame);
    this.drawFrame(frameGfx, cx);

    const banner = this.scene.add
      .text(cx, topY + 4, def.shout, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: COLOR_HEX.gold,
        stroke: COLOR_HEX.bg,
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(depth.banner);

    this.gfx = { back, glass, frame: frameGfx, banner };
  }

  private drawCounter(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH } = LAYOUT;
    const slab = panelRect(cx);

    gfx.fillStyle(COLORS.panel, 1);
    gfx.fillRoundedRect(slab.x, slab.y, slab.w, slab.h, 8);

    gfx.fillStyle(0x101820, 1);
    gfx.fillRoundedRect(cx - winW / 2 + 2, topY + 2, winW - 4, winH - 4, 6);
  }

  private drawGlass(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH } = LAYOUT;
    const x = cx - winW / 2;
    gfx.fillStyle(0x8cb4d8, 0.1);
    gfx.fillRoundedRect(x + 3, topY + 3, winW - 6, winH - 6, 5);
  }

  private drawFrame(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH } = LAYOUT;
    const x = cx - winW / 2;
    const y = topY;

    gfx.lineStyle(5, COLORS.gold, 1);
    gfx.strokeRoundedRect(x, y, winW, winH, 8);
    gfx.lineStyle(2, COLORS.goldLight, 0.95);
    gfx.strokeRoundedRect(x + 4, y + 4, winW - 8, winH - 8, 6);

    const { x: slotX, y: slotY, w: slotW, h: slotH } = holeRect(cx);
    gfx.fillStyle(0x080c10, 1);
    gfx.fillRoundedRect(slotX, slotY, slotW, slotH, 4);
    gfx.lineStyle(2, COLORS.gold, 1);
    gfx.strokeRoundedRect(slotX, slotY, slotW, slotH, 4);
  }
}
