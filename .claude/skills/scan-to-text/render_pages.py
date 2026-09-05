#!/usr/bin/env python3
"""스캔 PDF(또는 이미지)를 쪽별 PNG로 만든다. 사용: render_pages.py <입력> <출력폴더> [--dpi 150] [--max 40]"""
import sys, os, subprocess, shutil, argparse

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--dpi", type=int, default=150)
ap.add_argument("--max", type=int, default=40)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
ext = os.path.splitext(a.src)[1].lower()

if ext in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff"):
    dst = os.path.join(a.out, "page-001" + ext)
    shutil.copyfile(a.src, dst)
    print(dst); sys.exit(0)

def with_fitz():
    import pymupdf as fitz
    doc = fitz.open(a.src)
    n = min(doc.page_count, a.max)
    for i in range(n):
        pix = doc[i].get_pixmap(dpi=a.dpi)
        p = os.path.join(a.out, "page-%03d.png" % (i + 1))
        pix.save(p); print(p)
    if doc.page_count > n:
        print("(%d쪽 중 %d쪽만 변환)" % (doc.page_count, n), file=sys.stderr)

try:
    import pymupdf  # noqa
except ImportError:
    if shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-r", str(a.dpi), "-png", "-l", str(a.max), a.src, os.path.join(a.out, "page")], check=True)
        for f in sorted(os.listdir(a.out)): print(os.path.join(a.out, f))
        sys.exit(0)
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "pymupdf"], check=True)
with_fitz()
