# LoLBookEngine: notes for Claude (read every session)

- This is the **shared engine** of the Library of Living Books (one game per public-domain book). Read `docs/ENGINE.md` first.
- **Books**: `jjumparound-qc101/Alice1` (Alice in Wonderland; still on its own copy of the engine, moving here later with the owner's approval) and `jjumparound-qc101/Carol1` (A Christmas Carol, uses this engine in its `engine/` folder). Each book repo has its own CLAUDE.md and docs/HANDOFF.md.
- **Branch**: `main`. Commit and push there.
- **Every engine change** must keep every book that uses it working: test it in at least one book (its smoke test and a look at screenshots) before pushing, record it in `docs/CHANGES.md` (newest first, with the books checked), and tell the owner which books should take the update.
- Nothing book-specific belongs here (no character names, art lists, chapter titles). A book supplies those through `startBook(book)` and `book.json`.
- **The owner** is not a programmer: brief, kind, factual replies in plain ASCII text, honest pushback, and every decision put to them with a recommendation.
