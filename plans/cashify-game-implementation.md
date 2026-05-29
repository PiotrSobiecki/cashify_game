# Plan: Cashify Game (Firewall → konkurs łapania pieniędzy)

> Source PRD: [cashify_game#1](https://github.com/PiotrSobiecki/cashify_game/issues/1)

## Architectural decisions

Durable decisions that apply across all phases:

- **Architecture style**: przebudowa istniejącej gry Firewall — Vite + TypeScript + Phaser 4. Scena gry orkiestruje czyste systemy (logika) i powłoki Phasera (wizual/wejście).
- **Model konkursu**: zwycięzca = najszybszy **czas** do 3000 pkt (speedrun). Ranking sortowany po czasie.
- **Data model / encje**:
  - `ItemType` — kategorie: krypto, fiat, metal, `boss_bar`; każdy ma punkty, etykietę PL, klucz assetu.
  - `Inventory` — `Map<ItemType, liczba>` złapanych przedmiotów; serializowalny do ekranu końca.
  - `RunResult` — wpis rankingowy: nick + czas (sek.).
- **Integracje**: ranking online na obecnej infrastrukturze (Cloudflare Worker + Neon), wzorzec jak w Firewallu. Wynik wysyłany z przeglądarki **bez walidacji serwerowej** (anty-cheat świadomie pominięty). CTA → cashify.eu.
- **Głębokie moduły (czysta logika, testowane Vitestem niezależnie od Phasera)**: kontroler rundy (timer + progi + warunek wygranej), ekwipunek, decyzja worka (złap vs odbij), system punktów. Katalog przedmiotów jako czyste dane.
- **Assety**: avatary NPC już w repo (`public/assets/npc/jacek.png`, `weronika.png`, `jakub.png`); ikonki krypto/fiat/metale z darmowych packów; brak pliku (PNG/audio) nie blokuje gry (fallback proceduralny/placeholder).
- **Klucze nadpisujące pierwotny plan techniczny**: bossy działają na **timerze 10 s deszczu bonusów** (nie na HP); **zegar wyścigu stoi** podczas popupu NPC; **ranking + pole na nick to sedno** ekranu końcowego, nie opcja.

---

## Phase 1: Worek łapie i boli (rdzeń pętli)

**User stories**: 1, 3, 4, 5, 6, 7

### What to build

Cienki, ale kompletny przekrój podstawowej rozgrywki na jednym typie przedmiotu. Gracz porusza workiem w dolnej strefie ekranu. Przytrzymanie spacji/przycisku otwiera worek nad graczem; widać wyraźnie stan otwarty/zamknięty. Spadający przedmiot przy otwartym worku i nałożeniu zostaje **złapany** (punkty), a przy zamkniętym worku i kontakcie z graczem **odbija się** i zabiera **HP**. Gracz ma 3 życia; śmierć = respawn z karą −15 pkt.

### Acceptance criteria

- [ ] Worek porusza się klawiaturą (strzałki/WASD) w dolnej strefie.
- [ ] Przytrzymanie spacji otwiera worek; puszczenie zamyka; stan jest czytelny wizualnie.
- [ ] Otwarty worek + nałożenie na przedmiot → złapanie nalicza punkty.
- [ ] Zamknięty worek + kontakt → przedmiot się odbija i gracz traci HP.
- [ ] 3 życia; utrata wszystkich HP → respawn z karą −15 pkt.
- [ ] Decyzja „złap vs odbij" pokryta testami jako czysta logika (otwarty+overlap → catch; zamknięty+kontakt → bounce+damage; brak overlapu → nic).

---

## Phase 2: Pełny katalog + spawn + HUD wyścigu

**User stories**: 5, 8, 18

### What to build

Rozbudowa pętli o pełny katalog przedmiotów (krypto, fiat, metale) z ich wartościami, ekwipunek zliczający, co i ile złapano, oraz spawn napędzany falami. HUD pokazuje postęp do celu 3000, upływający czas wyścigu i pozostałe życia. Progi zdarzeń śledzone flagami jednorazowości, aby nie powtarzały się przy respawnie.

### Acceptance criteria

- [ ] Spawnowane są różne typy przedmiotów z katalogu, każdy z właściwą wartością punktową.
- [ ] Złapanie dolicza punkty zgodnie z katalogiem oraz powiększa ekwipunek (typ → liczba).
- [ ] HUD pokazuje postęp do 3000, czas i życia, aktualizowane na bieżąco.
- [ ] Flagi progów wyzwalają się dokładnie raz na rundę (test: brak powtórki przy respawnie/cofnięciu punktów).
- [ ] `Inventory` (zliczanie wielu sztuk/typów i serializacja) oraz naliczanie punktów pokryte testami.

---

## Phase 3: Bossy i pracownicy kantoru

**User stories**: 9, 10, 11

### What to build

Wydarzenia progowe w trakcie wyścigu. Przy 900/1900/2900 pkt pojawia się boss: wstrzymuje zwykłe spawny i przez 10 s zrzuca bonusowe `boss_bar`, które gracz łapie dla dodatkowych punktów (przyspieszenie do 3000); po 10 s wraca normalny spawn. Przy 1000/2000/3000 pkt wyskakuje popup pracownika (Jacek/Weronika/Jakub) z chmurką tekstu — **na czas popupu zegar wyścigu się zatrzymuje** i wznawia po zamknięciu.

### Acceptance criteria

- [ ] 3 bossy odpalają się przy 900/1900/2900, każdy jednorazowo.
- [ ] Faza bossa wstrzymuje zwykłe spawny, zrzuca bonusowe przedmioty przez ~10 s, potem przywraca spawn.
- [ ] 3 popupy NPC odpalają się przy 1000/2000/3000 z właściwym tekstem/postacią.
- [ ] Podczas popupu NPC timer wyścigu jest zatrzymany; po zamknięciu wznawia od tej samej wartości (test kontrolera).
- [ ] Kolejność zdarzeń w sesji: 900→1000→1900→2000→2900→3000.

---

## Phase 4: Wygrana, ranking, ekran końcowy, CTA

**User stories**: 12, 13, 14, 15, 16, 17, 19

### What to build

Domknięcie konkursu. Przy pierwszym przekroczeniu 3000 timer wyścigu zatrzymuje się (to czas liczony do rankingu), pojawia się popup Jakuba, następuje krótka rundka honorowa ~10 s (dla feelu/CTA, bez wpływu na ranking), po czym scena końcowa. Ekran końcowy zdominowany przez ranking: pole na nick → zapis `RunResult` (czas) do globalnego rankingu → TOP z podświetleniem wpisu gracza. Pod spodem lista zdobyczy (typ × ilość), przycisk „Idź do Cashify" → cashify.eu oraz „Zagraj jeszcze raz".

### Acceptance criteria

- [ ] Timer zatrzymuje się dokładnie przy pierwszym osiągnięciu ≥3000 (test kontrolera); warunek wygranej spełniony.
- [ ] Popup Jakuba → rundka ~10 s → ekran końcowy, bez crasha.
- [ ] Pole na nick zapisuje czas do rankingu (Worker + Neon); pobrany TOP pokazuje wpis gracza podświetlony.
- [ ] Lista zdobyczy odzwierciedla zawartość ekwipunku (typ × ilość).
- [ ] „Idź do Cashify" prowadzi na cashify.eu; „Zagraj jeszcze raz" restartuje rundę.

---

## Phase 5: Rebrand, assety, mobile, cleanup, testy

**User stories**: 2, 20, 21, 22

### What to build

Warstwa marki, assetów i czystości kodu. Menu i ekrany przebrandowane na CASHIFY (nazwa, tagline kantoru, instrukcja „Spacja = worek", paleta retro-neon + akcenty złota). Ładowanie PNG (ikonki krypto/fiat/metale, avatary NPC) i audio z fallbackiem na placeholdery. Weryfikacja sterowania mobile (joystick + przycisk „WOREK"). Usunięcie mechanik spoza zakresu (strzały, power-upy, tarcza, wrogowie malware). Komplet testów Vitest dla głębokich modułów.

### Acceptance criteria

- [ ] Menu i ekran końcowy noszą branding CASHIFY (nazwa, tagline, instrukcja, paleta).
- [ ] Assety PNG/audio ładują się z `public/`, a ich brak nie blokuje gry (fallback działa).
- [ ] Sterowanie na mobile (joystick + przycisk „WOREK") działa i jest grywalne.
- [ ] Usunięto kod tarczy/strzałów/power-upów/wrogów; brak martwego kodu w scenie gry.
- [ ] Testy Vitest przechodzą dla: kontroler rundy, ekwipunek, decyzja worka, system punktów.
- [ ] Pełen przebieg (start → 3 bossy → 3 NPC → 3000 → rundka → ekran końcowy → zapis rankingu → CTA) bez crasha.
