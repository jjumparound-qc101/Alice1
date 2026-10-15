# LoLBookEngine

The shared engine of the Library of Living Books: a public-domain book's text in sync with its full-cast LibriVox reading, staged as a 2.5D Victorian toy theater (three.js + Vite), with an Electron wrapper for Steam.

Each book lives in its own repository and carries a pinned copy of this one in its `engine/` folder. See [docs/ENGINE.md](docs/ENGINE.md) for how a book uses the engine, [docs/NEW_BOOK.md](docs/NEW_BOOK.md) to start a new book, and [docs/CHANGES.md](docs/CHANGES.md) for what changed.

| Path | What |
|---|---|
| `src/` | The engine: `main.js` (`startBook`), the book page and timeline (`narration.js`, `navigate.js`), Explore (`explore.js`), puppets (`puppet.js`), cue words (`cues.js`), camera tracks (`track.js`), thought vignettes (`thoughts.js`), paper flats (`stage.js`), engraving helpers (`ink.js`), the placeholder title page (`scenes/placeholder.js`), the page style (`style.css`) |
| `fonts/` | IM Fell English (SIL Open Font License, `fonts/OFL.txt`) |
| `electron/` | Desktop wrapper (Steam via steamworks.js) |
| `tools/` | Narration, art and check tools, run from a book's folder |
| `template/` | The starting files for a new book |
