#!/usr/bin/env python3
"""Build script for "See the World — Integrated Social Studies in English".

Steps
  1. Inline the stylesheet and every original SVG illustration into one HTML file.
  2. Generate the data charts (pure SVG, from the data tables in charts.py).
  3. Print the HTML to a PDF with headless Chromium.
  4. (optional) Render PNG previews of every page for proofreading.

Usage
  python3 build.py            # build output/see-the-world-unit1.pdf
  python3 build.py --preview  # also write output/preview/page-NN.png
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
SVG_DIR = SRC / "svg"
OUT = ROOT / "output"
FONTS = ROOT / "fonts"

sys.path.insert(0, str(SRC))
import charts  # noqa: E402  (src/charts.py)

CHROME_CANDIDATES = [
    os.environ.get("CHROME_BIN", ""),
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    shutil.which("chromium") or "",
    shutil.which("chromium-browser") or "",
    shutil.which("google-chrome") or "",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def find_chrome() -> str:
    for c in CHROME_CANDIDATES:
        if c and Path(c).exists():
            return c
    # Playwright installs under PLAYWRIGHT_BROWSERS_PATH
    base = Path(os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers"))
    for p in sorted(base.glob("chromium-*/chrome-linux/chrome")):
        return str(p)
    raise SystemExit("Chromium not found. Set CHROME_BIN=/path/to/chrome")


def load_svg(name: str) -> str:
    path = SVG_DIR / f"{name}.svg"
    if not path.exists():
        raise SystemExit(f"Missing illustration: {path}")
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"<\?xml[^>]*\?>\s*", "", text)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    return text.strip()


def build_html() -> Path:
    OUT.mkdir(parents=True, exist_ok=True)
    html = (SRC / "book.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")

    def sub_svg(m: re.Match) -> str:
        return load_svg(m.group(1))

    def sub_chart(m: re.Match) -> str:
        fn = getattr(charts, m.group(1), None)
        if fn is None:
            raise SystemExit(f"Unknown chart: {m.group(1)}")
        return fn()

    html = re.sub(r"\{\{svg:([a-z0-9_-]+)\}\}", sub_svg, html)
    html = re.sub(r"\{\{chart:([a-z0-9_]+)\}\}", sub_chart, html)
    html = html.replace("{{styles}}", css)

    missing = [f for f in re.findall(r"url\(\"\.\./fonts/([^\"]+)\"\)", css) if not (FONTS / f).exists()]
    if missing:
        print("warning: fonts missing (run fetch-fonts.sh):", ", ".join(missing[:4]), "...")

    out = OUT / "book.html"
    out.write_text(html, encoding="utf-8")
    return out


def print_pdf(html_path: Path, pdf_path: Path) -> None:
    chrome = find_chrome()
    cmd = [
        chrome,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=8000",
        f"--print-to-pdf={pdf_path}",
        html_path.resolve().as_uri(),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if not pdf_path.exists():
        print(res.stdout, res.stderr)
        raise SystemExit("PDF was not produced")


def preview(pdf_path: Path, dpi: int = 70) -> None:
    try:
        import pymupdf  # type: ignore
    except ImportError:
        print("pip install pymupdf  # needed for --preview")
        return
    pv = OUT / "preview"
    pv.mkdir(exist_ok=True)
    for old in pv.glob("page-*.png"):
        old.unlink()
    doc = pymupdf.open(pdf_path)
    for i, page in enumerate(doc, start=1):
        page.get_pixmap(dpi=dpi).save(pv / f"page-{i:02d}.png")
    print(f"{len(doc)} pages -> {pv}")


def main() -> None:
    html_path = build_html()
    pdf_path = OUT / "see-the-world-unit1.pdf"
    print_pdf(html_path, pdf_path)
    print(f"PDF: {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")
    if "--preview" in sys.argv:
        preview(pdf_path)


if __name__ == "__main__":
    main()
