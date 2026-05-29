// Stałe gry Cashify — pojedyncze źródło prawdy, do tuningu w playteście.

/** Cel rundy = 5 mln zł (ostatni boss Jakub). Po nim 30 s rundki i koniec. Ranking = najszybszy czas. */
export const WIN_TARGET_PLN = 5_000_000;

/** @deprecated Alias — wynik w PLN; używaj WIN_TARGET_PLN. */
export const WIN_SCORE = WIN_TARGET_PLN;

/** Twardy limit sesji (zabezpieczenie): 30:00. */
export const SESSION_MAX_MS = 30 * 60 * 1000;

/** Bossy: Jacek 0,5 mln · Weronika 2 mln · Jakub 5 mln (3. boss = meta + rundka 30 s). */
export const BOSS_MILESTONES = [500_000, 2_000_000, 5_000_000] as const;
/** Dymki z kwestią 100 tys. PRZED każdym bossem (zapowiedź postaci). */
export const NPC_MILESTONES = [400_000, 1_900_000, 4_900_000] as const;

/** Faza bossa: 10 s deszczu specjalnych sztabek, wstrzymany normalny spawn. */
export const BOSS_PHASE = {
  durationMs: 10000,
  dropEveryMs: 400,
} as const;

/** Popup pracownika kantoru — ile trzyma się na ekranie (zegar wyścigu stoi). */
export const NPC_POPUP_MS = 4000;

/** Rundka honorowa po osiągnięciu 5 mln zł: bezwzględnie 30 s, potem koniec. */
export const GRACE_MS = 30000;

/** CTA na ekranie końcowym — kantor Cashify. */
export const CASHIFY_URL = "https://cashify.eu";

/** Liczba żyć w rundzie. Każde życie = pełne HP. */
export const LIVES = 3;

/** @deprecated Kara za śmierć wyłączona — wynik zostaje przy respawnie. */
export const RESPAWN_PENALTY_PLN = 0;

/** @deprecated Alias w PLN. */
export const RESPAWN_PENALTY = RESPAWN_PENALTY_PLN;

/**
 * Worek: gracz przytrzymuje Spację, by otworzyć worek nad sobą. Otwarty worek
 * łapie nałożony przedmiot; zamknięty — przedmiot odbija się i zabiera HP.
 * `catchRadius` to zasięg strefy łapania od środka gracza.
 */
export const BAG = {
  /** Wysokość sprite'a worka na ekranie (szerokość z proporcji PNG). */
  displayHeight: 182,
  /** Margines dolnej krawędzi sprite'a od dołu ekranu. */
  bottomEdgePad: 10,
  /** Strefa łapania — otwarty worek (szersza, przy otworze). */
  catchRadius: 48,
  /** Zamknięty worek: elipsa — szersza na boki, niższa w pionie. */
  catchRadiusClosedX: 44,
  catchRadiusClosedY: 24,
  contactDamage: 20,
  /** Głębokość renderowania (większa = bliżej kamery). */
  depth: {
    itemBehind: 5,
    bag: 6,
    itemFront: 7,
    logo: 8,
  },
  /** Środek strefy łapania — otwarty worek (w górę od środka sprite'a). */
  catchCenterUp: 0.28,
  /** Środek kontaktu — zamknięty worek (niżej niż poprzednio, bliżej „dachu”). */
  catchCenterUpClosed: 0.32,
  /** Z góry: przedmiot może trafić tuż nad linią kontaktu (px). */
  closedContactMinBelowPx: 2,
  /** Poniżej linii kontaktu — bez odbicia (nie tułów/logo worka). */
  closedContactMaxBelowPx: 10,
  /** Maks. odległość od osi worka w poziomie (udział szerokości sprite'a). */
  closedContactMaxDxRatio: 0.42,
  /** Cel wciągania: w głąb czarnego otworu (w górę od środka sprite'a worka). */
  mouthTargetUp: 0.1,
  /** Próg: przedmiot musi zejść do tej linii, żeby zacząć wciąganie. */
  mouthLayerThresholdUp: 0.24,
  /** Odległość od celu, przy której chowa się za sprite (wcześniej = dłużej widać). */
  mouthHideDistance: 34,
  mouthPullX: 0.7,
  mouthPullY: 0.95,
  mouthPullSpeed: 28,
  /** Najpierw widoczny zjazd w otwór, potem krótkie zanikanie. */
  swallowSlideMs: 140,
  swallowFadeMs: 50,
  // Wytrzymałość otwartego worka (jak dawna tarcza): otwarty zużywa energię,
  // po wyczerpaniu zamyka się i blokuje, aż energia odbije do reactivateAt.
  maxEnergy: 100,
  drainPerSec: 26, // ~3.8 s ciągłego otwarcia z pełnej
  regenPerSec: 42, // szybka regeneracja po puszczeniu
  reactivateAt: 14, // próg odblokowania po wyczerpaniu
  transitionMs: 140, // czas klatki pośredniej worka przy przełączeniu
} as const;

/** Spadające przedmioty (typy z katalogu items.ts). ~500 ms ≈ cel ~0,5 mln zł / 5 min przy typowym łapaniu. */
export const FALLING = {
  speed: 175,
  spawnEveryMs: 500,
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
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV
    ? "http://localhost:8787"
    : "https://cashify-scores.piotr-sobiecki.workers.dev");

/**
 * Normalizacja: gdy `VITE_API_BASE` poda host bez schematu (np.
 * "cashify-scores...workers.dev"), `fetch` potraktowałby go jako ścieżkę
 * względną i uderzył w pages.dev zamiast w workera. Dokładamy https://.
 */
export const API_BASE = /^https?:\/\//.test(RAW_API_BASE)
  ? RAW_API_BASE
  : `https://${RAW_API_BASE}`;

/**
 * Audio: utwór leci w pętli przez całą rozgrywkę. Plik w `public/`
 * (serwowany przez Vite). Brak pliku nie blokuje gry.
 */
export const AUDIO = {
  trackFile: "cashify.mp3",
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

/** Paleta Cashify (cashify.eu) — ciemne tło, złoto, fintech. */
export const COLORS = {
  bg: 0x0f1419,
  bgBottom: 0x151c24,
  gold: 0xc9a227,
  goldLight: 0xe8c547,
  cash: 0x3db87a,
  fiat: 0x6b8cae,
  crypto: 0xf0b429,
  text: 0xe8eaed,
  panel: 0x1a222d,
  warn: 0xe85d6a,
  cyan: 0x6b8cae,
  magenta: 0xe85d6a,
  yellow: 0xc9a227,
  green: 0x3db87a,
} as const;

export const COLOR_HEX = {
  bg: "#0f1419",
  bgBottom: "#151c24",
  gold: "#C9A227",
  goldLight: "#E8C547",
  cash: "#3DB87A",
  fiat: "#6B8CAE",
  crypto: "#F0B429",
  text: "#E8EAED",
  panel: "#1A222D",
  warn: "#E85D6A",
  cyan: "#6B8CAE",
  magenta: "#E85D6A",
  yellow: "#C9A227",
  green: "#3DB87A",
} as const;

/** Tuning gracza (do playtestu). */
export const PLAYER = {
  speed: 300,
  zoneTop: GAME_HEIGHT * 0.35, // ruch w dolnych ~65% ekranu
  /** Margines od krawędzi ekranu (px) — od środka + połowa sprite'a worka. */
  edgePadX: 6,
  edgePadY: 10,
  bodyRadius: 20,
  maxHp: 100,
  iframesMs: 900, // nietykalność po trafieniu, by nie tracić HP co klatkę
  respawnIframesMs: 1500,
} as const;
