"""'먼저 보기' 표 칸 폭 계산 — 폰트 실측 기반.

핵심 원칙: 한 단어가 칸 안에서 중간에 잘리면 안 된다("tha/t", "Whil/e").
여러 단어로 된 구는 공백에서 두 줄로 나뉘어도 읽을 수 있으므로 강제 조건이 아니다.

보정 근거(실제 렌더 대조):
  "that"  텍스트 369tw, 칸 560  → 잘림      "While" 496tw, 칸 700  → 잘림
  "While" 496tw, 칸 1000 → 정상(정본 unit01)
접속사 칸은 런 테두리(선 두께 + space 3pt)가 좌우로 자리를 먹는다.
"""
import re, os
from PIL import ImageFont

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rg2', 'assets', 'fonts')
PX = 200
_bold = ImageFont.truetype(os.path.join(FONTS, 'NotoSansKR-700.ttf'), PX)
_reg = ImageFont.truetype(os.path.join(FONTS, 'NotoSansKR-400.ttf'), PX)

CELL_PAD = 90          # 셀 좌우 여백 + 여유
BORDER_PAD = 400       # 런 테두리(선 + space 3pt)가 먹는 폭, 실측 보정값

def unescape(s):
    s = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    return s.replace('\\"', '"').replace("\\\\", "\\")

def text_tw(text, is_bold, pt=9.0):
    f = _bold if is_bold else _reg
    return f.getlength(text) / PX * pt * 20

def pad(bordered):
    return BORDER_PAD + CELL_PAD if bordered else CELL_PAD

def hard_need(text, is_bold, bordered):
    """가장 긴 단어가 잘리지 않을 최소 폭."""
    longest = max(text.split(), key=lambda w: text_tw(w, is_bold), default='')
    return int(text_tw(longest, is_bold) + pad(bordered))

def soft_need(text, is_bold, bordered):
    """전체 텍스트가 한 줄에 들어갈 폭."""
    return int(text_tw(text, is_bold) + pad(bordered))

ROW = re.compile(r'(T\(\[)([\d,\s]+)(\], \[new TableRow\(\{ children: \[\s*\n)((?:[ \t]*exSeg\(.*\n)+)')
CALL = re.compile(r'exSeg\(\[t\("((?:[^"\\]|\\.)*)", \{([^}]*)\}[^\]]*\)\], "([^"]*)", (\w+), (\d+)')

def parse(src):
    m = ROW.search(src)
    if not m:
        return None
    widths = [int(x) for x in m.group(2).split(',')]
    cells = []
    for c in CALL.finditer(m.group(4)):
        raw, opts, label, _col, w = c.groups()
        cells.append({'text': unescape(raw), 'bold': 'bold: true' in opts,
                      'bordered': 'border:' in opts, 'w': int(w), 'label': label})
    return m, widths, cells
