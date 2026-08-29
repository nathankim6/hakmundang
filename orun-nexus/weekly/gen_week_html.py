# -*- coding: utf-8 -*-
"""ORUN WEEKLY VOL.1 — 주차별 학습지 HTML 20개 생성기.

입력  : weekly.json (본문·어휘·단어시험·정답)  ·  guide.json (해설집)
출력  : out/ORUN_WEEKLY_VOL1_WEEK01.html … WEEK20.html

한 파일이 한 주차다. 인터넷 없이 열리고 그대로 인쇄된다(A4).
실물에서 확인한 것만 싣는다 — 16~20주차는 정답지만 확보되어 그렇게 표시한다.
"""
import json, io, os, re, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')

D = json.load(io.open(os.path.join(HERE, 'weekly.json'), encoding='utf-8'))
G = json.load(io.open(os.path.join(HERE, 'guide.json'), encoding='utf-8'))
WEEKS = {w['no']: w for w in D['weeks']}
ANS = {int(k): v for k, v in D['answers'].items()}
TOTAL_WEEKS = 20
E = lambda s: html.escape(s or '', quote=True)

CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮'

# 정답지·본문·해설집을 1,921문항 전수 대조했을 때 서로 어긋난 자리.
# 원문은 그대로 싣고, 해당 주차 정답 위에 따로 알린다.
ERRATA = {
    5: ["<b>47번</b> — 정답지 좌변이 <code>ticking</code>이지만 본문 47번 문장은 "
        "<code>tickling</code>입니다. 해설집은 <code>tickling → being tickled</code>로 "
        "적혀 있어, 정답지 쪽 오탈자로 보입니다.",
        "<b>62번</b> — 정답지가 <code>had made → had made</code>로 좌우가 같습니다. "
        "본문은 <code>has made</code>, 해설집은 <code>has made → had made</code>이므로 "
        "좌변이 <code>has made</code>여야 합니다."],
    10: ["<b>56번</b> — 본문 문장에 <code>coms from</code>으로 인쇄되어 있습니다. "
         "정답지·해설집은 모두 <code>comes from → coming from</code>으로 적고 있어, "
         "본문 쪽 오탈자로 보입니다."],
    12: ["<b>96번</b> — 정답지 좌변이 <code>That is wby</code>입니다. 본문은 "
         "<code>That is why</code>이므로 정답지 쪽 오탈자로 보입니다."],
}

CSS = """
:root{
  --navy:#0e2a47; --navy2:#16375b; --gold:#c9a227; --gold-l:#f2b93c;
  --ink:#16202b; --ink2:#4a5a6b; --line:#d8dfe6; --tint:#f4f7fa;
  --red:#c0392b; --green:#1d7a4c; --paper:#ffffff; --shell:#eef2f6;
}
*{box-sizing:border-box}
body{margin:0;background:var(--shell);color:var(--ink);
     font-family:'Pretendard','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',
                 system-ui,-apple-system,sans-serif;
     font-size:14px;line-height:1.62;-webkit-text-size-adjust:100%}
.wrap{max-width:900px;margin:0 auto;padding:0 0 80px}

/* ── 표지 ── */
.cover{background:linear-gradient(160deg,#16375b 0%,#0e2a47 46%,#081a2e 100%);
       color:#fff;padding:38px 34px 30px;position:relative;overflow:hidden}
.cover:after{content:'';position:absolute;right:-60px;bottom:-90px;width:280px;height:280px;
       border-radius:50%;background:radial-gradient(circle,rgba(242,185,60,.20),transparent 70%)}
.eyebrow{font-size:10.5px;letter-spacing:.22em;color:var(--gold-l);text-transform:uppercase;
       font-weight:700;margin-bottom:14px}
.mark{font-size:34px;font-weight:800;letter-spacing:.02em;line-height:1.06}
.mark em{font-style:normal;color:var(--gold-l)}
.sub{margin-top:8px;font-size:14px;color:#c8d7e8}
.sub b{color:var(--gold-l)}
.wknum{position:absolute;right:30px;top:26px;width:82px;height:82px;border-radius:50%;
       background:var(--gold-l);color:#0e2a47;display:grid;place-content:center;text-align:center;
       box-shadow:0 6px 22px rgba(0,0,0,.32)}
.wknum span{display:block;font-size:9.5px;letter-spacing:.2em;font-weight:700}
.wknum b{display:block;font-size:31px;font-weight:800;line-height:1}
.stats{display:flex;gap:0;margin-top:24px;border-top:1px solid rgba(255,255,255,.22);
       padding-top:16px;position:relative;z-index:2;flex-wrap:wrap}
.stat{flex:1 1 100px;min-width:100px}
.stat b{display:block;font-size:22px;font-weight:800;color:#fff}
.stat span{font-size:9.5px;letter-spacing:.18em;color:#9fb6cf;text-transform:uppercase}

/* ── 목차 바 ── */
nav{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);
    backdrop-filter:blur(8px);border-bottom:1px solid var(--line);
    display:flex;flex-wrap:wrap;gap:2px 2px;padding:8px 14px;align-items:center}
nav a{font-size:12px;color:var(--navy);text-decoration:none;padding:5px 11px;border-radius:3px;
      font-weight:600}
nav a:hover{background:var(--tint)}
nav .sp{flex:1}
@media (max-width:560px){nav .sp{flex-basis:100%;height:0}
  nav button{margin-top:6px}}
nav button{font:inherit;font-size:11.5px;font-weight:700;border:1px solid var(--navy);
      background:#fff;color:var(--navy);border-radius:3px;padding:5px 12px;cursor:pointer}
nav button[aria-pressed=true]{background:var(--navy);color:#fff}

/* ── 섹션 ── */
section{background:var(--paper);margin:18px 0 0;padding:26px 34px 30px;
        border:1px solid var(--line);border-top:3px solid var(--navy)}
h2{margin:0 0 4px;font-size:18px;font-weight:800;color:var(--navy);letter-spacing:-.01em}
h2 .en{font-size:10.5px;letter-spacing:.2em;color:var(--gold);display:block;
       font-weight:700;margin-bottom:5px}
.lead{margin:0 0 18px;font-size:12.5px;color:#5b6b7c}
.note{background:var(--tint);border-left:3px solid var(--gold);padding:11px 14px;
      font-size:12.5px;margin:0 0 18px;border-radius:0 3px 3px 0}

ol.guide{margin:0;padding-left:0;list-style:none;counter-reset:g}
ol.guide li{counter-increment:g;position:relative;padding:9px 0 9px 40px;
      border-bottom:1px solid #eef1f5;font-size:13px}
ol.guide li:last-child{border-bottom:none}
ol.guide li:before{content:counter(g,decimal-leading-zero);position:absolute;left:0;top:9px;
      font-size:11px;font-weight:800;color:#fff;background:var(--navy);
      width:23px;height:19px;display:grid;place-content:center;border-radius:2px}

/* ── 표 ── */
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{background:var(--navy);color:#fff;font-size:10px;letter-spacing:.14em;font-weight:700;
   padding:7px 8px;text-align:left;text-transform:uppercase}
td{padding:5px 8px;border-bottom:1px solid #eef1f5;vertical-align:top}
tr:nth-child(even) td{background:#fafcfd}
td.n{width:34px;color:#93a3b3;font-size:11px;text-align:right;font-variant-numeric:tabular-nums}
td.w{font-weight:700;color:var(--navy2);width:31%;word-break:break-word}
td.p{width:52px;color:#7b8a99;font-size:11px;white-space:nowrap}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
@media (max-width:720px){.cols{grid-template-columns:1fr}}
td.blank{border-bottom:1px solid #cfd8e0;min-width:120px}

/* ── 문장 ── */
.s{padding:15px 0 15px 46px;border-bottom:1px solid #eef1f5;position:relative}
.s:last-child{border-bottom:none}
.s .no{position:absolute;left:0;top:15px;width:32px;text-align:right;font-size:12px;
       font-weight:800;color:var(--navy);font-variant-numeric:tabular-nums}
.tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.04em;
     background:#fdf4dc;color:#8a6d10;border:1px solid #ecd9a0;border-radius:2px;
     padding:1px 7px;margin-bottom:6px}
.en{font-size:13.5px;line-height:1.66;word-break:normal;overflow-wrap:break-word}
.ko{margin-top:5px;font-size:12.5px;color:#5c6b7a;line-height:1.6}

/* ── 해설 ── */
.gd{margin-top:11px;border:1px solid #e3e9ef;border-radius:3px;overflow:hidden}
.gd>summary{cursor:pointer;list-style:none;padding:7px 12px;background:var(--tint);
     font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--navy);
     display:flex;align-items:center;gap:9px}
.gd>summary::-webkit-details-marker{display:none}
.gd>summary:before{content:'＋';font-weight:800;color:var(--gold)}
.gd[open]>summary:before{content:'－'}
.gdbody{padding:14px 14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:0 22px}
@media (max-width:760px){.gdbody{grid-template-columns:1fr;gap:16px 0}}
.gh{font-size:9.5px;letter-spacing:.16em;font-weight:800;color:var(--gold);
    text-transform:uppercase;margin:0 0 7px;padding-bottom:4px;border-bottom:1px solid #ecd9a0}
.fix{font-size:13px;margin-bottom:12px}
.fix .bad{color:var(--red);text-decoration:line-through;text-decoration-thickness:1px}
.fix .arw{color:#93a3b3;margin:0 7px}
.fix .good{color:var(--green);font-weight:700}
.ana{font-size:12.5px;color:#3d4c5a;line-height:1.66}
ul.st{margin:0;padding:0;list-style:none;font-size:12.5px}
ul.st li{padding:5px 0;border-bottom:1px dotted #e3e9ef;line-height:1.55}
ul.st li:last-child{border-bottom:none}

/* ── 정답 ── */
.keys{display:grid;grid-template-columns:repeat(2,1fr);gap:0 26px}
@media (max-width:720px){.keys{grid-template-columns:1fr}}
.k{display:flex;gap:9px;padding:4px 0;border-bottom:1px solid #f0f3f6;font-size:12.5px}
.k b{color:var(--navy);font-weight:800;min-width:30px;text-align:right;
     font-variant-numeric:tabular-nums}
.k .bad{color:var(--red)} .k .good{color:var(--green);font-weight:700}
.k .arw{color:#93a3b3;margin:0 6px}

.missing{background:#fff8e6;border:1px solid #ecd9a0;padding:16px 18px;font-size:13px;
         border-radius:3px;color:#6d5710}
.errata{background:#fdf1ef;border:1px solid #edc3bb;border-left:3px solid var(--red);
        padding:12px 15px;font-size:12.5px;margin:0 0 16px;border-radius:0 3px 3px 0}
.errata b{color:var(--red)}
.errata ul{margin:7px 0 0;padding-left:17px}
.errata li{margin:3px 0}
footer{padding:26px 34px;font-size:11px;color:#8794a3;text-align:center}
footer b{color:var(--navy)}

@media print{
  body{background:#fff;font-size:10.5pt}
  nav{display:none}
  .wrap{max-width:none;padding:0}
  section{border:none;margin:0;padding:14pt 0 10pt;page-break-inside:auto}
  section+section{border-top:1.5pt solid var(--navy);page-break-before:always}
  .cover{page-break-after:always}
  .s,.k,tr{page-break-inside:avoid}
  .gd{page-break-inside:avoid}
  .gd>summary{display:none}
  .gd:not([open]) .gdbody{display:grid}
  h2{page-break-after:avoid}
  @page{size:A4;margin:14mm 13mm 16mm}
}
"""

JS = """
(function(){
  var all=document.getElementById('tg-all');
  if(!all) return;
  all.onclick=function(){
    var on=all.getAttribute('aria-pressed')!=='true';
    all.setAttribute('aria-pressed',on?'true':'false');
    all.textContent=on?'해설 접기':'해설 모두 펼치기';
    document.querySelectorAll('details.gd').forEach(function(d){ d.open=on; });
  };
})();
"""


def fix_html(wrong, right):
    if not wrong and not right: return ''
    if not right:
        return '<div class="fix"><span class="bad">%s</span></div>' % E(wrong)
    return ('<div class="fix"><span class="bad">%s</span>'
            '<span class="arw">→</span><span class="good">%s</span></div>'
            % (E(wrong), E(right)))


def structure_html(items):
    if not items: return ''
    out = []
    for s in items:
        mark, body = (s[0], s[1:].strip()) if s and s[0] in CIRC else ('·', s)
        out.append('<li><b>%s</b> %s</li>' % (E(mark), E(body)))
    return '<ul class="st">%s</ul>' % ''.join(out)


def key_html(pairs, base):
    rows = []
    for no, ans in pairs:
        m = re.match(r'^(.*?)\s*->\s*(.*)$', ans)
        local = no - base
        if m:
            body = ('<span class="bad">%s</span><span class="arw">→</span>'
                    '<span class="good">%s</span>' % (E(m.group(1)), E(m.group(2))))
        else:
            body = E(ans)
        rows.append('<div class="k"><b>%d</b><span>%s</span></div>' % (local, body))
    return '<div class="keys">%s</div>' % ''.join(rows)


def vocab_html(rows):
    half = (len(rows) + 1) // 2
    def tbl(part):
        body = ''.join(
            '<tr><td class="n">%d</td><td class="w">%s</td><td class="p">%s</td><td>%s</td></tr>'
            % (r[0], E(r[1]), E(r[2]), E(r[3])) for r in part)
        return ('<table><thead><tr><th>#</th><th>Word</th><th>품사</th><th>뜻</th></tr></thead>'
                '<tbody>%s</tbody></table>' % body)
    return '<div class="cols"><div>%s</div><div>%s</div></div>' % (tbl(rows[:half]), tbl(rows[half:]))


def wordtest_html(rows):
    """단어 시험은 실물처럼 50문항씩 두 회분."""
    out = []
    for i in range(0, len(rows), 50):
        part = rows[i:i + 50]
        half = (len(part) + 1) // 2
        def tbl(p):
            body = ''.join('<tr><td class="n">%d</td><td class="w">%s</td>'
                           '<td class="blank"></td></tr>' % (r[0], E(r[1])) for r in p)
            return ('<table><thead><tr><th>#</th><th>Word</th><th>뜻</th></tr></thead>'
                    '<tbody>%s</tbody></table>' % body)
        out.append('<h3 style="margin:22px 0 8px;font-size:13px;color:#0e2a47">'
                   'WORD TEST %d / %d</h3>'
                   '<div class="cols"><div>%s</div><div>%s</div></div>'
                   % (i // 50 + 1, (len(rows) + 49) // 50, tbl(part[:half]), tbl(part[half:])))
    return ''.join(out)


def sentences_html(sents, guide, keymap):
    out = []
    for s in sents:
        no = s['no']
        g = guide.get(str(no))
        gd = ''
        if g:
            left = fix_html(g.get('wrong'), g.get('right'))
            ana = ('<p class="ana">%s</p>' % E(g['analysis'])) if g.get('analysis') else ''
            st = structure_html(g.get('structure') or [])
            gd = ('<details class="gd"><summary>ORUN GUIDE · 해설</summary>'
                  '<div class="gdbody">'
                  '<div><p class="gh">Error Correction · 오류 수정</p>%s'
                  '<p class="gh" style="margin-top:14px">Analysis · 오답 분석</p>%s</div>'
                  '<div><p class="gh">Structure · 구문 분석</p>%s</div>'
                  '</div></details>' % (left, ana, st))
        elif keymap.get(no):
            m = re.match(r'^(.*?)\s*->\s*(.*)$', keymap[no])
            body = fix_html(m.group(1), m.group(2)) if m else E(keymap[no])
            gd = ('<details class="gd"><summary>정답</summary>'
                  '<div class="gdbody" style="grid-template-columns:1fr">'
                  '<div><p class="gh">Error Correction · 오류 수정</p>%s</div></div></details>' % body)
        out.append('<div class="s"><div class="no">%d</div>%s'
                   '<div class="en">%s</div><div class="ko">%s</div>%s</div>'
                   % (no, ('<span class="tag">%s</span>' % E(s['tag'])) if s.get('tag') else '',
                      E(s['en']), E(s['ko']), gd))
    return ''.join(out)


def build_week(n):
    w = WEEKS.get(n)
    base = (n - 1) * 100
    pairs = ANS.get(n, [])
    guide = G.get(str(n), {})
    keymap = {no - base: ans for no, ans in pairs}
    stats = w['stats'] if w and w['stats'] else None
    nav, secs = [], []

    if w and w['sentences']:
        gcount = sum(1 for s in w['sentences'] if str(s['no']) in guide)
        st_txt = ('<div class="stats">'
                  '<div class="stat"><b>%d</b><span>Sentences</span></div>'
                  '<div class="stat"><b>%d</b><span>Grammar Topics</span></div>'
                  '<div class="stat"><b>%d</b><span>Vocabs</span></div>'
                  '<div class="stat"><b>%d</b><span>Guide 해설</span></div>'
                  '</div>' % (stats[0], stats[1], stats[2], gcount)) if stats else ''

        if w.get('guide'):
            nav.append(('study', 'STUDY GUIDE'))
            secs.append('<section id="study"><h2><span class="en">Study Guide</span>학습 방법</h2>'
                        '<ol class="guide">%s</ol></section>'
                        % ''.join('<li>%s</li>' % E(g) for g in w['guide']))
        if w['vocab']:
            nav.append(('vocab', '핵심 어휘'))
            secs.append('<section id="vocab"><h2><span class="en">Vocabulary</span>'
                        'WEEK %02d 핵심 어휘 <span style="font-size:12px;color:#7b8a99">'
                        '%d개</span></h2>'
                        '<p class="lead">모르는 단어는 형광펜으로 표시하고 암기하세요.</p>%s</section>'
                        % (n, len(w['vocab']), vocab_html(w['vocab'])))
        if w['wordtest']:
            nav.append(('wt', '단어 시험'))
            secs.append('<section id="wt"><h2><span class="en">Word Test</span>'
                        'WEEK %02d 단어 시험</h2>'
                        '<p class="lead">다음 영어 단어의 한글 뜻을 쓰세요.</p>%s</section>'
                        % (n, wordtest_html(w['wordtest'])))
        nav.append(('sent', '본문 100문장'))
        secs.append('<section id="sent"><h2><span class="en">Sentences</span>'
                    'WEEK %02d 본문 100문장</h2>'
                    '<div class="note">본 동사와 본 주어에 노란 형광펜으로 체크하고 각각 S, V를 '
                    '표시하세요. 각 문장에서 어법 오류 1개를 찾으세요.</div>%s</section>'
                    % (n, sentences_html(w['sentences'], guide, keymap)))
    else:
        st_txt = ('<div class="stats">'
                  '<div class="stat"><b>%d</b><span>Answer Key</span></div>'
                  '<div class="stat"><b>—</b><span>본문 미확보</span></div></div>' % len(pairs))
        secs.append('<section><h2><span class="en">Notice</span>본문 지면 미확보</h2>'
                    '<div class="missing">이 주차는 제공된 8개 PDF에 <b>목차와 정답지</b>만 '
                    '들어 있습니다. 본문 100문장·핵심 어휘·단어 시험·ORUN GUIDE 해설 지면은 '
                    '파일에 포함되지 않아 아래 정답만 싣습니다. 해당 지면을 주시면 다른 주차와 '
                    '같은 구성으로 채워 드립니다.</div></section>')

    if pairs:
        nav.append(('key', '정답'))
        er = ERRATA.get(n)
        erhtml = ('<div class="errata"><b>실물 대조 결과 — 확인이 필요한 자리</b><ul>%s</ul>'
                  '<div style="margin-top:7px;color:#8a6a62">아래 정답은 정답지 원문 그대로 '
                  '싣습니다.</div></div>' % ''.join('<li>%s</li>' % x for x in er)) if er else ''
        secs.append('<section id="key"><h2><span class="en">Answer Key</span>'
                    'WEEK %02d 정답 <span style="font-size:12px;color:#7b8a99">%d문항</span></h2>'
                    '<p class="lead">정답지(Grammar Corrections) 원문 그대로입니다. '
                    '전권 통번호 %d–%d번에 해당합니다.</p>%s%s</section>'
                    % (n, len(pairs), base + 1, base + len(pairs), erhtml,
                       key_html(pairs, base)))

    navhtml = ''.join('<a href="#%s">%s</a>' % (i, t) for i, t in nav)
    if any(i == 'sent' for i, _ in nav):
        navhtml += ('<span class="sp"></span>'
                    '<button id="tg-all" aria-pressed="false">해설 모두 펼치기</button>')

    return """<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ORUN WEEKLY VOL.1 · WEEK %02d</title>
<style>%s</style></head>
<body><div class="wrap">
<header class="cover">
  <div class="wknum"><span>WEEK</span><b>%02d</b></div>
  <div class="eyebrow">New Veritas · Nova Via ad Excellentiam</div>
  <div class="mark">ORUN WEEKL<em>Y</em></div>
  <div class="sub">옳은영어 주간지 <b>for Top/고1</b> · VOL.1</div>
  <div class="sub" style="font-size:11.5px;color:#8fa6bf;letter-spacing:.1em;margin-top:2px">
    EVERY WEEK · VOCA + USAGE + SYNTAX</div>
  %s
</header>
<nav>%s</nav>
%s
<footer>ORUN WEEKLY VOL.1 · WEEK %02d / %d &nbsp;·&nbsp; <b>옳은영어 ORUN ENGLISH</b><br>
실물 교재 8개 PDF에서 추출·검증한 내용입니다.</footer>
</div><script>%s</script></body></html>
""" % (n, CSS, n, st_txt, navhtml, ''.join(secs), n, TOTAL_WEEKS, JS)


def main():
    os.makedirs(OUT, exist_ok=True)
    made = []
    for n in range(1, TOTAL_WEEKS + 1):
        p = os.path.join(OUT, 'ORUN_WEEKLY_VOL1_WEEK%02d.html' % n)
        io.open(p, 'w', encoding='utf-8').write(build_week(n))
        w = WEEKS.get(n)
        made.append((n, os.path.getsize(p),
                     len(w['sentences']) if w else 0,
                     len(w['vocab']) if w else 0,
                     len(G.get(str(n), {})),
                     len(ANS.get(n, []))))
    print('%-6s %10s %7s %7s %7s %7s' % ('WEEK', 'bytes', 'sent', 'vocab', 'guide', 'answers'))
    for r in made: print('%-6d %10d %7d %7d %7d %7d' % r)
    print('\n%d files → %s' % (len(made), OUT))


if __name__ == '__main__':
    main()
