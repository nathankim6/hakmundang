# -*- coding: utf-8 -*-
"""ORUN WEEKLY 옳은영어 주간지 Galaxy(SYNTAX) 데이터 생성기.

실물 8개 PDF(총 750면)에서 뽑아낸 것만 쓴다:
  · 표지 — ORUN WEEKLY VOL.1 / 「옳은영어 주간지 for Top/고1」
           NEW VERITAS · NOVA VIA AD EXCELLENTIAM
           EVERY WEEK · VOCA + USAGE + SYNTAX
  · 목차 — Week 1~20, 주마다 100문장, 총 1,921문장 / 790면 / 20챕터
  · 주차 첫 장 — WEEK 번호 · STUDY GUIDE 6항 ·
                 100 SENTENCES / N GRAMMAR TOPICS / N VOCABS
  · 주차 구성 — 학습가이드 → 핵심 어휘 → 단어 시험(2면) → 문장 100(10면)
  · 문장마다 어법 포인트 이름표가 붙고, 문장마다 어법 오류가 정확히 하나
  · 권말 정답지 38면 — Chapter 1~20, 총 1,921문제

교재의 설계는 목차가 아니라 주차별 어법 포인트 수에 드러난다. 1주차가 28종을
한 번에 훑고 매주 드문 것부터 덜어 내 11주차에 5종, 12주차부터는 이름표 없이
'기타' 한 종으로 실전에 들어간다 — 깔때기다. PHASE 넷은 그 깔때기의 마디를
따라 잘랐다(교재에 인쇄된 구분은 아니다).

주차별 수치(문장·어법 종수·어휘 수)와 어법 포인트별 문항 수는 모두 실물에서
센 값이다. 16~20주차는 목차·정답지에만 있고 본문 면을 받지 못해 어휘 수를
비워 둔다.
"""
import json, os

WEEKS_TOTAL = 20
PER_PHASE = 5
SENT_PER_WEEK = 100
SENT_TOTAL = 1921          # 목차 하단 '총 문장 수'
PAGES_TOTAL = 790          # 목차 하단 '총 페이지'

# ── 주차별 실측 (topics = 어법 포인트 종수, vocabs = 핵심 어휘 수) ──────
#    16~20주차는 목차만 확보 → vocabs=None
WEEK_STATS = {
    1:  (28, 323), 2:  (23, 160), 3:  (21, 150), 4:  (17, 163), 5:  (16, 206),
    6:  (14, 142), 7:  (12, 232), 8:  (12, 218), 9:  (11, 261), 10: (9, 209),
    11: (5, 224),  12: (1, 190),  13: (1, 294),  14: (1, 217),  15: (1, 199),
    16: (1, None), 17: (1, None), 18: (1, None), 19: (1, None), 20: (1, None),
}

# ── 어법 포인트 27종 — (이름, 전권 문항 수, 등장 주차) ───────────────────
#    이름의 띄어쓰기는 지면 인쇄대로, 수치는 1~15주차 1,500문장을 센 값이다.
#    이름표 없는 '기타' 505문항은 따로 세지 않는다.
TAGS = [
    ("주어-동사 수일치",                 105, list(range(1, 12))),
    ("병렬구조",                          97, list(range(1, 12))),
    ("분사 (현재/과거)",                  88, list(range(1, 12))),
    ("수동태/능동태",                     85, list(range(1, 12))),
    ("관계대명사절",                      72, list(range(1, 11))),
    ("어순/문장구조",                     71, list(range(1, 11))),
    ("명사절 (THAT/WHETHER/의문사)",      71, list(range(1, 11))),
    ("형용사/부사 구별",                  65, list(range(1, 11))),
    ("전치사 (구)",                       54, list(range(1, 10))),
    ("분사구문",                          54, list(range(1, 10))),
    ("대명사/지시어",                     42, list(range(1, 9))),
    ("사역/지각동사",                     33, list(range(1, 7))),
    ("TO부정사 (명사적)",                 30, list(range(1, 7))),
    ("시제/시상",                         25, list(range(1, 6))),
    ("동명사구문",                        24, list(range(1, 6))),
    ("TO부정사 (형용사적/부사적)",        17, list(range(1, 5))),
    ("관계부사절",                        10, [1, 2, 3]),
    ("종속접속사",                        10, [1, 2, 3]),
    ("등위접속사/상관접속사",              9, [1, 2, 3]),
    ("가정법 (과거/과거완료)",             9, [1, 2, 3]),
    ("부사절",                             6, [1, 2]),
    ("관사/한정사",                        4, [1, 2]),
    ("복합관계사 (WHOEVER/WHATEVER 등)",   4, [1]),
    ("삽입/동격구문",                      3, [1]),
    ("부정구문 (부정어/이중부정)",         3, [1]),
    ("도치구문",                           2, [1]),
    ("비교구문 (비교급/최상급/원급)",      2, [1]),
]

# ── PHASE 넷 — 깔때기의 마디 ────────────────────────────────────────────
PHASES = [
    (1, "WEEK 01–05", "FULL SWEEP", "전 영역 스캔",
     "28종에서 16종으로. 첫 주가 어법 전 영역을 한 번에 훑고, 매주 드문 포인트부터 덜어 낸다.",
     "한 해 치 어법을 첫 주에 전부 만난다 — 모르는 것을 먼저 알아야 좁힐 수 있다."),
    (2, "WEEK 06–10", "NARROW DOWN", "빈출 압축",
     "14종에서 9종으로. 시험이 실제로 묻는 자리만 남기고 빈도가 낮은 포인트를 걷어 낸다.",
     "덜어 내는 것이 곧 커리큘럼이다 — 남은 것이 시험에서 실제로 나오는 자리다."),
    (3, "WEEK 11–15", "CORE DRILL", "핵심 집중",
     "5종에서 1종으로. 수일치·병렬·분사·태 네 축만 반복하다가 이름표를 떼고 실전으로 넘어간다.",
     "이름표가 사라지는 순간이 시험장이다 — 어떤 포인트인지부터 스스로 판별한다."),
    (4, "WEEK 16–20", "FULL RUN", "실전 마무리",
     "이름표 없이 100문장씩. 포인트를 알려 주지 않고 오류 하나를 찾아 근거를 말한다.",
     "문장을 보고 어디를 봐야 하는지 스스로 정할 수 있으면 어법이 끝난 것이다."),
]

# 주차 첫 장 STUDY GUIDE — 인쇄된 문구 그대로
STUDY_GUIDE = [
    "본 주간지는 고1·2 모의고사에서 선별한 고난도 핵심 문장으로 구성되어 있습니다.",
    "각 문장을 의미 단위(Semantic Unit)에 따라 슬래시(/)로 구분하며 정확한 해석을 연습하세요.",
    "각 문장은 어법 오류를 하나씩 포함하고 있습니다. 단순히 정답을 찾는 것이 아니라, "
    "왜 틀렸는지 문법적으로 설명할 수 있어야 합니다.",
    "ORUN GUIDE(해설지)을 참고하여 문장의 구조를 분석하세요. 주어(S)와 동사(V)는 "
    "형광펜으로 표시하고, 구조를 먼저 파악한 뒤 어법 오류를 분석하세요.",
    "이해가 되지 않는 문장은 반드시 선생님께 질문하세요 — 질문은 실력을 끌어올리는 "
    "가장 빠른 방법입니다.",
    "주차별 과제를 모두 완료한 학생은 해당 주차의 핵심 어휘를 암기하세요.",
]

# 문장 지면 상단의 학습법 — 인쇄된 문구 그대로
PAGE_NOTE = ("본 동사와 본 주어에 노란 형광펜으로 체크하고 각각 S, V를 표시하세요. "
             "각 문장에서 어법 오류 1개를 찾으세요.")

# ── 1주차 실제 문장 10개(첫 지면) — 어법 포인트·정답은 권말 정답지 그대로 ──
W1_SENTENCES = [
    ("주어-동사 수일치",
     "This deep longing to choose our own purpose, beliefs, and actions, no matter what age "
     "we are, are fought for and defended in every home, particularly by children whose "
     "parents overlook their vital need for autonomy.",
     "are → is",
     "핵은 This deep longing(단수)이다. to choose ~ actions는 형용사적 to부정사구, "
     "no matter what age we are는 삽입절이라 둘 다 걷어낸다."),
    ("병렬구조",
     "Marketers need to be aware of these stages and prepare to act at the appropriate time.",
     "prepare → be prepared",
     "and가 잇는 것은 to be aware와 to (be) prepared다. need to의 to에 걸리므로 "
     "앞과 같은 형태여야 한다."),
    ("분사 (현재/과거)",
     "He wandered around for a while, following the little paths were made by dirt washed "
     "down from the hillside, but finally he sat down on a log and stared straight ahead "
     "without seeing.",
     "were made → made",
     "the little paths를 꾸미는 자리다. 이미 wandered라는 본동사가 있어 were made를 "
     "쓰면 동사가 둘이 된다 — 과거분사 made로 줄인다."),
    ("수동태/능동태",
     "And above all, the genetic code itself – the dictionary by which all genes are "
     "translated – is the same across all living creatures that have ever looked at.",
     "have ever looked at → have ever been looked at",
     "creatures는 '관찰되는' 쪽이다. look at의 목적어가 관계대명사 that으로 빠져 "
     "있으므로 수동이어야 한다."),
    ("관계대명사절",
     "The same is also true of social institutions, such as the family, the state, banks, "
     "churches, and so on – most of them are modified forms of earlier practices or "
     "institutions.",
     "them → which",
     "앞 절과 뒤 절을 잇는 접속사가 없다. most of which로 관계절을 만들어야 한 문장이 된다."),
    ("어순/문장구조",
     "If feelings of discomfort accompany such minor an alteration, how much more so with "
     "significant behavior changes?",
     "such → so",
     "형용사 minor가 관사 앞으로 나온 어순이므로 so minor an alteration이다. "
     "such는 such a minor alteration 어순을 쓴다."),
    ("명사절 (THAT/WHETHER/의문사)",
     "Instead of projecting negative traits onto others, look first inside to see that you "
     "have a trace of what you find so awful in others.",
     "that → if",
     "'가지고 있는지 (아닌지)'를 확인하는 자리다. 사실을 전제하는 that이 아니라 "
     "여부를 묻는 if/whether를 쓴다."),
    ("형용사/부사 구별",
     "In other words, the ABS systems were not used to reduce accidents; instead, the "
     "drivers used the additional element of safety (ABS) to enable them to drive faster "
     "and more reckless without increasing their risk of getting into an accident.",
     "reckless → recklessly",
     "drive를 꾸미는 자리다. and가 faster와 잇고 있으므로 같은 부사여야 한다."),
    ("전치사 (구)",
     "We have had tremendous support from the community in rising funds for this project.",
     "rising → raising",
     "'기금을 모으다'는 목적어를 갖는 타동사 raise다. rise는 자동사라 funds를 "
     "목적어로 받을 수 없다."),
    ("분사구문",
     "I left your restaurant felt hungry and upset.",
     "felt → feeling",
     "본동사는 left 하나다. '배고픈 채로'라는 부대상황은 분사구문 feeling으로 쓴다."),
]

# ── 1주차 핵심 어휘 (앞 24개) ────────────────────────────────────────────
W1_VOCAB = [
    ("longing", "명사", "갈망, 열망"), ("autonomy", "명사", "자율성, 자치권"),
    ("vital", "형용사", "필수적인, 중요한"), ("overlook", "동사", "간과하다, 놓치다"),
    ("appropriate", "형용사", "적절한, 알맞은"), ("wander", "동사", "돌아다니다, 방황하다"),
    ("stare", "동사", "응시하다, 바라보다"), ("genetic", "형용사", "유전의, 유전적인"),
    ("translate", "동사", "번역하다, 해석하다"), ("creature", "명사", "생물, 피조물"),
    ("institution", "명사", "기관, 제도"), ("modify", "동사", "수정하다, 변경하다"),
    ("discomfort", "명사", "불편함, 불쾌감"), ("accompany", "동사", "동반하다, 함께하다"),
    ("alteration", "명사", "변경, 수정"), ("significant", "형용사", "중요한, 상당한"),
    ("trait", "명사", "특성, 특징"), ("trace", "명사", "흔적, 자취"),
    ("awful", "형용사", "끔찍한, 지독한"), ("additional", "형용사", "추가의, 부가적인"),
    ("enable", "동사", "가능하게 하다"), ("reckless", "형용사", "무모한, 경솔한"),
    ("tremendous", "형용사", "엄청난, 대단한"), ("indispensable", "형용사", "없어서는 안 될"),
]

# ── 1주차 단어 시험 1/2 지면 앞 10개 ─────────────────────────────────────
W1_WORDTEST = ["responsibility", "battle", "particular", "limited", "sporting",
               "trail", "confirm", "characterize", "infer", "retrieve"]
W1_WORDTEST_KEY = ["책임, 의무", "전투, 싸움", "특정한, 특별한", "제한된, 한정된",
                   "스포츠의, 운동 경기의", "길, 흔적", "확인하다, 확정하다",
                   "특징짓다, 규정하다", "추론하다", "되찾다, 회수하다"]


def phase_of(week):
    return (week - 1) // PER_PHASE + 1


def week_summary(week):
    topics, vocabs = WEEK_STATS[week]
    v = "핵심 어휘 %d개" % vocabs if vocabs else "핵심 어휘 미확보"
    if topics == 1:
        return ("%d문장 · 어법 이름표 없음 · %s. 포인트를 알려 주지 않는다 — "
                "어디를 봐야 하는지부터 스스로 정한다." % (SENT_PER_WEEK, v))
    return ("%d문장 · 어법 포인트 %d종 · %s. 문장마다 오류가 정확히 하나, "
            "본주어와 본동사에 S·V를 표시한 뒤 판별한다." % (SENT_PER_WEEK, topics, v))


# ── 샘플 주차 (WEEK 01) ──────────────────────────────────────────────────
SAMPLE = {
    "wk-w1": {
        "summary": "1주차 · 어법 28종을 한 번에 훑는 전 영역 스캔. 100문장 · 핵심 어휘 323개 — "
                   "한 해 치 어법 지도를 첫 주에 펼친다.",
        "keyPoints": [
            "의미 단위(Semantic Unit)마다 슬래시(/)를 긋고 나서야 구조가 보인다.",
            "본주어와 본동사에 S·V를 표시한다 — 수식어를 걷어내면 수일치는 저절로 정해진다.",
            "문장마다 어법 오류가 정확히 하나 — 찾는 것이 아니라 왜 틀렸는지 말하는 것이 과제다.",
            "28종 이름표가 붙어 있는 주다. 이름표를 먼저 읽고 그 자리부터 본다.",
            "주차 과제를 끝낸 학생은 그 주의 핵심 어휘 323개를 암기한다.",
        ],
    },
}

WS = {
    "wk-w1": {
        "source": "ORUN WEEKLY VOL.1 · TOP/고1 · WEEK 1 (100문장 · 어법 28종)",
        "baekji": {
            "chapter": "WEEK 01 — 끊어 읽고, 세우고, 판별한다",
            "sections": [
                {"no": 1, "label": "STEP 1. 의미 단위로 끊기",
                 "instruction": "슬래시를 어디에 긋는지 한 줄로 적으시오.",
                 "kind": "skeleton-fill",
                 "rows": [
                     {"prompt": "주어부가 길어지면 ____________ 앞에서 끊는다.",
                      "lines": 1, "answer": "본동사",
                      "why": "본동사 앞까지가 주어부다 — 그 경계가 첫 슬래시 자리다."},
                     {"prompt": "전치사구·분사구·관계절은 ____________로 묶어 걷어낸다.",
                      "lines": 1, "answer": "괄호",
                      "why": "수식어는 길이만 늘릴 뿐 문장의 뼈대를 바꾸지 않는다."},
                     {"prompt": "접속사 and·but·or 앞에서 끊으면 ____________ 짝이 드러난다.",
                      "lines": 1, "answer": "병렬",
                      "why": "무엇과 무엇을 잇는지가 보여야 형태를 맞출 수 있다."},
                     {"prompt": "본주어에는 ______, 본동사에는 ______를 표시한다.",
                      "lines": 1, "answer": "S / V",
                      "why": "표시가 끝나야 수일치·태·시제를 판별할 자리가 정해진다."},
                     {"prompt": "한 문장에 들어 있는 어법 오류는 정확히 ______개다.",
                      "lines": 1, "answer": "1",
                      "why": "하나를 찾았다면 나머지가 왜 옳은지까지 말할 수 있어야 한다."},
                 ]},
                {"no": 2, "label": "STEP 2. 본동사와 준동사 가르기",
                 "instruction": "두 자리가 어떻게 갈리는지 한 문장으로 쓰시오.",
                 "kind": "compare-contrast",
                 "rows": [
                     {"prompt": "the paths were made  vs  the paths made", "lines": 2,
                      "answer": "앞에 이미 본동사가 있으면 were made는 동사가 둘이 되므로, "
                                "명사를 꾸미는 자리에는 과거분사 made를 쓴다.",
                      "why": "1주차 3번 문장이 정확히 이 자리를 묻는다."},
                     {"prompt": "so minor an alteration  vs  such a minor alteration", "lines": 2,
                      "answer": "so는 형용사를 관사 앞으로 끌어내 so＋형용사＋a＋명사, "
                                "such는 such＋a＋형용사＋명사 어순을 쓴다.",
                      "why": "형용사가 관사 앞에 나와 있으면 such가 아니라 so 자리다."},
                     {"prompt": "see that ~  vs  see if ~", "lines": 2,
                      "answer": "that은 사실을 전제하고, if/whether는 '~인지 아닌지'라는 여부를 묻는다.",
                      "why": "확인하러 들여다보는 문맥이면 여부를 묻는 자리다."},
                     {"prompt": "rise  vs  raise", "lines": 2,
                      "answer": "rise는 목적어를 갖지 않는 자동사, raise는 목적어를 갖는 타동사다.",
                      "why": "funds라는 목적어가 뒤에 있으면 raise만 가능하다."},
                 ]},
                {"no": 3, "label": "STEP 3. 오류 판별과 근거",
                 "instruction": "틀린 곳을 고치고, 왜 틀렸는지 문장으로 쓰시오.",
                 "kind": "error-explain",
                 "rows": [
                     {"prompt": W1_SENTENCES[0][1], "lines": 2,
                      "answer": W1_SENTENCES[0][2], "why": W1_SENTENCES[0][3]},
                     {"prompt": W1_SENTENCES[7][1], "lines": 2,
                      "answer": W1_SENTENCES[7][2], "why": W1_SENTENCES[7][3]},
                     {"prompt": W1_SENTENCES[8][1], "lines": 2,
                      "answer": W1_SENTENCES[8][2], "why": W1_SENTENCES[8][3]},
                     {"prompt": W1_SENTENCES[9][1], "lines": 2,
                      "answer": W1_SENTENCES[9][2], "why": W1_SENTENCES[9][3]},
                 ]},
            ],
        },
        "popquiz": {
            "chapter": "WEEK 01 · 어법 10문항 + 단어 10문항",
            "questions": (
                [{"no": i + 1,
                  "groupHeader": ("[1-10] 다음 각 문장에는 어법상 틀린 곳이 한 군데 있다. "
                                  "찾아 바르게 고치고, 왜 틀렸는지 쓰시오."
                                  if i == 0 else ""),
                  "stem": "[%s] %s" % (tag, en),
                  "boxed": True, "bank": [], "choices": [], "bullets": []}
                 for i, (tag, en, _, _) in enumerate(W1_SENTENCES)]
                + [{"no": 11 + i,
                    "groupHeader": ("[11-20] 다음 영어 단어의 한글 뜻을 쓰시오. "
                                    "(WEEK 1 단어 시험)" if i == 0 else ""),
                    "stem": w,
                    "boxed": False, "bank": [], "choices": [], "bullets": []}
                   for i, w in enumerate(W1_WORDTEST)]
            ),
            "answerKey": (
                [{"no": i + 1, "answer": ans, "why": why}
                 for i, (_, _, ans, why) in enumerate(W1_SENTENCES)]
                + [{"no": 11 + i, "answer": W1_WORDTEST_KEY[i], "why": ""}
                   for i in range(len(W1_WORDTEST))]
            ),
        },
    },
}


def build():
    chapters = []
    for pno, rng, en, kr, obj, big in PHASES:
        lo = (pno - 1) * PER_PHASE + 1
        hi = pno * PER_PHASE
        items = []
        for w in range(lo, hi + 1):
            iid = "wk-w%d" % w
            sm = SAMPLE.get(iid)
            items.append({
                "id": iid, "unitNo": w,
                "title": "WEEK %02d · %d문장" % (w, SENT_PER_WEEK),
                "summary": sm["summary"] if sm else week_summary(w),
                **({"keyPoints": sm["keyPoints"]} if sm else {}),
            })
        has = any(i["id"] in SAMPLE for i in items)
        ch = {
            "no": pno,
            "title": "%s · %s" % (rng, kr),
            "titleEn": en,
            "pending": not has,
            "objective": "%s 매주 100문장, 다섯 주 %d문장. %s"
                         % (rng, PER_PHASE * SENT_PER_WEEK, obj),
            "items": items,
        }
        if has:
            ch["bigIdea"] = big
        chapters.append(ch)

    book = {
        "id": "wk",
        "short": "ORUN WEEKLY",
        "chip": "WEEKLY",
        "title": "ORUN WEEKLY VOL.1 · 옳은영어 주간지 for Top/고1",
        "publisher": "옳은영어 ORUN ENGLISH",
        "band": "고1 · 매주 한 회",
        "grades": ["gh1"],
        "gradeTag": "고1·2 모의고사 고난도 문장",
        "desc": "20주 · %s문장. 매주 학습가이드 → 핵심 어휘 → 단어 시험 → 100문장. "
                "문장마다 어법 오류가 정확히 하나 들어 있고, 1주차 28종에서 12주차 "
                "이름표 없는 실전까지 어법 포인트를 깔때기처럼 좁혀 간다. "
                "권말 정답지 %s문제. EVERY WEEK · VOCA + USAGE + SYNTAX."
                % ("{:,}".format(SENT_TOTAL), "{:,}".format(SENT_TOTAL)),
        "unitWord": "WEEK",
        "confidence": "verified",
        "basis": "표지·목차·주차별 첫 장(문장 수·어법 종수·어휘 수)·문장 지면의 어법 "
                 "이름표·권말 정답지까지 실물 8개 PDF(750면)에서 확인했습니다. "
                 "16~20주차는 목차와 정답지에만 있고 본문 면을 받지 못해 어휘 수가 "
                 "비어 있습니다. PHASE 네 구분은 교재에 인쇄된 것이 아니라 주차별 "
                 "어법 종수(28→16→9→1)의 마디를 따라 지도용으로 나눈 것입니다.",
        "current": {"rank": 1, "of": 1, "base": [201, 162, 39], "hot": [246, 214, 132]},
        "cover": {"motif": "weekly", "vol": "VOL 1", "big": "1",
                  "kr": "옳은영어 주간지", "tag": "for Top/고1",
                  "eyebrow": "NEW VERITAS · NOVA VIA AD EXCELLENTIAM",
                  "foot": "EVERY WEEK · VOCA + USAGE + SYNTAX"},
        "chapters": chapters,
    }

    topics = [{"id": "wt%d" % (i + 1),
               "label": "어법 %s · %d문항" % (name, n),
               "chapters": [["wk", p] for p in sorted({phase_of(w) for w in weeks})]}
              for i, (name, n, weeks) in enumerate(TAGS)]

    done_ch = sum(1 for c in chapters if not c["pending"])
    data = {
        "meta": {
            "series": "ORUN WEEKLY · 옳은영어 주간지",
            "publisher": "옳은영어 ORUN ENGLISH",
            "academy": "옳은영어 ORUN ENGLISH",
            "chaptersDone": done_ch, "chaptersTotal": len(chapters),
            "sheetUnits": len(WS), "unitsTotal": WEEKS_TOTAL,
            "studyGuide": STUDY_GUIDE,
            "pageNote": PAGE_NOTE,
            "track": {
                "recall": "SLASH NOTE", "check": "WEEKLY SET",
                "vol": "ORUN WEEKLY BOOK", "volTitle": ["ORUN", "WEEKLY"],
                "recallF": "SlashNote", "checkF": "WeeklySet",
                "per": "주차", "unit": "WEEK", "chWord": "PHASE",
                "hint": PAGE_NOTE,
                "bj": [
                    {"kind": "skeleton-fill", "en": "SLASH RIGHT", "kr": "의미 단위 끊기"},
                    {"kind": "compare-contrast", "en": "FRAME RIGHT", "kr": "본동사 세우기"},
                    {"kind": "error-explain", "en": "FIX RIGHT", "kr": "오류 판별"},
                ],
            },
            "academyApp": "ORUN NEXUS UNIVERSE",
        },
        "books": [book], "topics": topics, "worksheets": WS,
        "rankTotal": 1,
        "grades": [{"id": "gh1", "label": "고1"}],
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "syntax.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("syntax.json:", os.path.getsize(out), "bytes · 1 book ·",
          WEEKS_TOTAL, "weeks ·", len(chapters), "phases ·",
          len(topics), "topics ·", len(WS), "sheets")


if __name__ == "__main__":
    build()
