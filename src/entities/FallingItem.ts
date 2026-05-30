import Phaser from "phaser";
import { BAG, FALLING, COLORS } from "../config";
import { TEXTURE, SPRITE } from "../art/SpriteTextures";
import { ITEMS, type ItemType, type ItemCategory } from "../data/items";

/** Barwy placeholdera wg kategorii (gdy brak PNG z katalogu). */
const CATEGORY_TINT: Record<ItemCategory, number> = {
  crypto: COLORS.crypto,
  fiat: COLORS.fiat,
  metal: COLORS.gold,
  boss: COLORS.goldLight,
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

  /** Wartość w PLN za złapanie (z katalogu). */
  get valuePln(): number {
    return ITEMS[this.itemType].valuePln;
  }

  /**
   * Aktywuje przedmiot danego typu i nadaje mu spadek.
   * @param fromHole — origin u góry sprite'a; (x,y) = wylot z otworu w kantorku.
   */
  spawn(
    type: ItemType,
    x: number,
    y: number,
    depth: number = BAG.depth.itemFront,
    fromHole = false,
  ): void {
    this.itemType = type;
    const def = ITEMS[type];
    const hasPng = this.scene.textures.exists(def.asset);
    this.setOrigin(0.5, fromHole ? 0 : 0.5);
    this.enableBody(true, x, y, true, true);
    this.setDepth(depth);
    this.setAlpha(1);
    this.setData("swallowing", false);
    this.setTexture(hasPng ? def.asset : TEXTURE.itemFallback);
    if (hasPng) this.clearTint();
    else this.setTint(CATEGORY_TINT[def.category]);
    this.setDisplaySize(SPRITE.item.w, SPRITE.item.h);
    this.setVelocity(0, FALLING.speed);
    (this.body as Phaser.Physics.Arcade.Body | null)?.updateFromGameObject();
  }

  /** Odbicie od zamkniętego worka: w górę i w bok od gracza. */
  bounceOff(playerX: number): void {
    const dir = this.x < playerX ? -1 : 1;
    this.setVelocity(dir * FALLING.bounceSideSpeed, -FALLING.bounceUpSpeed);
  }
}
