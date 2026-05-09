#!/usr/bin/env bash
# Pollinations AI image generator for SIAKAD demo content.
# Generates 1280x720 images for hero, gallery, and news thumbnails.
# Usage: bash scripts/generate-images.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_HERO="$ROOT/public/img/hero"
OUT_GAL="$ROOT/public/img/gallery"
OUT_NEWS="$ROOT/public/img/news"
mkdir -p "$OUT_HERO" "$OUT_GAL" "$OUT_NEWS"

BASE='https://image.pollinations.ai/prompt'
PARAMS='width=1280&height=720&nologo=true&enhance=true&model=flux'
PARAMS_SQ='width=1024&height=1024&nologo=true&enhance=true&model=flux'

fetch() {
  local prompt="$1"
  local out="$2"
  local params="${3:-$PARAMS}"
  if [ -s "$out" ]; then
    echo "[skip] $out exists"
    return
  fi
  local enc
  enc=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$prompt")
  echo "[fetch] $out"
  curl -sSL --max-time 90 "$BASE/$enc?$params&seed=$RANDOM" -o "$out" || {
    echo "[retry] $out"
    sleep 2
    curl -sSL --max-time 120 "$BASE/$enc?$params&seed=$RANDOM" -o "$out"
  }
}

# --- Hero backgrounds (used on homepage / login) ---
fetch "Modern Indonesian senior high school building exterior, sunny morning, students walking in red and white uniform, palm trees, tropical landscape, cinematic, photorealistic, wide angle" "$OUT_HERO/hero-1.jpg"
fetch "Clean classroom interior in Indonesian school with smart whiteboard, students learning, daylight from window, vibrant, photorealistic" "$OUT_HERO/hero-2.jpg"
fetch "Modern Indonesian school library with bookshelves and students reading, warm lighting, photorealistic, wide angle" "$OUT_HERO/hero-3.jpg"
fetch "Indonesian school courtyard with national flag, students lining up for ceremony, blue sky, photorealistic" "$OUT_HERO/login-bg.jpg"

# --- Gallery (school activities) ---
i=1
for prompt in \
  "Indonesian high school students in red and white uniform during morning flag ceremony, photorealistic" \
  "Indonesian students working in computer lab, modern PCs, focused, photorealistic" \
  "Indonesian students in chemistry lab wearing safety goggles, conducting experiment, photorealistic" \
  "Indonesian students playing soccer on school field, daytime, photorealistic" \
  "Indonesian students playing basketball indoor school gym, action shot, photorealistic" \
  "Indonesian school marching band performing, traditional uniforms, parade, photorealistic" \
  "Indonesian students dancing traditional Saman dance on stage, colorful costumes, photorealistic" \
  "Indonesian students performing angklung music ensemble, photorealistic" \
  "Indonesian school art exhibition, students paintings displayed, photorealistic" \
  "Indonesian school cooking class, students wearing apron preparing food, photorealistic" \
  "Indonesian school robotics club, students assembling robot, photorealistic" \
  "Indonesian school choir on stage performing, photorealistic" \
  "Indonesian school graduation ceremony, students wearing toga, photorealistic" \
  "Indonesian school science fair, student presenting project poster, photorealistic" \
  "Indonesian Pramuka scout students hiking outdoor, photorealistic" \
  "Indonesian students reading in library, photorealistic" \
  "Indonesian school open house event, parents and students, photorealistic" \
  "Indonesian school sports day, athletics track, students running, photorealistic" \
  "Indonesian school computer based test CBT room, rows of computers, photorealistic" \
  "Indonesian school field trip to museum, photorealistic" \
  "Indonesian school environmental program, students planting trees, photorealistic" \
  "Indonesian school debate competition, students at podium, photorealistic" \
  "Indonesian school batik day, students wearing traditional batik clothes, photorealistic" \
  "Indonesian school welcoming new students, MPLS orientation, photorealistic"
do
  fetch "$prompt" "$OUT_GAL/gallery-$(printf '%02d' "$i").jpg" "$PARAMS"
  i=$((i+1))
done

# --- News thumbnails ---
j=1
for prompt in \
  "Indonesian school principal giving speech at podium, photorealistic" \
  "Indonesian student receiving award medal trophy, photorealistic" \
  "Indonesian school teachers meeting in conference room, photorealistic" \
  "Indonesian school football team holding trophy after winning, photorealistic" \
  "Indonesian school book donation event, photorealistic" \
  "Indonesian school OSIS student council election, photorealistic" \
  "Indonesian school visit by minister of education, photorealistic" \
  "Indonesian school health screening day, photorealistic" \
  "Indonesian school iftar Ramadan event, students sharing meal, photorealistic" \
  "Indonesian school independence day August 17 ceremony, photorealistic" \
  "Indonesian school career day with industry guests, photorealistic" \
  "Indonesian school parent teacher conference, photorealistic"
do
  fetch "$prompt" "$OUT_NEWS/news-$(printf '%02d' "$j").jpg" "$PARAMS"
  j=$((j+1))
done

echo "Done."
ls -la "$OUT_HERO" "$OUT_GAL" "$OUT_NEWS" | head -100
