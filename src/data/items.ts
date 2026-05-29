/**
 * Katalog przedmiotów Cashify — wartość w PLN (szacunki ~2026), rzadkość z ceny.
 */

export type ItemCategory = "crypto" | "fiat" | "metal" | "boss";

export interface ItemDef {
  label: string;
  /** Wartość złapanego przedmiotu w PLN — trafia do wyniku rundy. */
  valuePln: number;
  category: ItemCategory;
  asset: string;
}

/**
 * Im drożej, tym rzadszy spawn — ale drobne monety nie dominują puli (tempo ~0,5 mln / 5 min).
 */
export function spawnWeightForValue(valuePln: number): number {
  if (valuePln <= 0) return 0;
  if (valuePln >= 50_000) return 6;
  if (valuePln >= 10_000) return 28;
  if (valuePln >= 1_000) return 52;
  if (valuePln >= 100) return 38;
  if (valuePln >= 10) return 16;
  return 8;
}

export function getSpawnWeight(type: ItemType): number {
  if (ITEMS[type].category === "boss") return 0;
  return spawnWeightForValue(ITEMS[type].valuePln);
}

// Wartości PLN: przybliżenie rynkowe (do tuningu w playteście).
export const ITEMS = {
  btc: { label: "Bitcoin", valuePln: 400_000, category: "crypto", asset: "crypto/btc" },
  eth: { label: "Ethereum", valuePln: 13_000, category: "crypto", asset: "crypto/eth" },
  bnb: { label: "BNB", valuePln: 2_500, category: "crypto", asset: "crypto/bnb" },
  sol: { label: "Solana", valuePln: 700, category: "crypto", asset: "crypto/sol" },
  xmr: { label: "Monero", valuePln: 650, category: "crypto", asset: "crypto/xmr" },
  usdt: { label: "Tether", valuePln: 4, category: "crypto", asset: "crypto/usdt" },
  usdc: { label: "USD Coin", valuePln: 4, category: "crypto", asset: "crypto/usdc" },
  xrp: { label: "XRP", valuePln: 9, category: "crypto", asset: "crypto/xrp" },
  doge: { label: "Dogecoin", valuePln: 1.4, category: "crypto", asset: "crypto/doge" },
  tron: { label: "TRON", valuePln: 1, category: "crypto", asset: "crypto/tron" },

  usd: { label: "Dolar", valuePln: 4, category: "fiat", asset: "fiat/usd" },
  eur: { label: "Euro", valuePln: 4.3, category: "fiat", asset: "fiat/eur" },
  pln: { label: "Złotówka", valuePln: 1, category: "fiat", asset: "fiat/pln" },
  mxn: { label: "Peso", valuePln: 0.24, category: "fiat", asset: "fiat/peso" },
  czk: { label: "Korona", valuePln: 0.18, category: "fiat", asset: "fiat/korona" },

  gold_bar: { label: "Sztabka złota", valuePln: 25_000, category: "metal", asset: "metals/gold_bar" },
  silver_bar: { label: "Sztabka srebra", valuePln: 130, category: "metal", asset: "metals/silver_bar" },
  gold_coin: { label: "Złota moneta", valuePln: 350, category: "metal", asset: "metals/gold_coin" },
  silver_coin: { label: "Srebrna moneta", valuePln: 5, category: "metal", asset: "metals/silver_coin" },

  boss_bar: { label: "Sztabka bossa", valuePln: 50_000, category: "boss", asset: "boss/boss_bar" },
} as const satisfies Record<string, ItemDef>;

export type ItemType = keyof typeof ITEMS;

export const BOSS_DROP: ItemType = "boss_bar";

export const ITEM_TYPES = (Object.keys(ITEMS) as ItemType[]).filter(
  (t) => ITEMS[t].category !== "boss",
);

export function isCollectibleItemType(type: string): type is ItemType {
  return type in ITEMS;
}

export function weightedPick(types: ItemType[], roll: number): ItemType {
  const total = types.reduce((s, t) => s + getSpawnWeight(t), 0);
  const clamped = roll < 0 ? 0 : roll >= 1 ? 0.999999 : roll;
  let r = clamped * total;
  for (const t of types) {
    r -= getSpawnWeight(t);
    if (r < 0) return t;
  }
  return types[types.length - 1];
}

export function randomWeightedItemType(): ItemType {
  return weightedPick(ITEM_TYPES, Math.random());
}
