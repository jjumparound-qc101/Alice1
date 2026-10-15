#!/usr/bin/env bash
# Build the game for the playable web link (a claude.ai artifact).
#   engine/tools/web_build.sh OUTDIR   (from the book's folder)
# Writes OUTDIR/dist (the site) and OUTDIR/page.html (dist/index.html without the
# doctype/html/head/body/meta tags, which the artifact adds itself). The narration is
# re-encoded at 40 kbps mono, because one file in an artifact may be at most 15 MB
# (the Carol's Stave III at the game's 96 kbps is 36 MB). The desktop build keeps 96 kbps.
set -euo pipefail
out="${1:?usage: engine/tools/web_build.sh OUTDIR}"
mkdir -p "$out"
npx vite build --base ./ --outDir "$out/dist" --emptyOutDir
for f in "$out"/dist/audio/ch*.mp3; do
  ffmpeg -v error -y -i "$f" -ac 1 -b:a 40k "$f.tmp.mp3"
  mv "$f.tmp.mp3" "$f"
done
python3 - "$out" <<'EOF'
import re, sys
out = sys.argv[1]
html = open(f"{out}/dist/index.html", encoding="utf-8").read()
for pat in [r"<!doctype[^>]*>", r"</?html[^>]*>", r"</?head>", r"</?body[^>]*>", r"<meta[^>]*>"]:
    html = re.sub(pat, "", html, flags=re.I)
open(f"{out}/page.html", "w", encoding="utf-8").write(html.strip() + "\n")
EOF
ls -la "$out"/dist/audio "$out"/dist/assets
