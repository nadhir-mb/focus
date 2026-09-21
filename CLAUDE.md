# CLAUDE.md — Memory Focus Reset (Chrome Extension)

## What this is
A Chrome extension memory game that acts as a **focus reset** for ADHD. The
game is a decoy: it catches the distraction urge, satisfies it with a short
contained round, then ejects the user back to work. The game is NOT the point —
the *return to work* is.

## Core loop
**Catch → Satisfy → Eject.**
1. User feels the urge to drift (or opens a new tab).
2. Plays one quick round of card-matching.
3. Gets pushed back to what they were doing — before the game becomes the new addiction.

## Decisions (locked)
- **Surfaces:** Both — popup (click icon) AND new-tab override.
- **Feel:** Quick dopamine — fast, snappy, satisfying.
- **Game:** Classic card-matching (Concentration) — flip pairs to match.
- **Site blocking:** NO. It does not block distracting sites. It sits passively
  in the new-tab moment; entering the game is the user's choice.
- **Sound:** OFF for now. Design so it can be toggled on later, but ship muted.
- **Tracking:** YES — tracking is a first-class feature. The real success metric
  is **reset → returned to work**, not game score.

## Theme
Machine learning. Each card shows a category (Supervised, Unsupervised, Math), an
illustration of how the method works, its name and its formula (`src/cards.js`,
21 cards). Pairs match on identical cards. Each round draws 2 pairs per category.

## Visual rules
- Zinc neutrals; black is the primary action color. No green, no gradients.
- Color only on card faces, one per category. Card backs never hint at category.
- Minimal copy: no filler hints or taglines, no em dashes.

## Eject mechanism (most important)
- Before a round: capture **"What am I doing right now?"** via an activity picker
  (MECE: Take in = Search/Read, Make = Write/Build/Design, Think = Analyze/Plan,
  Connect = Message/Meet) plus an optional free-text detail.
- After a round: show a big **"Back to work"** button + throw the note back
  ("You were: <task>").
- **No prominent "Play Again."** Replay is minimized or gated.
- **Hard round cap** so the round ends slightly before full satisfaction — the
  residual itch pulls the user back to the task, not deeper into the game.

## Anti-patterns to design against
The failure mode is building a *better distraction*. Guard rails:
- Escalating friction on repeat plays (delay / "sure?" prompt on 2nd/3rd round).
- Stats celebrate **returning to work**, not high scores.
- No infinite mode, no leaderboard rabbit hole.

## Tracking — what to measure
- Reset started (game opened) vs. reset completed (returned to work).
- Return rate: % of sessions that ended with "Back to work."
- Repeat-play count per sitting (should trend low).
- Optional: the captured task notes, for the user's own review.
- Stats panel has a Week (7 days) / Month (30 days) toggle. Stats are hidden
  during a round and on the end screen.

## Tech baseline
- Manifest V3.
- Files: manifest.json, popup (html/css/js), newtab (html/css/js), storage for
  tracking + notes. Icons at 16/48/128.
- `storage` permission for tracking and the task note. No site-access
  permissions needed (no blocking).

## Open / later
- Sound toggle (built for it, shipped off).
- Round cap exact value (currently 60s from first flip, 6 pairs; `CONFIG` in `src/app.js`).
- Exact escalating-friction thresholds.