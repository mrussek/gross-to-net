# Gross to Net

A 2D top-down forensic accounting thriller. You're the new controls lead at Halvorsen Brands, a $6.2B consumer packaged goods company, during Q3 close. Your predecessor left without notice. An anonymous whistleblower, **LEDGER**, has left you a burner phone.

## Play

Open `index.html` in a browser. There's no build step and no dependencies.

**Controls:** WASD or arrow keys to move · Shift to hurry · E or Space to talk and inspect · P for the phone · J for the case file · M to mute · Esc to close.

**Touch and mouse:** tap or click where you want to walk; tap a person or object to walk over and interact. Phones and tablets are detected automatically and get a zoom level and layout sized for small screens. Landscape gives the most room.

Progress autosaves to `localStorage`.

## How it plays

- **Explore** Floor 14 (and, eventually, parking garage P2). Talk to staff and inspect objects. Obtain data without tipping anyone off.
- **Workpapers.** Six forensic analyses, each a multi-step procedure with real numbers that have to tie:
  1. GL 2410 trade-accrual roll-forward (solve for the unsupported top-side)
  2. Benford first-digit and approval-threshold analysis (invoice splitting under the DoA limit)
  3. Vendor master ↔ HR data cross-match (and the segregation-of-duties failure)
  4. Proof of performance: invoices vs. syndicated POS scan data, plus ASC 606 consideration payable to a customer
  5. Journal entry testing (AS 2401 risk criteria) and firefighter-ID log review (ITGC)
  6. Loss quantification, the correcting entry, and SAB 108 / SAB 99
- **Dialogue confrontations** where the wrong approach can cost you.
- **The Audit Committee.** Rebut each claim by presenting the right exhibit before your credibility runs out.

## LEDGER's hints

Every failed attempt is counted per step. When you fail a workpaper step enough times (2, 3, then 5 attempts), LEDGER texts you a hint, and each hint is more direct than the last. The final hint is effectively the answer. Dialogue and hearing mistakes escalate faster (1, 2, then 3). Your final rating reflects your total missteps.

## Code layout

| File | Purpose |
|---|---|
| `js/maps.js` | Builds the floor and garage maps (floor and object layers) |
| `js/render.js` | Procedural pixel art for tiles, furniture, characters, and portraits |
| `js/engine.js` | Game loop, grid movement, NPC actors, camera, night lighting |
| `js/ui.js` | Dialogue, phone, case file, toasts, chapter cards, HUD |
| `js/puzzles.js` | Workpaper framework and all six analyses with their data |
| `js/hearing.js` | Audit committee confrontation |
| `js/story.js` | Cast, chapters, objectives, dialogue, evidence, hint escalation |
