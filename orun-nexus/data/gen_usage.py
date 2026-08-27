# -*- coding: utf-8 -*-
"""ORUN USAGE 옳은 어법 Galaxy 데이터 생성기.

실물 표지·본문에서 확정된 사실만 쓴다:
  · 한 권, 36차시 = ROUND 01~36 = SET 01/36~36/36
  · 차시마다 10문항 — 밑줄형 5 + 선택형 5, 전권 360문항
  · EDITION 문제지 · ORUN ENGLISH GRAMMAR SERIES
  · 표지 색 금색 #c9a227, 밤하늘 #1e2a3d, 먹 #0e2a47
  · 차시 안내문과 "근거로 판단하는 어법 훈련" 문구는 본문 그대로

CHAPTER 여섯 덩어리(ROUND 01–06 …)는 교재에 없는 구분이다 — 36개를 한 고리에
늘어놓으면 지도에서 읽히지 않아 항해용으로 여섯씩 묶었을 뿐이고, 그래서
confidence='draft' 로 둔다. 차시 번호와 문항 수는 교재 그대로다.
"""
import json, os

ROUNDS = 36
PER_BLOCK = 6

# 차시 안내문 — 표지 다음 장에 실제로 인쇄된 문구
ROUND_NOTE = ("옳은 어법(ORUN USAGE) 실전 세트입니다. 밑줄형과 선택형을 교차 배열했습니다. "
              "각 문항의 모든 보기에 대해 맞다/틀리다의 근거를 직접 문장으로 적어 보세요. "
              "정답을 고르는 것보다 나머지 네 개가 왜 옳은지를 설명할 수 있을 때 어법이 완성됩니다.")

# ── 샘플 차시 (실제 콘텐츠) ───────────────────────────────────────────
SAMPLE = {
    "us-r1": {
        "summary": "1차시 · 실전 세트 10문항(밑줄형 5 + 선택형 5). 고르는 훈련이 아니라 "
                   "고르지 않은 넷이 왜 옳은지 문장으로 적는 훈련이다.",
        "keyPoints": [
            "밑줄형은 다섯 밑줄 각각에 '맞다/틀리다'와 그 근거를 한 줄씩 적고 시작한다.",
            "선택형 (A)(B)(C)는 서로 다른 포인트를 묻는다 — 한 문항에서 세 자리를 각각 판별한다.",
            "수일치는 주어의 핵부터 — 전치사구·분사구·관계절을 괄호로 걷어낸다.",
            "준동사 자리는 앞의 동사가 정한다 — 동사가 요구하는 형태를 먼저 떠올린다.",
            "관계사는 뒤에 빠진 자리로 정한다 — 주어가 없으면 주격, 목적어가 없으면 목적격.",
        ],
    },
}

WS = {
    "us-r1": {
        "source": "ORUN USAGE 옳은 어법 · ROUND 01 · SET 01 / 36 (1차시)",
        "baekji": {
            "chapter": "ROUND 01 · 1차시 — 근거로 판단하는 어법 훈련",
            "sections": [
                {"no": 1, "label": "STEP 1. 판별 기준 세우기",
                 "instruction": "이 차시에서 다룬 자리마다 '어디를 보는가'를 한 줄로 적으시오.",
                 "kind": "skeleton-fill",
                 "rows": [
                     {"prompt": "수일치를 물으면 먼저 ____________를 괄호로 걷어내고 주어의 ____________에 동사를 맞춘다.",
                      "lines": 1, "answer": "수식어 / 핵",
                      "why": "전치사구·분사구·관계절은 길이만 늘릴 뿐 동사의 수를 정하지 않는다."},
                     {"prompt": "준동사(to부정사·동명사) 자리는 ____________가 정한다.",
                      "lines": 1, "answer": "앞의 동사",
                      "why": "avoid·enjoy는 동명사, decide·promise는 to부정사를 목적어로 갖는다."},
                     {"prompt": "관계대명사의 격은 뒤에 ____________ 무엇인지로 정한다.",
                      "lines": 1, "answer": "빠진 자리가",
                      "why": "주어가 없으면 주격, 목적어가 없으면 목적격, 완전한 절이면 관계부사다."},
                     {"prompt": "분사가 명사를 꾸밀 때, 명사가 하는 쪽이면 ______분사, 당하는 쪽이면 ______분사다.",
                      "lines": 1, "answer": "현재 / 과거",
                      "why": "the boy singing(하는 쪽) ↔ the song sung(당하는 쪽)."},
                     {"prompt": "접속사 자리와 전치사 자리는 뒤에 ______이 오느냐 ______가 오느냐로 갈린다.",
                      "lines": 1, "answer": "절 / 구",
                      "why": "because＋절 ↔ because of＋구, although＋절 ↔ despite＋구."},
                 ]},
                {"no": 2, "label": "STEP 2. 함정 구별",
                 "instruction": "두 자리가 어떻게 갈리는지 한 문장으로 쓰시오.",
                 "kind": "compare-contrast",
                 "rows": [
                     {"prompt": "the number of＋복수명사  vs  a number of＋복수명사", "lines": 2,
                      "answer": "the number of는 '~의 수'가 핵이라 단수 동사, a number of는 '많은'이라는 수량 표현이라 복수 동사를 쓴다.",
                      "why": "핵이 number 자체냐, 뒤의 복수명사냐로 갈린다."},
                     {"prompt": "관계대명사 what  vs  that", "lines": 2,
                      "answer": "what은 선행사를 품고 있어 앞에 선행사가 없고, that은 선행사가 앞에 있어야 한다.",
                      "why": "What he said(그가 말한 것) ↔ the thing that he said."},
                     {"prompt": "stop -ing  vs  stop to부정사", "lines": 2,
                      "answer": "stop -ing는 '하던 것을 멈추다', stop to부정사는 '~하기 위해 멈추다'로 to부정사는 목적이다.",
                      "why": "remember·forget·try도 같은 방식으로 뜻이 갈린다."},
                     {"prompt": "despite  vs  although", "lines": 2,
                      "answer": "despite는 전치사라 뒤에 명사구가, although는 접속사라 뒤에 절이 온다.",
                      "why": "뒤에 주어＋동사가 보이면 접속사 자리다."},
                 ]},
                {"no": 3, "label": "STEP 3. 근거 서술",
                 "instruction": "틀린 곳을 고치고, 나머지가 왜 옳은지까지 문장으로 쓰시오.",
                 "kind": "error-explain",
                 "rows": [
                     {"prompt": "The list of names on the notice board were updated yesterday.", "lines": 2,
                      "answer": "were → was",
                      "why": "핵은 The list — of names와 on the notice board는 전치사구라 걷어낸다."},
                     {"prompt": "She avoided to answer the question about her plans.", "lines": 2,
                      "answer": "to answer → answering",
                      "why": "avoid는 동명사를 목적어로 갖는 동사다."},
                     {"prompt": "This is the book which I told you about it last week.", "lines": 2,
                      "answer": "it 삭제",
                      "why": "which가 이미 about의 목적어라, it을 또 쓰면 목적어가 둘이 된다."},
                     {"prompt": "Despite he was tired, he finished the whole set.", "lines": 2,
                      "answer": "Despite → Although",
                      "why": "뒤에 he was tired라는 절이 오므로 전치사가 아니라 접속사 자리다."},
                 ]},
            ],
        },
        "popquiz": {
            "chapter": "ROUND 01 · 1차시 — 밑줄형 5 · 선택형 5",
            "questions": [
                {"no": 1, "groupHeader": "[1-5] 다음 밑줄 친 부분 중 어법상 틀린 것을 고르시오. (밑줄형)",
                 "kind": "mc-plain",
                 "stem": "The collection of essays that <u>①were</u> published last spring <u>②has</u> been widely read. Many readers say the book <u>③helped</u> them think about <u>④what</u> they had long taken for granted, and reviewers <u>⑤praised</u> its clarity.",
                 "boxed": True, "bank": [], "choices": [], "bullets": []},
                {"no": 2, "groupHeader": "", "kind": "mc-plain",
                 "stem": "Scientists <u>①studying</u> deep-sea life have found creatures <u>②whose</u> bodies produce light. The light, <u>③producing</u> by chemical reactions, helps them <u>④attract</u> prey in water <u>⑤where</u> sunlight never reaches.",
                 "boxed": True, "bank": [], "choices": [], "bullets": []},
                {"no": 3, "groupHeader": "", "kind": "mc-plain",
                 "stem": "<u>①Despite</u> the heavy rain, the team kept <u>②working</u> outdoors. The coach insisted that every player <u>③wears</u> a jacket, and nobody <u>④was</u> allowed to leave until the drill <u>⑤was</u> over.",
                 "boxed": True, "bank": [], "choices": [], "bullets": []},
                {"no": 4, "groupHeader": "", "kind": "mc-plain",
                 "stem": "The museum, <u>①which</u> opened in 1998, houses paintings <u>②that</u> few people have seen. Visitors are often surprised at <u>③how</u> small the rooms are, but the curator says the space <u>④makes</u> the works feel <u>⑤more closely</u>.",
                 "boxed": True, "bank": [], "choices": [], "bullets": []},
                {"no": 5, "groupHeader": "", "kind": "mc-plain",
                 "stem": "Not until the last page <u>①did I realize</u> that the narrator <u>②had been</u> lying. The author, <u>③whom</u> I had never read before, made me <u>④to question</u> everything <u>⑤I</u> had assumed.",
                 "boxed": True, "bank": [], "choices": [], "bullets": []},
                {"no": 6, "groupHeader": "[6-10] (A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것을 고르시오. (선택형)",
                 "kind": "mc-boxed",
                 "stem": "A number of studies (A) [suggest / suggests] that short walks improve focus. What matters is not the distance (B) [but / and] the break itself. Students (C) [asking / asked] to walk for ten minutes scored higher on attention tests.",
                 "boxed": True, "bank": [],
                 "choices": ["suggest – but – asked", "suggests – but – asking",
                              "suggest – and – asked", "suggests – and – asking",
                              "suggest – but – asking"], "bullets": []},
                {"no": 7, "groupHeader": "", "kind": "mc-boxed",
                 "stem": "The habit of checking messages (A) [make / makes] deep work difficult. Each interruption costs more time than it seems, (B) [because / because of] returning to the task takes effort. Try (C) [to leave / leaving] the phone in another room for an hour.",
                 "boxed": True, "bank": [],
                 "choices": ["makes – because – leaving", "make – because – to leave",
                              "makes – because of – leaving", "make – because of – to leave",
                              "makes – because – to leave"], "bullets": []},
                {"no": 8, "groupHeader": "", "kind": "mc-boxed",
                 "stem": "The city rebuilt the bridge (A) [which / where] the old one had collapsed. Engineers used a design (B) [proven / proving] safe in earthquakes. Residents say the new bridge feels (C) [safe / safely] even in strong wind.",
                 "boxed": True, "bank": [],
                 "choices": ["where – proven – safe", "which – proven – safely",
                              "where – proving – safe", "which – proving – safely",
                              "where – proven – safely"], "bullets": []},
                {"no": 9, "groupHeader": "", "kind": "mc-boxed",
                 "stem": "It was the silence (A) [that / what] surprised the visitors most. They had expected a crowd, only (B) [finding / to find] empty halls. The guide explained that most tourists (C) [come / comes] in the evening.",
                 "boxed": True, "bank": [],
                 "choices": ["that – to find – come", "what – to find – come",
                              "that – finding – come", "what – finding – comes",
                              "that – to find – comes"], "bullets": []},
                {"no": 10, "groupHeader": "", "kind": "mc-boxed",
                 "stem": "Rarely (A) [we see / do we see] a species change so fast. The moths, (B) [whose / which] wings darkened within decades, adapted to soot-covered trees. Their story is often used to explain (C) [how / what] natural selection works.",
                 "boxed": True, "bank": [],
                 "choices": ["do we see – whose – how", "we see – whose – how",
                              "do we see – which – what", "we see – which – how",
                              "do we see – whose – what"], "bullets": []},
            ],
            "answerKey": [
                {"no": 1, "answer": "①were → was",
                 "why": "관계절 that ~의 선행사는 The collection(단수)이다. ②has의 주어도 The collection이라 옳고, ④what은 뒤에 목적어가 빠진 명사절을 이끌어 옳다."},
                {"no": 2, "answer": "③producing → produced",
                 "why": "The light가 반응에 의해 '만들어지는' 쪽이므로 과거분사. ②whose는 뒤에 bodies라는 명사가 이어져 옳고, ⑤where는 뒤가 완전한 절이라 옳다."},
                {"no": 3, "answer": "③wears → (should) wear",
                 "why": "insist가 '주장·요구'의 뜻일 때 that절은 (should)＋동사원형. ①Despite는 뒤에 명사구 the heavy rain이 와서 옳다."},
                {"no": 4, "answer": "⑤more closely → closer",
                 "why": "feel의 보어 자리라 형용사가 온다. ①which는 계속적 용법, ③how는 뒤에 small the rooms are라는 간접의문문 어순이라 옳다."},
                {"no": 5, "answer": "④to question → question",
                 "why": "make는 사역동사라 목적격 보어에 동사원형을 쓴다. ①은 Not until이 문두라 도치된 형태로 옳고, ③whom은 read의 목적어라 옳다."},
                {"no": 6, "answer": "①", "why": "A number of＋복수명사는 복수(suggest), not A but B의 짝(but), Students가 '요청받은' 쪽이라 과거분사(asked)."},
                {"no": 7, "answer": "①", "why": "핵은 The habit(단수), 뒤에 절이 오므로 because, try -ing는 '시험 삼아 해 보다'로 문맥에 맞다."},
                {"no": 8, "answer": "①", "why": "뒤가 완전한 절이라 where, design이 '입증된' 쪽이라 proven, feel의 보어라 형용사 safe."},
                {"no": 9, "answer": "①", "why": "It was ~ that 강조구문, only to find는 결과의 to부정사, most tourists는 복수라 come."},
                {"no": 10, "answer": "①", "why": "Rarely가 문두라 도치(do we see), 뒤에 wings라는 명사가 이어지므로 whose, explain의 목적어로 '어떻게 작동하는지'라 how."},
            ],
        },
    },
}


def build():
    chapters = []
    for ci in range(1, ROUNDS // PER_BLOCK + 1):
        lo = (ci - 1) * PER_BLOCK + 1
        hi = ci * PER_BLOCK
        items = []
        for r in range(lo, hi + 1):
            iid = "us-r%d" % r
            sm = SAMPLE.get(iid)
            items.append({
                "id": iid, "unitNo": r,
                "title": "ROUND %02d · %d차시" % (r, r),
                "summary": sm["summary"] if sm else "",
                **({"keyPoints": sm["keyPoints"]} if sm else {}),
            })
        has = any(i["id"] in SAMPLE for i in items)
        ch = {
            "no": ci, "title": "ROUND %02d–%02d" % (lo, hi), "titleEn": "SET %02d / 36" % hi,
            "pending": not has,
            "objective": "실전 세트 %d차시 — 차시마다 밑줄형 5 + 선택형 5, 모두 %d문항. %s"
                         % (PER_BLOCK, PER_BLOCK * 10, ROUND_NOTE),
            "items": items,
        }
        if has:
            ch["bigIdea"] = ("정답을 고르는 것보다 나머지 네 개가 왜 옳은지를 설명할 수 있을 때 "
                             "어법이 완성된다 — 근거로 판단하는 훈련이다.")
        chapters.append(ch)

    book = {
        "id": "us",
        "short": "옳은 어법",
        "chip": "USAGE",
        "title": "ORUN USAGE · 옳은 어법 (문제지)",
        "publisher": "옳은영어 ORUN ENGLISH",
        "band": "고등 내신·수능",
        "grades": ["gh"],
        "gradeTag": "고등 내신에 직결되는 어법",
        "desc": "36차시 · 360문항. 밑줄형·선택형 전면 수록, 전 문항 보기별 오답 분석 노트 내장, "
                "정답의 근거를 서술하는 어법 훈련 시스템. ORUN ENGLISH GRAMMAR SERIES.",
        "unitWord": "ROUND",
        "confidence": "draft",
        "basis": "차시 수(36)·문항 수(차시당 10, 전권 360)·표지와 본문 문구는 실물 확정입니다. "
                 "ROUND 여섯씩 묶은 CHAPTER 구분은 교재에 없는, 지도 항해를 위한 구분입니다.",
        "current": {"rank": 1, "of": 1, "base": [201, 162, 39], "hot": [240, 214, 128]},
        "cover": {"motif": "usage", "vol": "36 ROUNDS", "big": "36",
                  "kr": "옳은 어법", "tag": "고등 내신 · 수능 어법",
                  "eyebrow": "고등 내신에 직결되는"},
        "chapters": chapters,
    }

    total_units = ROUNDS
    total_ch = len(chapters)
    done_ch = sum(1 for c in chapters if not c["pending"])

    data = {
        "meta": {
            "series": "ORUN USAGE · 옳은 어법",
            "publisher": "옳은영어 ORUN ENGLISH",
            "academy": "옳은영어 ORUN ENGLISH",
            "chaptersDone": done_ch, "chaptersTotal": total_ch,
            "sheetUnits": len(WS), "unitsTotal": total_units,
            "track": {
                "recall": "REASON NOTE", "check": "USAGE SET",
                "vol": "ORUN USAGE BOOK", "volTitle": ["ORUN", "USAGE"],
                "recallF": "ReasonNote", "checkF": "UsageSet",
                "per": "차시", "unit": "ROUND", "chWord": "BLOCK",
                "hint": "정답을 고르기 전에, 모든 보기에 맞다/틀리다의 근거를 문장으로 적어보세요.",
                "bj": [
                    {"kind": "skeleton-fill", "en": "RULE RIGHT", "kr": "판별 기준 세우기"},
                    {"kind": "compare-contrast", "en": "SPOT RIGHT", "kr": "함정 구별"},
                    {"kind": "error-explain", "en": "SAY RIGHT", "kr": "근거 서술"},
                ],
            },
            "academyApp": "ORUN NEXUS UNIVERSE",
        },
        "books": [book], "topics": [], "worksheets": WS,
        "rankTotal": 1,
        "grades": [{"id": "gh", "label": "고등"}],
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "usage.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("usage.json:", os.path.getsize(out), "bytes · 1 book ·",
          total_units, "rounds ·", total_ch, "blocks ·", len(WS), "sheets")


if __name__ == "__main__":
    build()
