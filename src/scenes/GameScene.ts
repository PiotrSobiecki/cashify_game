import Phaser from "phaser";
import { TEXTURE } from "../art/SpriteTextures";
import {
  COLORS,
  COLOR_HEX,
  GAME_WIDTH,
  GAME_HEIGHT,
  SESSION_MAX_MS,
  TOUCH,
  BAG,
  FALLING,
} from "../config";
import { Player } from "../entities/Player";
import { FallingItem } from "../entities/FallingItem";
import { BagSystem } from "../systems/BagSystem";
import { ScoreSystem } from "../systems/ScoreSystem";
import { RunController } from "../systems/RunController";
import { resolveCatch } from "../systems/bagCatch";
import { RetroGridBackground } from "../ui/RetroGridBackground";
import { HUD } from "../ui/HUD";
import { MusicController } from "../systems/MusicController";
import { Sfx } from "../systems/Sfx";
import { followDrive } from "../systems/TouchMove";
import type { EndData } from "./EndScene";

const SPAWN_X = GAME_WIDTH / 2;
const SPAWN_Y = GAME_HEIGHT - 90;

/**
 * Rdzeń rozgrywki Cashify (Faza 1): gracz porusza workiem, przytrzymaniem
 * Spacji otwiera go nad sobą i łapie spadające przedmioty (punkty). Zamknięty
 * worek — przedmiot odbija się i zabiera HP. 3 życia; śmierć = respawn −15 pkt.
 */
export class GameScene extends Phaser.Scene {
  private bg!: RetroGridBackground;
  private player!: Player;
  private bag!: BagSystem;
  private score!: ScoreSystem;
  private run!: RunController;
  private hud!: HUD;
  private items!: Phaser.Physics.Arcade.Group;
  private burst!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private space!: Phaser.Input.Keyboard.Key;

  private startTime = 0;
  private started = false; // czas/spawn startują przy 1. klatce update
  private ended = false;
  private nextSpawnAt = 0;

  private music!: MusicController;
  private sfx!: Sfx;
  private paused = false;
  private pausedAt = 0;
  private pausedTotal = 0;
  private pauseOverlay?: Phaser.GameObjects.Text;

  // Sterowanie dotykowe: joystick (lewa) = ruch, przycisk (prawa) = WOREK.
  private touchBag = false;
  private bagBtn?: Phaser.GameObjects.Arc;
  private bagPointerId = -1;
  private joyActive = false;
  private joyPointerId = -1;
  private joyBaseX = 0;
  private joyBaseY = 0;
  private joyVecX = 0;
  private joyVecY = 0;
  private joyBase?: Phaser.GameObjects.Arc;
  private joyKnob?: Phaser.GameObjects.Arc;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.ended = false;
    this.started = false;
    this.paused = false;
    this.pausedTotal = 0;
    this.nextSpawnAt = 0;

    this.bg = new RetroGridBackground(this);
    this.score = new ScoreSystem();
    this.run = new RunController();

    this.player = new Player(this, SPAWN_X, SPAWN_Y);
    this.bag = new BagSystem(this, this.player);

    this.items = this.physics.add.group({
      classType: FallingItem,
      maxSize: 40,
      runChildUpdate: false,
    });

    this.burst = this.add.particles(0, 0, TEXTURE.particle, {
      speed: { min: 50, max: 200 },
      lifespan: 420,
      scale: { start: 1.2, end: 0 },
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      tint: [COLORS.yellow, COLORS.cyan, COLORS.green],
      emitting: false,
    });
    this.burst.setDepth(8);

    this.hud = new HUD(this);
    this.hud.setLives(this.run.lives);
    this.hud.setHp(this.player.hpRatio);
    this.hud.setScore(0);
    this.hud.setTime(0, SESSION_MAX_MS);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;
    this.space = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.music = new MusicController(this);
    this.music.start();
    this.sfx = new Sfx(this);
    kb.on("keydown-M", () => this.music.toggle());
    kb.on("keydown-P", () => this.togglePause());

    this.touchBag = false;
    this.bagPointerId = -1;
    this.joyActive = false;
    this.joyPointerId = -1;
    this.joyVecX = 0;
    this.joyVecY = 0;
    if (this.sys.game.device.input.touch) this.setupTouchControls();
  }

  private spawnItem(x: number): void {
    if (this.ended) return;
    const item = this.items.get(x, -20) as FallingItem | null;
    if (!item) return;
    item.spawn(x, -20, FALLING.testPoints);
  }

  update(time: number, delta: number): void {
    if (this.ended || this.paused) return;

    if (!this.started) {
      this.started = true;
      this.startTime = this.time.now;
      this.nextSpawnAt = this.time.now;
    }

    const dtSec = delta / 1000;
    this.bg.update(dtSec);

    // --- ruch worka (klawiatura ma pierwszeństwo, potem joystick) ---
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const kix = (right ? 1 : 0) - (left ? 1 : 0);
    const kiy = (down ? 1 : 0) - (up ? 1 : 0);
    if (kix !== 0 || kiy !== 0) {
      this.player.drive(kix, kiy);
    } else if (this.joyActive) {
      this.player.driveProportional(this.joyVecX, this.joyVecY);
    } else {
      this.player.drive(0, 0);
    }

    // --- worek: przytrzymanie Spacji / przycisku otwiera ---
    this.bag.update(this.space.isDown || this.touchBag);

    // --- spawn przedmiotów ---
    if (time >= this.nextSpawnAt) {
      this.spawnItem(Phaser.Math.Between(28, GAME_WIDTH - 28));
      this.nextSpawnAt = time + FALLING.spawnEveryMs;
    }

    // --- rozstrzygnięcie złap / odbij dla każdego przedmiotu ---
    for (const obj of this.items.getChildren()) {
      const item = obj as FallingItem;
      if (!item.active) continue;
      if (item.y > GAME_HEIGHT + 20 || item.y < -60) {
        item.disableBody(true, true);
        continue;
      }
      const overlapping = this.bag.overlaps(item);
      const outcome = resolveCatch(this.bag.isOpen, overlapping);
      if (outcome === "catch") {
        this.catchItem(item);
      } else if (outcome === "bounce") {
        this.bounceItem(item);
      }
    }

    // --- czas + koniec rundy (timeout; wygrana 3000 dopiero w Fazie 4) ---
    const elapsed = this.time.now - this.startTime - this.pausedTotal;
    this.hud.setTime(elapsed, SESSION_MAX_MS);
    const reason = this.run.update(this.score.score, elapsed);
    if (reason) this.end(reason);
  }

  /** Złapanie otwartym workiem → punkty + efekty. */
  private catchItem(item: FallingItem): void {
    this.sfx.enemyDeath();
    this.score.addBonus(item.points);
    this.hud.setScore(this.score.score);
    this.burst.explode(12, item.x, item.y);
    item.disableBody(true, true);
  }

  /** Kontakt z zamkniętym workiem → przedmiot odbija się, gracz traci HP. */
  private bounceItem(item: FallingItem): void {
    item.bounceOff(this.player.x);
    if (!this.player.takeDamage(BAG.contactDamage, this.time.now)) return;
    this.afterPlayerHit(this.player.x, this.player.y);
  }

  /** Reakcja na obrażenia: efekty + respawn (kara −15) lub koniec gry. */
  private afterPlayerHit(fxX: number, fxY: number): void {
    this.burst.explode(8, fxX, fxY);
    this.cameras.main.shake(130, 0.009);
    this.hud.setHp(this.player.hpRatio);
    if (this.player.isAlive) return;

    if (this.run.loseLife()) {
      this.score.onDeath();
      this.player.respawn(SPAWN_X, SPAWN_Y, this.time.now);
      this.hud.setLives(this.run.lives);
      this.hud.setHp(this.player.hpRatio);
      this.hud.setScore(this.score.score);
      this.cameras.main.flash(160, 255, 60, 60);
    } else {
      this.end("death");
    }
  }

  /** Kontrolki dotykowe: joystick po lewej (ruch) + przycisk WOREK po prawej. */
  private setupTouchControls(): void {
    this.input.addPointer(2);

    const r = TOUCH.shieldBtnRadius;
    const bx = GAME_WIDTH - r - 18;
    const by = GAME_HEIGHT - r - 22;
    this.bagBtn = this.add.circle(bx, by, r, COLORS.yellow, 0.12).setDepth(15);
    this.bagBtn.setStrokeStyle(2, COLORS.yellow, 0.7);
    this.add
      .text(bx, by, "WOREK", { fontFamily: "monospace", fontSize: "13px", color: COLOR_HEX.yellow })
      .setOrigin(0.5)
      .setDepth(16);
    this.bagBtn.setInteractive();
    this.bagBtn.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.touchBag = true;
      this.bagPointerId = p.id;
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.bagPointerId) {
        this.touchBag = false;
        this.bagPointerId = -1;
      }
    };
    this.bagBtn.on("pointerup", release);
    this.bagBtn.on("pointerout", release);

    this.joyBaseX = TOUCH.joyMargin + TOUCH.joyRadius;
    this.joyBaseY = GAME_HEIGHT - TOUCH.joyMargin - TOUCH.joyRadius;
    this.joyBase = this.add
      .circle(this.joyBaseX, this.joyBaseY, TOUCH.joyRadius, COLORS.magenta, 0.1)
      .setDepth(15);
    this.joyBase.setStrokeStyle(2, COLORS.magenta, 0.55);
    this.joyKnob = this.add
      .circle(this.joyBaseX, this.joyBaseY, TOUCH.knobRadius, COLORS.magenta, 0.35)
      .setDepth(16);

    this.input.on("pointerdown", this.onJoyInput, this);
    this.input.on("pointermove", this.onJoyInput, this);
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (p.id === this.joyPointerId) this.resetJoy();
    });
  }

  private onJoyInput(p: Phaser.Input.Pointer): void {
    if (this.ended || this.paused) return;
    if (!this.joyActive) {
      if (p.id !== this.joyPointerId) {
        if (p.x > GAME_WIDTH * 0.5) return;
        if (this.overBagBtn(p)) return;
        this.joyActive = true;
        this.joyPointerId = p.id;
      }
    } else if (p.id !== this.joyPointerId) {
      return;
    }

    const v = followDrive(
      { x: this.joyBaseX, y: this.joyBaseY },
      { x: p.x, y: p.y },
      TOUCH.deadzone,
      TOUCH.joyRadius,
    );
    this.joyVecX = v.x;
    this.joyVecY = v.y;
    this.joyKnob?.setPosition(
      this.joyBaseX + v.x * TOUCH.joyRadius,
      this.joyBaseY + v.y * TOUCH.joyRadius,
    );
  }

  private resetJoy(): void {
    this.joyActive = false;
    this.joyPointerId = -1;
    this.joyVecX = 0;
    this.joyVecY = 0;
    this.joyKnob?.setPosition(this.joyBaseX, this.joyBaseY);
  }

  private overBagBtn(p: Phaser.Input.Pointer): boolean {
    if (!this.bagBtn) return false;
    const d = Phaser.Math.Distance.Between(p.x, p.y, this.bagBtn.x, this.bagBtn.y);
    return d <= TOUCH.shieldBtnRadius + 8;
  }

  private togglePause(): void {
    if (this.ended) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.pausedAt = this.time.now;
      this.pauseOverlay = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "⏸ PAUZA\n\nP — wznów", {
          fontFamily: "monospace",
          fontSize: "26px",
          color: COLOR_HEX.cyan,
          align: "center",
          backgroundColor: "#0a0e17",
          padding: { x: 22, y: 18 },
        })
        .setOrigin(0.5)
        .setDepth(20);
    } else {
      this.physics.resume();
      this.pausedTotal += this.time.now - this.pausedAt;
      this.pauseOverlay?.destroy();
      this.pauseOverlay = undefined;
    }
  }

  private end(reason: EndData["reason"]): void {
    if (this.ended) return;
    this.ended = true;
    this.physics.pause();
    this.cameras.main.flash(180, reason === "win" ? 0 : 255, reason === "win" ? 255 : 0, 80);

    const data: EndData = {
      reason,
      score: this.score.score,
      timeMs: Math.max(0, this.time.now - this.startTime - this.pausedTotal),
    };
    if (reason === "win") {
      this.scene.start("EndScene", data);
      return;
    }
    this.time.delayedCall(220, () => this.scene.start("EndScene", data));
  }
}
