#!/usr/bin/env python3
"""
SIAKAD demo image generator using Pollinations.ai.

- Uses the free public endpoint (no auth).
- Pollinations limits to 1 concurrent request per IP, so we go strictly sequential
  with retry + backoff and validate the response is an actual JPEG.
- Width/height tuned for hero (1280x720), gallery (1280x720), news (1024x576).
"""
from __future__ import annotations

import os
import random
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO_DIR = os.path.join(ROOT, "public", "img", "hero")
GAL_DIR = os.path.join(ROOT, "public", "img", "gallery")
NEWS_DIR = os.path.join(ROOT, "public", "img", "news")
for d in (HERO_DIR, GAL_DIR, NEWS_DIR):
    os.makedirs(d, exist_ok=True)

BASE = "https://image.pollinations.ai/prompt/"


def is_jpeg(data: bytes) -> bool:
    return len(data) > 4096 and data[:3] == b"\xff\xd8\xff"


def fetch(prompt: str, out: str, *, w: int = 1280, h: int = 720, attempts: int = 5) -> bool:
    if os.path.exists(out) and os.path.getsize(out) > 4096:
        with open(out, "rb") as f:
            if is_jpeg(f.read(8)):
                print(f"[skip] {os.path.basename(out)}")
                return True
    enc = urllib.parse.quote(prompt, safe="")
    for attempt in range(1, attempts + 1):
        seed = random.randint(1, 2**31 - 1)
        url = (
            f"{BASE}{enc}?width={w}&height={h}"
            f"&nologo=true&enhance=true&model=flux&seed={seed}"
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "siakad-readme-bot/1.0"},
            )
            with urllib.request.urlopen(req, timeout=180) as r:
                body = r.read()
            if is_jpeg(body):
                with open(out, "wb") as f:
                    f.write(body)
                print(
                    f"[ok ] {os.path.basename(out)}  ({len(body)//1024} KiB, attempt {attempt})"
                )
                # Pollinations is happier when we space requests.
                time.sleep(2)
                return True
            else:
                head = body[:160].decode("utf-8", errors="replace")
                print(
                    f"[wait] {os.path.basename(out)} not jpeg yet: {head!r}"
                )
        except Exception as exc:  # noqa: BLE001
            print(f"[err ] {os.path.basename(out)} attempt {attempt}: {exc}")
        time.sleep(min(2 ** attempt, 30))
    print(f"[FAIL] {os.path.basename(out)}")
    return False


HERO = [
    (
        "hero-1.jpg",
        "Modern Indonesian senior high school building exterior, sunny morning, "
        "students walking in red and white uniform, palm trees, tropical landscape, "
        "cinematic, photorealistic, wide angle",
    ),
    (
        "hero-2.jpg",
        "Clean classroom interior in Indonesian school with smart whiteboard, "
        "students learning, daylight from window, vibrant, photorealistic",
    ),
    (
        "hero-3.jpg",
        "Modern Indonesian school library with bookshelves and students reading, "
        "warm lighting, photorealistic, wide angle",
    ),
    (
        "login-bg.jpg",
        "Indonesian school courtyard with national flag, students lining up for "
        "ceremony, blue sky, photorealistic, soft bokeh",
    ),
]

GALLERY = [
    "Indonesian high school students in red and white uniform during morning flag ceremony, photorealistic",
    "Indonesian students working in computer lab, modern PCs, focused, photorealistic",
    "Indonesian students in chemistry lab wearing safety goggles, conducting experiment, photorealistic",
    "Indonesian students playing soccer on school field, daytime, photorealistic",
    "Indonesian students playing basketball indoor school gym, action shot, photorealistic",
    "Indonesian school marching band performing, traditional uniforms, parade, photorealistic",
    "Indonesian students dancing traditional Saman dance on stage, colorful costumes, photorealistic",
    "Indonesian students performing angklung music ensemble, photorealistic",
    "Indonesian school art exhibition, students paintings displayed, photorealistic",
    "Indonesian school cooking class, students wearing apron preparing food, photorealistic",
    "Indonesian school robotics club, students assembling robot, photorealistic",
    "Indonesian school choir on stage performing, photorealistic",
    "Indonesian school graduation ceremony, students wearing toga, photorealistic",
    "Indonesian school science fair, student presenting project poster, photorealistic",
    "Indonesian Pramuka scout students hiking outdoor, photorealistic",
    "Indonesian students reading in library, photorealistic",
    "Indonesian school open house event, parents and students, photorealistic",
    "Indonesian school sports day, athletics track, students running, photorealistic",
    "Indonesian school computer based test CBT room, rows of computers, photorealistic",
    "Indonesian school field trip to museum, photorealistic",
    "Indonesian school environmental program, students planting trees, photorealistic",
    "Indonesian school debate competition, students at podium, photorealistic",
    "Indonesian school batik day, students wearing traditional batik clothes, photorealistic",
    "Indonesian school welcoming new students, MPLS orientation, photorealistic",
]

NEWS = [
    "Indonesian school principal giving speech at podium, photorealistic",
    "Indonesian student receiving award medal trophy, photorealistic",
    "Indonesian school teachers meeting in conference room, photorealistic",
    "Indonesian school football team holding trophy after winning, photorealistic",
    "Indonesian school book donation event, photorealistic",
    "Indonesian school OSIS student council election, photorealistic",
    "Indonesian school visit by minister of education, photorealistic",
    "Indonesian school health screening day, photorealistic",
    "Indonesian school iftar Ramadan event, students sharing meal, photorealistic",
    "Indonesian school independence day August 17 ceremony, photorealistic",
    "Indonesian school career day with industry guests, photorealistic",
    "Indonesian school parent teacher conference, photorealistic",
]


def main() -> int:
    fail = 0
    for name, prompt in HERO:
        if not fetch(prompt, os.path.join(HERO_DIR, name)):
            fail += 1
    for i, prompt in enumerate(GALLERY, start=1):
        if not fetch(prompt, os.path.join(GAL_DIR, f"gallery-{i:02d}.jpg")):
            fail += 1
    for i, prompt in enumerate(NEWS, start=1):
        if not fetch(prompt, os.path.join(NEWS_DIR, f"news-{i:02d}.jpg"), w=1024, h=576):
            fail += 1
    print(f"\nFinished. failures={fail}")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
