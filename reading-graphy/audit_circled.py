"""한글이 섞인 굵은 런 안의 원문자(ⓐ~ⓩ)를 찾는다.

렌더러는 런 단위로 글꼴을 고르는데, 한글이 섞이면 CJK 글꼴로 잡히고
그 대체 사슬에는 ⓐ~ⓓ가 없어 네모(두부)로 깨진다.
정본 템플릿이 제목에서 (a)(b)(c)(d)를 쓰는 이유다.
"""
import re, sys, os

CIRCLED = re.compile(r'[ⓐ-ⓩ]|\\\\u24[Dd][0-9A-Fa-f]')
HANGUL = re.compile(r'[가-힣]')
# Hs("...") / H("...") 제목과, bold: true 가 붙은 t("...") 런
HS = re.compile(r'\bHs?\("((?:[^"\\]|\\.)*)"\)')
BOLDRUN = re.compile(r't\("((?:[^"\\]|\\.)*)",\s*\{[^}]*bold:\s*true[^}]*\}')

def unesc(s):
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s).replace('\\"', '"')

bad = 0
for f in sorted(sys.argv[1:]):
    src = open(f).read()
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    hits = []
    for m in HS.finditer(src):
        s = unesc(m.group(1))
        if CIRCLED.search(s):
            hits.append(('제목', s))
    for m in BOLDRUN.finditer(src):
        s = unesc(m.group(1))
        if CIRCLED.search(s):
            hits.append(('굵은런', s))
    for kind, s in hits:
        print(f'{tag} [{kind}] {s[:90]}')
        bad += 1
print('한글+원문자 굵은 런:', bad)
