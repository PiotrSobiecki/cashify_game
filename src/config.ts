// Stałe gry Cashify — pojedyncze źródło prawdy, do tuningu w playteście.

/** Cel rundy = 3000 pkt. Wygrana po czasie do 3000 (najszybszy = wyżej w rankingu). */
export const WIN_SCORE = 3000;

/** Twardy limit sesji (zabezpieczenie): 6:30. */
export const SESSION_MAX_MS = 6 * 60 * 1000 + 30 * 1000;

/** Progi zdarzeń: bossy tuż przed milestone'ami, NPC na okrągłych setkach. */
export const BOSS_MILESTONES = [900, 1900, 2900] as const;
export const NPC_MILESTONES = [1000, 2000, 3000] as const;

/** Faza bossa: 10 s deszczu specjalnych sztabek, wstrzymany normalny spawn. */
export const BOSS_PHASE = {
  durationMs: 10000,
  dropEveryMs: 520,
} as const;

/** Popup pracownika kantoru — ile trzyma się na ekranie (zegar wyścigu stoi). */
export const NPC_POPUP_MS = 4000;

/** Rundka honorowa po osiągnięciu 3000: ile gra trwa jeszcze (czas zamrożony). */
export const GRACE_MS = 10000;

/** CTA na ekranie końcowym — kantor Cashify. */
export const CASHIFY_URL = "https://cashify.eu";

/** Liczba żyć w rundzie. Każde życie = pełne HP. */
export const LIVES = 3;

/** Kara punktowa za śmierć: odejmowana, nie schodzi poniżej 0. */
export const RESPAWN_PENALTY = 15;

/**
 * Worek: gracz przytrzymuje Spację, by otworzyć worek nad sobą. Otwarty worek
 * łapie nałożony przedmiot; zamknięty — przedmiot odbija się i zabiera HP.
 * `catchRadius` to zasięg strefy łapania od środka gracza.
 */
export const BAG = {
  catchRadius: 50,
  contactDamage: 20,
} as const;

/** Spadające przedmioty (typy z katalogu items.ts). */
export const FALLING = {
  speed: 160,
  spawnEveryMs: 750,
  bounceUpSpeed: 220, // odrzut w górę po odbiciu od zamkniętego worka
  bounceSideSpeed: 120,
} as const;

/** Ranking: ile miejsc trzymamy/pokazujemy (TOP N). Imię pytane gdy wynik wchodzi do TOP N. */
export const LEADERBOARD_SIZE = 10;

/**
 * Adres API rankingu (Cloudflare Worker + Neon). Globalny ranking online.
 * Build prod celuje w workera; `vite dev` w localhost (`wrangler dev` :8787).
 * `VITE_API_BASE` nadpisuje oba. Bez sieci ranking jest niedostępny.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV
    ? "http://localhost:8787"
    : "https://firewall-scores.piotr-sobiecki.workers.dev");

/**
 * Audio: utwór leci w pętli przez całą rozgrywkę. Plik w `public/`
 * (serwowany przez Vite). Brak pliku nie blokuje gry.
 */
export const AUDIO = {
  trackFile: "firewall.mp3",
  musicVolume: 0.6,
  sfxVolume: 0.5,
} as const;

/** Rozdzielczość logiczna (portrait jak mobile). */
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

/**
 * Sterowanie dotykowe: wirtualny joystick po lewej (ruch), przycisk WOREK
 * po prawej. Tylko na urządzeniach dotykowych; klawiatura działa równolegle.
 */
export const TOUCH = {
  deadzone: 6,
  joyRadius: 54,
  knobRadius: 24,
  joyMargin: 26,
  bagBtnRadius: 46,
} as const;

/** Paleta retro-neon + akcent złota (branding Cashify). */
export const COLORS = {
  bg: 0x0a0e17,
  cyan: 0x00f0ff,
  magenta: 0xff00aa,
  yellow: 0xffcc00,
  green: 0x00ff88,
} as const;

export const COLOR_HEX = {
  bg: "#0a0e17",
  cyan: "#00f0ff",
  magenta: "#ff00aa",
  yellow: "#ffcc00",
  green: "#00ff88",
} as const;

/** Tuning gracza (do playtestu). */
export const PLAYER = {
  speed: 300,
  zoneTop: GAME_HEIGHT * 0.35, // ruch w dolnych ~65% ekranu
  bodyRadius: 16,
  maxHp: 100,
  iframesMs: 900, // nietykalność po trafieniu, by nie tracić HP co klatkę
  respawnIframesMs: 1500,
} as const;
