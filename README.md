# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/dikadavidsatu/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/dikadavidsatu/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy tracker, platinum roadmap and guide for all **55 official Grand Theft Auto VI (PlayStation 5) trophies**: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned.

- **Tracker** — every official trophy with its exact name, description and grade. Click a card to mark it earned; progress persists in your browser (localStorage), with a progress ring, per-grade counts and an “up next” line that surfaces unearned missables first. The checklist exports and imports as a JSON file.
- **Filters** — by grade, by kind (story / collectible / activity / online / misc), by earned status, by missables, plus text search. A **spoiler setting** hides unearned story trophies behind “Hidden trophy” until you earn them.
- **Roadmap to the Platinum** — four phases (story → strangers & activities → collectibles & exploration → cleanup & the 100% grind) with estimated hours (80–120) and difficulty (5/10), both labelled as estimates. Each trophy's guide panel also names the roadmap phase it belongs to.
- **Missables, flagged honestly** — five trophies are flagged as *inferred* missables, reasoned from the official descriptions' wording (choices, one-time scenes, a fail-first condition) and labelled as inference everywhere they appear — never as confirmed fact.
- **A guide for every trophy** — what to do, where and when it matters, and a tip, in this guide's own words. Each panel cites its sources: the official trophy description (Exophase) and PSN's tracked target where one exists (PSNProfiles). Anything drawn from GTA V / RDR2 trophy design is labelled an *expectation*, not a fact — the game launched 2026-11-19 and no claim here pretends to be play-tested.

The app is plain static files with zero dependencies and zero network requests: it works from `file://` or any static host, and shows no Rockstar logo or official artwork.

## Run it

Open `app/index.html` in a browser — that's it.

Or serve it locally (Node 22, standard library only):

```sh
node serve.ts            # http://localhost:8123
python3 -m http.server --directory app 8123
```

To hand the entry in the way the competition program does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # copies app/ + screenshots/ to out/ and writes out/dossier.json
```

Useful demo links: `app/index.html?demo=1` seeds 13 trophies as earned, `?demo=1&detail=37` opens a guide panel, `?demo=1&view=roadmap` opens the roadmap.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the tracker, roadmap and guide UI (hand-written, no framework).
- `app/data/trophies.json` — the trophy dataset: official names/descriptions/grades plus this guide's kind, hidden and missable flags, PSN target, guide and tips per trophy. `app/data/trophies-data.js` carries the same content as a script so the page also loads from `file://`, where `fetch()` of local JSON is blocked.
- `main.ts` — the handoff program; `vendor/makefun-frontend.ts` — the make.fun dossier library (vendored unchanged, as the scorer requires).
- `screenshots/` — captures of the running app; `shots.json` says what each one shows.

<sub>Entered on [make.fun](https://make.fun/?ref=vyqgkf3p&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
