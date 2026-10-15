# {{Book Title}} project: notes for Claude (read every session)

- **Start by reading `docs/HANDOFF.md`** and follow it.
- **Branch**: all work goes on `main`. If the session was set up on another branch, check out `main` (`git fetch origin main && git checkout main`), commit there and push there.
- **The engine** is shared by every Library of Living Books title: `engine/` is a pinned copy of `jjumparound-qc101/LoLBookEngine` (read `engine/docs/ENGINE.md`). Don't change files in `engine/` without sending the change to LoLBookEngine (ENGINE.md, "Changing the engine while working on a book"); everything book-specific stays outside `engine/`.
- **The owner** is not a programmer: brief, kind, factual replies in plain ASCII text, honest pushback, and every decision put to them with a recommendation.

## When the owner asks for a handoff
1. Update `docs/HANDOFF.md` (date, where things stand, next steps, anything learned), commit and push. Make sure nothing is left unpushed (in this repo and, if the engine changed, in LoLBookEngine).
2. Republish the web link if anything changed since the last publish.
3. End the reply with a **copy-and-paste prompt for the next session**, in a code block, filled in with the current details. Use this template:

```
Continue the {{Book Title}} project. Work on branch main in jjumparound-qc101/{{Repo}}.
First read docs/HANDOFF.md and follow it.

Where we are: <two or three lines: what is done, what is in progress>.

Your job this session:
1. <the next steps from the handoff, in order>
2. When I send images, save each to source/ai/ under its prompt's file name, process
   it, put it in the game, check a screenshot, log it in PROVENANCE.md (see "When art
   arrives" in the handoff).
3. When I send patch notes, work through them.

Keep me updated briefly, ask me before any decision that's mine to make (with a
recommendation), and update the web link after each batch:
<the web link from the handoff>
```

4. Remind the owner how to start the next session: in a new Claude Code session on the `{{Repo}}` repository, paste the prompt; the branch name is in the prompt.
