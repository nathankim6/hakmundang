/**
 * 분석지·설명회 덱의 모든 문구.
 *
 * 웹(AnalysisReport, SchoolPicker, Schools)과 PPT(deck.ts)가 같은 파일을 읽는다.
 * 여기 없는 문장은 화면에 나오지 않는다.
 *
 * 말투 원칙
 *  - 학부모에게는 정중하게, 학생에게는 가볍게. 둘이 같이 읽는 글이라 '해요체'를 기본으로.
 *  - 제목은 명사로 끝낸다. 설명은 한 문장에 하나만 말한다.
 *  - 줄표(—)와 가운뎃점(·)을 제목에 쓰지 않는다. 쉼표와 줄바꿈으로 푼다.
 *  - 영문 아이브로우는 브랜드 장치. 짧고 구어적으로.
 */

import type { IconName } from "@/assets/art";

export const YEAR = "2027학년도";

export const APP = {
  brand: "ORUN ENGLISH",
  eyebrow: "옳은영어 학교 분석지",
  title: "우리 동네 학교, 시험지로 읽었습니다",
  lede: "학교를 고르기 전에 그 학교 시험지를 먼저 봐야 해요. 공시 숫자 위에 옳은영어가 올해 직접 풀어본 시험을 얹어 한 권으로 묶었습니다.",
  generatorLink: "문항 생성기로",
  tabs: {
    pick: "학교 고르기",
    report: "분석지",
    calc: "1등급 계산기",
    edit: "우리가 본 기록",
  },
  calc: {
    en: "SEATS, LIVE",
    title: "1등급은 딱 몇 자리인가",
    lede: "설명회 자리에서 숫자를 직접 넣어 보여주는 화면이에요. 공통과목과 선택과목의 분모가 다르다는 걸 눈으로 확인하는 게 목적입니다.",
  },
  empty: {
    text: "아직 고른 학교가 없어요.",
    cta: "학교 고르러 가기",
  },
  edit: {
    en: "WHAT WE SAW",
    title: "우리가 본 것, 여기 적어 둬요",
    lede: "공시엔 없는 얘기예요. 올해 적어 두면 내년 설명회 준비가 반으로 줄어요.",
  },
  stats: {
    fact: (n: number) => `학교알리미 공시 ${n}곳`,
    seen: (n: number) => `시험지를 직접 본 ${n}곳`,
    news: (n: number) => `학교 소식 ${n}곳`,
  },
  steps: [
    { icon: "school", title: "학교 고르기", text: "동네 학교를 고르면 공시 숫자는 알아서 채워져요." },
    { icon: "paper", title: "분석지 읽기", text: "그 위에 올해 시험지와 학교 소식을 얹어 한 권으로 묶어요." },
    { icon: "slides", title: "PPT로 내보내기", text: "설명회 슬라이드가 그대로 나와요. 글자도 그림도 다 고칠 수 있어요." },
  ] as { icon: IconName; title: string; text: string }[],
  theme: { toDark: "어둡게 보기", toLight: "밝게 보기" },
};

export const PICKER = {
  en: "PICK YOUR SCHOOLS",
  title: "오늘 볼 학교를 골라 주세요",
  hint: "한 곳이든 열 곳이든, 고른 만큼만 분석지가 만들어져요.",
  search: "학교 이름으로 찾기",
  filterSourced: "자료 있는 학교만",
  selectAll: "보이는 학교 다 담기",
  clearVisible: "담은 것 다 빼기",
  emptyGroup: "이 범위엔 학교가 없어요. 위에서 범위를 하나 더 켜 보세요.",
  badgeObs: "우리 기록",
  badgeSourced: "2026 분석",
  badgeNews: "학교 소식",
  badgeAchieve: "성취도 3년",
  footer: (n: number) => `고른 학교 ${n}곳`,
  footerDetail: (deep: number, light: number) => `자세히 ${deep}곳, 요약 ${light}곳`,
  cta: "분석지 만들기",
  g1: (n: number) => `1학년 ${n}명`,
};

export const TOOLBAR = {
  back: "학교 다시 고르기",
  count: (n: number) => `${n}곳 분석지`,
  ppt: "PPT로 내보내기",
  pptBusy: "만드는 중",
  pptFailed: "PPT를 못 만들었어요. 한 번 더 눌러 주세요.",
  print: "인쇄·PDF",
};

export const COVER = {
  eyebrow: "옳은영어 학교 분석지",
  high: {
    title: ["학교를 고른다는 건", "3년치 시험지를 고르는 일"],
    lede: (year: string) =>
      `${year} 예비고1. 공시 숫자에, 옳은영어가 올해 직접 풀어본 시험지를 얹었어요. 어디까지가 사실이고 어디부터가 우리 생각인지 표시해 두었습니다.`,
  },
  mid: {
    title: ["중학교 3년이", "고등학교를 정합니다"],
    lede: (year: string) =>
      `${year} 예비중1. 이 중학교를 나온 선배들이 어느 고등학교로 갔는지부터 봅니다. 그 다음이 영어 수업이에요.`,
  },
  footer: "옳은영어 ORUN ENGLISH, 정확한 분석 옳은 방향",
};

export const SECTION = {
  numbers: {
    en: "READ THE NUMBERS",
    ko: "1등급 몇 명? 그 전에 분모부터",
    lede: "설명회는 여기서 시작해요. 같은 숫자도 어떤 분모 위에 올리느냐에 따라 전혀 다른 얘기가 됩니다.",
  },
  compare: {
    en: "SIDE BY SIDE",
    ko: "한 표로 보는 학교 스펙",
    lede: "학부모님이 제일 먼저 물어보는 것만 골랐어요. 학교알리미 공시 그대로이고 저희가 손대지 않았습니다.",
    subHigh: "고등학교",
    subMid: "중학교",
    howTo: "이 표 읽는 법",
    howToText:
      "1등급 자리는 1학년 인원의 상위 10%, 소수점은 버려요. 중학교는 석차등급이 없어 이 칸이 없습니다. 전출은 1학년 중 다른 학교로 옮긴 비율이고, 맨 오른쪽 진학 수치는 직전 졸업생 기준이라 지금 1학년과는 3년 시차가 있어요.",
    anomaly: "공시값 한 번 더 확인",
    anomalyText:
      "표에 * 가 붙은 학교예요. 전년과 차이가 커서 학교 입력 오류일 수 있습니다. 발표 자료에 쓰기 전에 학교알리미 원문을 열어 보세요.",
  },
  achieve: {
    en: "GRADES ON PAPER",
    ko: "국영수 성취도, 3년을 겹쳐 보면",
    lede: "학교알리미가 공시한 과목별 성취도 분포예요. A(90점 이상) 인원과 1등급 자리를 맞대 보면 이 학교 1등급 컷이 90점 위인지 아래인지가 보입니다.",
    ledeMid: "중학교는 등급이 없어 성취도 A~E만 남아요. A 비율과 평균으로 시험의 성격을 읽습니다.",
    subHigh: (g: number, y: number) => `고${g}, ${y}학년도 기준`,
    subMid: (g: number, y: number) => `중${g}, ${y}학년도 기준`,
    cols: { school: "학교", n: "수강자", seats: "1등급 자리", a: (s: string) => `${s} A 비율`, avg: "평균(국/영/수)", verdict: "1등급 컷" },
    above: "90점 위",
    below: "90점 아래",
    aCount: (n: number) => `${n}명`,
    legend: "A 인원이 1등급 자리보다 많으면 90점을 넘겨도 1등급이 아닐 수 있어요. 노란 선이 1등급 자리(5등급제 10%, 9등급제 4%)입니다.",
    dist: "성취도 분포",
    years: "학년도",
    trendUp: (a: number, b: number) => `3년 사이 A 비율이 ${a.toFixed(1)}%에서 ${b.toFixed(1)}%로 올랐어요. 상위권이 두꺼워지는 추세예요.`,
    trendDown: (a: number, b: number) => `3년 사이 A 비율이 ${a.toFixed(1)}%에서 ${b.toFixed(1)}%로 내려왔어요. 시험이 어려워지거나 상위권이 얇아진 거예요.`,
    trendFlat: (a: number) => `3년 동안 A 비율이 ${a.toFixed(1)}% 안팎으로 안정적이에요.`,
    keySubject: (s: string, a: number) => `국영수 중 ${s} A 비율이 가장 낮아요(${a.toFixed(1)}%). 이 학교에선 ${s}가 등급을 가릅니다.`,
    fitTitle: "이런 학생이 가면 좋아요",
    cautionTitle: "이건 알고 가세요",
    fitNote: "공시 숫자에서 읽어낸 옳은영어의 생각이에요. 학교가 발표한 해석이 아닙니다.",
    source: (years: string) => `출처: 학교알리미 교과별 학업성취 사항, ${years} 공시`,
    empty: {
      title: "아직 성취도 자료가 없어요",
      text: "학교알리미는 이 항목을 API로 주지 않고, 화면은 자동수집을 막아 둬서 사람이 받아야 해요. 받은 엑셀을 '우리가 본 기록' 탭에서 불러오면 이 자리가 채워집니다.",
      steps: [
        "학교알리미(schoolinfo.go.kr)에서 학교를 검색해 들어가요.",
        "공시항목 중 '4-나. 교과별 학업성취 사항'을 열고 숫자(보안문자)를 입력해요.",
        "연도를 2026, 2025, 2024로 바꾸며 '엑셀다운로드'를 세 번 받아요.",
        "'우리가 본 기록' 탭의 성취도 불러오기에 파일을 한 번에 끌어다 놓아요.",
      ],
    },
    partial: (names: string) => `${names}는 아직 성취도 자료가 없어요. 엑셀을 불러오면 함께 비교됩니다.`,
  },
  exam2026: {
    en: "THIS YEAR'S PAPER",
    ko: "올해 시험지, 이렇게 나왔다",
    lede: "옳은영어 강사진이 시험지를 펴 놓고 쓴 학교별 리포트예요. 컷은 학교가 발표한 값이 아니라 우리 학생 성적표와 강사 추정으로 잡았습니다.",
    subHigh: "고1 기준",
    subMid: "중3 기준, 없으면 중2",
    foot: "학교별 상세는 아래 학교 페이지에 중간·기말 카드로 실었어요. 출처는 카드마다 붙어 있습니다.",
    cols: { school: "학교", mid: "중간고사", fin: "기말고사", cut: "1등급 컷", oneLiner: "한 줄로" },
  },
  seats: {
    en: "SEATS",
    ko: "1등급은 딱 몇 자리인가",
    lede: "5등급제에서 1등급은 상위 10%예요. 학교가 크면 자리도 늘지만 경쟁자도 같이 늘어납니다.",
    unit: "자리",
    callout: "꼭 알아두실 것",
    calloutA:
      "이 숫자는 공통과목에서만 맞아요. 석차등급은 학년 정원이 아니라 그 과목을 고른 사람 수로 매겨집니다. 수강자가 30명이면 1등급은 3명, 15명이면 1명이에요.",
    calloutB:
      "상위 10% 안이어야 하니 소수점은 버립니다. 167명이면 16자리, 170명이면 17자리. 수강자가 10명 미만이면 1등급 자리가 없어요. 고교학점제에선 어떤 과목을 고르느냐가 등급을 바꿉니다.",
  },
  paths: {
    en: "WHERE THEY WENT",
    ko: "이 중학교 졸업생은 어디로 갔을까",
    lede: "중학교 성적은 대입에 들어가지 않아요. 대신 어느 고등학교로 가느냐가 그 다음 3년을 바꿉니다.",
    grads: (n: number, year: string) => `졸업생 ${n}명, ${year}년 공시`,
    specialDetail: "특목고 안을 열어 보면",
    callout: "이 숫자 읽는 법",
    calloutA:
      "서울 중학교는 사는 곳 학교군 안에서 추첨이에요. 그래서 이건 좋은 중학교 순위표가 아니라, 우리 동네 아이들이 실제로 어디로 흘러가는지 보여주는 지도입니다.",
    calloutB:
      "특목고 비율이 높다고 그 중학교가 더 좋은 건 아니에요. 다만 외고·국제고를 생각한다면 중2부터 준비해야 하고, 그 출발은 영어입니다.",
  },
  midEnglish: {
    en: "ENGLISH CLASS",
    ko: "영어 수업은 어떻게 돌아가나",
    lede: "중학교엔 등급이 없고 성취도 A~E만 남아요. 그래서 '몇 등급'보다 '어떻게 배우나'가 남는 정보입니다.",
    cols: { school: "학교", perClass: "학급당", weekly: "주당 시수", leveled: "수준별 수업", subjectRoom: "교과교실제", after: "방과후 참여" },
    on: "운영",
    off: "미운영",
    callout: "수준별 수업이 뭔가요",
    calloutOn: (names: string) =>
      `영어·수학을 실력에 따라 반을 나눠 가르치는 방식이에요. 고른 학교 중 ${names}가 운영합니다. 상위반에 들어가려면 1학년 첫 시험이 중요해요. 한 번 갈린 반은 잘 안 바뀝니다.`,
    calloutOff: "영어·수학을 실력에 따라 반을 나눠 가르치는 방식이에요. 고른 학교 중엔 운영하는 곳이 없어 전체가 같은 진도로 배웁니다.",
  },
  results: {
    en: "SCOREBOARD",
    ko: "옳은영어 성적표",
    lede: "2026년 1학기 기말고사 기준이에요. 아래 두 지표는 분모가 달라 따로 실었고, 서로 비교하는 숫자가 아닙니다.",
    enrolledSub: "분모는 옳은영어 재원생 수",
    schoolTopSub: "분모는 그 학교 전체 1등급 인원",
    foot: "옳은영어 재원생 자체 집계",
  },
  school: {
    en: "ZOOM IN",
    ko: "학교 하나씩 들여다보기",
    ledeSeen: (seen: number, total: number) =>
      seen === total
        ? `저희가 직접 시험지를 본 ${total}곳이에요. 공시로는 안 보이는 부분입니다.`
        : `직접 시험지를 본 ${seen}곳을 포함해 ${total}곳이에요. 공시로는 안 보이는 부분입니다.`,
    ledeNewsOnly: (total: number) => `${total}곳을 학교 밖 공개 자료로 봅니다. 홈페이지, 언론, 학교알리미 문서에서 옮겼어요.`,
  },
};

export const BLOCK = {
  character: { en: "THE SCHOOL", ko: "한 줄 소개" },
  subjects: { en: "WHAT'S HARD", ko: "과목별 난이도" },
  scope: { en: "ON THE TEST", ko: "시험 범위, 어디서 나왔나" },
  scopeMid: { en: "ON THE TEST", ko: "시험 범위, 어디서 나왔나 (중3 기준)" },
  cutoff: { en: "CUT LINE", ko: "1등급 커트라인" },
  cutoffNote: (basis: string) => `${basis}. 우리 학생들 성적표로 잡은 값이고 학교가 발표한 숫자가 아니에요.`,
  middleReport: { en: "ON THE REPORT", ko: "성적표에 남는 것" },
  middleReportNote: "우리 학생들 성적표로 잡은 값이고 학교가 발표한 숫자가 아니에요.",
  freeSemester: "지필평가 없는 학기",
  features: { en: "HOW THEY TEST", ko: "이 학교 시험의 습관" },
  signature: { en: "SIGNATURE", ko: "여기서만 나오는 문제" },
  signatureMake: "바로 뽑기",
  fit: { en: "WHO FITS", ko: "이런 학생에게 맞는 학교" },
  fitNote: "이 판단은 옳은영어의 생각이고 공시된 사실이 아니에요.",
  exam2026: { en: "THIS YEAR", ko: "올해 시험지 리포트", tag: "2026 1학기" },
  examGrade: (level: string, g: number) => `${level}${g}`,
  results: { en: "PROOF", ko: "이 학교에서 낸 결과", tag: "2026 실적" },
  insights: { en: "FROM THE STAGE", ko: "강사진이 짚은 포인트", tag: "LIVE, 블로그" },
  tmi: { en: "TMI", ko: "선배들의 TMI", tag: "재원생 선배" },
  tmiNote: "옳은영어 재원생 선배들이 직접 써 준 답을 설명회에서 소개한 것. 유튜브 LIVE 2025.11.16",
  news: { en: "FROM OUTSIDE", ko: "학교 밖에서 확인한 것", tag: "학교·언론 공개 자료" },
  newsNote: (home: string | undefined, date: string) =>
    `${home ? `학교 홈페이지 ${home}, ` : ""}조사일 ${date}. 노란 점은 1차 출처, 회색 점은 2차 출처예요.`,
  stats: { g1: "1학년", classes: "1학년 학급", perClass: "학급당", seats: "1등급 자리", coed: "남 : 여", aRatio: "영어 성취도 A", ratio: "지필 : 수행", textbook: "교과서" },
};

export const TAG = {
  fact: "공시 자료",
  obs: "우리가 본 것",
  view: "우리 생각",
  sourced: "출처 있는 자료",
};

export const NUMBERS = {
  cards: "2026년 1학기, 숫자로",
  posterNote: "포스터의 이름은 원문대로 가려져 있어요. 옳은영어 블로그에 공개된 자료를 그대로 옮겼습니다.",
  posterCaptions: [
    "2026 1학기 중간고사 결과. 흑석고1 학교 1등급의 35%, 수도여고1 재원생 30%, 영등포고1 40%, 숭의여고1 33%",
    "2026 1학기 기말고사 전 과목 1등급. 흑석고1 3명, 영등포고1 1명",
    "2026 1학기 기말고사 고등부 성적 우수자. 90점 이상 및 1등급",
  ],
  posterSource: "포스터 원문",
};

export const FOOTER = {
  left: "옳은영어 ORUN ENGLISH",
  sources: "출처: 학교알리미 2026년 공시, 진로현황 2025년 공시, 옳은영어 블로그 2026년 1학기 분석, 유튜브 LIVE 2025.11.16, 각 학교 홈페이지",
};

/* ── 덱 전용 ─────────────────────────────── */

export const DECK = {
  fileName: (stamp: string) => `옳은영어_학교분석_${stamp}.pptx`,
  author: "옳은영어 ORUN ENGLISH",
  cover: {
    eyebrow: "옳은영어 학교 분석지",
    subHigh: (year: string) => `${year} 예비고1을 위한 학교별 내신 리포트`,
    subMid: (year: string) => `${year} 예비중1을 위한 학교별 리포트`,
    footer: "옳은영어 ORUN ENGLISH, 정확한 분석 옳은 방향",
    note: (n: number) =>
      `[템플릿 사용법] 표지. 학교 목록은 담은 순서 그대로 들어가요.\n\n[발표 스크립트] 오늘은 ${n}개 학교를 함께 봅니다. 공시가 말해 주는 것과 저희가 시험지에서 본 것을 나눠서 말씀드릴게요.`,
  },
  title: (year: string) => `${year} 옳은영어 학교 분석지`,
  sectionNote: (heading: string, summary: string) => `[템플릿 사용법] 섹션 표지. 큰 숫자는 순번이에요. 그림은 벡터라 색과 크기를 바꿀 수 있어요.\n\n[발표 스크립트] ${heading}. ${summary}`,
  toc: { en: "TODAY", title: "오늘 볼 학교", count: (n: number) => `${n}곳`, note: "[발표 스크립트] 순서대로 한 학교씩 봅니다." },
  sections: {
    numbers: { title: "1등급 몇 명? 그 전에 분모부터", summary: "같은 숫자도 어떤 분모 위에 올리느냐에 따라 전혀 다른 얘기가 돼요." },
    compare: { title: "한 표로 보는 학교 스펙", summary: "학교알리미 공시를 그대로 옮긴 표예요. 저희 해석은 아직 안 들어갔습니다." },
    exam2026: { title: "올해 시험지, 이렇게 나왔다", summary: "강사진이 시험지를 펴 놓고 쓴 학교별 리포트. 중간과 기말이 어떻게 달랐는지까지." },
    seats: { title: "1등급은 딱 몇 자리인가", summary: "상위 10%가 몇 명인지부터 세어 봅니다. 분모가 무엇인지가 전부예요." },
    paths: { title: "이 중학교 졸업생은 어디로 갔을까", summary: "서울 중학교는 학교군 추첨. 순위표가 아니라 지도로 보셔야 해요." },
    school: { title: "학교 하나씩 들여다보기" },
  },
  numbers: {
    en: "READ THE NUMBERS",
    title: "1등급 몇 명? 그 전에 분모부터",
    sub: "같은 숫자도 어떤 분모 위에 올리느냐에 따라 전혀 다른 얘기가 돼요",
    note: "[템플릿 사용법] 오프닝. 학원 자랑보다 숫자 읽는 법을 먼저 드려요.\n\n[발표 스크립트] 100명 중 10명이 1등급인 학원과, 다섯 명 중 한 명이 1등급인 학원. 어느 쪽이 잘 가르치는 곳일까요.",
  },
  orunResults: {
    en: "SCOREBOARD, 2026 1학기",
    title: "2026년 1학기, 옳은영어 성적표",
    posterCaption: "옳은영어 블로그 2026.05.15 게시 포스터",
    foot: "학교 1등급 중 비율과 재원생 중 비율은 분모가 달라요. 옳은영어 블로그 성적우수자 발표 기준",
    note: "[발표 스크립트] 전 과목 1등급 4명, 전교 1등 2명. 포스터에 있는 그대로예요.",
  },
  compare: {
    en: "SIDE BY SIDE",
    title: "한 표로 보는 학교 스펙",
    part: (i: number, n: number) => `한 표로 보는 학교 스펙 (${i}/${n})`,
    subHigh: "전부 공시 자료 그대로, 저희가 손대지 않았어요",
    subMid: "중학교는 석차등급이 없어 1등급 자리 칸이 없어요",
    foot: "1등급 자리는 1학년 인원의 상위 10%, 소수점은 버려요. 진학 수치는 작년 졸업생 기준",
    footNoGrad: (names: string) => `${names}는 아직 졸업생이 없어 진학·전출 자료가 없어요`,
    note: "[발표 스크립트] 먼저 숫자만 나란히 놓고 봅니다. 전부 학교알리미 공시 그대로예요.",
    cols: { school: "학교", g1: "1학년", classes: "반", perClass: "반당", seats: "1등급 자리", moved: (l: string) => `${l}1 전출`, headHigh: "4년제", headMid: "특목·자율고" },
  },
  seats: {
    en: "SEATS",
    title: "1등급은 딱 몇 자리인가",
    of: (n: number) => `1학년 ${n}명 중`,
    explain:
      "석차등급은 학년 정원이 아니라 그 과목을 고른 사람 수로 매겨져요. 2·3학년 선택과목에서 수강자가 30명이면 1등급은 3명, 15명이면 1명입니다.\n상위 10% 안이어야 하니 소수점은 버려요. 167명이면 16자리입니다.",
    note: "[발표 스크립트] 숫자 하나만 먼저 보여드릴게요. 1등급은 상위 10%. 다만 이건 공통과목 얘기고, 2학년부터 고르는 과목에서는 분모가 확 줄어듭니다.",
  },
  paths: {
    en: "WHERE THEY WENT",
    title: (name: string) => `${name} 졸업생은 어디로 갔을까`,
    sub: (n: number, year: string) => `졸업생 ${n}명, ${year}년 공시`,
    special: (items: string) => `특목고 안을 열어 보면 ${items}`,
    note: "[발표 스크립트] 이 학교를 나온 선배들이 실제로 어디로 갔는지 봅니다. 서울 중학교는 학교군 안에서 추첨이라, 이건 순위표가 아니라 지도예요.",
  },
  achieve: {
    en: "GRADES ON PAPER",
    title: "국영수 성취도, 3년을 겹쳐 보면",
    part: (i: number, n: number) => `국영수 성취도, 3년을 겹쳐 보면 (${i}/${n})`,
    sub: (g: number, y: number) => `고${g} ${y}학년도. 학교알리미 교과별 학업성취 사항 공시`,
    subMid: (g: number, y: number) => `중${g} ${y}학년도. 학교알리미 교과별 학업성취 사항 공시`,
    cols: ["학교", "수강자", "1등급 자리", "국어 A", "영어 A", "수학 A", "평균 국/영/수", "1등급 컷, 90점 기준"],
    above: "90점 위",
    below: "90점 아래",
    foot: "A 인원 = 수강자 × A 비율. 1등급 자리 = 수강자 × 10%(5등급제) 또는 4%(9등급제), 소수점 버림. A 인원이 자리보다 많으면 컷이 90점 위",
    note: "[발표 스크립트] 학교알리미 공시 숫자만으로 1등급 컷이 어디쯤인지 읽어 봅니다. 90점 이상이 몇 명인지와 1등급 자리가 몇 개인지를 맞대 보면 돼요.",
    schoolTitle: (name: string) => `${name}, 성취도로 읽은 학교`,
    schoolSub: (type: string) => type,
    fit: "이런 학생이 가면 좋아요",
    caution: "이건 알고 가세요",
    seatLine: "1등급 자리",
    noteSchool: (name: string, summary: string) => `[발표 스크립트] ${name}입니다. ${summary}`,
    fitNote: "공시 숫자에서 읽어낸 옳은영어의 생각이에요. 학교가 발표한 해석이 아닙니다",
    sectionTitle: "국영수 성취도, 3년을 겹쳐 보면",
    sectionSummary: "학교알리미 공시 그대로예요. A 인원과 1등급 자리를 맞대 보면 컷이 어디 있는지 보입니다.",
  },
  exam2026Table: {
    en: "THIS YEAR'S PAPER",
    title: "올해 시험지, 이렇게 나왔다",
    part: (i: number, n: number) => `올해 시험지, 이렇게 나왔다 (${i}/${n})`,
    sub: (level: string, g: number) => `${level}${g} 기준. 옳은영어 강사진이 시험지를 펴 놓고 쓴 리포트`,
    foot: "컷은 학교 발표값이 아니라 우리 학생 성적표와 강사 추정. 출처는 학교 페이지에",
    note: "[발표 스크립트] 같은 동네인데 시험 성격이 이렇게 달라요. 객관식 100%인 학교와 서답형 35점인 학교가 나란히 있습니다.",
  },
  examTrend: {
    en: "THIS YEAR",
    title: (name: string, level: string, g: number) => `${name} ${level}${g}, 올해 시험지`,
    cut: "1등급 컷",
    cut2: (v: string) => `2등급 ${v}`,
    avg: (v: string) => `평균 ${v}`,
    scope: (v: string) => `범위 ${v}`,
    note: (name: string, g: number, lines: string) => `[발표 스크립트] ${name} ${g}학년 2026년 1학기예요. ${lines}`,
  },
  insights: {
    en: "FROM THE STAGE",
    title: (name: string) => `${name}, 강사진이 짚은 포인트`,
  },
  tmi: {
    en: "TMI",
    title: (name: string) => `${name} 선배들의 TMI`,
    sub: "옳은영어 재원생 선배들이 직접 써 준 답. 유튜브 LIVE 2025.11.16",
    note: "[발표 스크립트] 어른들이 못 알려주는 것들이에요. 급식, 계단, 매점.",
  },
  news: {
    en: "FROM OUTSIDE",
    title: (name: string) => `${name}, 학교 밖에서 확인한 것`,
    foot: (date: string) => `조사일 ${date}. 학교 홈페이지, 언론, 학교알리미 공시 문서에서 옮겼어요`,
    note: (first: string) => `[발표 스크립트] 학교 밖에서 확인되는 것들이에요. ${first}`,
  },
  school: {
    en: { the: "THE SCHOOL", hard: "WHAT'S HARD", how: "HOW THEY TEST", fit: "WHO FITS" },
    character: "한 줄 소개",
    subjects: "과목별 난이도",
    scope: "시험 범위, 어디서 나왔나",
    cutoff: "1등급 커트라인",
    aRatio: "영어 성취도 A",
    ratio: (v: string) => `지필:수행 ${v}`,
    features: "이 학교 시험의 습관",
    signature: "여기서만 나오는 문제",
    fit: (name: string) => `${name}, 이런 학생에게 맞는 학교`,
    fitNote: "이 판단은 옳은영어의 생각이고 공시된 사실이 아니에요",
    noteCharacter: (name: string, c: string) => `[발표 스크립트] ${name}이에요. ${c}`,
    noteHard: (name: string, lv: string, c: string) => `[발표 스크립트] ${name}는 영어가 ${lv}이에요. ${c}`,
    noteHow: (name: string, f: string) => `[발표 스크립트] ${name} 시험의 습관이에요. ${f}`,
    noteFit: "[발표 스크립트] 그래서 이런 학생에게 맞아요.",
  },
  results: {
    en: "SCOREBOARD",
    title: "옳은영어 성적표",
    foot: (term: string) => `${term}, 옳은영어 재원생 자체 집계. 두 지표는 분모가 달라요`,
    note: "[발표 스크립트] 두 숫자는 기준이 달라요. 섞어서 비교하시면 안 됩니다.",
  },
  closing: {
    en: "THANK YOU",
    title: ["정확한 분석,", "옳은 방향"],
    brand: "옳은영어 ORUN ENGLISH",
    sources: "출처: 학교알리미 2026년 공시, 졸업생 진로 2025년 공시, 나이스 교육정보 개방포털, 옳은영어 블로그, 각 학교 홈페이지",
    note: "[발표 스크립트] 개별 상담은 끝나고 바로 받을게요.",
  },
};

/* ── 1등급 계산기 ─────────────────────────── */

export const CALC = {
  common: { en: "COMMON", title: "공통과목", hint: "1학년 공통과목은 학년 전체가 들어요. 분모가 학년 정원입니다.", placeholder: "학년 정원" },
  elective: { en: "ELECTIVE", title: "선택과목", hint: "2, 3학년 선택과목은 그 과목을 고른 학생끼리만 겨뤄요. 분모가 수강자 수입니다.", placeholder: "예상 수강자 수" },
  seatsLabel: "1등급",
  unit: "명",
  cols: { grade: "등급", seats: "인원", cum: "누적" },
  foot: "2025학년도 고1부터 5등급제예요. 1등급 10%, 2등급까지 34%, 3등급까지 66%, 4등급까지 90%. 상위 10% 안이어야 하니 소수점은 버립니다.",
};

/* ── 우리가 본 기록(입력 화면) ───────────── */

export const EDITOR = {
  pickSchool: "학교를 골라 주세요",
  pickHint: "적어 둘 학교를 위에서 골라 주세요. 한 학교에 10분이면 충분해요.",
  recorded: "직접 적은 학교",
  progress: (total: number, filled: number) => `전체 ${total}곳 중 직접 적은 곳 ${filled}곳`,
  pct: (p: number) => `${p}% 채움`,
  saved: "저장됐어요",
  saveFailed: "저장이 안 됐어요. 브라우저 저장공간을 확인해 주세요.",
  reset: "기록 지우기",
  resetConfirm: (name: string) => `${name}에 적어 둔 걸 지워요. 계속할까요?`,
  fact: { en: "FROM DISCLOSURE", ko: "공시 자료", hint: "학교알리미에서 알아서 채워져요. 손댈 수 없습니다.", tag: "공시, 읽기만" },
  character: {
    phHigh: "이 학교를 한 문단으로 설명한다면? 설명회 첫 장에 그대로 실려요.",
    phMid: "이 중학교를 한 문단으로 설명한다면? 분위기, 진학 성향, 영어 수업 특징.",
  },
  subjects: {
    phHigh: "난이도에 대한 설명. 성취도 분포에서 읽어낸 것",
    phMid: "성취도 분포에서 읽어낸 것. 중학교는 등급이 없어요.",
  },
  scope: { add: "시험 하나 더", termHigh: "1학기 중간", termMid: "3학년 1학기 중간", ph: "교과서 Lesson 1~2, 부교재 Unit 1~4 (총 30지문)" },
  middle: {
    hint: "중학교는 석차등급이 없어요. 성적표엔 성취도 A~E만 남습니다.",
    aRatio: "영어 성취도 A 비율",
    ratio: "지필 : 수행",
    freeSemester: "지필평가 없는 학기",
    textbook: "교과서",
    ph: { aRatio: "예: 32%", ratio: "예: 60 : 40", freeSemester: "예: 1학년 전체 (자유학년)", textbook: "예: 동아 윤정미" },
  },
  cutoff: {
    hint: "근거를 꼭 같이 적어요. 추정치가 학교 발표처럼 보이면 안 되니까요.",
    g1: "1등급",
    g2: "2등급",
    basis: "기준",
    ph: { g1: "87~91", g2: "63~71", basis: "영어, 원점수 기준" },
  },
  features: { add: "한 줄 더", ph: "시험지를 받아 본 사람만 아는 것" },
  signature: { hint: "문항 유형을 걸어 두면 설명회 자리에서 바로 문제를 뽑을 수 있어요.", add: "문항 하나 더", title: "문제 발문이나 유형 이름", note: "왜 이 문제가 등급을 가르는지", noType: "문항 유형 안 걸기" },
  fit: { hint: "이건 사실이 아니라 우리 생각으로 표시돼요.", add: "하나 더", phHigh: "어떤 학생에게 맞는 학교인가", phMid: "어떤 학생에게 맞는 중학교인가" },
  rows: { up: "위로", down: "아래로", remove: "지우기" },
  stats: { g1: "1학년", classes: "학급", perClass: "학급당", male: "남", female: "여" },
};

export const BACKUP = {
  en: "BACKUP",
  title: "이 브라우저에만 남아요",
  text: (n: number) =>
    `직접 적은 ${n}곳이 이 브라우저에 남아 있어요. 다른 컴퓨터에서 쓰거나 백업하려면 파일로 내보내 주세요. 브라우저 데이터를 지우면 같이 사라집니다. 프로그램에 기본으로 들어 있는 학교는 내보내기에 안 들어가요.`,
  export: "파일로 내보내기",
  import: "파일 불러오기",
  imported: (n: number) => `${n}곳을 불러왔어요.`,
};

/* ── 학업성취 프로필(우리 생각) ───────────── */

type Fit = { name: string; en: string; summary: (p: { seats: number; aCount: number; avg: string; sd: string; aMean: string }) => string; fit: string[]; caution: string[] };

export const ACHIEVE_PROFILE: Record<"thick" | "steep" | "flat" | "standard", Fit> = {
  thick: {
    name: "상위권이 두꺼운 학교",
    en: "DEEP TOP",
    summary: ({ seats, aCount }) => `1등급 자리 ${seats}명보다 90점 이상(A) 인원 ${aCount}명이 많아요. 90점을 넘겨도 1등급이 아닐 수 있는 학교예요.`,
    fit: ["실수 없이 만점 가까이 마무리하는 습관이 있는 최상위권", "내신 경쟁이 세더라도 학생부·비교과로 같이 버틸 수 있는 학생", "친구들 수준이 높을 때 자극을 받는 유형"],
    caution: ["90점대 초반은 2등급을 각오해야 해요.", "한 문제 차이가 등급을 바꿔요. 서답형 감점 관리가 핵심입니다."],
  },
  steep: {
    name: "어렵게 내고 크게 벌리는 학교",
    en: "STEEP TEST",
    summary: ({ avg, sd }) => `평균 ${avg}점, 표준편차 ${sd}. 시험을 어렵게 내서 점수가 넓게 퍼져요. 1등급 컷이 90점 아래로 내려옵니다.`,
    fit: ["응용·심화 문제에 강하고 어려운 시험에 흔들리지 않는 학생", "상위권을 노린다면 경쟁자가 적어 유리해요.", "점수보다 등급을 보고 스스로를 평가할 수 있는 학생"],
    caution: ["중위권은 점수 자체가 낮아 성취도 C·D가 나올 수 있어요. 자신감 관리가 필요합니다.", "학교 유형에 맞춘 고난도 훈련 없이는 상위권 진입이 어려워요."],
  },
  flat: {
    name: "완만하게 내는 학교",
    en: "GENTLE SLOPE",
    summary: ({ avg, sd }) => `평균 ${avg}점, 표준편차 ${sd}. 시험이 완만해서 점수가 몰려 있어요. 한 문제가 등급을 바꿉니다.`,
    fit: ["꼼꼼하고 정확한 학생, 실수를 잘 안 하는 유형", "수업 내용을 충실히 따라가는 성실형", "심화보다 기본을 완벽하게 하는 쪽이 강한 학생"],
    caution: ["변별이 약해 1등급 컷이 매우 높아요. 95점 안팎까지 올라갈 수 있습니다.", "쉬운 시험이라고 방심하면 등급이 한 번에 내려가요."],
  },
  standard: {
    name: "표준형 학교",
    en: "STANDARD",
    summary: ({ aMean }) => `국영수 A 비율 평균 ${aMean}%. 평균과 분포가 서울 일반고의 표준에 가까워요.`,
    fit: ["꾸준히 하는 만큼 등급이 따라오는 구조라 성실한 학생에게 맞아요.", "특정 과목 쏠림 없이 국영수를 고르게 하는 학생"],
    caution: ["표준형일수록 과목별 편차를 봐야 해요. 아래 '등급을 가르는 과목'을 확인하세요."],
  },
};

/** 중학교용 — 등급이 없으니 A 비율과 평균으로만 말한다 */
export const ACHIEVE_MID = {
  high: { name: "A가 많은 학교", summary: (a: string) => `A 비율 ${a}%. 성취도 A가 흔해서 학교 시험만으로는 상위권이 갈리지 않아요.`, fit: ["특목·자사고를 생각하면 학교 시험 밖에서 실력을 확인해야 해요.", "내신 부담이 덜해 영어 원서·심화에 시간을 쓸 수 있는 학생"], caution: ["고교 첫 시험에서 성적표 충격을 받기 쉬워요. 중3 겨울이 중요합니다."] },
  low: { name: "A가 귀한 학교", summary: (a: string) => `A 비율 ${a}%. 시험이 까다로워 A가 귀해요.`, fit: ["학교 시험으로 실력을 검증받고 싶은 학생", "고교 내신 방식(서답형·범위 넓은 시험)을 미리 겪어 보려는 학생"], caution: ["성취도 B·C가 실력 부족이 아닐 수 있어요. 점수보다 위치를 보세요."] },
  mid: { name: "표준형 학교", summary: (a: string) => `A 비율 ${a}%. 서울 중학교 표준에 가까워요.`, fit: ["꾸준한 학생이 노력만큼 결과를 받는 구조예요."], caution: ["자유학기가 있는 학년은 지필 성취가 없어요. 비교할 때 학년을 확인하세요."] },
};

export const ACHIEVE_IMPORT = {
  en: "GRADES FROM SCHOOLINFO",
  title: "학교알리미 성취도 엑셀 불러오기",
  lede: "학교알리미 '교과별 학업성취 사항'에서 받은 엑셀을 여기 놓으면 국영수 성취도 분석이 켜져요. 학교마다 2026·2025·2024년 세 파일을 받아 한 번에 놓으세요.",
  drop: "여기에 파일을 끌어다 놓거나 눌러서 고르기",
  hint: "xlsx, xls 여러 개 가능",
  parsed: (rows: number) => `${rows}행 읽음`,
  school: "학교",
  year: "공시연도",
  pickSchool: "학교를 골라 주세요",
  save: "저장",
  saveAll: (n: number) => `${n}개 파일 저장`,
  saved: (n: number) => `${n}곳 저장했어요.`,
  remove: "지우기",
  loaded: "불러온 학교",
  export: "JSON으로 내보내기",
  importJson: "JSON 불러오기",
  fileNote: (name: string, rows: number) => `${name}, ${rows}행`,
  none: "아직 불러온 성취도 자료가 없어요.",
  preview: "미리보기",
};
