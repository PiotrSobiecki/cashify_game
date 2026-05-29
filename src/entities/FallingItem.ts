import Phaser from "phaser";
import { FALLING, COLORS } from "../config";
import { TEXTURE, SPRITE } from "../art/SpriteTextures";
import { ITEMS, type ItemType, type ItemCategory } from "../data/items";

/** Barwy placeholdera wg kategorii (gdy brak PNG z katalogu). */
const CATEGORY_TINT: Record<ItemCategory, number> = {
  crypto: COLORS.yellow,
  fiat: COLORS.green,
  metal: COLORS.cyan,
  boss: COLORS.magenta,
};

/**
 * Spadający przedmiot. Niesie typ z katalogu items.ts (punkty, etykieta, asset).
 * Jeśli PNG z katalogu jest załadowane — pokazuje je; inaczej placeholder-monetę
 * barwioną wg kategorii (brak assetu nie blokuje gry).
 */
export class FallingItem extends Phaser.Physics.Arcade.Image {
  itemType: ItemType = "btc";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE.itemFallback);
  }

  /** Punkty za złapanie (z katalogu). */
  get points(): number {
    return ITEMS[this.itemType].points;
  }

  /** Aktywuje przedmiot danego typu u góry ekranu i nadaje mu spadek. */
  spawn(type: ItemType, x: number, y: number): void {
    this.itemType = type;
    const def = ITEMS[type];
    const hasPng = this.scene.textures.exists(def.asset);
    this.enableBody(true, x, y, true, true);
    this.setDepth(4);
    this.setTexture(hasPng ? def.asset : TEXTURE.itemFallback);
    if (hasPng) this.clearTint();
    else this.setTint(CATEGORY_TINT[def.category]);
    this.setDisplaySize(SPRITE.item.w, SPRITE.item.h);
    this.setVelocity(0, FALLING.speed);
  }

  /** Odbicie od zamkniętego worka: w górę i w bok od gracza. */
  bounceOff(playerX: number): void {
    const dir = this.x < playerX ? -1 : 1;
    this.setVelocity(dir * FALLING.bounceSideSpeed, -FALLING.bounceUpSpeed);
  }
}
