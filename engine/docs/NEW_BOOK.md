# Starting a new book

How *A Christmas Carol* was started (2026-10-15), as steps for the next book.

## 1. Choose the book
- A **LibriVox dramatic (full-cast) reading**: search the LibriVox API, e.g. `https://librivox.org/api/feed/audiobooks/?title=^Treasure%20Island&format=json`, and keep titles with "Dramatic Reading". Check the cast list and listen to a chapter: quality varies by reader. The files are on archive.org (`url_zip_file` names the item).
- **The original illustrations**, public domain worldwide (the illustrator dead more than 70 years, published before 1931 for the US): Project Gutenberg's illustrated HTML editions (`https://www.gutenberg.org/cache/epub/N/pgN-images.html`) or scans on archive.org (`https://archive.org/download/<item>/page/n<page>.jpg`, with `curl -L`; `_w300` for thumbnails to find the plates).
- **The text**: Project Gutenberg, the edition LibriVox names as its source (`url_text_source`).

## 2. Make the repository
1. The owner creates an empty private repository on github.com (Claude can't create repositories) and gives the Claude GitHub App access to it if needed.
2. Attach it to the session (`add_repo`), clone it.
3. Copy `template/` from this repository into it (including `.github/` and `.gitignore`), fill in every `{{…}}`, and add the engine:
   ```sh
   git add -A && git commit -m "Start <book> from the LoLBookEngine template"
   git subtree add --prefix engine https://github.com/jjumparound-qc101/LoLBookEngine main --squash
   ```
4. `npm install` (through the proxy in the cloud container: `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install --ignore-scripts --proxy "$HTTPS_PROXY" --https-proxy "$HTTPS_PROXY" --noproxy localhost`), commit `package-lock.json`.

## 3. Sources and narration
1. The Gutenberg text to `source/text/pgN_full.txt`; fill in `book.json` (chapter headings, `heading_paragraphs`, `typeset` if the text has straight quotes and `--`).
2. The LibriVox files to `source/audio/` (not committed). For each chapter N:
   ```sh
   WHISPER_MODEL=base.en python3 engine/tools/transcribe.py source/audio/<file N>.mp3 source/audio/chNN_whisper_words.json
   python3 engine/tools/narration.py N source/audio/<file N>.mp3
   W2V_DIR=<wav2vec2 model folder> W2V_CACHE=<scratch> python3 engine/tools/forced_align.py N
   ```
   The wav2vec2 model: `model.onnx` (from `onnx/`) and `vocab.json` from huggingface.co/Xenova/wav2vec2-base-960h. Check the first and last words of each chapter's words file, and a few words marked `"x": 1` (shown faint) against the audio.
3. Add the chapters to `NARRATED` in `src/chapters.js`; run `npm run dev` and `node engine/tools/smoke.mjs`.
4. The plates to `source/plates/`, cropped copies to `public/art/…` for the title pages (`PLATES` in `chapters.js`, loaded in `book.js`).
5. `PROVENANCE.md`: every source (edition, URL, rights basis) and every shipped asset, with any AI involvement (Steam requires the disclosure).

## 4. The web link
`engine/tools/web_build.sh <scratch>/web`, then publish `<scratch>/web/page.html` as an artifact with `root` = `<scratch>/web/dist` and the files in `files`. Record the link at the end of the book's `docs/HANDOFF.md` and in its CLAUDE.md prompt.

## Making each chapter (the Alice process)
1. Read the chapter and its plates; write `docs/CHAPTER_NN_ASSETS.md` (places, plates, colours, poses, characters, sets, props, thought vignettes).
2. Write the prompts in `docs/ART_PROMPTS.md` (its first section, "## 0. Style block", goes in front of every prompt in `engine/tools/gen_image.py`).
3. Put any colour or staging decision to the owner with a recommendation, and wait. Show the first picture of every new character and place before it goes in.
4. Process the art (`engine/tools/whitecut.py`, the book's own tools), stage the scenes (`src/scenes/`), add puppets to `book.js`'s cast, register in `chapters.js` (`STAGED`). Staging is keyed to cue words (`@engine/cues.js`).
5. Check: `node engine/tools/chapter_shots.mjs http://localhost:5173/ <dir> N [t1,…]`, look at the screenshots, fix, repeat; run the smoke test.
6. Commit, push, republish the web link, tell the owner.

The Alice project's `docs/HANDOFF.md` (in `jjumparound-qc101/Alice1`) has the fullest record of what worked: camera direction ("simple and smooth"), keeping the lead in the picture, thought vignettes, phones, memory, and the art pipeline.
