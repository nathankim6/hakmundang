# -*- coding: utf-8 -*-
"""옳은보카 Galaxy 데이터 생성기.

표지 PDF(옳은보카 0~8 + Ultimate)에서 확정된 사실만 쓴다:
권 구성·부제·DAY 수·표지 색·DAY별 DAILY TEST·예문/어원 수록.
PART(5일 묶음, Ultimate는 6일)는 잠정 구성이라 confidence='draft'로 표시하고,
샘플로 채운 DAY 외에는 pending으로 둔다.
"""
import json, os

# ── 책 라인 (표지 PDF 기준) ────────────────────────────────────────────
BOOKS = [
    # id, vol, subtitle, days, base RGB, hot RGB, grades, band, gradeTag, desc
    ("v0", "0", "Blooming (Basic)", 26, [76, 175, 125], [150, 224, 183], ["ge"],
     "초등 기초", "초등 VOCA 입문",
     "26일 완성. 그림처럼 눈에 익는 기초 표제어로 영어 단어장을 처음 편다."),
    ("v1", "1", "Blooming (Power)", 26, [219, 106, 146], [245, 168, 197], ["ge", "g0"],
     "초등 완성", "초등 VOCA 완성",
     "26일 완성. 초등 필수 어휘를 마무리하고 중등 어휘로 건너갈 힘을 만든다."),
    ("v2", "2", "Harvest", 26, [204, 171, 44], [240, 216, 110], ["g0"],
     "예비중1", "예비중 수확기",
     "26일 완성. 초등에서 거둔 어휘를 다시 심어 중등 교과 어휘의 밭을 간다."),
    ("v3", "3", "중등 필수 어휘", 40, [110, 152, 188], [172, 207, 235], ["gm"],
     "중등 필수", "중1–중2 내신",
     "40일 완성. 중등 교과서·내신 지문에 가장 자주 등장하는 필수 표제어."),
    ("v4", "4", "중등 고난도 어휘", 30, [47, 94, 70], [118, 175, 142], ["gm"],
     "중등 심화", "중2–중3 심화",
     "30일 완성. 중등 심화 지문과 고입 대비를 위한 고난도 표제어."),
    ("v5", "5", "고등 기본 어휘", 30, [141, 129, 176], [194, 182, 223], ["gh"],
     "예비고·고1", "고등 기본",
     "30일 완성. 고등 첫 지문이 낯설지 않도록 기본 어휘의 층을 올린다."),
    ("v6", "6", "고등 필수 어휘", 50, [221, 138, 110], [246, 188, 162], ["gh"],
     "고1–고2", "고등 필수",
     "50일 완성. 모의고사·내신 빈출 필수 어휘를 어원과 예문으로 굳힌다."),
    ("v7", "7", "고등 고난도 어휘", 30, [93, 163, 155], [154, 214, 205], ["gh"],
     "고2–고3", "고등 고난도",
     "30일 완성. 1등급을 가르는 고난도 어휘와 다의어를 정면으로 다룬다."),
    ("v8", "8", "고등 어휘 완성", 50, [179, 160, 140], [224, 208, 188], ["gh"],
     "수능 완성", "수능 어휘 완성",
     "50일 완성. 수능·평가원 기출 어휘를 통독하며 고등 어휘를 완성한다."),
    ("vu", "Ultimate", "Ultimate", 174, [82, 82, 92], [235, 235, 242], ["gm", "gh"],
     "전 레벨 통합", "통합 마스터",
     "174일 완성. 옳은보카 전 레벨을 한 권으로 통합한 마스터 볼륨."),
]

PART_SIZE = {"vu": 6}          # Ultimate만 6일 묶음(29 PART), 나머지는 5일 묶음


def parts_of(days, size):
    """[(start, end)] — 마지막 묶음이 2일 이하로 남으면 앞 묶음에 붙인다."""
    out, s = [], 1
    while s <= days:
        e = min(days, s + size - 1)
        if days - e <= 2 and e != days:
            e = days
        out.append((s, e))
        s = e + 1
    return out


# ── 샘플 DAY (실제 콘텐츠) ─────────────────────────────────────────────
SAMPLE_DAYS = {
    "v0-d1": {
        "title": "DAY 01 · 학교와 교실",
        "summary": "학교와 교실에서 매일 만나는 기초 표제어 12개 — 문구·사람·공부 동사까지 한 자리에서 익힌다.",
        "keyPoints": [
            "pencil 연필 · eraser 지우개 · desk 책상 · chair 의자 — 교실 물건 4형제.",
            "teacher 선생님 · student 학생 — -er는 ‘~하는 사람’을 만드는 꼬리표다. (teach+er)",
            "classroom은 class(수업)+room(방), homework는 home(집)+work(일) — 합쳐서 뜻이 되는 단어.",
            "question 질문 ↔ answer 대답 — 항상 짝으로 외운다.",
            "learn은 ‘(몰랐던 것을) 배워 알게 되다’, study는 ‘(알기 위해) 공부하다’ — 방향이 다르다.",
        ],
    },
    "v3-d1": {
        "title": "DAY 01 · 일상·학교 필수 동사",
        "summary": "중등 교과서 빈출 필수 표제어 20개 — 동사 중심으로 파생어와 용법(목적어 형태)까지 함께 잡는다.",
        "keyPoints": [
            "achieve 성취하다 · decide 결정하다 · suggest 제안하다 · prefer ~을 더 좋아하다 — 내신 서술형 단골 동사.",
            "improve 향상시키다 → improvement 향상 / describe 묘사하다 → description 묘사 — 파생 명사까지 한 세트.",
            "provide 제공하다 (provide A with B) · include 포함하다 · receive 받다 — 목적어를 바로 갖는 타동사.",
            "avoid·suggest는 동명사(-ing) 목적어, decide는 to부정사 목적어 — 어휘와 어법이 만나는 지점.",
            "environment 환경 · experience 경험 · opinion 의견 · various 다양한 — 지문 소재를 여는 명사·형용사.",
            "reduce 줄이다 ↔ increase 늘리다, appear 나타나다 ↔ disappear 사라지다 — 반의어 짝.",
        ],
    },
}

WS = {}

# ---- v0 DAY 01 · 학교와 교실 (Blooming Basic) -------------------------
WS["v0-d1"] = {
    "source": "옳은보카 0 Blooming (Basic) · DAY 01 학교와 교실",
    "baekji": {
        "chapter": "PART 1 · DAY 1 학교와 교실",
        "sections": [
            {"no": 1, "label": "STEP 1. 뜻 회상",
             "instruction": "오늘 외운 단어를 떠올리며, 우리말 뜻을 쓰시오.",
             "kind": "skeleton-fill",
             "rows": [
                 {"prompt": "pencil  :  ______________", "lines": 1, "answer": "연필",
                  "why": "pen(펜)과 한 가족인 필기구 이름이다."},
                 {"prompt": "eraser  :  ______________", "lines": 1, "answer": "지우개",
                  "why": "erase(지우다)+-er — ‘지우는 것’이라는 뜻이 그대로 이름이 되었다."},
                 {"prompt": "classroom  :  ______________", "lines": 1, "answer": "교실",
                  "why": "class(수업)+room(방). 합쳐서 뜻이 되는 합성어다."},
                 {"prompt": "teacher  :  ______________", "lines": 1, "answer": "선생님",
                  "why": "teach(가르치다)+-er(~하는 사람)."},
                 {"prompt": "student  :  ______________", "lines": 1, "answer": "학생",
                  "why": "study와 한 뿌리 — ‘공부하는 사람’이다."},
                 {"prompt": "homework  :  ______________", "lines": 1, "answer": "숙제",
                  "why": "home(집)+work(일) — 집에서 하는 공부."},
                 {"prompt": "question  :  ______________", "lines": 1, "answer": "질문",
                  "why": "answer(대답)와 항상 짝으로 다닌다."},
                 {"prompt": "learn  :  ______________", "lines": 1, "answer": "배우다",
                  "why": "몰랐던 것을 배워서 알게 된다는 뜻의 동사다."},
             ]},
            {"no": 2, "label": "STEP 2. 혼동어 구별",
             "instruction": "두 낱말의 뜻 차이를 한 문장으로 쓰시오.",
             "kind": "compare-contrast",
             "rows": [
                 {"prompt": "learn  vs  study", "lines": 2,
                  "answer": "learn은 ‘(몰랐던 것을) 배워서 알게 되다’, study는 ‘(알기 위해) 공부하다’이다.",
                  "why": "결과(learn)와 과정(study)의 차이다. I studied hard and learned the song."},
                 {"prompt": "question  vs  answer", "lines": 2,
                  "answer": "question은 ‘질문’, answer는 그 질문에 대한 ‘대답’이다.",
                  "why": "ask a question(질문하다) — answer the question(질문에 답하다)로 짝을 지어 외운다."},
                 {"prompt": "desk  vs  chair", "lines": 2,
                  "answer": "desk는 공부하는 ‘책상’, chair는 앉는 ‘의자’이다.",
                  "why": "at my desk(책상에서), on the chair(의자에)처럼 붙는 전치사도 다르다."},
             ]},
            {"no": 3, "label": "STEP 3. 문장 속 쓰임 교정",
             "instruction": "밑줄 없이 숨어 있는 틀린 낱말을 찾아 바르게 고치고, 이유를 쓰시오.",
             "kind": "error-explain",
             "rows": [
                 {"prompt": "I do my question after dinner.  (나는 저녁을 먹고 숙제를 한다.)", "lines": 2,
                  "answer": "question → homework",
                  "why": "‘숙제를 하다’는 do one's homework. question은 ‘질문’이다."},
                 {"prompt": "She is a train at our school.  (그녀는 우리 학교 선생님이다.)", "lines": 2,
                  "answer": "train → teacher",
                  "why": "직업을 나타내는 말이 와야 한다. teacher는 teach+-er."},
                 {"prompt": "Please answer my study.  (내 질문에 대답해 주세요.)", "lines": 2,
                  "answer": "study → question",
                  "why": "answer의 목적어는 question. ‘질문에 답하다’ = answer the question."},
             ]},
        ],
    },
    "popquiz": {
        "chapter": "PART 1 · DAY 1 학교와 교실",
        "questions": [
            {"no": 1, "groupHeader": "[1-3] 다음 괄호 안에서 알맞은 말을 고르시오.",
             "kind": "paren-choice", "stem": "I do my (homework, question) after dinner.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 2, "groupHeader": "", "kind": "paren-choice",
             "stem": "The (student, teacher) teaches English at our school.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 3, "groupHeader": "", "kind": "paren-choice",
             "stem": "Write with a (pencil, chair), please.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 4, "groupHeader": "[4-5] 다음 영영풀이가 가리키는 낱말을 고르시오.",
             "kind": "mc-plain", "stem": "a person who teaches students at a school",
             "boxed": True, "bank": [],
             "choices": ["teacher", "student", "eraser", "classroom", "desk"], "bullets": []},
            {"no": 5, "groupHeader": "", "kind": "mc-plain",
             "stem": "work that a teacher gives you to do at home",
             "boxed": True, "bank": [],
             "choices": ["question", "answer", "homework", "chair", "pencil"], "bullets": []},
            {"no": 6, "groupHeader": "[6-8] <보기>에서 알맞은 말을 골라 빈칸을 채우시오. (한 번씩만 사용)",
             "kind": "fill-from-bank", "stem": "We ____________ English songs at school.",
             "boxed": False, "bank": ["learn", "study", "answer"], "choices": [], "bullets": []},
            {"no": 7, "groupHeader": "", "kind": "fill-from-bank",
             "stem": "I ____________ math for two hours every day.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 8, "groupHeader": "", "kind": "fill-from-bank",
             "stem": "Please ____________ my question.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 9, "groupHeader": "",
             "kind": "translate-mc", "stem": "‘교실에 책상과 의자가 있다.’를 영어로 바르게 옮긴 것은?",
             "boxed": False, "bank": [],
             "choices": ["There are desks and chairs in the classroom.",
                          "There are questions and answers in the classroom.",
                          "There are pencils and erasers in the homework.",
                          "There are teachers and students on the desk.",
                          "There are classrooms in the chair."], "bullets": []},
            {"no": 10, "groupHeader": "",
             "kind": "mc-plain", "stem": "짝지어진 두 낱말의 관계가 나머지와 <u>다른</u> 것은?",
             "boxed": False, "bank": [],
             "choices": ["question – answer", "teach – teacher", "learn – study",
                          "erase – eraser", "study – student"], "bullets": []},
        ],
        "answerKey": [
            {"no": 1, "answer": "homework", "why": "‘숙제를 하다’는 do one's homework. question은 ‘질문’."},
            {"no": 2, "answer": "teacher", "why": "가르치는(teaches) 사람은 teacher. student는 배우는 사람이다."},
            {"no": 3, "answer": "pencil", "why": "‘~으로 쓰다’의 도구는 필기구인 pencil. chair는 앉는 의자다."},
            {"no": 4, "answer": "① teacher", "why": "‘학생을 가르치는 사람’ = teacher."},
            {"no": 5, "answer": "③ homework", "why": "‘선생님이 집에서 하라고 주는 공부’ = homework."},
            {"no": 6, "answer": "learn", "why": "노래를 ‘배워 익히다’ — learn. 결과적으로 알게 되는 것."},
            {"no": 7, "answer": "study", "why": "시간을 들여 ‘공부하다’의 과정 — study."},
            {"no": 8, "answer": "answer", "why": "question(질문)의 짝 동사 answer — answer my question."},
            {"no": 9, "answer": "①", "why": "desk(책상)·chair(의자)·classroom(교실)이 제자리에 쓰인 문장은 ①뿐이다."},
            {"no": 10, "answer": "③ learn – study", "why": "③은 뜻이 비슷한 동사끼리의 짝. 나머지는 ‘동사–사람/사물(-er)’ 또는 ‘짝 개념’ 관계다."},
        ],
    },
}

# ---- v3 DAY 01 · 일상·학교 필수 동사 (중등 필수) ----------------------
WS["v3-d1"] = {
    "source": "옳은보카 3 중등 필수 어휘 · DAY 01 일상·학교 필수 동사",
    "baekji": {
        "chapter": "PART 1 · DAY 1 일상·학교 필수 동사",
        "sections": [
            {"no": 1, "label": "STEP 1. 뜻 회상",
             "instruction": "오늘 외운 표제어의 우리말 뜻을 쓰시오. 파생어가 있으면 함께 떠올린다.",
             "kind": "skeleton-fill",
             "rows": [
                 {"prompt": "improve  :  ______________", "lines": 1, "answer": "향상시키다, 나아지다",
                  "why": "im(안으로)+prove — 명사형 improvement(향상)까지 한 세트로 외운다."},
                 {"prompt": "describe  :  ______________", "lines": 1, "answer": "묘사하다, 설명하다",
                  "why": "de(아래로)+scribe(쓰다) ‘써 내려가다’ — 명사형 description."},
                 {"prompt": "provide  :  ______________", "lines": 1, "answer": "제공하다",
                  "why": "provide A with B(A에게 B를 제공하다) 구문으로 자주 나온다."},
                 {"prompt": "decide  :  ______________", "lines": 1, "answer": "결정하다",
                  "why": "decide + to부정사 — 명사형 decision(결정)."},
                 {"prompt": "avoid  :  ______________", "lines": 1, "answer": "피하다",
                  "why": "avoid + 동명사(-ing) 목적어를 갖는 대표 동사다."},
                 {"prompt": "suggest  :  ______________", "lines": 1, "answer": "제안하다",
                  "why": "suggest + 동명사/that절 — 명사형 suggestion(제안)."},
                 {"prompt": "realize  :  ______________", "lines": 1, "answer": "깨닫다",
                  "why": "real(실제의)에서 나온 동사 — ‘실제임을 알아차리다’."},
                 {"prompt": "reduce  :  ______________", "lines": 1, "answer": "줄이다",
                  "why": "re(뒤로)+duce(이끌다) — 반의어는 increase(늘리다)."},
                 {"prompt": "environment  :  ______________", "lines": 1, "answer": "환경",
                  "why": "environmental problem(환경 문제)처럼 형용사형과 함께 빈출."},
                 {"prompt": "various  :  ______________", "lines": 1, "answer": "다양한",
                  "why": "vary(다르다)의 형용사 — various students처럼 명사를 바로 꾸민다."},
             ]},
            {"no": 2, "label": "STEP 2. 혼동어 구별",
             "instruction": "두 표제어의 뜻·쓰임 차이를 한 문장으로 쓰시오.",
             "kind": "compare-contrast",
             "rows": [
                 {"prompt": "improve  vs  increase", "lines": 2,
                  "answer": "improve는 질이 ‘좋아지다/향상시키다’, increase는 수·양이 ‘늘다/늘리다’이다.",
                  "why": "실력은 improve, 가격·숫자는 increase — 질과 양의 차이다."},
                 {"prompt": "appear  vs  seem", "lines": 2,
                  "answer": "appear는 ‘(눈앞에) 나타나다’가 기본 뜻이고, seem은 ‘~처럼 보이다’라는 추측만 나타낸다.",
                  "why": "appear도 ‘~처럼 보이다’로 쓰이지만, ‘나타나다’의 뜻은 appear에만 있다."},
                 {"prompt": "provide  vs  prepare", "lines": 2,
                  "answer": "provide는 ‘(남에게) 제공하다’, prepare는 ‘(스스로) 준비하다’이다.",
                  "why": "제공은 상대가 있고, 준비는 자신이 하는 일이다. provide A with B / prepare for A."},
                 {"prompt": "experience  vs  experiment", "lines": 2,
                  "answer": "experience는 ‘경험(하다)’, experiment는 ‘(과학) 실험’이다.",
                  "why": "철자가 닮아 시험에 자주 나오는 짝 — ex- 뒤를 끝까지 읽어야 한다."},
             ]},
            {"no": 3, "label": "STEP 3. 문장 속 쓰임 교정",
             "instruction": "표제어의 쓰임이 틀린 곳을 찾아 바르게 고치고, 이유를 쓰시오.",
             "kind": "error-explain",
             "rows": [
                 {"prompt": "She decided going abroad to study music.", "lines": 2,
                  "answer": "going → to go",
                  "why": "decide는 to부정사를 목적어로 갖는다. ‘동명사 목적어’ 동사(avoid, suggest)와 구별."},
                 {"prompt": "He suggested to take a short break.", "lines": 2,
                  "answer": "to take → taking",
                  "why": "suggest는 동명사(-ing)를 목적어로 갖는 동사다."},
                 {"prompt": "Various of students joined the reading club.", "lines": 2,
                  "answer": "Various of students → Various students",
                  "why": "various는 형용사이므로 명사를 바로 꾸민다. a variety of와 혼동하지 않는다."},
                 {"prompt": "Her describe of the old town was really vivid.", "lines": 2,
                  "answer": "describe → description",
                  "why": "소유격(Her) 뒤 주어 자리에는 명사가 온다 — describe의 명사형은 description."},
             ]},
        ],
    },
    "popquiz": {
        "chapter": "PART 1 · DAY 1 일상·학교 필수 동사",
        "questions": [
            {"no": 1, "groupHeader": "[1-3] 다음 괄호 안에서 문맥에 알맞은 말을 고르시오.",
             "kind": "paren-choice",
             "stem": "Reading every day will (improve, increase) your writing skills.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 2, "groupHeader": "", "kind": "paren-choice",
             "stem": "The school (provides, prepares) free lunch for all students.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 3, "groupHeader": "", "kind": "paren-choice",
             "stem": "You should (avoid, achieve) eating too much fast food.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 4, "groupHeader": "[4-5] 다음 영영풀이가 가리키는 표제어를 고르시오.",
             "kind": "mc-plain", "stem": "to make something better than before",
             "boxed": True, "bank": [],
             "choices": ["improve", "reduce", "avoid", "describe", "receive"], "bullets": []},
            {"no": 5, "groupHeader": "", "kind": "mc-plain",
             "stem": "to say what someone or something is like",
             "boxed": True, "bank": [],
             "choices": ["decide", "describe", "provide", "realize", "prefer"], "bullets": []},
            {"no": 6, "groupHeader": "[6-8] <보기>에서 알맞은 표제어를 골라 알맞은 형태로 빈칸을 채우시오. (한 번씩만 사용)",
             "kind": "fill-from-bank",
             "stem": "We should ____________ plastic waste to protect the environment.",
             "boxed": False, "bank": ["reduce", "receive", "suggest"], "choices": [], "bullets": []},
            {"no": 7, "groupHeader": "", "kind": "fill-from-bank",
             "stem": "I ____________ a letter from my old friend yesterday.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 8, "groupHeader": "", "kind": "fill-from-bank",
             "stem": "Minsu ____________ going on a picnic this Saturday.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 9, "groupHeader": "",
             "kind": "correct-underline",
             "stem": "밑줄 친 부분을 문맥에 맞는 형태로 고쳐 쓰시오.<br>Her <u>describe</u> of the scene helped us imagine the place.",
             "boxed": False, "bank": [], "choices": [], "bullets": []},
            {"no": 10, "groupHeader": "",
             "kind": "translate-mc", "stem": "‘그는 회의를 피하기로 결정했다.’를 영어로 바르게 옮긴 것은?",
             "boxed": False, "bank": [],
             "choices": ["He decided to avoid the meeting.",
                          "He decided avoiding the meeting.",
                          "He avoided to decide the meeting.",
                          "He suggested to avoid the meeting.",
                          "He realized to avoid the meeting."], "bullets": []},
            {"no": 11, "groupHeader": "",
             "kind": "mc-plain", "stem": "빈칸에 공통으로 들어갈 말로 알맞은 것은?",
             "boxed": False, "bank": [],
             "bullets": ["The library ____________ students with quiet study rooms.",
                          "Trees ____________ us with fresh air."],
             "choices": ["provide", "provides ─ provide", "avoid", "receive", "prefer"]},
            {"no": 12, "groupHeader": "",
             "kind": "mc-plain", "stem": "다음 중 단어의 짝(동사 – 명사형)이 <u>잘못</u> 연결된 것은?",
             "boxed": False, "bank": [],
             "choices": ["decide – decision", "suggest – suggestion", "describe – description",
                          "improve – improvement", "realize – realization ─ 모두 옳다"], "bullets": []},
        ],
        "answerKey": [
            {"no": 1, "answer": "improve", "why": "글쓰기 ‘실력’은 질이 좋아지는 것 — improve. increase는 수·양의 증가."},
            {"no": 2, "answer": "provides", "why": "학교가 학생‘에게’ 점심을 제공한다 — provide. prepare는 스스로 준비하는 것."},
            {"no": 3, "answer": "avoid", "why": "‘너무 많이 먹는 것을 피하라’ — avoid + 동명사. achieve는 ‘성취하다’."},
            {"no": 4, "answer": "① improve", "why": "‘전보다 더 좋게 만들다’ = improve."},
            {"no": 5, "answer": "② describe", "why": "‘어떤 사람·사물이 어떤지 말하다’ = describe."},
            {"no": 6, "answer": "reduce", "why": "플라스틱 쓰레기를 ‘줄이다’ — reduce."},
            {"no": 7, "answer": "received", "why": "편지를 ‘받았다’ — receive의 과거형 received."},
            {"no": 8, "answer": "suggested", "why": "suggest + 동명사(going). 과거 시제로 suggested."},
            {"no": 9, "answer": "description", "why": "소유격 Her 뒤 주어 자리 — 명사 description이 온다."},
            {"no": 10, "answer": "①", "why": "decide + to부정사, avoid + 명사 목적어. 두 동사의 목적어 형태를 함께 묻는 문장이다."},
            {"no": 11, "answer": "①", "why": "두 빈칸 모두 provide A with B 구문. 첫 문장은 단수 주어지만 공통형은 provide."},
            {"no": 12, "answer": "⑤", "why": "다섯 짝 모두 옳게 연결되어 있다 — realize의 명사형은 realization이 맞다."},
        ],
    },
}


def build():
    books = []
    total_units = 0
    done_parts = 0
    total_parts = 0
    for rank, (bid, vol, sub, days, base, hot, grades, band, gtag, desc) in enumerate(BOOKS, 1):
        chapters = []
        for pi, (s, e) in enumerate(parts_of(days, PART_SIZE.get(bid, 5)), 1):
            items = []
            for d in range(s, e + 1):
                iid = "%s-d%d" % (bid, d)
                sample = SAMPLE_DAYS.get(iid)
                items.append({
                    "id": iid, "unitNo": d,
                    "title": sample["title"] if sample else "DAY %02d" % d,
                    "summary": sample["summary"] if sample else "",
                    **({"keyPoints": sample["keyPoints"]} if sample else {}),
                })
            has_sample = any(i["id"] in SAMPLE_DAYS for i in items)
            ch = {
                "no": pi,
                "title": "DAY %02d–%02d" % (s, e),
                "titleEn": "",
                "pending": not has_sample,
                "items": items,
            }
            if has_sample:
                ch["objective"] = ("하루 한 DAY — 표제어를 어원·예문과 함께 외우고, 그날 바로 DAILY TEST로 "
                                   "뜻 회상 → 혼동어 구별 → 문장 속 쓰임 교정까지 확인한다.")
                ch["bigIdea"] = "단어는 목록이 아니라 쓰임으로 남는다 — 외운 날 시험 보는 것이 옳은보카의 한 바퀴다."
                done_parts += 1
            chapters.append(ch)
            total_parts += 1
        total_units += days
        books.append({
            "id": bid,
            "short": "옳은보카 %s" % vol,
            "chip": "보카 %s" % vol,
            "title": "옳은보카 %s · %s" % (vol, sub),
            "publisher": "ORUN ENGLISH 어학연구소",
            "band": band,
            "grades": grades,
            "gradeTag": gtag,
            "desc": desc,
            "unitWord": "DAY",
            "confidence": "draft",
            "basis": "권 구성·부제·DAY 수는 표지 확정, PART(DAY 묶음)는 목차 연동 전 잠정안입니다.",
            "current": {"rank": rank, "of": len(BOOKS), "base": base, "hot": hot},
            "cover": {"motif": "voca", "lines": ["옳은보카", sub], "vol": "VOL. %s" % vol,
                      "big": ("U" if vol == "Ultimate" else vol), "tag": "%d DAYS" % days},
            "chapters": chapters,
        })

    data = {
        "meta": {
            "series": "옳은보카 ORUN VOCA · VOCABULARY SERIES",
            "publisher": "ORUN ENGLISH 어학연구소",
            "academy": "옳은영어 ORUN ENGLISH",
            "chaptersDone": done_parts, "chaptersTotal": total_parts,
            "sheetUnits": len(WS), "unitsTotal": total_units,
            "track": {
                "recall": "DAILY TEST", "check": "VOCA CHECK",
                "vol": "ORUN VOCA BOOK", "volTitle": ["ORUN", "VOCA"],
                "recallF": "DailyTest", "checkF": "VocaCheck",
                "per": "DAY", "unit": "DAY",
                "chWord": "PART",
                "hint": "오늘 외운 표제어를 떠올리며 빈칸을 채워보세요.",
                "bj": [
                    {"kind": "skeleton-fill", "en": "WORD RIGHT", "kr": "뜻 회상"},
                    {"kind": "compare-contrast", "en": "SPOT RIGHT", "kr": "혼동어 구별"},
                    {"kind": "error-explain", "en": "FIX RIGHT", "kr": "문장 속 쓰임 교정"},
                ],
            },
            "academyApp": "ORUN NEXUS UNIVERSE",
        },
        "books": books,
        "topics": [],
        "worksheets": WS,
        "rankTotal": len(BOOKS),
        "grades": [
            {"id": "ge", "label": "초등"},
            {"id": "g0", "label": "예비중1"},
            {"id": "gm", "label": "중등"},
            {"id": "gh", "label": "고등"},
        ],
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vocab.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("vocab.json:", os.path.getsize(out), "bytes ·",
          len(books), "books ·", total_units, "days ·", total_parts, "parts ·", len(WS), "sheets")


if __name__ == "__main__":
    build()
