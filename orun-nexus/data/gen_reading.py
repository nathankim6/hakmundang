# -*- coding: utf-8 -*-
"""옳은 독해 은하 데이터 생성기.

옳은영어 자체 독해 라인 기준:
  READING GRAPHY Level 1~4 (중등) — 지문 36개 = 풀 유닛 12(1·4·7·…) + 축약 24
  옳은 독해 Level 3 (고등)        — 동작구 7개교 시그니처 문항 유닛

PART 테마 6종은 레벨을 가로질러 이어지는 소재 트랙(topics)이 된다.
지문 제목은 실제 지문 연동 전 잠정안이라 confidence='draft'로 표시하고,
샘플로 채운 유닛(r1-u1) 외의 챕터는 pending으로 둔다.
"""
import json, os

THEMES = [
    ("일상과 학교", "Daily Life & School"),
    ("동물과 자연", "Animals & Nature"),
    ("음식과 문화", "Food & Culture"),
    ("과학과 기술", "Science & Technology"),
    ("세계와 장소", "Places & the World"),
    ("인물과 이야기", "People & Stories"),
]

# 레벨별 훈련 초점 — PART objective 문장에 쓰인다
LEVEL_SKILL = {
    "r1": "소재와 핵심어 찾기·지시어 이해·한 줄 해석의 기본기를 세운다",
    "r2": "연결어(because·so·but·then)로 글의 흐름 5구간을 가른다",
    "r3": "주제문 영작과 요약·패러프레이징으로 읽은 것을 제 문장으로 만든다",
    "r4": "추론·비판적 읽기로 고등 독해의 문턱을 넘는다",
}

TITLES = {
    "r1": [
        ["The Bread Bus", "My Robot Alarm Clock", "A Day Without a Phone",
         "The Lost and Found Box", "Lunchtime Heroes", "The Classroom Garden"],
        ["A Cat with a Job", "Why Do Cats Purr?", "The Ant City",
         "Rain for the Desert", "A Tree's Winter Sleep", "Fireflies at Night"],
        ["The First Sandwich", "Rice Around the World", "Why We Eat Birthday Cake",
         "The Colors of Kimchi", "Ice Cream in Winter", "Table Manners in Two Countries"],
        ["Why the Sky Is Blue", "The Magnet in Your Pocket", "Robots That Clean the Sea",
         "How a Pencil Is Made", "The Smallest Computer", "Lights That Talk"],
        ["The Underground City", "A Town on the Water", "The Longest School Trip",
         "The Post Office on the Mountain", "The Island of Bicycles", "A Market That Floats"],
        ["The Boy Who Drew Maps", "A Letter from 1900", "The Kind Giant of the Village",
         "Grandma's Radio", "The New Student's First Day", "The Clockmaker's Secret"],
    ],
    "r2": [
        ["Morning Routines of Athletes", "The School with No Bells", "Pocket Money Lessons",
         "Why We Forget Homework", "The Quiet Corner of the Library", "Club Day Decisions"],
        ["How Birds Find Their Way", "The Octopus Escape Artist", "Seeds That Travel",
         "A River Comes Back to Life", "Bees and Our Breakfast", "The Language of Elephants"],
        ["Noodles on the Silk Road", "The Story of Chocolate", "Fermented Foods Around Us",
         "Why Spicy Food Feels Hot", "School Lunches in Three Countries", "The First Restaurants"],
        ["How Elevators Changed Cities", "The Science of Sneakers", "Batteries Big and Small",
         "Why Ice Floats", "Your Brain on Games", "Machines That Learn"],
        ["The Bridge Between Two Towns", "Desert Cities and Water", "The Old Map That Was Right",
         "Night Markets of Asia", "The Village That Moved", "Streets Without Cars"],
        ["The Girl Who Counted Stars", "An Inventor's Failed Notebook", "The Painter of Tiny Doors",
         "A Coach's Second Chance", "The Voice Behind the Cartoon", "Letters to My Future Self"],
    ],
    "r3": [
        ["The Cost of Convenience", "Habits That Build Themselves", "Why Teens Need More Sleep",
         "The Psychology of Waiting in Line", "Digital Manners", "The Value of Boredom"],
        ["The Return of the Wolves", "Coral Cities in Danger", "How Forests Talk",
         "Animals That Farm", "The Journey of a Raindrop", "Urban Wildlife Neighbors"],
        ["The Hidden Sugar Map", "Food Miles and Your Plate", "The Culture of Sharing Meals",
         "Why Recipes Travel", "The Science of Umami", "Fair Trade on the Table"],
        ["Satellites Above Us", "The Truth About Multitasking", "Vaccines: Training the Body",
         "The Physics of Bridges", "Algorithms in Daily Life", "Energy from the Ocean"],
        ["Cities That Never Sleep", "The Silk Road Today", "Borders Drawn by Rivers",
         "The Museum of Everyday Things", "Rebuilding After the Storm", "Time Zones and Jet Lag"],
        ["The Scientist Who Listened", "A Marathon at Ninety", "The Translator of Silence",
         "The Architect of Paper", "A Chef Who Feeds the City", "The Photographer's Last Roll"],
    ],
    "r4": [
        ["The Attention Economy", "Rethinking Failure", "The Ethics of Small Choices",
         "Why We Follow Trends", "The Power of Routine", "Growing Up Online"],
        ["Keystone Species", "Reading a Forest's Rings", "Invasive Species, Local Problems",
         "The Deep Sea's Quiet Light", "Migration in a Warming World", "What Soil Remembers"],
        ["The Grammar of Taste", "Food Security and the City", "The Invention of the Menu",
         "Culinary Diplomacy", "Salt, Smoke, and Time", "The Future of Protein"],
        ["The Limits of Prediction", "Gene Editing in Plain Words", "The Internet's Physical Body",
         "Noise, Signal, and Data", "The Mathematics of Fairness", "Batteries for a Green Grid"],
        ["The Geography of Innovation", "Cities and Their Rivers", "The Arctic's New Routes",
         "Heritage in the Age of Tourism", "Megacities and Micro-homes", "Maps That Lie"],
        ["The Editor of Memories", "A Physicist's Everyday Questions", "The Cartographer of Sound",
         "Second Careers, First Loves", "The Slow Doctor", "An Astronaut's View of Home"],
    ],
}

# 옳은 독해 Level 3 (고등) — 소재 4계열 × 6지문, 동작구 7개교 시그니처
ORUN_PARTS = [
    ("인문·사회", ["The Paradox of Choice", "Why Rituals Matter", "The Economics of Attention",
                  "Language and Thought", "The Wisdom of Crowds, Reconsidered", "History as Narrative"]),
    ("과학·기술", ["Correlation Is Not Causation", "The Placebo Effect", "Entropy in Everyday Life",
                  "The Bias in the Machine", "Why Replication Matters", "The Half-Life of Facts"]),
    ("환경·생태", ["The Tragedy of the Commons", "Rewilding Debates", "Carbon's Long Journey",
                  "The Myth of Pristine Nature", "Urban Heat Islands", "Biodiversity as Insurance"]),
    ("예술·심리", ["The Uncanny Valley", "Why Sad Music Feels Good", "The Zeigarnik Effect",
                  "Art as Attention Training", "The Paradox of Fiction", "Creativity and Constraint"]),
]

RG_BOOKS = [
    # id, level, base, hot, grades, band, gradeTag
    ("r1", 1, [235, 164, 96], [250, 208, 156], ["g0", "g1"], "예비중1·중1", "중등 독해 입문"),
    ("r2", 2, [226, 132, 64], [248, 182, 124], ["g1", "g2"], "중1·중2", "중등 독해 기본"),
    ("r3", 3, [206, 94, 60], [240, 152, 112], ["g2", "g3"], "중2·중3", "중등 독해 실력"),
    ("r4", 4, [170, 66, 52], [228, 122, 98], ["g3"], "중3·예비고1", "중등 독해 완성"),
]

# ── 샘플 유닛 r1-u1 · The Bread Bus ───────────────────────────────────
# 지문(자체 제작): 11문장 · 약 100단어 · 소개→쓰임→과거→문제→해결→마무리
SAMPLE_ITEMS = {
    "r1-u1": {
        "summary": "빵집이 된 낡은 스쿨버스 이야기 — 풀 유닛(독해 4문항 + READ RIGHT 5단계 + RE:RIGHT 워크북). "
                   "소재: 버스, 핵심어: bus·bakery·morning, 지시어 It(버스)·He(Mr. Park)의 대상 전환을 훈련한다.",
        "keyPoints": [
            "주제문: An old school bus became a new bakery in Minho's town.",
            "흐름 5구간: [A] 특별한 버스 소개 → [B] 지금의 쓰임(아침 빵집) → [C] 과거(통학 버스) → [D] 문제(낡아서 버려질 뻔) → [E] 해결과 마무리(Mr. Park의 개조).",
            "지시어: It(= the bus, 사물), He(= Mr. Park, 사람) — 가리키는 대상이 바뀌는 자리를 놓치지 않는다.",
            "판별 연결어: now(현재), Long ago(과거), so(결과), But(반전), Then(순서).",
            "핵심 어휘: carry 나르다 · bakery 빵집 · sell 팔다 · throw away 버리다 · oven 오븐.",
        ],
    },
}

PASSAGE_SRC = "READING GRAPHY Level 1 · UNIT 01 The Bread Bus"

WS = {
    "r1-u1": {
        "source": PASSAGE_SRC,
        "baekji": {
            "chapter": "PART 1 일상과 학교 · UNIT 1 The Bread Bus",
            "sections": [
                {"no": 1, "label": "STEP 1. 핵심 파악",
                 "instruction": "지문을 덮고, 글의 뼈대를 다시 세우시오.",
                 "kind": "skeleton-fill",
                 "rows": [
                     {"prompt": "이 글의 소재(무엇에 관한 글인가)를 우리말로 쓰시오.", "lines": 1,
                      "answer": "빵집이 된 낡은 (스쿨)버스",
                      "why": "글 전체가 한 대의 버스가 무엇이 되었는지를 따라간다."},
                     {"prompt": "핵심어 3개를 영어로 쓰시오.  ① b______  ② b______  ③ m______", "lines": 1,
                      "answer": "① bus  ② bakery  ③ morning",
                      "why": "핵심어는 자주 나온 말이 아니라 주제문을 이루는 말이다."},
                     {"prompt": "주제문을 완성하시오.  An old school bus ____________ a new ____________ in Minho's town.",
                      "lines": 1, "answer": "became / bakery",
                      "why": "‘낡은 스쿨버스가 새 빵집이 되었다’ — 글의 처음과 끝을 잇는 한 문장이다."},
                     {"prompt": "버스가 매일 아침 멈추는 곳은 어디인지 우리말로 쓰시오.", "lines": 1,
                      "answer": "학교 근처",
                      "why": "Every morning, the bus stops near the school."},
                 ]},
                {"no": 2, "label": "STEP 2. 흐름·구조",
                 "instruction": "글의 흐름 5구간 [A]~[E]를 떠올리며, 각 구간의 역할을 채우시오.",
                 "kind": "compare-contrast",
                 "rows": [
                     {"prompt": "[A] 특별한 버스 소개 → [B] ______________ → [C] 과거의 쓰임", "lines": 1,
                      "answer": "지금의 쓰임(아침마다 빵과 우유를 파는 빵집)",
                      "why": "now가 붙은 문장들이 [B] 구간이다."},
                     {"prompt": "[C] 구간이 과거 이야기로 바뀌는 신호가 되는 표현을 지문에서 찾아 쓰시오.", "lines": 1,
                      "answer": "Long ago",
                      "why": "시간 연결어가 구간의 경계를 만든다."},
                     {"prompt": "[D] 문제 → [E] 해결로 흐름을 뒤집는 접속사 한 단어를 쓰시오.", "lines": 1,
                      "answer": "But",
                      "why": "‘버리려 했다 → 그러나 Mr. Park에게 더 좋은 생각이 있었다’의 반전이다."},
                 ]},
                {"no": 3, "label": "STEP 3. 세부 확인",
                 "instruction": "본문과 다르게 말한 부분을 찾아 바르게 고치고, 근거 문장을 쓰시오.",
                 "kind": "error-explain",
                 "rows": [
                     {"prompt": "Mr. Park sells cold juice at the bus every morning.", "lines": 2,
                      "answer": "cold juice → warm bread and milk",
                      "why": "The baker, Mr. Park, sells warm bread and milk."},
                     {"prompt": "The town painted the old bus yellow.", "lines": 2,
                      "answer": "The town → Mr. Park (He)",
                      "why": "He cleaned the old bus and painted it yellow — 개조한 사람은 Mr. Park이다."},
                     {"prompt": "The bus still carries children to school.", "lines": 2,
                      "answer": "still carries → does not carry (now)",
                      "why": "It does not carry people now — 지금은 사람을 태우지 않는다."},
                 ]},
            ],
        },
        "popquiz": {
            "chapter": "PART 1 일상과 학교 · UNIT 1 The Bread Bus",
            "questions": [
                {"no": 1, "groupHeader": "",
                 "kind": "mc-plain", "stem": "이 글의 제목으로 가장 알맞은 것은?",
                 "boxed": False, "bank": [],
                 "choices": ["An Old Bus Starts a New Morning",
                              "How to Bake Warm Bread",
                              "The Fastest School Bus in Town",
                              "Mr. Park's First Day at School",
                              "Why Students Love Milk"], "bullets": []},
                {"no": 2, "groupHeader": "",
                 "kind": "mc-plain", "stem": "이 글의 내용과 일치하지 <u>않는</u> 것은?",
                 "boxed": False, "bank": [],
                 "choices": ["버스는 지금 사람을 태우지 않는다.",
                              "버스는 매일 아침 학교 근처에 선다.",
                              "Mr. Park은 빵과 우유를 판다.",
                              "마을은 처음부터 버스를 빵집으로 만들 계획이었다.",
                              "버스 안에는 작은 오븐이 있다."], "bullets": []},
                {"no": 3, "groupHeader": "",
                 "kind": "mc-boxed",
                 "stem": "밑줄 친 <u>It</u>이 가리키는 것은?<br>It became old, so the town wanted to throw it away.",
                 "boxed": True, "bank": [],
                 "choices": ["the bus", "the school", "the town", "the oven", "the bread"], "bullets": []},
                {"no": 4, "groupHeader": "[4-6] 본문의 내용과 일치하면 T, 다르면 F를 고르시오.",
                 "kind": "paren-choice",
                 "stem": "Long ago, the bus carried children to school.  ( T / F )",
                 "boxed": False, "bank": [], "choices": [], "bullets": []},
                {"no": 5, "groupHeader": "", "kind": "paren-choice",
                 "stem": "Mr. Park painted the bus green.  ( T / F )",
                 "boxed": False, "bank": [], "choices": [], "bullets": []},
                {"no": 6, "groupHeader": "", "kind": "paren-choice",
                 "stem": "Students love the sweet smell of the bread.  ( T / F )",
                 "boxed": False, "bank": [], "choices": [], "bullets": []},
                {"no": 7, "groupHeader": "[7-8] <보기>에서 알맞은 말을 골라 본문 요약의 빈칸을 채우시오.",
                 "kind": "fill-from-bank",
                 "stem": "The old bus became a small ____________ on wheels.",
                 "boxed": False, "bank": ["bakery", "oven", "morning"], "choices": [], "bullets": []},
                {"no": 8, "groupHeader": "", "kind": "fill-from-bank",
                 "stem": "Mr. Park put a small ____________ inside the bus.",
                 "boxed": False, "bank": [], "choices": [], "bullets": []},
                {"no": 9, "groupHeader": "",
                 "kind": "mc-plain", "stem": "글의 흐름상, 일이 일어난 순서로 알맞은 것은?",
                 "boxed": False, "bank": [],
                 "bullets": ["(A) Mr. Park cleaned and painted the bus.",
                              "(B) The bus carried children to school.",
                              "(C) The town wanted to throw the bus away.",
                              "(D) The bus sells warm bread near the school."],
                 "choices": ["(B) – (C) – (A) – (D)", "(A) – (B) – (C) – (D)",
                              "(B) – (A) – (C) – (D)", "(C) – (B) – (D) – (A)",
                              "(D) – (C) – (B) – (A)"]},
                {"no": 10, "groupHeader": "",
                 "kind": "find-error",
                 "stem": "다음 단어를 바르게 배열하여 이 글의 주제문을 완성하시오.<br><보기> became / an old school bus / a new bakery / in Minho's town",
                 "boxed": False, "bank": [], "choices": [], "bullets": []},
            ],
            "answerKey": [
                {"no": 1, "answer": "①", "why": "마지막 문장 the old bus starts a new morning이 글 전체를 요약한다 — 낡은 버스의 새 출발."},
                {"no": 2, "answer": "④", "why": "마을은 버스를 버리려(throw it away) 했고, 빵집으로 만든 것은 Mr. Park의 생각이었다."},
                {"no": 3, "answer": "①", "why": "낡아져서 버려질 뻔한 것 — 앞 문장들의 the (old) bus를 가리킨다."},
                {"no": 4, "answer": "T", "why": "Long ago, the bus carried children to school."},
                {"no": 5, "answer": "F", "why": "painted it yellow — 초록색이 아니라 노란색이다."},
                {"no": 6, "answer": "T", "why": "Students love the sweet smell."},
                {"no": 7, "answer": "bakery", "why": "It is a small bakery on wheels."},
                {"no": 8, "answer": "oven", "why": "Then he put a small oven inside."},
                {"no": 9, "answer": "①", "why": "통학 버스(B) → 버려질 뻔(C) → 개조(A) → 지금의 빵집(D) 순서다."},
                {"no": 10, "answer": "An old school bus became a new bakery in Minho's town.",
                 "why": "주어(An old school bus)+동사(became)+보어(a new bakery)+장소(in Minho's town) 순서로 배열한다."},
            ],
        },
    },
}


def rg_chapters(bid):
    """READING GRAPHY 한 권 — 6 PART × 6 UNIT, 유닛 1·4·7·…은 풀 유닛."""
    chapters = []
    unit_no = 0
    for pi, (kr, en) in enumerate(THEMES, 1):
        items = []
        for k in range(6):
            unit_no += 1
            iid = "%s-u%d" % (bid, unit_no)
            full = (unit_no - 1) % 3 == 0
            sample = SAMPLE_ITEMS.get(iid)
            it = {
                "id": iid, "unitNo": unit_no,
                "title": TITLES[bid][pi - 1][k],
                "summary": sample["summary"] if sample else "",
            }
            if sample:
                it["keyPoints"] = sample["keyPoints"]
            elif full:
                it["summary"] = ""
            items.append(it)
        has_sample = any(i["id"] in SAMPLE_ITEMS for i in items)
        ch = {
            "no": pi, "title": kr, "titleEn": en,
            "pending": not has_sample,
            "objective": "%s 소재의 지문 6편(풀 유닛 2 + 축약 4)으로 %s." % (kr, LEVEL_SKILL[bid]),
            "items": items,
        }
        if has_sample:
            ch["bigIdea"] = ("풀 유닛(1·4번)은 독해 4문항 + READ RIGHT 5단계 + RE:RIGHT 워크북 7종, "
                             "축약 유닛은 독해 + 구문 + 한 줄 해석 + STEP 1 + 워크북 R1·R2로 돈다.")
        chapters.append(ch)
    return chapters


def build():
    books = []
    for rank, (bid, lv, base, hot, grades, band, gtag) in enumerate(RG_BOOKS, 1):
        books.append({
            "id": bid,
            "short": "READING GRAPHY %d" % lv,
            "chip": "GRAPHY %d" % lv,
            "title": "READING GRAPHY Level %d" % lv,
            "publisher": "ORUN ENGLISH 어학연구소",
            "band": band, "grades": grades, "gradeTag": gtag,
            "desc": "지문 36편 — 풀 유닛 12(지문 1·4·7·…) + 축약 유닛 24. 5단계 READ RIGHT 훈련과 RE:RIGHT 워크북으로 도는 중등 독해 교재.",
            "unitWord": "UNIT",
            "confidence": "draft",
            "basis": "유닛 수·풀/축약 구성은 교재 사양 확정, 지문 제목은 실제 지문 연동 전 잠정안입니다.",
            "current": {"rank": rank, "of": 5, "base": base, "hot": hot},
            "cover": {"motif": "rg", "lines": ["READING", "GRAPHY"], "vol": "LEVEL %d" % lv, "big": str(lv)},
            "chapters": rg_chapters(bid),
        })

    # 옳은 독해 Level 3 (고등)
    ro_chapters = []
    unit_no = 0
    for pi, (kr, titles) in enumerate(ORUN_PARTS, 1):
        items = []
        for t in titles:
            unit_no += 1
            items.append({"id": "ro-u%d" % unit_no, "unitNo": unit_no, "title": t, "summary": ""})
        ro_chapters.append({
            "no": pi, "title": kr, "titleEn": "",
            "pending": True,
            "objective": "%s 계열 고등 지문 6편 — 독해 4문항 + 5단계 훈련 + 동작구 7개교 시그니처 문항으로 내신 실전을 돈다." % kr,
            "items": items,
        })
    books.append({
        "id": "ro",
        "short": "옳은 독해 3",
        "chip": "옳은 독해",
        "title": "옳은 독해 Level 3",
        "publisher": "ORUN ENGLISH 어학연구소",
        "band": "고등 내신·수능", "grades": ["gh"], "gradeTag": "동작구 시그니처",
        "desc": "고등 지문(150단어 내외) 한 편으로 독해 4문항 + 어휘·구문·직독직해 + 독해력 5단계 훈련 + 동작구 7개 고등학교 시그니처 문항까지 도는 실전 유닛.",
        "unitWord": "UNIT",
        "confidence": "draft",
        "basis": "유닛 구성(14면 체제)은 교재 사양 확정, 지문 제목은 실제 지문 연동 전 잠정안입니다.",
        "current": {"rank": 5, "of": 5, "base": [150, 44, 80], "hot": [224, 116, 156]},
        "cover": {"motif": "bar", "lines": ["옳은 독해", "ORUN READING"], "vol": "LEVEL 3"},
        "chapters": ro_chapters,
    })

    topics = [{"id": "th%d" % (i + 1),
               "label": "소재 트랙 · " + kr,
               "chapters": [[b[0], i + 1] for b in RG_BOOKS]}
              for i, (kr, en) in enumerate(THEMES)]

    total_units = sum(len(c["items"]) for b in books for c in b["chapters"])
    total_parts = sum(len(b["chapters"]) for b in books)
    done_parts = sum(1 for b in books for c in b["chapters"] if not c["pending"])

    data = {
        "meta": {
            "series": "READING GRAPHY · 옳은 독해 READING SERIES",
            "publisher": "ORUN ENGLISH 어학연구소",
            "academy": "옳은영어 ORUN ENGLISH",
            "chaptersDone": done_parts, "chaptersTotal": total_parts,
            "sheetUnits": len(WS), "unitsTotal": total_units,
            "track": {
                "recall": "READ RIGHT", "check": "READING CHECK",
                "vol": "READING GRAPHY BOOK", "volTitle": ["READING", "GRAPHY"],
                "recallF": "ReadRight", "checkF": "ReadingCheck",
                "per": "유닛", "unit": "UNIT",
                "chWord": "PART",
                "hint": "지문을 덮고, 글의 뼈대를 떠올리며 빈칸을 채워보세요.",
                "bj": [
                    {"kind": "skeleton-fill", "en": "READ RIGHT", "kr": "핵심 파악"},
                    {"kind": "compare-contrast", "en": "FLOW RIGHT", "kr": "흐름·구조"},
                    {"kind": "error-explain", "en": "CHECK RIGHT", "kr": "세부 확인"},
                ],
            },
            "academyApp": "ORUN NEXUS UNIVERSE",
        },
        "books": books,
        "topics": topics,
        "worksheets": WS,
        "rankTotal": 5,
        "grades": [
            {"id": "g0", "label": "예비중1"},
            {"id": "g1", "label": "중1"},
            {"id": "g2", "label": "중2"},
            {"id": "g3", "label": "중3"},
            {"id": "gh", "label": "고등"},
        ],
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reading.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("reading.json:", os.path.getsize(out), "bytes ·", len(books), "books ·",
          total_units, "units ·", total_parts, "parts ·", len(WS), "sheets")


if __name__ == "__main__":
    build()
