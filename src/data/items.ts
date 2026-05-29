/**
 * Katalog przedmiotów Cashify (czyste dane). Źródło prawdy dla punktów,
 * etykiet PL (ekran końca / ekwipunek) i kluczy assetów (ładowanie w Fazie 5).
 * Widełki punktowe wg PRD: krypto-top 25–30, krypto-alt 15–20, fiat 10–15,
 * monety 12, sztabki 20–35.
 */

export type ItemCategory = "crypto" | "fiat" | "metal" | "boss";

export interface ItemDef {
  /** Etykieta po polsku do ekranu zdobyczy. */
  label: string;
  /** Punkty za złapanie (skalują z wartością — rzadkie = jackpot). */
  points: number;
  /** Szacunkowa wartość 1 szt. w PLN (podstawa rzadkości spawnu). */
  valuePln: number;
  /** Względna waga spawnu (większa = częstszy). 0 = poza normalnym spawnem. */
  weight: number;
  category: ItemCategory;
  /** Klucz tekstury / ścieżka assetu. */
  asset: string;
}

// Wartości PLN: przybliżenie z początku 2026 (do tuningu). Im droższy item,
// tym mniejsza waga (rzadszy) i więcej punktów (nagroda za upolowanie).
export const ITEMS = {
  // --- Krypto ---
  btc: { label: "Bitcoin", points: 300, valuePln: 400000, weight: 1, category: "crypto", asset: "crypto/btc" },
  eth: { label: "Ethereum", points: 150, valuePln: 13000, weight: 3, category: "crypto", asset: "crypto/eth" },
  bnb: { label: "BNB", points: 80, valuePln: 2500, weight: 8, category: "crypto", asset: "crypto/bnb" },
  sol: { label: "Solana", points: 40, valuePln: 700, weight: 20, category: "crypto", asset: "crypto/sol" },
  xmr: { label: "Monero", points: 40, valuePln: 650, weight: 20, category: "crypto", asset: "crypto/xmr" },
  usdt: { label: "Tether", points: 8, valuePln: 4, weight: 90, category: "crypto", asset: "crypto/usdt" },
  usdc: { label: "USD Coin", points: 8, valuePln: 4, weight: 90, category: "crypto", asset: "crypto/usdc" },
  xrp: { label: "XRP", points: 12, valuePln: 9, weight: 80, category: "crypto", asset: "crypto/xrp" },
  doge: { label: "Dogecoin", points: 6, valuePln: 1.4, weight: 100, category: "crypto", asset: "crypto/doge" },
  tron: { label: "TRON", points: 5, valuePln: 1, weight: 100, category: "crypto", asset: "crypto/tron" },

  // --- Fiat ---
  usd: { label: "Dolar", points: 10, valuePln: 4, weight: 90, category: "fiat", asset: "fiat/usd" },
  eur: { label: "Euro", points: 10, valuePln: 4.3, weight: 90, category: "fiat", asset: "fiat/eur" },
  pln: { label: "Złotówka", points: 5, valuePln: 1, weight: 100, category: "fiat", asset: "fiat/pln" },
  mxn: { label: "Peso", points: 4, valuePln: 0.24, weight: 110, category: "fiat", asset: "fiat/peso" },
  czk: { label: "Korona", points: 4, valuePln: 0.18, weight: 110, category: "fiat", asset: "fiat/korona" },

  // --- Metale ---
  gold_bar: { label: "Sztabka złota", points: 150, valuePln: 10000, weight: 3, category: "metal", asset: "metals/gold_bar" },
  silver_bar: { label: "Sztabka srebra", points: 30, valuePln: 130, weight: 25, category: "metal", asset: "metals/silver_bar" },
  gold_coin: { label: "Złota moneta", points: 40, valuePln: 350, weight: 20, category: "metal", asset: "metals/gold_coin" },
  silver_coin: { label: "Srebrna moneta", points: 10, valuePln: 5, weight: 80, category: "metal", asset: "metals/silver_coin" },

  // --- Drop bossa (tylko w fazie bossa, poza normalnym spawnem) ---
  boss_bar: { label: "Sztabka bossa", points: 50, valuePln: 10000, weight: 0, category: "boss", asset: "boss/boss_bar" },
} as const satisfies Record<string, ItemDef>;

export type ItemType = keyof typeof ITEMS;

/** Specjalny drop bossa — zrzucany tylko podczas fazy bossa. */
export const BOSS_DROP: ItemType = "boss_bar";

/** Typy do NORMALNEGO spawnu (bez dropów bossa). */
export const ITEM_TYPES = (Object.keys(ITEMS) as ItemType[]).filter(
  (t) => ITEMS[t].category !== "boss",
);

/** Tylko przedmioty z katalogu mogą być złapane / odbić się od worka. */
export function isCollectibleItemType(type: string): type is ItemType {
  return type in ITEMS;
}

/**
 * Ważony wybór typu (czysty, testowalny): `roll` ∈ [0,1). Im większa waga
 * itemu, tym większa szansa. Droższe itemy mają mniejsze wagi → są rzadsze.
 */
export function weightedPick(types: ItemType[], roll: number): ItemType {
  const total = types.reduce((s, t) => s + ITEMS[t].weight, 0);
  const clamped = roll < 0 ? 0 : roll >= 1 ? 0.999999 : roll;
  let r = clamped * total;
  for (const t of types) {
    r -= ITEMS[t].weight;
    if (r < 0) return t;
  }
  return types[types.length - 1];
}

/** Losowy typ do normalnego spawnu wg wag (Math.random). */
export function randomWeightedItemType(): ItemType {
  return weightedPick(ITEM_TYPES, Math.random());
}
