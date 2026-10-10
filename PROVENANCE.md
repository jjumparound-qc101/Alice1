# Provenance

Every shipped asset is listed here with its source. AI-generated or AI-modified assets are flagged, because they must be disclosed on Steam.

## Source editions

| Source | What it is | Where it came from (URL or archive and shelfmark) | Rights basis | Notes |
|---|---|---|---|---|
| _TBD_ | Tenniel illustrations, scan source | | Public domain (1865) | Record the exact edition and the scanning institution. |
| Selected | LibriVox "Alice's Adventures in Wonderland (Dramatic Reading)", full cast, released 2011-02-21. Chapter I speakers: Narrator (David Goldfarb), Alice (Miss Avarice), White Rabbit (BellonaTimes). Alice's Sister (Diana Majlinger) is cast for the final chapter. | https://librivox.org/4511 · https://archive.org/details/aliceinwonderland_1102_librivox · Chapter I file: `aliceinwonderland_01_carroll.mp3` (VBR) | Public Domain Mark 1.0 | Cast confirmed from the LibriVox page. Chapter I downloaded 2026-10-10: mono, 44.1 kHz, 128 kbps, 12:20 (740 s), peak -2.2 dB, mean -22.9 dB. The only silence over 2 s is the last 4.5 s. Complete and unabridged: a transcript matches the Project Gutenberg #11 text with no missing passages. 0:00–0:14 is the spoken intro ("Chapter 1 of Alice's Adventures in Wonderland…"). The text starts at 0:14.7 and "End of chapter 1" is at 12:14. The catalog's 10:29 appears to be wrong; there's no extra material. |

## Asset log

`Origin` is one of:
- `scan`: Tenniel, unmodified apart from cleanup
- `scan+AI`: a scan with AI fill or extension
- `AI`: fully generated
- `artist`: new art from a human artist
- `original`: made in-house without AI

| Asset ID | File | Origin | Source plate or recording | AI tool and version | What AI did | Date | Reviewed by |
|---|---|---|---|---|---|---|---|
| rabbit_w01-1 | `public/art/rabbit_w01-1.png` | scan + spot color | Tenniel, *Wonderland* ch. I, "I'm late" (W-01-1). Web-resolution image from [Victorian Web](https://victorianweb.org/art/illustration/tenniel/alice/1.2.html), kept as `source/plates/tenniel_w01-1_white_rabbit_victorianweb.jpg` | none | Nothing. Cut out with `tools/cutout.py` and a hand-traced mask (`source/plates/tenniel_w01-1_white_rabbit.poly.json`). Eyes tinted pink per COLOR.md (`…white_rabbit.spot.json`). Slice only: replace with a high-resolution scan. | 2026-10-10 | Claude Code |
| narration_ch01_slice | `public/audio/ch01_slice.mp3` | original | LibriVox dramatic reading, Chapter I, 0:14.0–1:51.4 | none | Nothing. Trimmed and re-encoded (mono, 96 kbps) with a 0.8 s fade-out | 2026-10-10 | Claude Code |
| ch01_slice_words | `public/data/ch01_slice_words.json` | original | Project Gutenberg #11 text, aligned to the narration | faster-whisper `small.en` (speech-to-text timings only) | AI supplied word timings, which were matched to the book text. 99.3% of words matched directly; the rest were interpolated. No AI-generated text. | 2026-10-10 | Claude Code |
| placeholder art | `src/art.js` | original | — | none | Nothing. Procedural placeholder set and figures, drawn in code. To be replaced by the master drawings. | 2026-10-10 | Claude Code |
| font_im_fell | `public/fonts/`, `godot/fonts/` | original | IM FELL English Roman and Italic by Igino Marini, from the google/fonts repository | none | Nothing. Bundled unchanged under the SIL Open Font License (`OFL.txt` alongside). | 2026-10-10 | Claude Code |
| godot_placeholders | `godot/art/*.png` (except the Rabbit) | original | PNG exports of `src/art.js` (`tools/bake_placeholders.mjs`) | none | Nothing. Same placeholder art as the web build. | 2026-10-10 | Claude Code |
