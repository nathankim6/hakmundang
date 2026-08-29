# -*- coding: utf-8 -*-
"""ORUN WEEKLY 8개 PDF → 주차별 구조화 데이터 (weekly.json).

  weekly_raw*.json (extract2.mjs 산출) → 주차별
  {stats, guide(학습방법), vocab, wordtest, sentences} + 정답지

줄바꿈으로 갈라진 글줄은 wrapjoin 이 원래 글자 그대로 다시 잇는다.
"""
import json, io, os, re, collections
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wrapjoin import wrapjoin, learn

# 중간 산출물(추출 원본)은 저장소에 두지 않는다 — extract2.mjs 가 다시 만든다.
RAW_PATH = os.environ.get('WEEKLY_RAW', 'weekly_raw4.json')
RAW = json.load(io.open(RAW_PATH, encoding='utf-8'))
# 한 줄 안에 온전히 찍힌 낱말들을 먼저 모은다 — 줄바꿈 판별의 사전이 된다.
for _pg in RAW: learn(l['t'] for l in _pg['lines'])
OUTDIR = os.environ.get('WEEKLY_OUT', '.')

HAN = re.compile(r'[가-힣]')
POS = '명사구|형용사구|부사구|동사구|전치사|접속사|대명사|형용사|명사|동사|부사|숙어|구'
VOC = re.compile(r'(\d{1,4})\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ \-\'/().,]*?)\s+(' + POS +
                 r')\s+(.+?)(?=\s*\d{1,4}\s+[A-Za-zÀ-ÿ]|$)')
WT = re.compile(r"(\d{1,4})\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ \-'/().]*?)(?=\s*\d{1,4}\s*[A-Za-zÀ-ÿ]|$)")
# 품사 칸이 제 줄로 밀려난 항목이 한 건 있다(11주차 151 on behalf of) — 품사를
# 비운 채로도 잡아 두고, 같은 지면에 홀로 떨어진 품사 조각을 도로 붙인다.
VOC0 = re.compile(r'(\d{1,4})\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ \-\'/().,]*?)\s+([~가-힣].*?)'
                  r'(?=\s*\d{1,4}\s+[A-Za-zÀ-ÿ]|$)')
POSONLY = re.compile(r'^(' + POS + r')$')


def unspace(s):
    s = s.strip(); toks = s.split(' ')
    if len(toks) > 2 and sum(1 for t in toks if len(t) == 1) >= len(toks) * 0.7:
        return ''.join(toks)
    return s


def rightof(l):
    """그 줄의 오른쪽 끝 — 두 칸 중 실제로 글자가 있는 쪽."""
    return l['rr'] if l.get('rr') is not None else l.get('lr')


def f3(pg):  return re.sub(r'\s+', '', ' '.join(l['t'] for l in pg['lines'][:3]))
def flatall(pg): return re.sub(r'\s+', '', ' '.join(l['t'] for l in pg['lines']))


def kind_of(pg):
    a = f3(pg)
    if 'ORUNGUIDE옳은영어주간지해설집' in a: return 'guide'
    if 'ANSWERKEY' in a or '정답지(AnswerKey)' in a: return 'key'
    if 'VOCABULARY' in a: return 'vocab'
    if 'WORDTEST' in a: return 'wordtest'
    if 'STUDYGUIDE' in flatall(pg): return 'opener'
    if '학습법|본동사와본주어에' in flatall(pg): return 'sent'
    if '목차' in a and 'TABLEOFCONTENTS' in a: return 'toc'
    return 'other'


def week_of(pg):
    m = re.search(r'WEEK(\d+)', f3(pg))
    return int(m.group(1)) if m else None


weeks, openers, answers = collections.OrderedDict(), [], {}
def W(n):
    if n not in weeks:
        weeks[n] = {'no': n, 'stats': None, 'guide': [], 'vocab': [],
                    'wordtest': [], 'sentences': []}
    return weeks[n]


cur, keychap, toc = None, None, []
for pg in RAW:
    k, w = kind_of(pg), week_of(pg)
    if w and w != cur:
        cur = w
        # 주차 첫 장은 그 주 번호를 그림으로 찍어 글자로 남기지 않는다 —
        # 바로 뒤에 오는 어휘 지면의 머리글이 그 주차를 알려 준다.
        for o in openers:
            if o['week'] is None: o['week'] = cur

    if k == 'toc':
        for l in pg['lines']:
            m = re.match(r'^Week (\d+)$', l['t'].strip())
            if m: toc.append(int(m.group(1)))
        continue

    if k == 'key':
        for l in pg['lines']:
            t = l['t'].strip()
            m = re.match(r'Chapter\s*(\d+)\s*\(', t)
            if m:
                keychap = int(m.group(1)); answers.setdefault(keychap, [])
                continue
            if keychap is None: continue
            for mm in re.finditer(r'(\d{1,4})\)\s*(.*?)(?=\s+\d{1,4}\)|$)', t):
                answers[keychap].append((int(mm.group(1)), mm.group(2).strip()))
        continue

    if k == 'opener':
        g, stats, gh = [], None, 7.1
        rows = []
        for l in pg['lines']:
            t = l['t'].strip()
            if re.match(r'^0[1-9]\s', t):
                rows.append([(t[3:].strip(), rightof(l))]); gh = l['h']
            elif t.startswith('—') and rows: rows[-1].append((t, rightof(l)))
            elif rows and 6.5 <= l['h'] <= 7.6 and l['x'] > 130:
                rows[-1].append((t, rightof(l)))
            elif re.fullmatch(r'\d{7,9}', t):   # 100 · 종수 · 어휘수 가 붙어 나온다
                r = t[3:]                        # 문장 수는 언제나 100
                stats = (100, int(r[:-3]), int(r[-3:]))
        gR = max([rightof(l) or 0 for l in pg['lines']
                  if 6.5 <= l['h'] <= 7.6 and l['x'] > 120] or [None])
        g = [wrapjoin(r, gh, gR) for r in rows]
        if stats: openers.append({'guide': g, 'stats': stats, 'week': None})
        continue

    if cur is None or k == 'guide': continue
    ww = W(cur)

    if k == 'vocab':
        orphan = [l['t'].strip() for l in pg['lines']
                  if 7.4 <= l['h'] <= 8.4 and POSONLY.match(l['t'].strip())]
        for l in pg['lines']:
            if not (7.4 <= l['h'] <= 8.4): continue
            hit = list(VOC.finditer(l['t']))
            if hit:
                for m in hit:
                    ww['vocab'].append([int(m.group(1)), m.group(2).strip(),
                                        m.group(3), m.group(4).strip()])
                continue
            for m in VOC0.finditer(l['t']):
                ww['vocab'].append([int(m.group(1)), m.group(2).strip(),
                                    orphan.pop(0) if orphan else '',
                                    m.group(3).strip()])

    elif k == 'wordtest':
        for l in pg['lines']:
            if not (7.4 <= l['h'] <= 8.4): continue
            for m in WT.finditer(l['t']):
                ww['wordtest'].append([int(m.group(1)), m.group(2).strip()])

    elif k == 'sent':
        # 지면 전체에서 각 칸의 오른쪽 여백선을 먼저 잰다 — 두 줄짜리 문단은
        # 제 안에서 여백선을 알 수 없다(마지막 줄은 언제나 짧다).
        enR = max([rightof(l) or 0 for l in pg['lines']
                   if 8.0 <= l['h'] <= 9.2 and l['x'] < 60] or [None])
        koR = max([rightof(l) or 0 for l in pg['lines']
                   if 6.5 <= l['h'] <= 7.6 and 50 <= l['x'] < 70] or [None])
        tags, groups, curg = [], [], None
        for l in pg['lines']:
            h, x, t = l['h'], l['x'], l['t'].strip()
            if h > 11 or l['y'] < 46 or t.startswith('✏') or t.startswith('💡'):
                continue                              # 머리글·꼬리글 띠
            if 4.0 <= h <= 5.2 and x > 150:
                tags.append(unspace(t)); continue
            R = rightof(l)
            if 8.0 <= h <= 9.2 and x < 42:
                m = re.match(r'^(\d{1,4})(\S.*)$', t)
                curg = {'no': int(m.group(1)) if m else None, 'eh': h,
                        'en': [((m.group(2) if m else t).strip(), R)], 'ko': []}
                groups.append(curg); continue
            if curg is None: continue
            if 8.0 <= h <= 9.2 and not curg['ko']: curg['en'].append((t, R))
            elif 6.5 <= h <= 7.6 and (HAN.search(t) or curg['ko']):
                curg['kh'] = h; curg['ko'].append((t, R))
        for i, g in enumerate(groups):
            g['tag'] = tags[i] if i < len(tags) else (tags[-1] if tags else '')
            g['en'] = wrapjoin(g['en'], g['eh'], enR)
            g['ko'] = wrapjoin(g['ko'], g.get('kh', 7.1), koR)
            g.pop('eh', None); g.pop('kh', None)
            ww['sentences'].append(g)

# 정답지의 'Chapter 20 (1901-2000)' 머리글은 실제로 1877번부터 걸려 있다 —
# 번호는 1~1921 로 죽 이어지므로, 주차는 머리글이 아니라 번호로 가른다.
allans = sorted(x for v in answers.values() for x in v)
answers = {}
for no, t in allans:
    answers.setdefault((no - 1) // 100 + 1, []).append((no, t))

for o in openers:
    if o['week'] in weeks:
        weeks[o['week']]['stats'] = o['stats']
        weeks[o['week']]['guide'] = o['guide']

for w in weeks.values():
    w['vocab'].sort(key=lambda r: r[0])
    w['wordtest'].sort(key=lambda r: r[0])
    w['sentences'].sort(key=lambda g: g['no'] or 0)

json.dump({'weeks': list(weeks.values()),
           'answers': {str(k): v for k, v in sorted(answers.items())},
           'toc': toc},
          io.open(OUTDIR + '/weekly.json', 'w', encoding='utf-8'), ensure_ascii=False)

print('%-5s %-12s %5s %6s %5s %8s %8s' %
      ('WEEK', 'stats(s/t/v)', 'sent', 'vocab', 'wt', 'answers', 'vocab==stat'))
ok = True
for n, w in sorted(weeks.items()):
    st = w['stats']; a = answers.get(n, [])
    good = st and len(w['vocab']) == st[2] and len(w['sentences']) == 100 \
           and len(a) == 100 and len(w['wordtest']) == 100
    ok = ok and bool(good)
    print('%-5d %-12s %5d %6d %5d %8d %8s' %
          (n, ('%d/%d/%d' % st) if st else '-', len(w['sentences']),
           len(w['vocab']), len(w['wordtest']), len(a), 'OK' if good else '!!'))
print('\nopeners: %d  toc weeks: %d  answer weeks: %d  answer total: %d'
      % (len(openers), len(toc), len(answers), sum(len(v) for v in answers.values())))
print('ALL WEEKS CLEAN:', ok)
