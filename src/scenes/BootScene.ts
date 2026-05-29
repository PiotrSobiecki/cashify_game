import Phaser from "phaser";
import { registerGameTextures } from "../art/SpriteTextures";
import { MUSIC_KEY, musicPath } from "../systems/MusicController";
import { NPCS } from "../data/npc";

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
    // Avatary pracowników kantoru (Faza 3) — popupy progowe.
    for (const npc of Object.values(NPCS)) this.load.image(npc.key, npc.asset);
    // 404 (mp3 / brakujący avatar) nie może wywalić preloadu.
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      if (file.key === MUSIC_KEY) {
        console.warn("[audio] Nie udało się wczytać firewall.mp3 — gra będzie wyciszona.");
      } else {
        console.warn(`[assets] Nie udało się wczytać: ${file.key}`);
      }
    });
  }

  create(): void {
    registerGameTextures(this);
    this.scene.start("MenuScene");
  }
}
