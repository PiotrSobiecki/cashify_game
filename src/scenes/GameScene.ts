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
  BOSS_MILESTONES,
  NPC_MILESTONES,
  BOSS_PHASE,
  NPC_POPUP_MS,
  GRACE_MS,
} from "../config";
import { Player } from "../entities/Player";
import { FallingItem } from "../entities/FallingItem";
import { BagSystem } from "../systems/BagSystem";
import { ScoreSystem } from "../systems/ScoreSystem";
import { InventorySystem } from "../systems/InventorySystem";
import { RunController } from "../systems/RunController";
import { RaceClock } from "../systems/RaceClock";
import { MilestoneTracker } from "../systems/MilestoneTracker";
import { resolveCatch } from "../systems/bagCatch";
import { BOSS_DROP, isCollectibleItemType, randomWeightedItemType, type ItemType } from "../data/items";
import { NPCS, WIN_NPC } from "../data/npc";
import { CurrencyBackdrop } from "../ui/CurrencyBackdrop";
import { HUD } from "../ui/HUD";
import { EmployeePopup } from "../ui/EmployeePopup";
import { BossEncounterDisplay } from "../ui/BossEncounterDisplay";
import { MusicController } from "../systems/MusicController";
import { Sfx } from "../systems/Sfx";
import { followDrive } from "../systems/TouchMove";
import type { EndData } from "./EndScene";

const SPAWN_X = GAME_WIDTH / 2;
const SPAWN_Y = GAME_HEIGHT - BAG.displayHeight / 2 - BAG.bottomEdgePad;

/**
 * Rdzeń rozgrywki Cashify (Faza 1): gracz porusza workiem, przytrzymaniem
 * Spacji otwiera go nad sobą i łapie spadające przedmioty (PLN). Zamknięty
 * worek — przedmiot odbija się i zabiera HP. 3 życia; śmierć = respawn bez utraty PLN.
 */
export class GameScene extends Phaser.Scene {
  private bg!: CurrencyBackdrop;
  private player!: Player;
  private bag!: BagSystem;
  private score!: ScoreSystem;
  private inventory!: InventorySystem;
  private run!: RunController;
  private clock!: RaceClock;
  private bossTracker!: MilestoneTracker;
  private npcTracker!: MilestoneTracker;
  private popup!: EmployeePopup;
  private hud!: HUD;
  private items!: Phaser.Physics.Arcade.Group;
  private burst!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private space!: Phaser.Input.Keyboard.Key;

  private started = false; // czas/spawn startują przy 1. klatce update
  private ended = false;
  private nextSpawnAt = 0;

  // faza bossa: wstrzymuje normalny spawn, zrzuca boss_bary przez ~10 s
  private bossActive = false;
  private bossEndsAt = 0;
  private bossDisplay?: BossEncounterDisplay;
  private bossCount = 0; // który to boss (0→Jacek, 1→Weronika, 2→Jakub)
  private winStarted = false; // sekwencja wygranej po 10 mln zł (rundka honorowa)

  private music!: MusicController;
  private sfx!: Sfx;
  private paused = false;
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
    this.nextSpawnAt = 0;
    this.bossActive = false;
    this.bossCount = 0;
    this.winStarted = false;

    this.bg = new CurrencyBackdrop(this);
    this.score = new ScoreSystem();
    this.inventory = new InventorySystem();
    this.run = new RunController();
    this.clock = new RaceClock();
    this.bossTracker = new MilestoneTracker([...BOSS_MILESTONES]);
    // Jakub przy wygranej (10 mln); popupy NPC przy 0,5 mln i 2 mln.
    this.npcTracker = new MilestoneTracker([...NPC_MILESTONES]);
    this.popup = new EmployeePopup(this);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
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
      tint: [COLORS.gold, COLORS.crypto, COLORS.cash],
      emitting: false,
    });
    this.burst.setDepth(8);

    this.hud = new HUD(this);
    this.hud.setLives(this.run.lives);
    this.hud.setHp(this.player.hpRatio);
    this.hud.setRaceProgress(0);
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

  private spawnItem(x: number, type: ItemType, y = -20): void {
    if (this.ended) return;
    const item = this.items.get(x, y) as FallingItem | null;
    if (!item) return;
    item.spawn(type, x, y);
  }

  /** Sztabka z okienka bossa — pozycja i animacja rzutu z lady. */
  private spawnBossDrop(): void {
    const drop = this.bossDisplay?.getDropPoint() ?? {
      x: Phaser.Math.Between(28, GAME_WIDTH - 28),
      y: -20,
    };
    this.spawnItem(drop.x, BOSS_DROP, drop.y);
    this.bossDisplay?.playThrow();
  }

  update(time: number, delta: number): void {
    if (this.ended || this.paused) return;

    if (!this.started) {
      this.started = true;
      this.clock.start(this.time.now);
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

    // --- worek: przytrzymanie Spacji / przycisku otwiera (zużywa energię) ---
    this.bag.update(this.space.isDown || this.touchBag, dtSec, time);
    this.hud.setEnergy(this.bag.energyRatio, this.bag.isExhausted);

    // --- faza bossa: koniec po 10 s ---
    if (this.bossActive && time >= this.bossEndsAt) this.endBossPhase();

    // --- spawn: faza bossa zrzuca boss_bary, inaczej normalny katalog ---
    if (time >= this.nextSpawnAt) {
      if (this.bossActive) {
        this.spawnBossDrop();
        this.nextSpawnAt = time + BOSS_PHASE.dropEveryMs;
      } else {
        const x = Phaser.Math.Between(28, GAME_WIDTH - 28);
        this.spawnItem(x, randomWeightedItemType());
        this.nextSpawnAt = time + FALLING.spawnEveryMs;
      }
    }

    // --- rozstrzygnięcie złap / odbij dla każdego przedmiotu ---
    for (const obj of this.items.getChildren()) {
      const item = obj as FallingItem;
      if (!item.active) continue;
      if (item.getData("swallowing")) continue;
      if (item.y > GAME_HEIGHT + 20 || item.y < -60) {
        item.disableBody(true, true);
        continue;
      }
      this.bag.updateItemLayer(item, dtSec);
      const overlapMode = this.bag.isOpen ? "open" : "closed";
      const overlapping = this.bag.overlaps(item, overlapMode);
      if (!overlapping) {
        item.setData("bounced", false);
      }
      const outcome = resolveCatch(this.bag.isOpen, overlapping);
      if (outcome === "catch") {
        this.catchItem(item);
      } else if (
        outcome === "bounce" &&
        isCollectibleItemType(item.itemType) &&
        this.bag.isClosedForContact(time)
      ) {
        this.bounceItem(item);
      }
    }

    // --- czas + koniec rundy ---
    // Wygraną (10 mln zł) prowadzi sekwencja z rundką honorową (startWinSequence),
    // więc tu kończymy tylko na twardym timeoucie.
    const elapsed = this.clock.elapsed(this.time.now);
    this.hud.setTime(elapsed, SESSION_MAX_MS);
    const reason = this.run.update(this.score.score, elapsed);
    if (reason === "win" && !this.winStarted) this.startWinSequence();
    else if (reason === "timeout") this.end("timeout");
  }

  /** Złapanie: przedmiot wciąga się do otworu, potem PLN i efekty. */
  private catchItem(item: FallingItem): void {
    if (item.getData("swallowing")) return;
    item.setData("swallowing", true);
    const body = item.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;

    const mouth = this.bag.mouthPoint;
    item.setDepth(BAG.depth.itemFront);
    item.setAlpha(1);
    this.tweens.killTweensOf(item);
    this.tweens.add({
      targets: item,
      x: mouth.x,
      y: mouth.y,
      duration: BAG.swallowSlideMs,
      ease: "Cubic.in",
      onComplete: () => {
        item.setDepth(BAG.depth.itemBehind);
        this.tweens.add({
          targets: item,
          alpha: 0,
          duration: BAG.swallowFadeMs,
          ease: "Quad.in",
          onComplete: () => this.finishCatch(item),
        });
      },
    });
  }

  private finishCatch(item: FallingItem): void {
    this.sfx.enemyDeath();
    this.score.addCatch(item.itemType);
    this.inventory.add(item.itemType);
    this.hud.setRaceProgress(this.score.score);
    this.burst.explode(12, item.x, item.y);
    item.disableBody(true, true);
    this.checkMilestones();
  }

  /** Po zmianie wyniku: progi bossów i NPC (każdy raz na rundę). */
  private checkMilestones(): void {
    const score = this.score.score;
    if (this.bossTracker.crossed(score).length > 0) this.startBossPhase();
    for (const m of this.npcTracker.crossed(score)) this.showNpc(m);
  }

  /** Start fazy bossa: scena z okienkiem + deszcz sztabek z lady. */
  private startBossPhase(): void {
    this.bossActive = true;
    this.bossEndsAt = this.time.now + BOSS_PHASE.durationMs;
    this.nextSpawnAt = this.time.now;
    if (!this.bossDisplay) this.bossDisplay = new BossEncounterDisplay(this);
    this.bossDisplay.show(this.bossCount);
    this.bossCount++;
    this.cameras.main.flash(180, 255, 0, 170);
  }

  /** Koniec fazy bossa: chowamy scenografię, wracają zwykłe spawny. */
  private endBossPhase(): void {
    this.bossActive = false;
    this.nextSpawnAt = this.time.now;
    this.bossDisplay?.hide();
  }

  /**
   * Wygrana (10 mln zł): zamraża czas (= wynik speedrun), popup Jakuba, rundka
   * honorowa ~10 s (gra leci, zegar stoi), potem ekran końcowy.
   */
  private startWinSequence(): void {
    if (this.winStarted) return;
    this.winStarted = true;
    this.clock.pause(this.time.now);
    this.popup.show(WIN_NPC.key, WIN_NPC.name, WIN_NPC.line, NPC_POPUP_MS, () => {});
    this.cameras.main.flash(220, 255, 215, 0);
    this.time.delayedCall(GRACE_MS, () => this.end("win"));
  }

  /** Popup pracownika kantoru: zatrzymuje zegar wyścigu na czas wyświetlenia. */
  private showNpc(milestone: number): void {
    const npc = NPCS[milestone];
    if (!npc || this.popup.isActive) return;
    this.clock.pause(this.time.now);
    this.popup.show(npc.key, npc.name, npc.line, NPC_POPUP_MS, () => {
      this.clock.resume(this.time.now);
    });
  }

  /** Kontakt z zamkniętym workiem → przedmiot odbija się, gracz traci HP (raz na przejście). */
  private bounceItem(item: FallingItem): void {
    if (item.getData("bounced")) return;
    item.setData("bounced", true);
    item.bounceOff(this.player.x);
    if (this.winStarted) return; // rundka honorowa: bez obrażeń

    // Twardy guard: nigdy nie zabieraj HP od czegoś, czego gracz nie widzi
    // (przedmiot za workiem / w trakcie wciągania / przezroczysty).
    const hidden =
      !item.visible || item.alpha < 0.9 || item.depth < BAG.depth.itemFront;
    if (hidden) {
      if (import.meta.env.DEV) {
        console.warn("[bag] pominięto odbicie od niewidocznego przedmiotu", {
          type: item.itemType,
          texture: item.texture?.key,
          depth: item.depth,
          alpha: item.alpha,
          visible: item.visible,
          x: Math.round(item.x),
          y: Math.round(item.y),
        });
      }
      return;
    }

    if (!this.player.takeDamage(BAG.contactDamage, this.time.now)) return;
    this.afterPlayerHit(this.player.x, this.player.y);
  }

  /** Reakcja na obrażenia: efekty + respawn (wynik bez zmian) lub koniec gry. */
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
      this.hud.setRaceProgress(this.score.score);
      this.cameras.main.flash(160, 255, 60, 60);
    } else {
      this.end("death");
    }
  }

  /** Kontrolki dotykowe: joystick po lewej (ruch) + przycisk WOREK po prawej. */
  private setupTouchControls(): void {
    this.input.addPointer(2);

    const r = TOUCH.bagBtnRadius;
    const bx = GAME_WIDTH - r - 18;
    const by = GAME_HEIGHT - r - 22;
    this.bagBtn = this.add.circle(bx, by, r, COLORS.gold, 0.14).setDepth(15);
    this.bagBtn.setStrokeStyle(2, COLORS.gold, 0.75);
    this.add
      .text(bx, by, "WOREK", { fontFamily: "monospace", fontSize: "13px", color: COLOR_HEX.gold })
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
      .circle(this.joyBaseX, this.joyBaseY, TOUCH.joyRadius, COLORS.fiat, 0.12)
      .setDepth(15);
    this.joyBase.setStrokeStyle(2, COLORS.fiat, 0.55);
    this.joyKnob = this.add
      .circle(this.joyBaseX, this.joyBaseY, TOUCH.knobRadius, COLORS.fiat, 0.38)
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
    return d <= TOUCH.bagBtnRadius + 8;
  }

  private togglePause(): void {
    if (this.ended || this.popup.isActive) return; // nie pauzujemy w trakcie popupu
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.clock.pause(this.time.now);
      this.pauseOverlay = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "⏸ PAUZA\n\nP — wznów", {
          fontFamily: "monospace",
          fontSize: "26px",
          color: COLOR_HEX.gold,
          align: "center",
          backgroundColor: COLOR_HEX.panel,
          padding: { x: 22, y: 18 },
        })
        .setOrigin(0.5)
        .setDepth(20);
    } else {
      this.physics.resume();
      this.clock.resume(this.time.now);
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
      timeMs: Math.max(0, this.clock.elapsed(this.time.now)),
      loot: this.inventory.entries(),
    };
    if (reason === "win") {
      this.scene.start("EndScene", data);
      return;
    }
    this.time.delayedCall(220, () => this.scene.start("EndScene", data));
  }
}
