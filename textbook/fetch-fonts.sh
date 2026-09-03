#!/usr/bin/env bash
# Downloads open-licensed (OFL) fonts from Google Fonts for the textbook build.
set -euo pipefail
DIR="${1:-$(cd "$(dirname "$0")" && pwd)/fonts}"
mkdir -p "$DIR"
UA="Mozilla/5.0"
fetch_family () {
  local fam="$1"; local spec="$2"; local slug="$3"
  local css; css=$(curl -sS -L -A "$UA" "https://fonts.googleapis.com/css2?family=${fam}:${spec}&display=swap")
  # Parse each @font-face block: style, weight, url
  echo "$css" | awk -v slug="$slug" -v dir="$DIR" '
    /font-style/ {gsub(/[;]/,""); style=$2}
    /font-weight/ {gsub(/[;]/,""); weight=$2}
    /src:/ { match($0, /https:[^)]*/); url=substr($0,RSTART,RLENGTH); ext=url; sub(/.*\./,"",ext);
             printf "%s %s-%s-%s.%s\n", url, slug, weight, style, ext }'
}
while read -r url name; do
  [ -f "$DIR/$name" ] || { echo "GET $name"; curl -sS -L -A "$UA" -o "$DIR/$name" "$url"; }
done < <(
  fetch_family "Noto+Sans+KR" "wght@400;500;700;900" "NotoSansKR"
  fetch_family "Nunito" "ital,wght@0,600;0,700;0,800;0,900;1,700" "Nunito"
  fetch_family "Lora" "ital,wght@0,400;0,600;0,700;1,400" "Lora"
  fetch_family "Source+Sans+3" "ital,wght@0,400;0,600;0,700;1,400" "SourceSans3"
)
ls -la "$DIR"
