# Gross to Net

A 2D top-down forensic accounting thriller in five episodes. Each episode is a separate case at a different consumer packaged goods company, with its own whistleblower, six forensic workpapers, dialogue confrontations, and a final hearing where you present evidence. The cases are connected by a trail of money that leads to one private-equity firm.

**Play:** http://mrussek.com/gross-to-net/, or open `index.html` locally. There's no build step and no dependencies.

## Episodes

| # | Title | Company | The fraud |
|---|---|---|---|
| 1 | Gross to Net | Halvorsen Brands (CPG, Ohio) | Trade-promotion embezzlement through a shell vendor, hidden in gross-to-net |
| 2 | Cold Storage | Northfield Foods (frozen pizza, Wisconsin) | Phantom inventory, capitalized variances and a fake third-party warehouse, inflating a lender's borrowing base |
| 3 | Sell-In | Voltline Beverage (energy drinks, Austin) | Channel stuffing, side letters, bill-and-hold and a marketing-fund round-trip, days before earnings |
| 4 | Facilitation | Botanas del Norte (snacks, Monterrey) | Customs bribery through a sham "consultancy," IMMEX duty evasion, and a pending acquisition |
| 5 | Hearthstone | Hearthstone Brands IPO (Chicago) | Related parties, round-tripping, Adjusted EBITDA abuse, stale goodwill, cookie-jar reserves and fee stripping |

Episodes can be played in any order, but the story builds from 1 to 5. Each episode saves its own progress to `localStorage`. The title screen shows which episodes are solved and your rating for each.

## Controls

**Keyboard:** WASD or arrow keys to move · Shift to hurry · E or Space to talk and inspect · P for the phone · J for the case file · M to mute · Esc to close · ☰ for episode select.

**Touch and mouse:** tap or click where you want to walk; tap a person or object to walk over and interact. Phones and tablets are detected automatically and get a zoom level and layout sized for small screens. Landscape gives the most room.

## Whistleblower hints

Every failed attempt is counted per step. When you fail a workpaper step enough times (2, 3, then 5 attempts), the episode's whistleblower texts you a hint, and each hint is more direct than the last. The final hint is effectively the answer. Dialogue and hearing mistakes escalate faster (1, 2, then 3). Your rating reflects your total missteps.

## Accounting covered

ASC 606 (consignment, bill-and-hold, consideration payable to a customer, variable consideration, contract existence), ASC 330 (abnormal costs, normal capacity), ASC 350 (one-step goodwill impairment), ASC 450 (loss ranges), ASC 470 (covenant breaches), ASC 805 (acquisition reserves), ASC 850 (related parties), ASC 855 (subsequent events), ASC 250 and SAB 99/108, Reg S-K Items 10(e) and 404, Reg FD and Form 8-K Item 4.02, the FCPA (anti-bribery, books-and-records, facilitating payments, third-party risk, M&A successor liability), AS 2401 / AU-C 240 journal entry testing, AU-C 501/505 inventory observation and confirmations, AS 2201 material weaknesses, Benford's law, ratio estimation, cash tracing, and borrowing-base calculations.

## Code layout

| File | Purpose |
|---|---|
| `js/mapkit.js` | Map-building primitives (floor layer, object layer, props, lighting) |
| `js/render.js` | Procedural pixel art: tiles, furniture, vehicles, characters, portraits, signage font |
| `js/engine.js` | Game loop, grid movement, tap-to-move pathfinding, NPC actors, camera, lighting, weather |
| `js/ui.js` | Dialogue, phone, case file, toasts, chapter cards, HUD |
| `js/puzzles.js` | Workpaper framework and reusable step types (numbers, multiple choice, row pick, multi-select, criteria, charts) |
| `js/hearing.js` | Evidence-presentation finale engine |
| `js/kit.js` | Episode registry, story builder, hint escalation, shared helpers, endings, saves |
| `js/episodes/ep1.js` … `ep5.js` | Each episode's maps, cast, workpapers, story, hints and hearing |
| `js/main.js` | Episode select, save/load, input routing |
