import Phaser from "phaser";
import { COLORS, COLOR_HEX, GAME_WIDTH, GAME_HEIGHT } from "../config";
import { getNpcPopupFrame, NPC_FRAME_POPUP_FULL } from "../assets/npcFrames";

const MARGIN = 12;
const BUBBLE_W = 210;
const BUBBLE_H = 82;
const GAP = 8;
/** Dymek bliżej postaci (w lewo). */
const BUBBLE_X_INSET = 20;
/** Dymek niżej względem głowy (px w dół). */
const BUBBLE_Y_OFFSET = 12;
/** Nad workiem gracza (SPAWN_Y ≈ GAME_HEIGHT - 90). */
const BOTTOM_CLEAR = 108;
/** Głowa — odległość od góry sprite'a (0 = czubek, 1 = stopy). */
const HEAD_FROM_TOP = 0.11;
/** Dymek — pionowo: środek dymka przy głowie (0.5 = głowa w połowie wysokości). */
const BUBBLE_HEAD_ALIGN = 0.4;
/** Dodatkowe powiększenie postaci w popupie. */
const CHAR_SCALE_BOOST = 1.22;

/**
 * Popup NPC: postać po lewej, dymek po prawej (przy głowie), wjazd z prawej.
 * Zawsze klatka {@link NPC_FRAME_POPUP_FULL} — osobno od ucięcia bossa.
 */
export class EmployeePopup {
  private active = false;

  constructor(private scene: Phaser.Scene) {}

  get isActive(): boolean {
    return this.active;
  }

  show(avatarKey: string, name: string, line: string, durationMs: number, onDone: () => void): void {
    if (this.active) {
      onDone();
      return;
    }
    this.active = true;

    const maxPanelW = GAME_WIDTH - MARGIN * 2;
    const maxAvW = maxPanelW - BUBBLE_W - GAP - 12;
    const maxAvH = GAME_HEIGHT - BOTTOM_CLEAR - 56;

    const { dispW, dispH, scale, bubbleLayoutW } = this.avatarMetrics(
      avatarKey,
      maxAvW,
      maxAvH,
    );

    const avX = 6;
    /** Pozycja dymka nie przesuwa się przy CHAR_SCALE_BOOST — tylko postać rośnie. */
    const bubbleX = avX + bubbleLayoutW + GAP - BUBBLE_X_INSET;
    const panelW = Math.max(bubbleX + BUBBLE_W + 10, avX + dispW + 10);
    const topPad = 20;
    const panelH = dispH + topPad + 12;
    const baseY = Math.max(64, GAME_HEIGHT - panelH - BOTTOM_CLEAR);
    const targetX = Math.max(MARGIN, GAME_WIDTH - panelW - MARGIN);
    const offX = GAME_WIDTH + panelW;

    const c = this.scene.add.container(offX, baseY).setDepth(19);

    const avY = panelH - 6;
    const avatar = this.createAvatar(avatarKey, avX, avY, scale);

    const headY = avY - dispH + dispH * HEAD_FROM_TOP;
    const bubbleY = headY - BUBBLE_H * BUBBLE_HEAD_ALIGN + BUBBLE_Y_OFFSET;

    const g = this.scene.add.graphics();
    g.fillStyle(COLORS.text, 1);
    g.lineStyle(3, COLORS.gold, 1);
    g.fillRoundedRect(bubbleX, bubbleY, BUBBLE_W, BUBBLE_H, 12);
    g.strokeRoundedRect(bubbleX, bubbleY, BUBBLE_W, BUBBLE_H, 12);

    const tailBaseX = bubbleX + 2;
    const tailTipX = tailBaseX - 16;
    const tailY = bubbleY + BUBBLE_H * 0.48;
    g.fillTriangle(tailBaseX, tailY - 10, tailBaseX, tailY + 10, tailTipX, tailY);
    g.lineBetween(tailBaseX, tailY - 10, tailTipX, tailY);
    g.lineBetween(tailBaseX, tailY + 10, tailTipX, tailY);

    const nameText = this.scene.add.text(bubbleX + 12, bubbleY + 8, name.toUpperCase(), {
      fontFamily: "monospace",
      fontSize: "14px",
      color: COLOR_HEX.gold,
      fontStyle: "bold",
    });
    const lineText = this.scene.add.text(bubbleX + 12, bubbleY + 28, line, {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#10202c",
      wordWrap: { width: BUBBLE_W - 24 },
      lineSpacing: 3,
    });

    c.add([avatar, g, nameText, lineText]);

    this.scene.tweens.add({
      targets: c,
      x: targetX,
      duration: 300,
      ease: "Back.Out",
      onComplete: () => {
        this.scene.time.delayedCall(durationMs, () => {
          this.scene.tweens.add({
            targets: c,
            x: offX,
            duration: 240,
            ease: "Back.In",
            onComplete: () => {
              c.destroy();
              this.active = false;
              onDone();
            },
          });
        });
      },
    });
  }

  private avatarMetrics(
    avatarKey: string,
    maxW: number,
    maxH: number,
  ): { dispW: number; dispH: number; scale: number; bubbleLayoutW: number } {
    if (!this.scene.textures.exists(avatarKey)) {
      return { dispW: maxW, dispH: maxH, scale: 1, bubbleLayoutW: maxW };
    }
    const frame = getNpcPopupFrame(this.scene, avatarKey);
    const srcW = Math.max(frame.width, 1);
    const srcH = Math.max(frame.height, 1);
    const baseScale = Math.min(maxW / srcW, maxH / srcH);
    const scale = Math.min(baseScale * CHAR_SCALE_BOOST, maxW / srcW, maxH / srcH);
    return {
      dispW: srcW * scale,
      dispH: srcH * scale,
      scale,
      bubbleLayoutW: srcW * baseScale,
    };
  }

  private createAvatar(
    avatarKey: string,
    x: number,
    y: number,
    scale: number,
  ): Phaser.GameObjects.GameObject {
    if (!this.scene.textures.exists(avatarKey)) {
      return this.scene.add
        .rectangle(x, y, 120, 200, COLORS.fiat, 0.25)
        .setOrigin(0, 1);
    }
    return this.scene.add
      .image(x, y, avatarKey, NPC_FRAME_POPUP_FULL)
      .setOrigin(0, 1)
      .setScale(scale);
  }
}
