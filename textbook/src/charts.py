"""Data charts for the textbook, rendered as plain SVG.

Every figure is drawn from a small data table below so that it can be
corrected or updated in one place. Values are rounded public statistics;
sources are listed in the book's credits page.
"""

FONT = 'font-family="Nunito, \'Noto Sans KR\', sans-serif"'
INK = "#1f2a37"
INK2 = "#3f4a5a"
MUTED = "#6b7280"
GRID = "#e5e7eb"


def _svg(w: int, h: int, body: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'role="img" style="width:100%;height:auto;display:block">{body}</svg>'
    )


def _bars(labels, values, color, deep, ymax, *, w=520, h=250, unit="", ref=None,
          ref_label="", fmt=lambda v: f"{v:g}", highlight_last=True, ticks=5,
          left=46, right=16, top=28, bottom=40, label_size=12):
    cw, ch = w - left - right, h - top - bottom
    n = len(values)
    slot = cw / n
    bw = slot * 0.58
    out = []
    for i in range(ticks + 1):
        y = top + ch - ch * i / ticks
        val = ymax * i / ticks
        out.append(f'<line x1="{left}" x2="{w-right}" y1="{y:.1f}" y2="{y:.1f}" stroke="{GRID}" stroke-width="1"/>')
        out.append(f'<text x="{left-7}" y="{y+4:.1f}" text-anchor="end" font-size="11" fill="{MUTED}" {FONT}>{val:g}</text>')
    for i, (lab, v) in enumerate(zip(labels, values)):
        x = left + slot * i + (slot - bw) / 2
        bh = ch * v / ymax
        y = top + ch - bh
        fill = deep if (highlight_last and i == n - 1) else color
        out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="4" fill="{fill}"/>')
        out.append(f'<text x="{x+bw/2:.1f}" y="{y-6:.1f}" text-anchor="middle" font-size="12" font-weight="800" fill="{INK}" {FONT}>{fmt(v)}</text>')
        out.append(f'<text x="{x+bw/2:.1f}" y="{top+ch+18}" text-anchor="middle" font-size="{label_size}" fill="{INK2}" {FONT}>{lab}</text>')
    if ref is not None:
        y = top + ch - ch * ref / ymax
        out.append(f'<line x1="{left}" x2="{w-right}" y1="{y:.1f}" y2="{y:.1f}" stroke="{INK}" stroke-dasharray="5 4" stroke-width="1.3"/>')
        out.append(f'<text x="{w-right}" y="{y-5:.1f}" text-anchor="end" font-size="10.5" font-weight="700" fill="{INK}" {FONT}>{ref_label}</text>')
    out.append(f'<line x1="{left}" x2="{w-right}" y1="{top+ch}" y2="{top+ch}" stroke="#9aa3ad" stroke-width="1.2"/>')
    if unit:
        out.append(f'<text x="{left-7}" y="{top-11}" text-anchor="end" font-size="10.5" fill="{MUTED}" {FONT}>{unit}</text>')
    return "".join(out)


# ----------------------------------------------------------------------
# Lesson 1 — Korea's total fertility rate (children per woman)
# Source: Statistics Korea, Vital Statistics (rounded)
# ----------------------------------------------------------------------
TFR = [("1970", 4.53), ("1980", 2.82), ("1990", 1.57), ("2000", 1.48),
       ("2010", 1.23), ("2020", 0.84), ("2023", 0.72)]


def tfr():
    labels = [y for y, _ in TFR]
    values = [v for _, v in TFR]
    body = _bars(labels, values, "#f3a55b", "#b85f13", 5, unit="children per woman",
                 ref=2.1, ref_label="2.1 = population stays stable", fmt=lambda v: f"{v:.2f}")
    return _svg(520, 250, body)


# ----------------------------------------------------------------------
# Project — elementary school students in Korea (millions)
# Source: Korean Educational Statistics Service (rounded)
# ----------------------------------------------------------------------
STUDENTS = [("1980", 5.66), ("1990", 4.87), ("2000", 4.02), ("2010", 3.30),
            ("2020", 2.69), ("2023", 2.60)]


def students():
    labels = [y for y, _ in STUDENTS]
    values = [v for _, v in STUDENTS]
    body = _bars(labels, values, "#7c78b8", "#2e2a5a", 6, unit="million students",
                 fmt=lambda v: f"{v:.1f}M", ticks=6)
    return _svg(520, 240, body)


# ----------------------------------------------------------------------
# Lesson 2 — share of world cobalt mine production, 2023 (approx.)
# Source: U.S. Geological Survey, Mineral Commodity Summaries 2024
# ----------------------------------------------------------------------
COBALT = [("DR Congo", 74), ("Others", 13), ("Indonesia", 7), ("Russia", 4), ("Australia", 2)]


def cobalt():
    w, h = 420, 190
    left, top, rowh = 92, 14, 32
    out = []
    for i, (lab, v) in enumerate(COBALT):
        y = top + i * rowh
        bw = (w - left - 60) * v / 100
        fill = "#1b9c85" if i == 0 else "#9dd6c8"
        out.append(f'<text x="{left-8}" y="{y+16}" text-anchor="end" font-size="12" font-weight="700" fill="{INK2}" {FONT}>{lab}</text>')
        out.append(f'<rect x="{left}" y="{y+3}" width="{bw:.1f}" height="20" rx="4" fill="{fill}"/>')
        out.append(f'<text x="{left+bw+7:.1f}" y="{y+17}" font-size="12" font-weight="800" fill="{INK}" {FONT}>{v}%</text>')
    return _svg(w, h, "".join(out))


# ----------------------------------------------------------------------
# Case study — fast fashion, two indexes (2000 = 100)
# Sources: McKinsey & Company (2016); Ellen MacArthur Foundation (2017)
# ----------------------------------------------------------------------

def fashion():
    w, h = 520, 230
    a = _bars(["2000", "2014"], [100, 200], "#e59ac6", "#8d2a66", 220, w=250, h=h,
              left=40, right=10, top=40, bottom=40, ticks=4, fmt=lambda v: f"{v:g}", highlight_last=True)
    b = _bars(["2000", "2015"], [100, 64], "#e59ac6", "#8d2a66", 120, w=250, h=h,
              left=40, right=10, top=40, bottom=40, ticks=4, fmt=lambda v: f"{v:g}", highlight_last=True)
    body = (
        f'<text x="125" y="18" text-anchor="middle" font-size="12.5" font-weight="800" fill="{INK}" {FONT}>Clothing produced (index)</text>'
        f'<g>{a}</g>'
        f'<g transform="translate(270 0)">'
        f'<text x="125" y="18" text-anchor="middle" font-size="12.5" font-weight="800" fill="{INK}" {FONT}>Times each item is worn (index)</text>'
        f'{b}</g>'
    )
    return _svg(w, h, body)
