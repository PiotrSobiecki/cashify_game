import Phaser from "phaser";
import { FALLING, COLORS } from "../config";
import { TEXTURE } from "../art/SpriteTextures";
import { ITEMS, type ItemType, type ItemCategory } from "../data/items";

/** Tymczasowe barwy wg kategorii (placeholder do czasu PNG w Fazie 5). */
const CATEGORY_TINT: Record<ItemCategory, number> = {
  crypto: COLORS.yellow,
  fiat: COLORS.green,
  metal: COLORS.cyan,
};

/**
 * Spadający przedmiot. Niesie swój typ z katalogu items.ts (punkty, etykieta).
 * Leci pionowo w dół; otwarty worek go łapie, zamknięty — odbija. Tekstura
 * tymczasowa (puShield) barwiona wg kategorii; docelowe logo PNG w Fazie 5.
 */
export class FallingItem extends Phaser.Physics.Arcade.Image {
  /** Typ przedmiotu z katalogu (źródło punktów i etykiety). */
  itemType: ItemType = "btc";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE.puShield);
  }

  /** Punkty za złapanie tego przedmiotu (z katalogu). */
  get points(): number {
    return ITEMS[this.itemType].points;
  }

  /** Aktywuje przedmiot danego typu u góry ekranu i nadaje mu spadek. */
  spawn(type: ItemType, x: number, y: number): void {
    this.itemType = type;
    this.enableBody(true, x, y, true, true);
    this.setDepth(4);
    this.setTint(CATEGORY_TINT[ITEMS[type].category]);
    this.setVelocity(0, FALLING.speed);
  }

  /** Odbicie od zamkniętego worka: w górę i w bok od gracza. */
  bounceOff(playerX: number): void {
    const dir = this.x < playerX ? -1 : 1;
    this.setVelocity(dir * FALLING.bounceSideSpeed, -FALLING.bounceUpSpeed);
  }
}
