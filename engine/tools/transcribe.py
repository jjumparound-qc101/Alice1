"""Speech-to-text with word times (faster-whisper): the rough timings tools/align.py starts from.

Usage: python3 engine/tools/transcribe.py LIBRIVOX.mp3 source/audio/chNN_whisper_words.json
  WHISPER_MODEL (default small.en; base.en is about three times faster), WHISPER_THREADS (default 0 = all).
"""
import os, sys, json, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(os.environ.get("WHISPER_MODEL", "small.en"), device="cpu", compute_type="int8",
                 cpu_threads=int(os.environ.get("WHISPER_THREADS", "0")))
pcm = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-f","s16le","-ac","1","-ar","16000","-"],capture_output=True,check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32)/32768
segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=False)
out=[]
for s in segs:
    out.append({"start":round(s.start,2),"end":round(s.end,2),"text":s.text.strip(),
                "words":[{"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)} for w in s.words]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text.strip()}", flush=True)
json.dump(out, open(sys.argv[2],"w"), indent=1)
