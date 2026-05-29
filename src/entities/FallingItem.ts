import Phaser from "phaser";
import { FALLING } from "../config";
import { TEXTURE } from "../art/SpriteTextures";

/**
 * Spadający przedmiot (Faza 1: jeden typ testowy). Leci pionowo w dół.
 * Otwarty worek go łapie (punkty), zamknięty — odbija (utrata HP gracza).
 * Tekstura tymczasowa (puShield) — docelowe logo krypto/fiat/metale w Fazie 5.
 */
export class FallingItem extends Phaser.Physics.Arcade.Image {
  /** Punkty za złapanie tego przedmiotu. */
  points = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE.puShield);
  }

  /** Aktywuje przedmiot u góry ekranu i nadaje mu spadek. */
  spawn(x: number, y: number, points: number): void {
    this.points = points;
    this.enableBody(true, x, y, true, true);
    this.setDepth(4);
    this.setVelocity(0, FALLING.speed);
  }

  /** Odbicie od zamkniętego worka: w górę i w bok od gracza. */
  bounceOff(playerX: number): void {
    const dir = this.x < playerX ? -1 : 1;
    this.setVelocity(dir * FALLING.bounceSideSpeed, -FALLING.bounceUpSpeed);
  }
}
