# -*- coding: utf-8 -*-
"""PDF 한 문단의 줄들을 원래 글자 그대로 다시 잇는다.

이 교재의 우리말은 낱말 한복판에서도 줄이 바뀐다(CJK 기본 줄바꿈). 그래서
줄을 공백으로 이으면 '여전히'가 '여 전히'가 되고, 공백 없이 이으면 원래
띄어져 있던 '들어오지 않았다'가 '들어오지않았다'가 된다.

기하로는 두 경우를 가를 수 없다 — 줄 끝의 공백은 CSS 에서 매달려(hanging)
줄 폭에 들어가지 않으므로, 낱말 한복판에서 잘린 줄과 공백에서 잘린 줄의
오른쪽 끝이 똑같이 여백선에 닿는다. PDF 도 그 공백을 내보내지 않는다.

그래서 교재 자체를 사전으로 쓴다. 750면에서 모은 낱말 목록에 '두 조각을
붙인 것'이 있으면 낱말 한복판에서 잘린 것이고, 두 조각이 각각 낱말로
있으면 공백에서 잘린 것이다. 같은 낱말이 책 어딘가에서는 한 줄 안에
온전히 찍혀 있기 때문에 이 판별이 선다.

로마자는 낱말 한복판에서 잘리지 않으므로(하이픈 제외) 경계면 늘 공백이다.
"""
import collections
import re

_TOK = collections.Counter()
HAN_RE = re.compile(r'[가-힣]')
PUNCT = '"\'()[]{}“”‘’…,.·→–—-/'

LAT_END = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,;:.)\"'?!")
LAT_BEG = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(\"'")


def learn(lines):
    """지면에서 실제로 한 줄 안에 찍힌 낱말들을 모은다."""
    for t in lines:
        for w in str(t or '').split():
            if w: _TOK[w] += 1


def charw(ch, h):
    """글자 하나의 대략적인 폭. h 는 그 줄의 글자 크기."""
    o = ord(ch)
    if 0x1100 <= o <= 0x11FF or 0x3000 <= o <= 0x30FF or \
       0xAC00 <= o <= 0xD7AF or 0x4E00 <= o <= 0x9FFF or 0xFF00 <= o <= 0xFF60:
        return h * 0.98                      # 한글·한자·전각
    if ch.isalnum():
        return h * 0.52                      # 로마자·숫자
    return h * 0.30                          # 문장부호·따옴표


def _needs_space(out, t, h, slack):
    """앞 줄 끝과 뒷 줄 머리 사이에 공백이 있었는가."""
    if not out or not t:
        return False
    a, b = out[-1], t[0]
    if a == '-' and b.islower():
        return None                          # 합성어 — 붙이되 하이픈은 남긴다
    if a in LAT_END and b in LAT_BEG:
        return True                          # 로마자 경계는 언제나 공백
    if not (HAN_RE.match(a) or HAN_RE.match(b)):
        # 둘 다 한글이 아니면 기하로 판단해도 안전하다
        return slack >= charw(b, h) * 0.92
    tail = out.split()[-1] if out.split() else ''
    head = t.split()[0] if t.split() else ''
    if not tail or not head:
        return True
    if tail[-1] in ')]}”"\'’':
        return True                          # 닫는 부호 뒤에서 낱말이 이어지지 않는다
    if _TOK.get(tail + head):
        return False                         # 붙인 꼴이 교재에 낱말로 있다
    tk, hk = tail.strip(PUNCT), head.strip(PUNCT)
    if tk and hk and _TOK.get(tk + hk):
        return False
    if _TOK.get(tail) and _TOK.get(head):
        return True                          # 각각 낱말로 있다 → 공백에서 잘림
    if tk and hk and _TOK.get(tk) and _TOK.get(hk):
        return True
    if hk and _TOK.get(hk):
        return True                          # 뒷 조각이 온전한 낱말이면 공백이 있었다
    # 사전이 답하지 못하면 한글 줄바꿈의 다수인 '낱말 한복판'으로 본다
    return False


def wrapjoin(rows, h, colR=None):
    """rows = [(글자, 그 줄의 오른쪽 끝 x)] — 한 문단의 줄들, 위에서 아래로."""
    rows = [(t.strip(), r) for t, r in rows if t and t.strip()]
    if not rows:
        return ''
    if colR is None:
        ends = [r for _, r in rows if r is not None]
        colR = max(ends) if ends else None
    out = rows[0][0]
    for i in range(1, len(rows)):
        prev_r, t = rows[i - 1][1], rows[i][0]
        slack = (colR - prev_r) if (colR is not None and prev_r is not None) else 1e9
        sp = _needs_space(out, t, h, slack)
        out += (' ' + t) if sp else t
    return out
