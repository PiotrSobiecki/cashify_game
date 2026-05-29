import Phaser from "phaser";
import { COLORS, COLOR_HEX, GAME_WIDTH, GAME_HEIGHT } from "../config";

const PANEL_W = 300;
const PANEL_H = 150;
const MARGIN = 12;

/**
 * Popup pracownika kantoru (Faza 3): avatar + chmurka z kwestią, wjeżdża
 * z prawej, trzyma się chwilę i znika. Sam nie zarządza czasem wyścigu —
 * GameScene pauzuje RaceClock na czas wyświetlenia i wznawia w `onDone`.
 * Brak tekstury avatara nie blokuje popupu (sam tekst).
 */
export class EmployeePopup {
  private active = false;

  constructor(private scene: Phaser.Scene) {}

  /** Czy popup jest aktualnie widoczny. */
  get isActive(): boolean {
    return this.active;
  }

  /** Pokazuje popup; po `durationMs` chowa go i woła `onDone`. */
  show(avatarKey: string, name: string, line: string, durationMs: number, onDone: () => void): void {
    if (this.active) {
      onDone();
      return;
    }
    this.active = true;

    const targetX = GAME_WIDTH - PANEL_W - MARGIN;
    const y = GAME_HEIGHT * 0.5 - PANEL_H / 2;
    const c = this.scene.add.container(GAME_WIDTH + PANEL_W, y).setDepth(19);

    const panel = this.scene.add.rectangle(0, 0, PANEL_W, PANEL_H, COLORS.bg, 0.95).setOrigin(0, 0);
    panel.setStrokeStyle(2, COLORS.yellow, 0.9);

    // avatar (z fallbackiem, gdy brak PNG)
    const avSize = 96;
    const avX = 14;
    const avY = (PANEL_H - avSize) / 2;
    let avatar: Phaser.GameObjects.GameObject;
    if (this.scene.textures.exists(avatarKey)) {
      avatar = this.scene.add
        .image(avX, avY, avatarKey)
        .setOrigin(0, 0)
        .setDisplaySize(avSize, avSize);
    } else {
      avatar = this.scene.add.rectangle(avX, avY, avSize, avSize, COLORS.magenta, 0.25).setOrigin(0, 0);
    }

    const textX = avX + avSize + 12;
    const textW = PANEL_W - textX - 12;
    const nameText = this.scene.add.text(textX, 14, name.toUpperCase(), {
      fontFamily: "monospace",
      fontSize: "15px",
      color: COLOR_HEX.yellow,
      fontStyle: "bold",
    });
    const lineText = this.scene.add.text(textX, 38, line, {
      fontFamily: "monospace",
      fontSize: "12px",
      color: COLOR_HEX.cyan,
      wordWrap: { width: textW },
      lineSpacing: 3,
    });

    c.add([panel, avatar, nameText, lineText]);

    this.scene.tweens.add({
      targets: c,
      x: targetX,
      duration: 280,
      ease: "Back.Out",
      onComplete: () => {
        this.scene.time.delayedCall(durationMs, () => {
          this.scene.tweens.add({
            targets: c,
            x: GAME_WIDTH + PANEL_W,
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
}
