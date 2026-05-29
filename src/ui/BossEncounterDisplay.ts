import Phaser from "phaser";
import { COLORS, COLOR_HEX, GAME_WIDTH } from "../config";
import { ensureNpcBossTorsoFrame } from "../assets/npcFrames";
import { getBossEncounter, type BossEncounterDef } from "../data/bosses";

/** Okienko kantoru — duża głowa + kawałek tułowia. */
const LAYOUT = {
  topY: 106,
  winW: 184,
  winH: 118,
  counterH: 42,
  slabW: 320,
  /** Góra PNG: głowa + barki / góra tułowia. */
  torsoCropRatio: 0.54,
  /** Dodatkowe powiększenie w szybie (1 = dopasowanie do ramki). */
  scaleBoost: 1.32,
  depth: {
    back: 10,
    npc: 11,
    glass: 12,
    frame: 13,
    banner: 13,
  },
} as const;

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
  private dropY = LAYOUT.topY + LAYOUT.winH;
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

  getDropPoint(): { x: number; y: number } {
    return {
      x: this.dropX + Phaser.Math.Between(-22, 22),
      y: this.dropY,
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
    const { topY, winW, winH, counterH, depth } = LAYOUT;
    this.dropX = cx;
    this.dropY = topY + winH + counterH - 12;

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
      .text(cx, topY - 8, def.shout, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: COLOR_HEX.gold,
      })
      .setOrigin(0.5, 1)
      .setDepth(depth.banner);

    this.gfx = { back, glass, frame: frameGfx, banner };
  }

  private drawCounter(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH, counterH, slabW } = LAYOUT;
    const slabX = cx - slabW / 2;
    const slabY = topY - 6;

    gfx.fillStyle(COLORS.panel, 1);
    gfx.fillRoundedRect(slabX, slabY, slabW, winH + counterH + 14, 8);

    gfx.fillStyle(0x101820, 1);
    gfx.fillRoundedRect(cx - winW / 2 + 2, topY + 2, winW - 4, winH - 4, 6);

    gfx.fillStyle(0x1a2634, 1);
    gfx.fillRect(slabX, topY + winH, slabW, counterH + 2);

    gfx.lineStyle(2, COLORS.gold, 0.55);
    gfx.lineBetween(slabX + 8, topY + winH + counterH, slabX + slabW - 8, topY + winH + counterH);
  }

  private drawGlass(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH } = LAYOUT;
    const x = cx - winW / 2;
    gfx.fillStyle(0x8cb4d8, 0.1);
    gfx.fillRoundedRect(x + 3, topY + 3, winW - 6, winH - 6, 5);
  }

  private drawFrame(gfx: Phaser.GameObjects.Graphics, cx: number): void {
    const { topY, winW, winH, counterH } = LAYOUT;
    const x = cx - winW / 2;
    const y = topY;

    gfx.lineStyle(5, COLORS.gold, 1);
    gfx.strokeRoundedRect(x, y, winW, winH, 8);
    gfx.lineStyle(2, COLORS.goldLight, 0.95);
    gfx.strokeRoundedRect(x + 4, y + 4, winW - 8, winH - 8, 6);

    const slotW = 58;
    const slotX = cx - slotW / 2;
    const slotY = topY + winH + counterH - 24;
    gfx.fillStyle(0x080c10, 1);
    gfx.fillRoundedRect(slotX, slotY, slotW, 18, 4);
    gfx.lineStyle(2, COLORS.gold, 1);
    gfx.strokeRoundedRect(slotX, slotY, slotW, 18, 4);
  }
}
