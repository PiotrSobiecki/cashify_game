# Cashify Game

Krótka, przeglądarkowa gra-konkurs w klimacie kantoru [Cashify](https://cashify.eu).
Sterujesz **workiem**, łapiesz spadające krypto, waluty i metale szlachetne, pokonujesz
3 bossów (Jacek → Weronika → Jakub) i ścigasz się o **najszybsze dojście do 5 mln zł**.
Po osiągnięciu mety leci jeszcze 30 s rundki honorowej, a na końcu — ranking online
i CTA do cashify.eu.

## Rozgrywka

- **Worek** — przytrzymaj `Spację` (lub przycisk WOREK na mobile), by otworzyć worek nad
  głową. Otwarty łapie nałożony przedmiot; zamknięty odbija go i zabiera HP. Otwarty worek
  zużywa energię — po wyczerpaniu blokuje się do regeneracji.
- **Wartości w PLN** — każdy przedmiot ma wartość; ważony spawn (`src/data/items.ts`).
- **Bossy** — przy progach 0,5 mln / 2,5 mln / 5 mln zł rusza 10 s faza deszczu specjalnych
  sztabek z okienka kantoru. Przed każdym bossem pojawia się dymek pracownika.
- **Meta** — 5 mln zł (boss Jakub) + 30 s rundki, potem ekran końcowy z listą zdobyczy.
- **Ranking** — speedrun: wygrani po czasie rosnąco, reszta po punktach. TOP 10 online.
- **Muzyka** — `public/cashify.mp3` w pętli; `M` wycisza. Brak pliku nie blokuje gry.

## Stack

- **Phaser 4** + **TypeScript** + **Vite** (portrait 480×800)
- **pnpm** jako menedżer pakietów
- **Vitest** — testy logiki (systemy w `src/systems/`)
- **Ranking online**: Cloudflare Worker (Hono) + Neon (Postgres) w `worker/`

## Struktura

```
src/
  scenes/      Boot → Menu → Game → End
  entities/    Player (worek), FallingItem
  systems/     czysta logika (Score, Race, Bag, Inventory, Milestone, ranking…)
  ui/          HUD, popupy NPC, ekran bossa, tło
  data/        items, bosses, npc (źródła prawdy)
  config.ts    stałe gry — pojedyncze źródło tuningu
worker/        API rankingu (Cloudflare Worker + Neon)
```

## Uruchomienie

```bash
pnpm install
pnpm dev        # dev server (Vite)
pnpm build      # tsc --noEmit + vite build → dist/
pnpm preview    # podgląd builda produkcyjnego
pnpm test       # testy (vitest run)
```

Ranking lokalnie (osobny terminal, w `worker/`):

```bash
cd worker
pnpm install
npx wrangler dev          # API na http://localhost:8787
```

W trybie `vite dev` gra celuje w `localhost:8787`; w buildzie produkcyjnym w
`https://cashify-scores.piotr-sobiecki.workers.dev`. Nadpisuje to `VITE_API_BASE`.

## Worker rankingu

Endpointy (`worker/src/index.ts`):

- `GET /scores` — TOP 10 (wygrani po czasie rosnąco, reszta po punktach)
- `POST /scores` — zapis wyniku `{ name, reason: win|death|timeout, score, timeMs }`

Anty-cheat świadomie pominięty — klient jest niezaufany, ale walidujemy tylko typ/zakres.

Deploy i baza:

```bash
cd worker
psql "$DATABASE_URL" -f schema.sql      # jednorazowo: tabela scores
npx wrangler secret put DATABASE_URL    # connection string Neon
npx wrangler deploy                     # → cashify-scores.*.workers.dev
```
