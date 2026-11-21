# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/dikadavidsatu/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/dikadavidsatu/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy tracker, platinum roadmap and guide for all **55 official Grand Theft Auto VI (PlayStation 5) trophies**: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned.

- **Tracker** — every official trophy with its exact name, description and grade. Click a card to mark it earned; progress persists in your browser (localStorage), with a progress ring, a progress bar with a plain-language percentage label, per-grade counts and an “up next” line that surfaces unearned missables first. The checklist exports and imports as a JSON file.
- **Three-step guide for every trophy** — each trophy carries a `guide` array of three short hints written for this page: **1. How to trigger it** — the action the trophy asks for; **2. Where & when** — the place, moment or story window it belongs to; **3. Watch out for** — the mistake, trap or missable condition that costs a retry. The detail panel renders them as a numbered list with those labels, and every card shows its first step at a glance so the grid already answers “how do I start this one?”. Hidden story trophies keep their steps spoiler-light, and the steps stay hidden with the trophy until you earn it or turn spoilers off.
- **Search that reads the guides** — the search box matches trophy names and official descriptions, and all three guide steps too. Type what you remember doing — “showroom”, “launder”, “bowling”, “meditate” — instead of the trophy's exact name. A short note under the controls says so, with example words.
- **Filters** — by grade, by kind (story / collectible / activity / online / misc), by earned status, by missables, plus the guide-aware text search. A **spoiler setting** hides unearned story trophies behind “Hidden trophy” until you earn them.
- **Roadmap to the Platinum** — four phases (story → strangers & activities → collectibles & exploration → cleanup & the 100% grind) with estimated hours (80–120) and difficulty (5/10), both labelled as estimates. Each trophy's guide panel also names the roadmap phase it belongs to, and the roadmap view explains how the three-step guides are organised.
- **Missables, flagged honestly** — five trophies are flagged as *inferred* missables, reasoned from the official descriptions' wording (choices, one-time scenes, a fail-first condition) and labelled as inference everywhere they appear — never as confirmed fact. The third guide step of each flagged trophy is the one that says how to protect the attempt, usually a manual save before the story moment or first try.
- **A tip for every trophy** — alongside the three steps, each panel keeps a single short tip, in this guide's own words. Each panel cites its sources: the official trophy description (Exophase) and PSN's tracked target where one exists (PSNProfiles). Anything drawn from GTA V / RDR2 trophy design is labelled an *expectation*, not a fact — the game launched 2026-11-19 and no claim here pretends to be play-tested.

The app is plain static files with zero dependencies and zero network requests: it works from `file://` or any static host, and shows no Rockstar logo or official artwork.

## Run it

Open `app/index.html` in a browser — that's it.

Or serve it locally (Node 22, standard library only):

```sh
node serve.ts            # http://localhost:8123
python3 -m http.server --directory app 8123
```

The dev server answers HEAD requests, sends an ETag with every file (so repeat previews can be answered with a 304), and shows a styled 404 page for paths that do not exist.

To hand the entry in the way the competition program does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # copies app/ + screenshots/ to out/ and writes out/dossier.json
```

The handoff program checks its inputs first and exits non-zero, naming what is missing, rather than writing a partial output. After copying, it parses `dossier.json` back from disk to prove the file is valid, then writes `out/manifest.json` with the size and SHA-256 of every output file, and prints a short summary — so the handoff can be verified with `sha256sum` against the manifest without re-running anything.

Useful demo links: `app/index.html?demo=1` seeds 13 trophies as earned, `?demo=1&detail=37` opens a guide panel, `?demo=1&view=roadmap` opens the roadmap. Try `?demo=1` with a search for “showroom” to see the guide-aware search find Capital Offense from its hints.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the tracker, roadmap and guide UI (hand-written, no framework). `app.js` renders each trophy's three guide steps as a labelled list in the detail panel, shows the first step on the card, and makes the search box match guide text as well as names and descriptions.
- `app/data/trophies.json` — the trophy dataset: official names/descriptions/grades plus this guide's kind, hidden and missable flags, PSN target, a three-step `guide` array and a `tips` line per trophy. `app/data/trophies-data.js` carries the identical content as a script so the page also loads from `file://`, where `fetch()` of local JSON is blocked. The two files are a hand-maintained mirror pair: both are edited by hand, in step, and neither is generated from the other — if you change one, change the other the same way.
- `main.ts` — the handoff program (preflight, copy, dossier, verification, manifest); `vendor/makefun-frontend.ts` — the make.fun dossier library (vendored unchanged, as the scorer requires).
- `screenshots/` — captures of the running app; `shots.json` says what each one shows.

## Data sources

Trophy names, descriptions, grades and hidden flags: the official PlayStation 5 list of 55 trophies, as published by Exophase. Progress targets (for example 42 Shooting Range challenges, 18 meditation spots, 52 areas of Leonida): PSNProfiles' listing of the counts PSN itself tracks. Guide steps and tips: written for this guide from those descriptions, in three parts per trophy — how, where/when, watch out — with hidden story trophies kept spoiler-light; anything beyond the official wording is labelled “expectation” or “inferred” in the text itself.

<sub>Entered on [make.fun](https://make.fun/?ref=vyqgkf3p&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
