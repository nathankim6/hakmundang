// 흑석관 버전 (구 145문항) 초등부 레벨테스트 문제 데이터
import type { PrepLevelTestQuestion } from './prepLevelTestQuestions';
export type { PrepLevelTestQuestion };

// 예비중 레벨테스트 문제 데이터


// ========================================
// PART 1: 독해 (Reading) - 객관식 4문제 + 구문분석 4문제
// ========================================

export const prepReadingQuestionsV1: PrepLevelTestQuestion[] = [
  // 객관식 1: 글의 목적
  {
    id: 1,
    section: 'reading',
    category: '독해',
    subCategory: '글의 목적',
    questionText: "다음 글의 목적으로 가장 적절한 것은?",
    passageText: "Dear Ms. Cross,\n\nWe are excited to announce the opening of the newest Sunshine Stationery Store in Raleigh, North Carolina! As you know, the Sunshine Stationery Store has long been the industry standard for quality creative paper products of all kinds, and we couldn't have picked a better location for our next branch than the warm and inviting city of Raleigh. We are thrilled to welcome you to the Grand Opening of the Raleigh store on March 15, 2018. The opening celebration will be from 9 a.m. to 9 p.m. ― a full 12 hours of fun! We would love to show you all the Raleigh store has to offer and hope to see you there on the 15th!\n\nSincerely,\nDonna Deacon",
    options: [
      "신제품의 출시를 홍보하려고",
      "회사 창립 기념일에 초대하려고",
      "이전한 매장의 위치를 안내하려고",
      "신설 매장의 개업식에 초대하려고",
      "매장의 영업시간 변경을 안내하려고"
    ],
    correctAnswer: 4,
    explanation: "편지는 새로운 Raleigh 지점의 Grand Opening에 초대하는 내용이다.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 객관식 2: 심경 파악
  {
    id: 2,
    section: 'reading',
    category: '독해',
    subCategory: '심경 파악',
    questionText: "다음 글에 드러난 'I'의 심경으로 가장 적절한 것은?",
    passageText: "One day I caught a taxi to work. When I got into the back seat, I saw a brand new cell phone sitting right next to me. I asked the driver, \"Where did you drop the last person off?\" and showed him the phone. He pointed at a girl and moved to her. We drove up to her and I rolled down the window yelling out to her. She was very thankful and by the look on her face I could tell how grateful she was. Her smile made me smile and feel really good inside. After she got the phone back, I heard someone walking past her say, \"Today's your lucky day!\"",
    options: [
      "angry",
      "bored",
      "scared",
      "pleased",
      "regretful"
    ],
    correctAnswer: 4,
    explanation: "화자는 핸드폰을 돌려주고 상대방의 감사한 미소에 기분이 좋아졌다.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 객관식 3: 필자의 주장
  {
    id: 3,
    section: 'reading',
    category: '독해',
    subCategory: '필자의 주장',
    questionText: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?",
    passageText: "Many people think of what might happen in the future based on past failures and get trapped by them. For example, if you have failed in a certain area before, when faced with the same situation, you anticipate what might happen in the future, and thus fear traps you in yesterday. Do not base your decision on what yesterday was. Your future is not your past and you have a better future. You must decide to forget and let go of your past. Your past experiences are the thief of today's dreams only when you allow them to control you.",
    options: [
      "꿈을 이루기 위해 다양한 경험을 하라.",
      "미래를 생각할 때 과거의 실패에 얽매이지 말라.",
      "장래의 성공을 위해 지금의 행복을 포기하지 말라.",
      "자신을 과신하지 말고 실현 가능한 목표부터 세우라.",
      "결정을 내릴 때 남의 의견에 지나치게 의존하지 말라."
    ],
    correctAnswer: 2,
    explanation: "필자는 과거의 실패에 얽매이지 말고 미래를 향해 나아가라고 주장한다.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 객관식 4: 내용 일치/불일치
  {
    id: 4,
    section: 'reading',
    category: '독해',
    subCategory: '내용 일치/불일치',
    questionText: "Mae C. Jemison에 관한 다음 글의 내용과 일치하지 않는 것은?",
    passageText: "Mae C. Jemison was named the first black woman astronaut in 1987. On September 12, 1992, she boarded the space shuttle Endeavor as a science mission specialist on the historic eight-day flight. Jemison left the National Aeronautic and Space Administration (NASA) in 1993. She was a professor of Environmental Studies at Dartmouth College from 1995 to 2002. Jemison was born in Decatur, Alabama, and moved to Chicago with her family when she was three years old. She graduated from Stanford University in 1977 with a degree in chemical engineering and Afro-American studies. Jemison received her medical degree from Cornell Medical School in 1981.",
    options: [
      "1992년에 우주 왕복선에 탑승했다.",
      "1993년에 NASA를 떠났다.",
      "Dartmouth 대학의 환경학과 교수였다.",
      "세 살 때 가족과 함께 Chicago로 이주했다.",
      "Stanford 대학에서 의학 학위를 받았다."
    ],
    correctAnswer: 5,
    explanation: "Stanford 대학에서는 화학공학과 아프리카계 미국인 연구 학위를 받았고, 의학 학위는 Cornell Medical School에서 받았다.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 구문분석 1: 주어/동사 클릭
  {
    id: 5,
    section: 'reading',
    category: '독해',
    subCategory: '주어동사파악',
    questionText: "문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)",
    sentenceWords: ['By', 'using', 'reusable', 'containers,', 'you', 'can', 'save', 'the', 'Earth!'],
    correctSubjects: ['you'], // 사용자가 직접 설정
    correctVerbs: [], // 필수 동사 없음 (can 또는 save 중 하나 이상 선택 시 정답)
    optionalVerbs: ['can', 'save'], // 둘 중 하나 이상 선택하면 정답
    explanation: "By using reusable containers(끊기) / you(주어) can save(동사) the Earth!",
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  // 구문분석 2: 주어/동사 클릭
  {
    id: 6,
    section: 'reading',
    category: '독해',
    subCategory: '주어동사파악',
    questionText: "문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)",
    sentenceWords: ['If', 'both', 'teams', 'failed', 'to', 'move,', 'the', 'judges', 'gave', '5', 'more', 'minutes.'],
    correctSubjects: ['judges'], // 본 주어만
    correctVerbs: ['gave'], // 본 동사만
    explanation: "If both teams failed to move(끊기) / the judges(주어) gave(동사) 5 more minutes.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'sentenceClick'
  },
  // 구문분석 3: 주어/동사 클릭
  {
    id: 7,
    section: 'reading',
    category: '독해',
    subCategory: '주어동사파악',
    questionText: "문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)",
    sentenceWords: ['What', 'will', 'the', 'world', 'be', 'like', 'in', 'the', 'future?'],
    correctSubjects: ['world'], // world가 주어
    optionalSubjects: ['the'], // the는 선택적
    correctVerbs: ['be', 'will'], // be 또는 will 둘 다 본동사로 인정
    optionalVerbs: [], // will도 정답이므로 별도 optional 불필요
    explanation: "What(끊기) / will(본동사) the world(주어) be like / in the future? (will 또는 be 둘 다 정답)",
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  // 구문분석 4: 주어/동사 클릭
  {
    id: 8,
    section: 'reading',
    category: '독해',
    subCategory: '주어동사파악',
    questionText: "문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)",
    sentenceWords: ['Explore', 'different', 'future', 'jobs', 'for', 'your', 'wonderful', 'life!'],
    correctSubjects: [], // 명령문이므로 주어 없음 - 사용자가 직접 설정
    correctVerbs: ['Explore'], // 사용자가 직접 설정
    explanation: "Explore(동사) different future jobs / for your wonderful life! (명령문이므로 주어 You 생략)",
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  }
];

// ========================================
// PART 2: 문법 A구간 (기초) - 객관식 20문제 + 주관식 20문제
// ========================================

export const prepGrammarAQuestionsV1: PrepLevelTestQuestion[] = [
  // A구간 객관식 1: 일반동사 의문문
  {
    id: 9,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 중 빈칸에 들어갈 수 없는 것은?\n\nDoes _________ have a computer?",
    options: ["he", "she", "Nancy", "they", "your sister"],
    correctAnswer: 4,
    explanation: "Does는 3인칭 단수 주어와 함께 사용된다. they는 복수이므로 Do they가 맞다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 2: 일반동사 의문문
  {
    id: 10,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 중 밑줄 친 부분이 틀린 것은?",
    options: [
      "<u>Does</u> Lisa <u>want</u> a glass of water?",
      "<u>Does</u> the sun <u>rise</u> in the morning and <u>sets</u> in the evening?",
      "<u>Do</u> they <u>take</u> a bus to school?",
      "What kind of movies <u>do</u> you <u>like</u> most?",
      "<u>Does</u> he <u>drink</u> a lot of milk?"
    ],
    correctAnswer: 2,
    explanation: "Does가 있으면 뒤에 오는 동사는 원형이어야 한다. sets → set",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 3: 일반동사 의문문
  {
    id: 11,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "우리말을 영어로 옮길 때 알맞은 것은?",
    questionContent: "너는 영어 선생님을 좋아하니?",
    options: [
      "Do you an English teacher?",
      "Do you like an English teacher?",
      "Are you like an English teacher?",
      "Does you like an English teacher?",
      "Don't you like an English teacher?"
    ],
    correctAnswer: 2,
    explanation: "2인칭 you와 함께 Do를 사용하고 동사 like의 원형을 쓴다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 4: 의문문
  {
    id: 12,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 중 의문문으로 바르게 바꾼 것은?",
    options: [
      "You ate the pizza on the table.<br/>→ Do you ate the pizza on the table?",
      "He played soccer last weekend.<br/>→ Does he played soccer last weekend?",
      "They went shopping yesterday.<br/>→ Did they go shopping yesterday?",
      "Sumin liked to play game.<br/>→ Did Sumin liked to play game?",
      "David enjoys watching movie.<br/>→ Do David enjoy watching movie?"
    ],
    correctAnswer: 3,
    explanation: "과거 시제 의문문은 Did + 주어 + 동사원형 형태이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 5: 의문문
  {
    id: 13,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 중 의문문으로 바르게 고친 문장을 고르세요.",
    options: [
      "My brother bought some flowers.<br/>→ Did my brother bought some flowers?",
      "Susan goes to high school.<br/>→ Does Susan go to high school?",
      "You have a cell phone.<br/>→ Does you have a cell phone?",
      "They have a big house.<br/>→ Do they has a big house?",
      "She likes movies.<br/>→ Do she like movies?"
    ],
    correctAnswer: 2,
    explanation: "3인칭 단수 현재 시제 의문문은 Does + 주어 + 동사원형 형태이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 6: 의문사
  {
    id: 14,
    section: 'grammar',
    category: '문법',
    subCategory: '의문사',
    grammarLevel: 'A',
    questionText: "다음 대화의 빈칸에 알맞은 것은?",
    questionContent: "A : _______ are you from?<br/>B : I'm from Sydney, Australia.",
    options: ["When", "Where", "How", "What", "Why"],
    correctAnswer: 2,
    explanation: "출신 장소를 묻는 질문에는 Where를 사용한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 7: 의문사
  {
    id: 15,
    section: 'grammar',
    category: '문법',
    subCategory: '의문사',
    grammarLevel: 'A',
    questionText: "위의 밑줄 친 빈칸에 들어갈 단어가 알맞게 쓰인 것을 고르시오.",
    questionContent: "(1) _______ do you get up?<br/>(2) _______ do you live?<br/>(3) _______ is your favorite animal?<br/>(4) _______ is your favorite actor?<br/>(5) _______ do you like him?",
    options: [
      "when - what - what - how - why",
      "when - where - what - who - why",
      "where - when - why - who - what",
      "where - when - why - how - what",
      "how - where - when - who - what"
    ],
    correctAnswer: 2,
    explanation: "(1)시간-When (2)장소-Where (3)사물-What (4)사람-Who (5)이유-Why",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 8: 과거 시제/부정문
  {
    id: 16,
    section: 'grammar',
    category: '문법',
    subCategory: '과거 시제/부정문',
    grammarLevel: 'A',
    questionText: "다음 빈칸에 didn't가 올 수 없는 것은?",
    options: [
      "Bora _____ help her mother last night.",
      "Subin _____ send me a Christmas card.",
      "I _____ doing my homework then.",
      "Bomi and her sister _____ clean the room.",
      "They _____ take guitar lessons last Sunday."
    ],
    correctAnswer: 3,
    explanation: "3번은 진행형이므로 wasn't가 와야 한다. (I wasn't doing...)",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 9: 과거 시제
  {
    id: 17,
    section: 'grammar',
    category: '문법',
    subCategory: '과거 시제/부정문',
    grammarLevel: 'A',
    questionText: "다음 중 어법상 옳은 문장은?",
    options: [
      "Jessica were a singer.",
      "Sumi was a good student.",
      "His father were tall.",
      "They was at the big park.",
      "He were a nice doctor."
    ],
    correctAnswer: 2,
    explanation: "Sumi는 3인칭 단수이므로 was가 올바르다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 10: 어법상 어색한 문장
  {
    id: 18,
    section: 'grammar',
    category: '문법',
    subCategory: '과거 시제/부정문',
    grammarLevel: 'A',
    questionText: "다음 중 어법상 어색한 문장을 <u>모두</u> 고르면?",
    options: [
      "Bora cans go to the library on Friday.",
      "What did you do on the weekend?",
      "Sophy put her finger in her mouth.",
      "Jessica didn't watched a movie at the theater.",
      "Can you pick up the pen on the floor?"
    ],
    correctAnswer: [1, 4],
    explanation: "1번(cans→can)과 4번(watched→watch)이 어색하다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 11: 조동사 기초
  {
    id: 19,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 중 어법상 바른 문장을 <u>모두</u> 고르세요.",
    options: [
      "I must will stay here until morning.",
      "May I leave a message?",
      "He may caught a cold.",
      "I not might come tomorrow.",
      "This cannot be true."
    ],
    correctAnswer: [2, 5],
    explanation: "2번과 5번이 맞다. 조동사 뒤에는 동사원형이 오고, 조동사는 연속으로 사용할 수 없다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 12: 조동사 기초
  {
    id: 20,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 질문에 대한 답으로 알맞은 것은?",
    questionContent: "May I borrow this book?",
    options: [
      "Yes, you are.",
      "Yes, you might.",
      "Yes, I can.",
      "No, you're not may.",
      "No, you may not."
    ],
    correctAnswer: 5,
    explanation: "May I ~?에 대한 부정적 대답은 No, you may not.이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 13: 조동사 - be able to
  {
    id: 21,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "<u>밑줄 친 부분</u>을 can으로 바꿔 쓸 수 있는 것은?",
    options: [
      "I <u>am able to</u> climb this mountain.",
      "Will you <u>be able to</u> come to our party?",
      "I would <u>be able to</u> finish eating it someday.",
      "I'm pleased to <u>be able to</u> fine such a wise man.",
      "Nobody will <u>be able to</u> master English in a year."
    ],
    correctAnswer: 1,
    explanation: "be able to는 can과 바꿔 쓸 수 있지만, 조동사와 함께 쓰일 때는 바꿀 수 없다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 14: 조동사 - not 위치
  {
    id: 22,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 문장에서 'not'이 들어가기에 알맞은 곳은?",
    questionContent: "You ( 1 ) should ( 2 ) eat ( 3 ) too ( 4 ) much ( 5 ) chocolate.",
    options: ["1", "2", "3", "4", "5"],
    correctAnswer: 2,
    explanation: "조동사의 부정은 조동사 바로 뒤에 not을 넣는다. should not eat",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 15: 어순 배열
  {
    id: 23,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞도록 괄호 안의 단어들을 배열하여 문장을 완성할 때 <u>세 번째</u>로 나오는 단어로 알맞은 것은?",
    questionContent: "학생들은 서로 도와야 한다<br/>(students/ each/ help/ other/ should)",
    options: ["students", "each", "help", "other", "should"],
    correctAnswer: 3,
    explanation: "Students should help each other. 세 번째 단어는 help이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 16: 감각동사 대화
  {
    id: 24,
    section: 'grammar',
    category: '문법',
    subCategory: '감각동사 + 형용사',
    grammarLevel: 'A',
    questionText: "다음 대화의 빈칸에 들어갈 말로 알맞은 것은?",
    questionContent: "A: This cake _______ good.<br/>B: Can I eat some?",
    options: ["tastes", "talks", "makes", "sounds", "finds"],
    correctAnswer: 1,
    explanation: "케이크의 맛에 대해 말하므로 tastes(맛이 ~하다)가 적절하다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 17: 감각동사 - 어색한 것
  {
    id: 25,
    section: 'grammar',
    category: '문법',
    subCategory: '감각동사 + 형용사',
    grammarLevel: 'A',
    questionText: "다음 빈칸에 들어갈 말로 <u>어색한것</u>은?",
    questionContent: "My mother looks _________ now.",
    options: ["sad", "happily", "tired", "excited", "great"],
    correctAnswer: 2,
    explanation: "감각동사(look) 뒤에는 형용사가 온다. happily는 부사이므로 happy가 와야 한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 18: 감각동사 빈칸 짝짓기
  {
    id: 26,
    section: 'grammar',
    category: '문법',
    subCategory: '감각동사 + 형용사',
    grammarLevel: 'A',
    questionText: "다음 문장의 빈칸에 들어갈 말이 순서대로 짝지어진 것은?",
    questionContent: "• The food tastes _________.<br/>• I feel _________.",
    options: [
      "nicely - good",
      "great - sadly",
      "good - hungry",
      "greatly - terribly",
      "terrible - happily"
    ],
    correctAnswer: 3,
    explanation: "감각동사(taste, feel) 뒤에는 형용사가 온다. good, hungry가 형용사이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 19: 감각동사 대화 빈칸
  {
    id: 27,
    section: 'grammar',
    category: '문법',
    subCategory: '감각동사 + 형용사',
    grammarLevel: 'A',
    questionText: "다음 대화의 빈칸에 들어갈 알맞은 단어가 차례대로 짝지어진 것은?",
    questionContent: "A: Hello. Andy. You __________ happy. What happened?<br/>B: I got special allowance from my dad. It is 30,000 won.<br/>　　I __________ great.<br/>A: Good for you. Why don't we spend it together?",
    options: [
      "look - feel",
      "looks - feel",
      "am - felt",
      "look - feels",
      "looks - felt"
    ],
    correctAnswer: 1,
    explanation: "주어가 You이므로 look, 주어가 I이므로 feel이 와야 한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 20: 감각동사 A-B-C
  {
    id: 28,
    section: 'grammar',
    category: '문법',
    subCategory: '감각동사 + 형용사',
    grammarLevel: 'A',
    questionText: "다음 빈칸 A-C에 들어갈 알맞은 단어로 바르게 연결된 것은?",
    questionContent: "• Suho is playing the guitar. It ___A___ wonderful.<br/>• I'm having spaghetti. It ___B___ delicious.<br/>• They ___C___ so happy.",
    options: [
      "A: sound / B: eat / C: are",
      "A: sounds / B: eats / C: looks",
      "A: sounds / B: tastes / C: look",
      "A: listen / B: taste / C: are",
      "A: listens / B: tastes / C: looks"
    ],
    correctAnswer: 3,
    explanation: "A: sounds(소리가 ~하게 들린다), B: tastes(맛이 ~하다), C: look(~해 보인다, 주어가 They이므로 복수형)",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },

  // A구간 객관식 문제들 (29-37)
  // A구간 객관식 21: 의문문 만들기
  {
    id: 29,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 문장을 의문문으로 바르게 고친 것은?",
    questionContent: "Cathy likes movies.",
    options: [
      "Do Cathy likes movies?",
      "Does Cathy like movies?",
      "Is Cathy likes movies?",
      "Does Cathy likes movies?"
    ],
    correctAnswer: 2,
    explanation: "3인칭 단수 현재 시제를 의문문으로 바꾸면 Does + 주어 + 동사원형 형태가 된다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 22: 의문문 만들기
  {
    id: 30,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 문장을 의문문으로 바르게 고친 것은?",
    questionContent: "He has a book in his hand.",
    options: [
      "Has he a book in his hand?",
      "Do he have a book in his hand?",
      "Does he have a book in his hand?",
      "Does he has a book in his hand?"
    ],
    correctAnswer: 3,
    explanation: "3인칭 단수 현재 시제를 의문문으로 바꾸면 Does + 주어 + 동사원형 형태가 된다. has → have",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 23: 의문문 만들기
  {
    id: 31,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 문장을 의문문으로 바르게 고친 것은?",
    questionContent: "The computer works fast.",
    options: [
      "Do the computer work fast?",
      "Does the computer works fast?",
      "Is the computer work fast?",
      "Does the computer work fast?"
    ],
    correctAnswer: 4,
    explanation: "3인칭 단수 현재 시제를 의문문으로 바꾸면 Does + 주어 + 동사원형 형태가 된다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 24: 의문문 만들기
  {
    id: 32,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 문장을 의문문으로 바르게 고친 것은?",
    questionContent: "Your sisters know him.",
    options: [
      "Does your sisters know him?",
      "Do your sisters know him?",
      "Are your sisters know him?",
      "Do your sisters knows him?"
    ],
    correctAnswer: 2,
    explanation: "복수 주어의 현재 시제를 의문문으로 바꾸면 Do + 주어 + 동사원형 형태가 된다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 25: 의문문 만들기 (과거시제)
  {
    id: 33,
    section: 'grammar',
    category: '문법',
    subCategory: '과거 시제/부정문',
    grammarLevel: 'A',
    questionText: "다음 문장을 의문문으로 바르게 고친 것은?",
    questionContent: "Cinderella cleaned the house.",
    options: [
      "Does Cinderella cleaned the house?",
      "Did Cinderella cleaned the house?",
      "Did Cinderella clean the house?",
      "Was Cinderella clean the house?"
    ],
    correctAnswer: 3,
    explanation: "과거 시제를 의문문으로 바꾸면 Did + 주어 + 동사원형 형태가 된다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 26: 현재진행형
  {
    id: 34,
    section: 'grammar',
    category: '문법',
    subCategory: '현재진행형',
    grammarLevel: 'A',
    questionText: "빈칸에 들어갈 알맞은 답은?",
    questionContent: "A: What is Min-ho doing?<br/>B: ________________________. (hit the ball)",
    options: [
      "He hits the ball",
      "He is hitting the ball",
      "He hit the ball",
      "He was hitting the ball"
    ],
    correctAnswer: 2,
    explanation: "현재진행형은 be동사 + 동사-ing 형태이다. hit는 자음이 중복된다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 27: 현재진행형
  {
    id: 35,
    section: 'grammar',
    category: '문법',
    subCategory: '현재진행형',
    grammarLevel: 'A',
    questionText: "빈칸에 들어갈 알맞은 답은?",
    questionContent: "A: What's Mi-na doing?<br/>B: ________________________. (kick the ball)",
    options: [
      "She kicks the ball",
      "She kicked the ball",
      "She is kicking the ball",
      "She was kicking the ball"
    ],
    correctAnswer: 3,
    explanation: "현재진행형은 be동사 + 동사-ing 형태이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 28: be going to
  {
    id: 36,
    section: 'grammar',
    category: '문법',
    subCategory: '현재진행형',
    grammarLevel: 'A',
    questionText: "두 문장이 같은 뜻이 되도록 빈칸에 알맞은 것은?",
    questionContent: "Jack will pass the exam. = Jack _____________ the exam.",
    options: [
      "is going to passing",
      "is going pass",
      "is going to pass",
      "going to pass"
    ],
    correctAnswer: 3,
    explanation: "will = be going to (미래 표현)",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 객관식 29: be going to
  {
    id: 37,
    section: 'grammar',
    category: '문법',
    subCategory: '현재진행형',
    grammarLevel: 'A',
    questionText: "두 문장이 같은 뜻이 되도록 빈칸에 알맞은 것은?",
    questionContent: "They will go to the museum. = They _____________ to the museum.",
    options: [
      "are going go",
      "are going to go",
      "is going to go",
      "going to go"
    ],
    correctAnswer: 2,
    explanation: "will = be going to (미래 표현). They는 복수이므로 are를 사용한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 주관식 10: 문장 배열
  {
    id: 38,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞게 주어진 말을 바르게 배열하시오.<br/>(필요하면 적절히 형태를 바꿔 쓸 것)",
    questionContent: "나의 아버지는 설거지를 하신다.",
    correctAnswer: "My father washes the dishes.",
    correctAnswers: ["My father washes the dishes.", "My father washes the dishes"],
    arrangeWords: ["My father", "the dishes.", "washes"],
    explanation: "3인칭 단수 현재이므로 washes로 변형한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  },
  // A구간 주관식 11: 어법 교정
  {
    id: 39,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "어법상 틀린 부분을 고쳐 쓰세요.<br/>(수정한 후의 정답 단어만 쓰세요)",
    questionContent: "My mom may cooks in the kitchen.",
    correctAnswer: "cook",
    correctAnswers: ["cook", "COOK"],
    explanation: "조동사 may 뒤에는 동사원형이 온다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'text'
  },
  // A구간 주관식 12: 어법 교정
  {
    id: 40,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "어법상 틀린 부분을 고쳐 쓰세요.<br/>(수정한 후의 정답 단어만 쓰세요)",
    questionContent: "They not may be in the classroom.",
    correctAnswer: "may not",
    correctAnswers: ["may not"],
    explanation: "조동사의 부정은 조동사 + not 순서이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'text'
  },
  // A구간 주관식 13: 문장 배열
  {
    id: 41,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.",
    questionContent: "너는 그에게 사실을 말해야 한다.",
    correctAnswer: "You should tell him the truth.",
    arrangeWords: ["him", "the", "You", "truth.", "tell", "should"],
    explanation: "조동사 should 뒤에는 동사원형 tell이 온다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  },
  // A구간 주관식 14: 문장 완성
  {
    id: 42,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.",
    questionContent: "너는 새 컴퓨터를 사는 게 좋겠다.",
    correctAnswer: "You should buy a new computer.",
    arrangeWords: ["buy", "a", "should", "computer.", "You", "new"],
    explanation: "조동사 should 뒤에는 동사원형이 온다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  },
  // A구간 주관식 15: 문장 배열
  {
    id: 43,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 기초',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하여 문장을 완성하시오.",
    questionContent: "영화 보는 동안에 시끄럽게 해서는 안 된다.<br/>-You ________________________ during the movie.",
    correctAnswer: "should not make a noise",
    arrangeWords: ["not", "make", "should", "noise", "a"],
    explanation: "should not + 동사원형 형태로 '~해서는 안 된다'를 표현한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  },
  // A구간 객관식 36: 동명사/to부정사
  {
    id: 44,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'A',
    questionText: "빈칸에 들어갈 알맞은 형태는?",
    questionContent: "He loves _____________ abroad. (travel)",
    options: [
      "travel",
      "traveled",
      "to traveling",
      "traveling, to travel"
    ],
    correctAnswer: 4,
    explanation: "love는 동명사와 to부정사 둘 다 목적어로 취할 수 있다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // A구간 객관식 37: 동명사
  {
    id: 45,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'A',
    questionText: "빈칸에 들어갈 알맞은 형태는?",
    questionContent: "I don't mind _____________ the door. (open)",
    options: [
      "open",
      "to open",
      "opening",
      "opened"
    ],
    correctAnswer: 3,
    explanation: "mind는 동명사만 목적어로 취한다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // A구간 주관식 18: 문장 배열
  {
    id: 46,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞게 주어진 단어를 배열하시오.",
    questionContent: "무언가 좋은 일이 오늘 밤에 생길 것이다.",
    correctAnswer: "Something good will happen tonight.",
    correctAnswers: ["Something good will happen tonight.", "Something good will happen tonight"],
    arrangeWords: ["will happen", "tonight.", "good", "Something"],
    explanation: "Something + 형용사 + 동사 순서이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  },
  // A구간 주관식 19: 문장 배열
  {
    id: 47,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사 의문문',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞게 주어진 단어를 배열하시오.",
    questionContent: "우리 반의 Amy는 칠판에 동그라미를 그린다.",
    correctAnswer: "Amy in my class draws some circles on the blackboard.",
    correctAnswers: ["Amy in my class draws some circles on the blackboard.", "Amy in my class draws some circles on the blackboard"],
    arrangeWords: ["some circles", "Amy", "in my class", "draws", "on the blackboard."],
    explanation: "주어 + 수식어구 + 동사 + 목적어 + 장소 부사구 순서이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  // A구간 주관식 20: 문장 배열
  {
    id: 48,
    section: 'grammar',
    category: '문법',
    subCategory: '과거 시제/부정문',
    grammarLevel: 'A',
    questionText: "다음 우리말에 맞게 주어진 단어를 배열하시오.",
    questionContent: "토니는 공중에서 공을 찼다.",
    correctAnswer: "Tony kicked a ball in the air.",
    correctAnswers: ["Tony kicked a ball in the air.", "Tony kicked a ball in the air"],
    arrangeWords: ["in the air.", "kicked", "a ball", "Tony"],
    explanation: "주어 + 동사(과거형) + 목적어 + 장소 부사구 순서이다.",
    points: 2,
    difficulty: 'basic',
    inputType: 'wordArrangement'
  }
];

// ========================================
// PART 3: 문법 B구간 (중급) - 객관식 20문제 + 주관식
// ========================================

export const prepGrammarBQuestionsV1: PrepLevelTestQuestion[] = [
  // B구간 객관식 1: 현재완료 (복수선택 - 모두)
  {
    id: 49,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "빈칸에 알맞지 <u>않은</u> 말을 <u>모두</u> 고르세요.",
    questionContent: "Have you ever ______________?",
    options: [
      "ridden a bike",
      "catched the flu",
      "sung a pop song",
      "ate Vietnamese food",
      "read this history book"
    ],
    correctAnswer: [2, 4],
    explanation: "catched → caught, ate → eaten (현재완료는 have + 과거분사)",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 2: 현재완료
  {
    id: 50,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "주어진 문장과 의미가 같은 것은?",
    questionContent: "He went to Europe, so he isn't here now.",
    options: [
      "He has gone to Europe.",
      "He hasn't been to Europe.",
      "He has ever been to Europe.",
      "He has been to Europe before.",
      "He is going to go to Europe."
    ],
    correctAnswer: 1,
    explanation: "have/has gone to는 '~에 가서 지금 여기 없다'는 의미이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 3: 현재완료 쓰임
  {
    id: 51,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "[3~4] 보기의 밑줄 친 부분과 쓰임이 같은 것은?",
    questionContent: "I <u>have lost</u> my math textbook.",
    options: [
      "She <u>has gone</u> to Spain.",
      "Jack <u>has ridden</u> horses.",
      "I <u>haven't been</u> to Russia.",
      "I <u>have never fought</u> online.",
      "<u>Have</u> you <u>written</u> to a newspaper?"
    ],
    correctAnswer: 1,
    explanation: "보기와 1번 모두 결과 용법(~해서 지금 그 상태이다)이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 4: 현재완료 쓰임
  {
    id: 52,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "보기의 밑줄 친 부분과 쓰임이 같은 것은?",
    questionContent: "<u>Have</u> you ever <u>seen</u> this picture before?",
    options: [
      "He <u>has gone</u> to Canada.",
      "I <u>have read</u> this novel three times.",
      "John <u>has lived</u> in Seoul for 6 years.",
      "I <u>have lost</u> my wallet on my way home.",
      "The singers <u>have just arrived</u> in Korea."
    ],
    correctAnswer: 2,
    explanation: "보기와 2번 모두 경험 용법(~한 적이 있다)이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 5: 시제
  {
    id: 53,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "빈칸에 들어갈 말로 바르게 짝지어진 것은?",
    questionContent: "• I __________ Chinese last month.<br/>• I __________ Chinese since last month.",
    options: [
      "was learning – learned",
      "learned – have learned",
      "have learned – learned",
      "have learned – have learned",
      "was learning – was learning"
    ],
    correctAnswer: 2,
    explanation: "last month(과거 시점)는 과거시제, since last month(과거부터 현재까지)는 현재완료와 함께 쓴다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 6: 수동태
  {
    id: 54,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'B',
    questionText: "다음 빈칸에 알맞은 말이 순서대로 짝지어진 것은?",
    questionContent: "• My uncle __________ the building.<br/>• The building __________ by my uncle.",
    options: [
      "designed – designed",
      "designed – was designed",
      "is designed – designed",
      "was designed – was designed",
      "was designed – was designing"
    ],
    correctAnswer: 2,
    explanation: "능동태: My uncle designed ~, 수동태: ~ was designed by my uncle",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 7: 수동태
  {
    id: 55,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'B',
    questionText: "다음 중 수동태로 바꿀 수 없는 문장은?",
    options: [
      "Tom cooked the steak.",
      "They saw the movie yesterday.",
      "He solved a very difficult question.",
      "I sent a Christmas card to Jack.",
      "He swam in the river last week."
    ],
    correctAnswer: 5,
    explanation: "swim은 자동사이므로 수동태로 바꿀 수 없다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 8: 수동태 전환
  {
    id: 56,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'B',
    questionText: "[8~9] 다음 문장을 수동태로 바르게 전환한 것은?",
    questionContent: "He didn't invite her to the party.",
    options: [
      "He didn't invite to the party by her.",
      "He isn't invited to the party by her.",
      "She didn't invited to the party by him.",
      "She wasn't invited to the party by him.",
      "She was invited not to the party by him."
    ],
    correctAnswer: 4,
    explanation: "과거 부정문의 수동태는 was/were not + p.p. 형태이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 9: 수동태 전환
  {
    id: 57,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'B',
    questionText: "다음 문장을 수동태로 바르게 전환한 것은?",
    questionContent: "She looked after the newborn baby.",
    options: [
      "The newborn baby looked by her after.",
      "The newborn baby looked after by her.",
      "The newborn baby is looked after by her.",
      "The newborn baby was looked by her after.",
      "The newborn baby was looked after by her."
    ],
    correctAnswer: 5,
    explanation: "look after(구동사)는 그대로 유지하고 수동태로 바꾼다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 10: 전치사
  {
    id: 58,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'B',
    questionText: "다음 빈칸에 들어갈 말이 나머지와 <u>다른</u> 하나는?",
    options: [
      "The table was covered ________ dirt.",
      "The scientists were satisfied ________ the result.",
      "The jar is filled ________ jelly beans.",
      "He is particularly interested ________ old cars.",
      "They were disappointed ________ my grades."
    ],
    correctAnswer: 4,
    explanation: "1~3, 5번은 with가 오고, 4번은 in이 온다. (be interested in)",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 11: 가주어 It
  {
    id: 59,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'B',
    questionText: "주어진 문장의 밑줄 친 <u>It</u>과 쓰임이 같은 것은?",
    questionContent: "<u>It</u> is good to get up early in the morning.",
    options: [
      "<u>It</u>'s raining now.",
      "What is <u>it</u>?",
      "I saw <u>it</u> yesterday.",
      "<u>It</u>'s March 18th.",
      "<u>It</u>'s fun to play table tennis."
    ],
    correctAnswer: 5,
    explanation: "주어진 문장의 It은 가주어이고 to get up~이 진주어이다. 5번도 같은 구조이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 12: to부정사 용법
  {
    id: 60,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'B',
    questionText: "[12~13] 주어진 문장의 밑줄 친 부분과 용법이 같은 것은?",
    questionContent: "I study English <u>to talk</u> with foreigners.",
    options: [
      "I want <u>to be</u> a teacher.",
      "Jihye is going to the library <u>to study</u>.",
      "Minho likes <u>to take care of</u> sick people.",
      "I need something <u>to eat</u>.",
      "It is exciting <u>to play</u> tennis."
    ],
    correctAnswer: 2,
    explanation: "보기와 2번 모두 '~하기 위해' 목적을 나타내는 부사적 용법이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 13: to부정사 용법
  {
    id: 61,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'B',
    questionText: "주어진 문장의 밑줄 친 부분과 용법이 같은 것은?",
    questionContent: "I have some books <u>to buy</u>.",
    options: [
      "I wish <u>to travel</u> around the world.",
      "Give him something <u>to eat</u>.",
      "I went to the cafe <u>to meet</u> him.",
      "I hope <u>to see</u> you at the party.",
      "It's fun <u>to teach</u> the students."
    ],
    correctAnswer: 2,
    explanation: "보기와 2번 모두 명사를 수식하는 형용사적 용법이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 14: 어법상 틀린 문장 개수
  {
    id: 62,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "다음 a~f 중 어법상 틀린 문장의 개수로 알맞은 것은?",
    questionContent: "a) I enjoy talking with my grandmother.<br/>b) Do you mind if I borrow your pen?<br/>c) When will you decide meeting him?<br/>d) He has many books to read in two days.<br/>e) My dad made me to take out the trash.<br/>f) I want you bring me my car key.",
    options: [
      "1개",
      "2개",
      "3개",
      "4개",
      "5개"
    ],
    correctAnswer: 3,
    explanation: "c) decide + to부정사, e) make + 목적어 + 동사원형, f) want + 목적어 + to부정사. 3개가 틀림.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 15: for/of 구문
  {
    id: 63,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'B',
    questionText: "다음 빈칸에 들어갈 단어가 나머지 넷과 <u>다른</u> 하나는?",
    options: [
      "It was necessary ______ him to get the answer.",
      "It is very kind ______ you to say so.",
      "It is not difficult ______ her to win the prize.",
      "It is helpful ______ me to wear a mask.",
      "It was exciting ______ them to reach the top of the mountain."
    ],
    correctAnswer: 2,
    explanation: "2번은 of (성격/태도를 나타내는 형용사 kind), 나머지는 for가 온다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 16: 사역동사
  {
    id: 64,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'B',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것은?",
    questionContent: "The red shirt made her __________ better.",
    options: [
      "looks",
      "look",
      "looked",
      "looking",
      "to look"
    ],
    correctAnswer: 2,
    explanation: "make + 목적어 + 동사원형 구문이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 17: 동사 + 목적어 + to부정사
  {
    id: 65,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'B',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것은?",
    questionContent: "Mom told me __________watching TV.",
    options: [
      "stop",
      "stopping",
      "to stop",
      "stopped",
      "stops"
    ],
    correctAnswer: 3,
    explanation: "tell + 목적어 + to부정사 구문이다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 18: 어법 교정
  {
    id: 66,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'B',
    questionText: "어법상 틀린 것을 바르게 고친 것 중 <u>잘못된</u> 것은?",
    options: [
      "I told him <u>take</u> a break and get some sleep. → to take",
      "He made his son <u>to keep</u> a promise. → keep",
      "Mom didn't allow me <u>going</u> to the movies. → go",
      "I helped him <u>moved</u> the desk. → move",
      "Jenny saw them <u>to hide</u> in the closet. → hide"
    ],
    correctAnswer: 3,
    explanation: "allow + 목적어 + to부정사 형태이므로 going → to go가 맞다.",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 19: 밑줄 친 부분 중 틀린 것
  {
    id: 67,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "다음 밑줄 친 부분 중 틀린 것을 고르시오.",
    options: [
      "The cat tried <u>to catch</u> a mouse.",
      "Many people choose <u>not to marry</u>.",
      "He continued <u>to ignore</u> everything I said.",
      "Ryan gave up <u>to write</u> his books in serials.",
      "The officer promised <u>to look into</u> the matter."
    ],
    correctAnswer: 4,
    explanation: "give up은 동명사를 목적어로 취한다. to write → writing",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 20: 밑줄 친 부분 중 틀린 것
  {
    id: 68,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "다음 밑줄 친 부분 중 틀린 것을 고르시오.",
    options: [
      "I quit <u>smoking</u> about a year ago.",
      "She decided <u>majoring</u> in business.",
      "Do you mind <u>sharing</u> the table with us?",
      "He enjoyed <u>fishing</u> when he was young.",
      "They began <u>to scream</u> at the ghost house."
    ],
    correctAnswer: 2,
    explanation: "decide는 to부정사를 목적어로 취한다. majoring → to major",
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },

  // B구간 객관식 문제들
  // B구간 객관식 21: 현재완료
  {
    id: 69,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "빈칸에 들어갈 말이 순서대로 바르게 짝지어진 것은?",
    questionContent: "A: ________ you ever ________ to the Grand Canyon?<br/>B: No, I ________. I really want to visit there someday.",
    options: [
      "Did – go – didn't",
      "Have – been – haven't",
      "Have – gone – haven't",
      "Are – been – am not"
    ],
    correctAnswer: 2,
    explanation: "현재완료 경험 용법: Have you ever been to ~? (가본 적 있니?)",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 22: 현재완료
  {
    id: 70,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "밑줄 친 부분 중 어법상 틀린 것은?",
    questionContent: "I ①<u>have</u> ②<u>took</u> guitar lessons ③<u>since</u> ④<u>last year</u>.",
    options: ["①", "②", "③", "④"],
    correctAnswer: 2,
    explanation: "현재완료는 have + 과거분사 형태이다. took → taken",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 23: 현재완료
  {
    id: 71,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "밑줄 친 부분 중 어법상 틀린 것은?",
    questionContent: "She ①<u>has lived</u> ②<u>in Jeju</u> ③<u>since</u> ④<u>five years</u>.",
    options: ["①", "②", "③", "④"],
    correctAnswer: 4,
    explanation: "기간(five years)을 나타낼 때는 for를 쓴다. since five years → for five years",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 객관식 24: 현재완료 어법 교정
  {
    id: 72,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'B',
    questionText: "밑줄 친 부분 중 어법상 틀린 것은?",
    questionContent: "Amy ①<u>has lost</u> her favorite ring ②<u>last week</u>.",
    options: ["① has lost", "② last week", "③ her favorite", "④ ring"],
    correctAnswer: 1,
    explanation: "last week은 과거 시점을 나타내므로 현재완료가 아닌 과거시제를 써야 한다. has lost → lost",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 주관식 5: 동명사 성분 (객관식)
  {
    id: 73,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "밑줄 친 동명사의 쓰임을 고르세요.\n\n<u>Reading</u> comic books is very fun.",
    options: [
      "주어",
      "목적어",
      "보어"
    ],
    correctAnswer: 1,
    explanation: "Reading comic books가 문장의 주어 역할을 한다.",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 주관식 6: 동명사 성분 (객관식)
  {
    id: 74,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "밑줄 친 동명사의 쓰임을 고르세요.\n\nCindy hates <u>cleaning</u> the bathroom.",
    options: [
      "주어",
      "목적어",
      "보어"
    ],
    correctAnswer: 2,
    explanation: "cleaning the bathroom이 동사 hates의 목적어 역할을 한다.",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // B구간 주관식 7: 동명사 성분 (객관식)
  {
    id: 75,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    grammarLevel: 'B',
    questionText: "밑줄 친 동명사의 쓰임을 고르세요.\n\nMy hobby is <u>playing</u> basketball.",
    options: [
      "주어",
      "목적어",
      "보어"
    ],
    correctAnswer: 3,
    explanation: "playing basketball이 be동사 뒤에서 주어를 보충 설명하는 보어 역할을 한다.",
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  }
];

// ========================================
// PART 4: 문법 C구간 (심화) - 객관식 20문제
// ========================================

export const prepGrammarCQuestionsV1: PrepLevelTestQuestion[] = [
  // C구간 객관식 1: 조동사 - may 용법
  {
    id: 76,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 심화',
    grammarLevel: 'C',
    questionText: "다음 밑줄 친 부분의 쓰임이 나머지 넷과 다른 것은?",
    options: [
      "You <u>may</u> leave now.",
      "It <u>may</u> be true.",
      "It <u>may</u> rain this afternoon.",
      "He <u>may</u> come back home today",
      "He <u>may</u> be a teacher."
    ],
    correctAnswer: 1,
    explanation: "1번의 may는 '허락'의 의미이고, 나머지는 모두 '추측'의 의미이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 2: 어법 오류 (복수선택)
  {
    id: 77,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'C',
    questionText: "어법상 잘못된 것을 <u>2개</u> 고르면?",
    options: [
      "She got up early to not miss the train.",
      "He seems to know the answer.",
      "Peter helped his brother fix the bike.",
      "My parents wanted me enter the contest.",
      "Jessy taught me how to use the machine."
    ],
    correctAnswer: [1, 4],
    explanation: "1번: to not → not to (부정어 위치), 4번: wanted me to enter (want + 목적어 + to부정사)",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 3: 조동사 의미 비교
  {
    id: 78,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사 심화',
    grammarLevel: 'C',
    questionText: "짝지어진 두 문장의 뜻이 다른 것은?",
    questionContent: "1) I don't have to worry about it.\n= I must not worry about it.\n\n2) I would like to drink some orange juice.\n= I want to drink some orange juice.\n\n3) Perhaps he is working.\n= He may be working.\n\n4) You are quite right in saying so.\n= You may well say so.\n\n5) Do you think I should apply for the job?\n= Do you think I ought to apply for the job?",
    options: [
      "1번",
      "2번",
      "3번",
      "4번",
      "5번"
    ],
    correctAnswer: 1,
    explanation: "don't have to는 '~할 필요가 없다', must not은 '~해서는 안 된다'로 의미가 다르다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 4: to부정사 용법
  {
    id: 79,
    section: 'grammar',
    category: '문법',
    subCategory: 'to부정사',
    grammarLevel: 'C',
    questionText: "밑줄 친 부분의 쓰임이 다른 하나는?",
    options: [
      "We need chairs <u>to sit</u> on.",
      "Please give me something <u>to eat</u>.",
      "He went to Paris <u>to study</u> art.",
      "She has lots of work <u>to do</u> today.",
      "They have no house <u>to live</u> in."
    ],
    correctAnswer: 3,
    explanation: "3번은 부사적 용법(목적)이고, 나머지는 형용사적 용법(명사 수식)이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 5: 수동태
  {
    id: 80,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'C',
    questionText: "다음 문장에서 어법상 올바른 문장은?",
    options: [
      "Where did your cell phone found?",
      "This cake didn't made by my mom.",
      "The novels were written by my mom.",
      "The vase was not breaking by the dog.",
      "The books was bought by my father."
    ],
    correctAnswer: 3,
    explanation: "3번만 수동태(were written)가 올바르게 사용되었다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 6: 수동태 불가
  {
    id: 81,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    grammarLevel: 'C',
    questionText: "다음 중 수동태로 만들 수 없는 문장은?",
    options: [
      "He helped lots of children in Africa.",
      "Everybody calls her Ms. Smile.",
      "She became more and more beautiful.",
      "You must finish this work by tomorrow.",
      "He filled the room with flowers."
    ],
    correctAnswer: 3,
    explanation: "become은 자동사이므로 수동태로 만들 수 없다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 7: It 용법
  {
    id: 82,
    section: 'grammar',
    category: '문법',
    subCategory: 'It 용법',
    grammarLevel: 'C',
    questionText: "다음 밑줄 친 <u>It</u>의 쓰임이 다른 것은?",
    options: [
      "<u>It</u> is so hard for me to get up early in the morning.",
      "<u>It</u> was great to spend time with your family.",
      "<u>It</u> will be really fun to go to the Club Festival.",
      "<u>It</u> was too cold outside so I didn't go out.",
      "<u>It</u> would be better for you to visit us."
    ],
    correctAnswer: 4,
    explanation: "4번의 It은 날씨를 나타내는 비인칭 주어이고, 나머지는 가주어 It이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 8: too~to 의미
  {
    id: 83,
    section: 'grammar',
    category: '문법',
    subCategory: 'too~to / so~that',
    grammarLevel: 'C',
    questionText: "다음 중 의미가 다른 하나는?",
    options: [
      "I was too tired to do anything.",
      "I was not too tired to do anything.",
      "I was so tired that I couldn't do anything.",
      "I couldn't do anything because I was so tired.",
      "Because I was too tired, I couldn't do anything."
    ],
    correctAnswer: 2,
    explanation: "2번은 '너무 피곤해서 아무것도 할 수 없는 것은 아니었다' (할 수 있었다)의 의미이고, 나머지는 모두 '너무 피곤해서 아무것도 할 수 없었다'의 의미이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 9: 문장 의미 비교
  {
    id: 84,
    section: 'grammar',
    category: '문법',
    subCategory: 'too~to / so~that',
    grammarLevel: 'C',
    questionText: "짝지어진 두 문장의 의미가 같은 것은?",
    questionContent: "1) Please tell me where to put this plant.\n= Please tell me where you will put this plant.\n\n2) I was so busy that I couldn't call you.\n= I was busy enough to call you.\n\n3) We are to see the motor show.\n= We want to see the motor show.\n\n4) The refrigerator was so expensive that he couldn't buy it.\n= The refrigerator was too expensive to buy.\n\n5) If you are to succeed, you should study hard.\n= If you are able to succeed, you should study hard.",
    options: [
      "1번",
      "2번",
      "3번",
      "4번",
      "5번"
    ],
    correctAnswer: 4,
    explanation: "too ~ to = so ~ that ... can't 구문이다. 4번이 같은 의미이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 10: 지각동사
  {
    id: 85,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'C',
    questionText: "다음 중 어법상 어색한 것을 고르시오.",
    options: [
      "She heard the dog barking loudly.",
      "The man watched her singing an opera.",
      "Do you feel my legs shaking?",
      "Did he really hear her to shout?",
      "We saw them sleeping on the floor."
    ],
    correctAnswer: 4,
    explanation: "지각동사 + 목적어 + 동사원형/-ing 형태이다. to shout → shout 또는 shouting",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 11: 지각동사 괄호
  {
    id: 86,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'C',
    questionText: "다음 괄호 안에 적절한 것이 바르게 짝지어진 것을 모두 고르시오.",
    questionContent: "a. I saw a lady ( sitting / sit / sat ) in the living room.\nb. We looked at the monkey ( to take care / take care / took care ) of its baby.",
    options: [
      "sitting, take care",
      "sit, took care",
      "sat, to take care",
      "sit, take care",
      "sitting, to take care"
    ],
    correctAnswer: [1, 4],
    explanation: "a. 지각동사 saw + 목적어 + 동사원형/-ing (sitting), b. look at + 목적어 + to부정사 (to take care)",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 12: 어법 교정
  {
    id: 87,
    section: 'grammar',
    category: '문법',
    subCategory: '준동사 심화',
    grammarLevel: 'C',
    questionText: "다음 문장에서 어색한 부분을 바르게 고친 것을 고르시오.",
    questionContent: "Koreans tend to keep silently when eating.",
    options: [
      "Koreans tend keeping silently when eating.",
      "Koreans tend to keep silent when eating.",
      "Koreans tend to keeping silently when eating.",
      "Koreans tends to keep silent when eating.",
      "Koreans tend to keep silently when eat."
    ],
    correctAnswer: 2,
    explanation: "keep + 형용사 구문이므로 silently(부사) → silent(형용사)로 고쳐야 한다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 13: 사역동사
  {
    id: 88,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'C',
    questionText: "다음 중 어법상 올바른 것을 고르시오.",
    options: [
      "My father never lets me to go to the zoo.",
      "Please let him to watch the basketball game.",
      "She had her daughter talking to her.",
      "My mother doesn't let me ate junk food.",
      "She made her robot clean her room."
    ],
    correctAnswer: 5,
    explanation: "사역동사 make + 목적어 + 동사원형 형태이다. 5번만 올바르다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 14: help 구문 (복수선택)
  {
    id: 89,
    section: 'grammar',
    category: '문법',
    subCategory: '5형식 문장',
    grammarLevel: 'C',
    questionText: "다음 빈칸에 적절한 것을 <u>모두</u> 고르시오.",
    questionContent: "I will help my father _____________ the dishes.",
    options: [
      "wash",
      "washed",
      "washing",
      "to wash",
      "to washing"
    ],
    correctAnswer: [1, 4],
    explanation: "help + 목적어 + 동사원형/to부정사가 가능하다. 1번(wash)과 4번(to wash)이 맞다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 15: 사역동사 올바른 것
  {
    id: 90,
    section: 'grammar',
    category: '문법',
    subCategory: '사역/지각동사',
    grammarLevel: 'C',
    questionText: "다음 중 어법상 올바른 것을 고르시오.",
    options: [
      "The chef let the soup to boil for two hours.",
      "My parents made me clean the garage last weekend.",
      "She had her cat wearing a funny costume.",
      "The coach made the players to run ten laps.",
      "We let our kids to stay up late on New Year's Eve."
    ],
    correctAnswer: 2,
    explanation: "사역동사 make + 목적어 + 동사원형 형태이다. 2번만 올바르다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 16: 시제 오류
  {
    id: 91,
    section: 'grammar',
    category: '문법',
    subCategory: '시제',
    grammarLevel: 'C',
    questionText: "다음 중 어법상 어색한 것을 고르시오.",
    options: [
      "It's not far from here.",
      "Is he your English teacher?",
      "Why don't we clean up the room?",
      "I take some pictures last weekend.",
      "We picked up lots of bottles and cans today."
    ],
    correctAnswer: 4,
    explanation: "last weekend은 과거 시점이므로 take → took으로 고쳐야 한다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 17: 문장 형식
  {
    id: 92,
    section: 'grammar',
    category: '문법',
    subCategory: '5형식 문장',
    grammarLevel: 'C',
    questionText: "다음 중 형식이 다른 것을 고르시오.",
    options: [
      "John asked me to join the meeting.",
      "The teacher told the students to sit down.",
      "I want you to keep calm until he comes.",
      "They advised her to take a rest.",
      "My uncle gave me a new watch."
    ],
    correctAnswer: 5,
    explanation: "5번은 4형식(수여동사 + 간접목적어 + 직접목적어)이고, 나머지는 5형식(동사 + 목적어 + 목적격보어)이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 18: 현재완료
  {
    id: 93,
    section: 'grammar',
    category: '문법',
    subCategory: '현재완료',
    grammarLevel: 'C',
    questionText: "주어진 두 문장을 한 문장으로 적절하게 표현한 문장을 고르시오.",
    questionContent: "He lost his wallet. He doesn't have it now.",
    options: [
      "He have lost his wallet.",
      "He lost his wallet.",
      "He had lost his wallet.",
      "He has been lost his wallet.",
      "He has lost his wallet."
    ],
    correctAnswer: 5,
    explanation: "과거에 잃어버려서 현재까지 영향이 있는 경우 현재완료(has lost)를 사용한다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 19: be going to
  {
    id: 94,
    section: 'grammar',
    category: '문법',
    subCategory: '준동사 심화',
    grammarLevel: 'C',
    questionText: "다음 중 밑줄 친 부분이 다른 것을 고르시오.",
    options: [
      "He <u>is going to</u> read the letters.",
      "We <u>are going to</u> have a party tonight.",
      "They <u>are going to</u> school right now.",
      "She <u>is going to</u> play volleyball with her friends.",
      "I'<u>m going to</u> drink some water."
    ],
    correctAnswer: 3,
    explanation: "3번의 'are going to school'은 '학교에 가는 중'이라는 현재진행형이고, 나머지는 'be going to + 동사원형' 미래 표현이다.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // C구간 객관식 20: 타동사/자동사
  {
    id: 95,
    section: 'grammar',
    category: '문법',
    subCategory: '타동사/자동사',
    grammarLevel: 'C',
    questionText: "다음 중 어법상 어색한 것을 고르시오.",
    options: [
      "Jenny resembles her mother very much.",
      "I refused to do the dishes this morning.",
      "We reached the subway station in twenty minutes.",
      "Andy discussed about the problem with Kelly.",
      "He drives his car carefully."
    ],
    correctAnswer: 4,
    explanation: "discuss는 타동사로 전치사 없이 목적어를 바로 취한다. about 삭제 필요.",
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  }
];

// ========================================
// PART 5: 어휘 (Vocabulary) - 50문제 (중등 레벨테스트와 동일 형식)
// ========================================

export const prepVocabularyQuestionsV1: PrepLevelTestQuestion[] = [
  // 기초 어휘 (1-18) - ID 96-113
  { id: 96, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "rude", correctAnswers: ["버릇없는", "무례한"], fixedDistractors: ["친절한", "상냥한", "정중한"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 97, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "owl", correctAnswers: ["올빼미", "부엉이"], fixedDistractors: ["독수리", "참새", "비둘기"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 98, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "invest", correctAnswers: ["투자하다", "(수익을 위해) 투자하다"], fixedDistractors: ["저축하다", "소비하다", "낭비하다"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 99, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "sunlight", correctAnswers: ["햇빛", "햇살"], fixedDistractors: ["달빛", "별빛", "그림자"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 100, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "victim", correctAnswers: ["희생자", "피해자"], fixedDistractors: ["가해자", "목격자", "구조자"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 101, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "stuff", correctAnswers: ["물건", "것", "~을채워넣다"], fixedDistractors: ["사람", "장소"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 102, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "discuss", correctAnswers: ["논의하다", "토론하다"], fixedDistractors: ["침묵하다", "회피하다", "결정하다"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 103, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "soil", correctAnswers: ["흙", "토양"], fixedDistractors: ["모래", "자갈", "바위"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 104, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "view", correctAnswers: ["견해", "경관", "전망", "생각"], fixedDistractors: ["소리"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 105, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "courage", correctAnswers: ["용기", "담력"], fixedDistractors: ["두려움", "겁", "불안"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 106, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "bit", correctAnswers: ["약간", "조금"], fixedDistractors: ["많이", "전혀", "거의"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 107, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "bug", correctAnswers: ["작은 곤충", "벌레"], fixedDistractors: ["새", "물고기", "동물"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 108, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "organ", correctAnswers: ["장기", "기관(악기)", "오르간"], fixedDistractors: ["근육", "뼈"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 109, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "achieve", correctAnswers: ["이루다", "성취하다"], fixedDistractors: ["실패하다", "포기하다", "시작하다"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 110, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "comb", correctAnswers: ["빗", "빗질하다", "빗다"], fixedDistractors: ["가위", "거울"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 111, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "street", correctAnswers: ["도로", "길거리"], fixedDistractors: ["건물", "공원", "광장"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 112, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "loud", correctAnswers: ["큰 소리의", "시끄러운"], fixedDistractors: ["조용한", "부드러운", "낮은"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
  { id: 113, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "astronaut", correctAnswers: ["우주비행사"], fixedDistractors: ["조종사", "선원", "탐험가", "과학자"], points: 2, difficulty: 'basic', inputType: 'multiText' as any },

  // 중급 어휘 (19-35) - ID 114-130
  { id: 114, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "cross", correctAnswers: ["건너다", "횡단하다", "교차하다"], fixedDistractors: ["피하다", "돌아가다"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 115, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "tiny", correctAnswers: ["아주 적은", "아주 작은"], fixedDistractors: ["커다란", "거대한", "넓은"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 116, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "brief", correctAnswers: ["잠깐의", "간결한"], fixedDistractors: ["길고긴", "복잡한", "지루한"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 117, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "cell", correctAnswers: ["세포"], fixedDistractors: ["기관", "장기", "조직", "근육"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 118, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "market", correctAnswers: ["시장"], fixedDistractors: ["상점", "광장", "공장", "은행"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 119, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "interact", correctAnswers: ["상호작용하다", "소통하다"], fixedDistractors: ["무시하다", "방해하다", "차단하다"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 120, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "nearly", correctAnswers: ["거의"], fixedDistractors: ["전혀", "결코", "완전히", "정확히"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 121, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "numerous", correctAnswers: ["많은", "수많은"], fixedDistractors: ["적은", "드문", "유일한"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 122, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "precious", correctAnswers: ["귀중한", "값비싼"], fixedDistractors: ["흔한", "값싼", "쓸모없는"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 123, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "sharp", correctAnswers: ["날카로운", "뾰족한", "급격한"], fixedDistractors: ["무딘", "완만한"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 124, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "degree", correctAnswers: ["범위", "정도", "(온도단위) 도"], fixedDistractors: ["속도", "무게"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 125, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "occupation", correctAnswers: ["점유", "직업"], fixedDistractors: ["취미", "휴식", "여가"], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 126, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "provide", correctAnswers: ["공급하다", "제공하다"], fixedDistractors: ["거절하다", "빼앗다", "숨기다"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 127, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "develop", correctAnswers: ["개발하다", "발전하다"], fixedDistractors: ["퇴화하다", "감소하다", "파괴하다"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 128, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "improve", correctAnswers: ["향상시키다", "개선하다"], fixedDistractors: ["악화시키다", "약화시키다", "유지하다"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 129, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "relationship", correctAnswers: ["관계"], fixedDistractors: ["감정", "기억", "약속", "친구"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
  { id: 130, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "social", correctAnswers: ["사회적인"], fixedDistractors: ["개인적인", "비밀의", "고립된", "독립적인"], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },

  // 고급 어휘 (36-50) - ID 131-145
  { id: 131, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "behave", correctAnswers: ["행동하다"], fixedDistractors: ["관찰하다", "기억하다", "이해하다", "느끼다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 132, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "terrible", correctAnswers: ["끔찍한"], fixedDistractors: ["멋진", "훌륭한", "평범한", "흥미로운"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 133, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "positive", correctAnswers: ["긍정적인"], fixedDistractors: ["부정적인", "중립적인", "회의적인", "불확실한"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 134, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "ride", correctAnswers: ["타다"], fixedDistractors: ["걷다", "달리다", "내리다", "멈추다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 135, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "emotion", correctAnswers: ["감정"], fixedDistractors: ["이성", "행동", "기억", "생각"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 136, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "proper", correctAnswers: ["적절한"], fixedDistractors: ["부적절한", "어색한", "지나친", "부족한"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 137, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "proud", correctAnswers: ["자랑스러워하는"], fixedDistractors: ["부끄러운", "겸손한", "실망한", "두려운"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 138, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "approach", correctAnswers: ["접근하다"], fixedDistractors: ["멀어지다", "회피하다", "후퇴하다", "벗어나다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 139, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "despite", correctAnswers: ["~에도 불구하고"], fixedDistractors: ["~때문에", "~덕분에", "~동안에", "~대신에"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 140, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "generate", correctAnswers: ["발생시키다"], fixedDistractors: ["소멸시키다", "감소시키다", "유지하다", "보존하다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 141, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "describe", correctAnswers: ["묘사하다"], fixedDistractors: ["숨기다", "왜곡하다", "지우다", "기록하다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 142, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "habitat", correctAnswers: ["서식지"], fixedDistractors: ["습관", "행동", "특성", "생태"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 143, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "allow", correctAnswers: ["허락하다"], fixedDistractors: ["금지하다", "거절하다", "방해하다", "막다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 144, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "relieve", correctAnswers: ["경감하다", "안도시키다"], fixedDistractors: ["악화시키다", "긴장시키다", "심화시키다"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
  { id: 145, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "expert", correctAnswers: ["전문가"], fixedDistractors: ["초보자", "견습생", "관찰자", "조수"], points: 2, difficulty: 'advanced', inputType: 'multiText' as any }
];

// ========================================
// 전체 문제 배열 및 분석 카테고리
// ========================================

export const allPrepQuestionsV1: PrepLevelTestQuestion[] = [
  ...prepReadingQuestionsV1,
  ...prepGrammarAQuestionsV1,
  ...prepGrammarBQuestionsV1,
  ...prepGrammarCQuestionsV1,
  ...prepVocabularyQuestionsV1
];

// 예비중 분석 카테고리 정의
export const prepAnalysisCategoriesV1 = {
  reading: {
    name: '독해 (Reading)',
    subCategories: [
      { name: '글의 목적', questions: [1] },
      { name: '심경 파악', questions: [2] },
      { name: '필자의 주장', questions: [3] },
      { name: '내용 일치/불일치', questions: [4] },
      { name: '주어동사파악', questions: [5, 6, 7, 8] }
    ]
  },
  grammarA: {
    name: '문법 A구간 (기초)',
    subCategories: [
      { name: '일반동사 의문문', questions: [9, 10, 11, 12, 13, 29, 30, 31, 32, 38, 39, 45, 46] },
      { name: '의문사', questions: [14, 15] },
      { name: '과거 시제/부정문', questions: [16, 17, 33, 47] },
      { name: '조동사 기초', questions: [22, 23, 24, 25, 40, 41, 42, 43] },
      { name: '감각동사 + 형용사', questions: [18, 19, 20, 21, 27] },
      { name: '현재진행형', questions: [26, 34, 35, 36, 37, 44, 48] }
    ]
  },
  grammarB: {
    name: '문법 B구간 (중급)',
    subCategories: [
      { name: '현재완료', questions: [49, 50, 51, 52, 67, 69, 70, 71] },
      { name: '수동태', questions: [53, 54, 55, 58, 63, 64] },
      { name: 'to부정사', questions: [56, 57, 62, 65] },
      { name: '동명사', questions: [59, 60, 68, 72, 73, 74] },
      { name: '사역/지각동사', questions: [61, 66] }
    ]
  },
  grammarC: {
    name: '문법 C구간 (심화)',
    subCategories: [
      { name: '조동사 심화', questions: [76, 78] },
      { name: 'to부정사', questions: [77, 79] },
      { name: '수동태', questions: [80, 81] },
      { name: 'It 용법', questions: [82] },
      { name: 'too~to / so~that', questions: [83, 84] },
      { name: '사역/지각동사', questions: [85, 86, 87, 88, 89, 90] },
      { name: '시제', questions: [91] },
      { name: '5형식 문장', questions: [92] },
      { name: '현재완료', questions: [93] },
      { name: '준동사 심화', questions: [94] },
      { name: '타동사/자동사', questions: [95] }
    ]
  },
  vocabulary: {
    name: '어휘 (Vocabulary)',
    subCategories: [
      { name: '기초', questions: [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113] },
      { name: '중급', questions: [114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130] },
      { name: '고급', questions: [131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145] }
    ]
  }
};

// 예비중 섹션 이름
export const prepSectionNamesV1: Record<string, string> = {
  reading: '독해',
  grammarA: '문법 A구간',
  grammarB: '문법 B구간',
  grammarC: '문법 C구간',
  vocabulary: '어휘'
};

// 총점 계산 함수
export const calculatePrepTotalMaxScoreV1 = (): number => {
  return allPrepQuestionsV1.reduce((total, q) => total + q.points, 0);
};

export const getPrepQuestionPointsV1 = (q: PrepLevelTestQuestion): number => q.points;
