# -*- coding: utf-8 -*-
"""기존 art/uNN.js 에서 icons·STRIP 은 그대로 두고 scenes·VIG 만 갈아 끼운다."""
import io, re, sys

def swap(unit, scenes, vig):
    p = "art/u%s.js" % unit
    s = io.open(p, encoding="utf-8").read()
    icons = re.search(r"const icons = \{[\s\S]*?\n\};", s).group(0)
    strip = re.search(r"const STRIP = \{[\s\S]*?\n\};", s).group(0)
    out = ("/* Unit %s 삽화 — 만화 + 인포그래픽\n"
           "   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */\n"
           "const K = require(\"../kit.js\");\n"
           "const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;\n\n"
           % unit) + icons + "\n\n" + scenes + "\n\n" + strip + "\n\n" + vig + \
          "\n\nmodule.exports = { icons, scenes, STRIP, VIG };\n"
    io.open(p, "w", encoding="utf-8").write(out)
    print("art/u%s.js 교체" % unit)
