/** Format kwoty w PLN do UI (np. „1 000 000 zł”). */
export function formatPln(amount: number): string {
  return `${Math.round(amount).toLocaleString("pl-PL")} zł`;
}

/** Krótszy format do HUD (tys. / mln). */
export function formatPlnCompact(amount: number): string {
  const n = Math.round(amount);
  if (n >= 1_000_000) {
    const mln = n / 1_000_000;
    return Number.isInteger(mln) ? `${mln} mln zł` : `${mln.toFixed(1)} mln zł`;
  }
  if (n >= 10_000) return `${Math.round(n / 1000)} tys. zł`;
  return `${n.toLocaleString("pl-PL")} zł`;
}
