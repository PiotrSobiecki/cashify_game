// Stałe gry Cashify — pojedyncze źródło prawdy, do tuningu w playteście.

/** Cel rundy = 3000 pkt. Wygrana po czasie do 3000 (najszybszy = wyżej w rankingu). */
export const WIN_SCORE = 3000;

/** Twardy limit sesji (zabezpieczenie): 6:30. */
export const SESSION_MAX_MS = 6 * 60 * 1000 + 30 * 1000;

/** Bossy przy 900 / 1900 / 2900 pkt. */
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
