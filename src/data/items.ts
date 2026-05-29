/**
 * Katalog przedmiotów Cashify (czyste dane). Źródło prawdy dla punktów,
 * etykiet PL (ekran końca / ekwipunek) i kluczy assetów (ładowanie w Fazie 5).
 * Widełki punktowe wg PRD: krypto-top 25–30, krypto-alt 15–20, fiat 10–15,
 * monety 12, sztabki 20–35.
 */

export type ItemCategory = "crypto" | "fiat" | "metal";

export interface ItemDef {
  /** Etykieta po polsku do ekranu zdobyczy. */
  label: string;
  /** Punkty za złapanie. */
  points: number;
  category: ItemCategory;
  /** Klucz tekstury / ścieżka assetu (PNG ładowane w Fazie 5). */
  asset: string;
}

export const ITEMS = {
  // --- Krypto ---
  btc: { label: "Bitcoin", points: 30, category: "crypto", asset: "crypto/btc" },
  eth: { label: "Ethereum", points: 25, category: "crypto", asset: "crypto/eth" },
  bnb: { label: "BNB", points: 20, category: "crypto", asset: "crypto/bnb" },
  sol: { label: "Solana", points: 20, category: "crypto", asset: "crypto/sol" },
  xmr: { label: "Monero", points: 20, category: "crypto", asset: "crypto/xmr" },
  usdt: { label: "Tether", points: 18, category: "crypto", asset: "crypto/usdt" },
  usdc: { label: "USD Coin", points: 18, category: "crypto", asset: "crypto/usdc" },
  xrp: { label: "XRP", points: 15, category: "crypto", asset: "crypto/xrp" },
  doge: { label: "Dogecoin", points: 15, category: "crypto", asset: "crypto/doge" },
  tron: { label: "TRON", points: 15, category: "crypto", asset: "crypto/tron" },

  // --- Fiat ---
  usd: { label: "Dolar", points: 15, category: "fiat", asset: "fiat/usd" },
  eur: { label: "Euro", points: 15, category: "fiat", asset: "fiat/eur" },
  pln: { label: "Złotówka", points: 12, category: "fiat", asset: "fiat/pln" },
  mxn: { label: "Peso", points: 10, category: "fiat", asset: "fiat/peso" },
  czk: { label: "Korona", points: 10, category: "fiat", asset: "fiat/korona" },

  // --- Metale ---
  gold_bar: { label: "Sztabka złota", points: 35, category: "metal", asset: "metals/gold_bar" },
  silver_bar: { label: "Sztabka srebra", points: 22, category: "metal", asset: "metals/silver_bar" },
  gold_coin: { label: "Złota moneta", points: 12, category: "metal", asset: "metals/gold_coin" },
  silver_coin: { label: "Srebrna moneta", points: 12, category: "metal", asset: "metals/silver_coin" },
} as const satisfies Record<string, ItemDef>;

export type ItemType = keyof typeof ITEMS;

/** Wszystkie typy przedmiotów (do spawnu/iteracji). */
export const ITEM_TYPES = Object.keys(ITEMS) as ItemType[];
