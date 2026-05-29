import Phaser from "phaser";
import { NPCS } from "../data/npc";

/** Pełna sylwetka — popup / chmurka (zawsze całe PNG). */
export const NPC_FRAME_POPUP_FULL = "__popup_full";

/** Góra PNG — okienko bossa (głowa + tułów). */
export function npcBossFrameName(textureKey: string, cropRatio: number): string {
  return `__boss_${textureKey}_${Math.round(cropRatio * 100)}`;
}

function sourceSize(tex: Phaser.Textures.Texture): { w: number; h: number } {
  const img = tex.getSourceImage() as HTMLImageElement;
  return { w: Math.max(img.width, 1), h: Math.max(img.height, 1) };
}

/** Rejestruje klatkę pełnej postaci (wywołać w BootScene po preloadzie). */
export function ensureNpcPopupFullFrame(scene: Phaser.Scene, textureKey: string): string {
  if (!scene.textures.exists(textureKey)) return textureKey;
  const tex = scene.textures.get(textureKey);
  if (tex.has(NPC_FRAME_POPUP_FULL)) return NPC_FRAME_POPUP_FULL;

  const { w, h } = sourceSize(tex);
  tex.add(NPC_FRAME_POPUP_FULL, 0, 0, 0, w, h);
  return NPC_FRAME_POPUP_FULL;
}

/** Klatka ucięta pod bossa — niezależna od popupu. */
export function ensureNpcBossTorsoFrame(
  scene: Phaser.Scene,
  textureKey: string,
  cropRatio: number,
): string {
  const name = npcBossFrameName(textureKey, cropRatio);
  if (!scene.textures.exists(textureKey)) return textureKey;
  const tex = scene.textures.get(textureKey);
  if (tex.has(name)) return name;

  const { w, h: fullH } = sourceSize(tex);
  const h = Math.max(24, Math.floor(fullH * cropRatio));
  tex.add(name, 0, 0, 0, w, h);
  return name;
}

export function registerNpcPopupFrames(scene: Phaser.Scene): void {
  for (const npc of Object.values(NPCS)) {
    ensureNpcPopupFullFrame(scene, npc.key);
  }
}

export function getNpcPopupFrame(
  scene: Phaser.Scene,
  textureKey: string,
): Phaser.Textures.Frame {
  const frameKey = ensureNpcPopupFullFrame(scene, textureKey);
  return scene.textures.get(textureKey).get(frameKey);
}
