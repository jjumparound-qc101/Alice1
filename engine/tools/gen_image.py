"""Generate one asset with the OpenAI image API (owner, 2026-10-13: always gpt-image-2 or newer).

The style block from docs/ART_PROMPTS.md is put in front of the prompt, and reference pictures
(Tenniel plates, the Alice model sheet) are sent with it, as in the ChatGPT conversation.

Usage: python3 engine/tools/gen_image.py OUT.png "PROMPT" [--ref FILE ...] [--size 1024x1536] [--model gpt-image-2]
Needs the API key in OPENAI_API_KEY (or supplied by the environment's proxy) and curl.

Rate limits (owner, 2026-10-15: stay inside OpenAI's limits so no generation fails): calls are
spaced at least --min-interval seconds apart (default 4 s, at most 15 a minute, under the lowest
image limit we know of; a stamp file in the system temp folder covers separate runs and parallel
ones), and a rate-limit answer (429) is waited out and retried, up to 5 times.
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import time

try:
    import fcntl
except ImportError:  # Windows
    fcntl = None

STAMP = os.path.join(tempfile.gettempdir(), "lol_gen_image.stamp")


def style_block(path="docs/ART_PROMPTS.md"):
    if path == "none":
        return ""
    text = open(path, encoding="utf-8").read()
    block = re.search(r"## 0\. Style block.*?```(.*?)```", text, re.S).group(1).strip()
    return block.replace('Reply "ready" and wait for my first request.', "").strip()


def wait_turn(min_interval):
    """Hold until min_interval seconds have passed since the last call started (any process)."""
    with open(STAMP, "a+") as f:
        if fcntl:
            fcntl.flock(f, fcntl.LOCK_EX)
        f.seek(0)
        last = float(f.read().strip() or 0)
        time.sleep(max(0.0, last + min_interval - time.time()))
        f.seek(0)
        f.truncate()
        f.write(str(time.time()))


def rate_limited(text):
    return '"rate_limit' in text or "429" in text[:200] or "Too Many Requests" in text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("prompt")
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--size", default="1024x1536")
    ap.add_argument("--model", default="gpt-image-2.5-sunburst")  # owner, 2026-10-13; gpt-image-2 as fallback
    ap.add_argument("--quality", default="high")
    ap.add_argument("--min-interval", type=float, default=4.0, help="seconds between calls (rate limit)")
    ap.add_argument("--style", default="docs/ART_PROMPTS.md", help='the file with the "## 0. Style block", or "none" (the prompt says it all)')
    a = ap.parse_args()
    block = style_block(a.style)
    prompt = block + "\n\nRequest:\n" + a.prompt if block else a.prompt
    auth = ["-H", f"Authorization: Bearer {os.environ.get('OPENAI_API_KEY', '')}"]
    # Streamed, so the connection stays busy while a high-quality image is drawn (the
    # environment's proxy drops a request that is silent for about 30 s).
    if a.ref:
        cmd = ["curl", "-sS", "-N", "https://api.openai.com/v1/images/edits", *auth,
               "-F", f"model={a.model}", "--form-string", f"prompt={prompt}", "-F", f"size={a.size}",
               "-F", f"quality={a.quality}", "-F", "stream=true", "-F", "partial_images=1"]
        for r in a.ref:
            kind = {"jpg": "jpeg"}.get(r.rsplit(".", 1)[-1].lower(), r.rsplit(".", 1)[-1].lower())
            cmd += ["-F", f"image[]=@{r};type=image/{kind}"]  # curl doesn't know .webp
    else:
        body = json.dumps({"model": a.model, "prompt": prompt, "size": a.size, "quality": a.quality,
                           "stream": True, "partial_images": 1})
        cmd = ["curl", "-sS", "-N", "https://api.openai.com/v1/images/generations", *auth,
               "-H", "Content-Type: application/json", "-d", body]
    for attempt in range(6):
        wait_turn(a.min_interval)
        out = subprocess.run(cmd, capture_output=True, text=True)
        events = [json.loads(ln[5:]) for ln in out.stdout.splitlines() if ln.startswith("data:") and ln[5:].strip().startswith("{")]
        done = [e for e in events if e.get("type", "").endswith(".completed")]
        if done or not rate_limited(out.stdout) or attempt == 5:
            break
        pause = 20 * 2 ** attempt
        print(f"rate limited; waiting {pause} s and trying again", file=sys.stderr)
        time.sleep(pause)
    if not done:
        sys.exit(f"no image from the API: {out.stdout[-1500:]} {out.stderr[-500:]}")
    r = {"data": [{"b64_json": done[-1]["b64_json"]}], "usage": done[-1].get("usage", {})}
    open(a.out, "wb").write(base64.b64decode(r["data"][0]["b64_json"]))
    print(a.out, json.dumps(r.get("usage", {})))


if __name__ == "__main__":
    main()
