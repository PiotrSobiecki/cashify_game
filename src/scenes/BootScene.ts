import Phaser from "phaser";
import { registerNpcPopupFrames } from "../assets/npcFrames";
import { registerGameTextures } from "../art/SpriteTextures";
import { MUSIC_KEY, musicPath } from "../systems/MusicController";
import { NPCS } from "../data/npc";
import { ITEMS } from "../data/items";

/**
 * Preload: ładuje utwór i generuje proceduralne tekstury, potem menu.
 * Brak pliku mp3 nie blokuje gry — łapiemy błąd ładowania i jedziemy dalej.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.audio(MUSIC_KEY, musicPath());
    // Avatary pracowników kantoru — popupy progowe.
    for (const npc of Object.values(NPCS)) this.load.image(npc.key, npc.asset);
    // Sprite'y worka (open/middle/closed) — wygląd gracza. Brak → fallback łuk.
    this.load.image("bag_closed", "assets/bags/bag_closed.png");
    this.load.image("bag_middle", "assets/bags/bag_middle.png");
    this.load.image("bag_open", "assets/bags/bag_open.png");
    // Logo Cashify (SVG) nakładane na worek. Brak → worek bez logo.
    this.load.svg("cashify_logo", "assets/cashify-logo.svg", { width: 128, height: 32 });
    // Ikonki przedmiotów (krypto/fiat/metale). Klucz = ścieżka assetu z katalogu;
    // brakujące pliki tylko ostrzegą (loaderror), FallingItem użyje placeholdera.
    for (const def of Object.values(ITEMS)) {
      this.load.image(def.asset, `assets/${def.asset}.png`);
    }
    // 404 (mp3 / brakujący avatar) nie może wywalić preloadu.
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      if (file.key === MUSIC_KEY) {
        console.warn("[audio] Nie udało się wczytać cashify.mp3 — gra będzie wyciszona.");
      } else {
        console.warn(`[assets] Nie udało się wczytać: ${file.key}`);
      }
    });
  }

  create(): void {
    registerGameTextures(this);
    registerNpcPopupFrames(this);
    this.scene.start("MenuScene");
  }
}
