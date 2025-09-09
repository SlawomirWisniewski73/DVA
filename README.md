# DVA – Differential Vector Animation (AGPL)

**DVA** to format i runtime animacji wektorowych zapisujących tylko **różnice w czasie** (transformacje / równania),
dzięki czemu pliki są lekkie i łatwe do generowania przez AI.

## Nowości bezpieczeństwa
- Zero `eval`/`new Function` – bezpieczny parser + interpreter AST.
- Biała lista funkcji (deterministyczne), stałe `PI/E`.
- Nieznane identyfikatory/funkcje → 0 (bez wyjątku) – odporność na błędy i ataki.
- Dzielenie przez 0 → 0.

## Szybki start
```bash
npm ci
npm run dev   # uruchamia lokalne demo (Vite)

```

## Struktura
```
•	packages/@dva/core – parser, evaluacja timeline, utilsy (bezpieczny expr engine)
•	packages/@dva/react – odtwarzacz React (SVG)
•	apps/demo – demo z edytorem JSON
```

## Testy
npm run test


## Licencja

```
•	AGPL-3.0-or-later (patrz LICENSE-AGPL)
•	Opcja licencji komercyjnej: LICENSE-COMMERCIAL.md
```
