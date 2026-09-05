// 레벨테스트 문제 데이터

export interface SentenceWord {
  text: string;
  isSubject?: boolean;
  isVerb?: boolean;
}

export interface LevelTestQuestion {
  id: number;
  section: 'grammar' | 'reading' | 'vocabulary' | 'sentence';
  category: string;
  subCategory: string;
  questionText: string;
  questionContent?: string; // 추가 지문이나 내용
  chartImage?: string; // 도표 이미지 URL
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: string[]; // 다중 정답 (어휘 문제용)
  sentenceWords?: string[]; // 문장 구조 분석용 단어 배열
  correctSubjects?: string[]; // 정답 주어들
  correctVerbs?: string[]; // 정답 동사들
  optionalSubjects?: string[]; // 선택적 정답 주어들 (있어도 되고 없어도 됨)
  optionalVerbs?: string[]; // 선택적 정답 동사들 (있어도 되고 없어도 됨)
  points: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  inputType: 'choice' | 'text' | 'multiText' | 'multiChoice' | 'sentenceClick'; // 객관식, 주관식, 다중입력, 다중선택, 문장클릭
}

// 섹션 1: 문법 (1~30번)
export const grammarQuestions: LevelTestQuestion[] = [
  // 1번: 하, be동사, 정답 3
  {
    id: 1,
    section: 'grammar',
    category: '문법',
    subCategory: 'be동사',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것을 고르시오.\n\nThe singer's hair _____ brown last month.",
    options: ['is', 'are', 'was', 'were', 'is not'],
    correctAnswer: 3,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 2번: 상, be동사, 정답 2 (기존 3번에서 이동)
  {
    id: 2,
    section: 'grammar',
    category: '문법',
    subCategory: 'be동사',
    questionText: "In the past, the castle _____ surrounded by a vast forest.",
    options: ['is', 'was', 'are', 'were', 'being'],
    correctAnswer: 2,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 3번: 하, be동사, 정답 2 (새 문제)
  {
    id: 3,
    section: 'grammar',
    category: '문법',
    subCategory: 'be동사',
    questionText: "어법상 어색한 문장의 개수로 맞는 것을 고르시오.",
    questionContent: "(A) He isn't a middle school student.\n(B) It's the famous 63 Building.\n(C) You isn't a writer.\n(D) This cake is very expensive.\n(E) I amn't tired.\n(F) Two pillows was on the bed.\n(G) They weren't honest.\n(H) His voice wasn't loud enough.\n(I) It was cloudy this morning.\n(J) Her daughter weren't excited.",
    options: ['2개', '4개', '6개', '8개', '10개'],
    correctAnswer: 2,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 4번: 하, 일반동사, 정답 4
  {
    id: 4,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사',
    questionText: "다음 문장을 부정문으로 바르게 바꾼 것은?\n\nDavid drank coffee today.",
    options: [
      'David not drank coffee today.',
      "David doesn't drank coffee today.",
      "David doesn't drink coffee today.",
      "David didn't drink coffee today.",
      "David didn't drank coffee today."
    ],
    correctAnswer: 4,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 5번: 중, 일반동사, 정답 2 (기존 2번에서 이동)
  {
    id: 5,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것을 고르시오.\n\nMy family _____ camping last weekend.",
    options: ['goes', 'went', 'is going', 'will go', 'has gone'],
    correctAnswer: 2,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 6번: 상, 일반동사, 정답 2
  {
    id: 6,
    section: 'grammar',
    category: '문법',
    subCategory: '일반동사',
    questionText: "어법상 어색한 문장의 개수로 맞는 것을 고르시오.",
    questionContent: "(A) Can he figure out how to open it by himself?\n(B) Will you be there all day long with Mark?\n(C) Does it has anything to do with the accident?\n(D) How is Nick going to prepare for the test overnight?\n(E) Was there any messages for me while I was out?\n(F) What does your sister want to do when she graduates from college?\n(G) Does it important for children to exercise on a regular basis?\n(H) Doesn't it matter to you what I wear for the party?",
    options: ['2개', '3개', '4개', '5개', '6개'],
    correctAnswer: 2,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 7번: 하, 조동사, 정답 1
  {
    id: 7,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사',
    questionText: "빈칸에 알맞은 조동사를 고르시오.\n\nCindy는 3개 국어를 말할 수 있다.\n=> Cindy ____ speak three languages.",
    options: ['can', 'must', 'may', 'has to', "don't have to"],
    correctAnswer: 1,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 8번: 중, 조동사, 정답 2
  {
    id: 8,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사',
    questionText: "빈칸에 알맞은 조동사를 고르시오.\n\n너는 제시간에 회의에 참석해야 한다.\n=> You ____ attend the meeting on time.",
    options: ['can', 'must', 'has to', 'may', "don't have to"],
    correctAnswer: 2,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 9번: 상, 조동사, 정답 4 (기존 5번에서 이동)
  {
    id: 9,
    section: 'grammar',
    category: '문법',
    subCategory: '조동사',
    questionText: "어법상 어색한 문장의 개수로 맞는 것을 고르시오.",
    questionContent: "(A) They were seriously hurt in the car accident. They should have fastened their seat belts.\n(B) We haven't seen her lately. She must be out of town.\n(C) He trusts her one hundred percent. She can have stolen his watch.\n(D) We couldn't buy anything at the store for two weeks. It might have closed down.\n(E) The game was so boring. You must not have been disappointed.\n(F) The lecture was very informative. You should have attended it with us.\n(G) She shouldn't have spent so much money on designer bags. She's broke now.\n(H) He must go to Singapore. I haven't seen him lately.",
    options: ['0개', '1개', '2개', '3개', '4개'],
    correctAnswer: 4,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 10번: 하, 시제, 정답 4
  {
    id: 10,
    section: 'grammar',
    category: '문법',
    subCategory: '시제',
    questionText: "다음 중 주어를 바꿔 쓴 문장이 어법상 틀린 것은?",
    options: [
      'I like oranges. => He likes oranges.',
      'You have a new cell phone. => She has a new cell phone.',
      'We take a walk. => Yumi takes a walk.',
      'They move fast. => The animals moves fast.',
      "Jonathan goes hiking. => Jonathan's parents go hiking."
    ],
    correctAnswer: 4,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 11번: 중, 시제, 정답 3
  {
    id: 11,
    section: 'grammar',
    category: '문법',
    subCategory: '시제',
    questionText: "다음 중 어법상 틀린 것을 고르시오.",
    questionContent: "(1) Does (2) she (3) has dinner (4) with (5) his classmates?",
    options: ['Does', 'she', 'has dinner', 'with', 'his classmates'],
    correctAnswer: 3,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 12번: 상, 시제, 정답 3
  {
    id: 12,
    section: 'grammar',
    category: '문법',
    subCategory: '시제',
    questionText: "어법상 어색한 문장이 몇 개인지 고르시오.",
    questionContent: "Sue and I are best friends. (A) Our friendship start when we were ten years old. (B) We took a walk and study together. (C) Sometimes we argued and didn't agree with each other. Now we have a lot of things in common. (D) We understand each other and spent lots of time together. (E) I hope that our friendship will last forever.",
    options: ['0개', '1개', '2개', '3개', '4개'],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 13번: 하, 완료, 정답 5
  {
    id: 13,
    section: 'grammar',
    category: '문법',
    subCategory: '완료',
    questionText: "빈칸에 들어갈 말로 알맞은 것을 고르시오.\n\nIt _____ twenty days since she went on the strict diet.",
    options: ['is', 'was', 'is being', 'will be', 'has been'],
    correctAnswer: 5,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 14번: 중, 완료, 정답 5
  {
    id: 14,
    section: 'grammar',
    category: '문법',
    subCategory: '완료',
    questionText: "다음 중 밑줄 친 부분의 쓰임이 나머지와 다른 것을 고르시오.",
    options: [
      'I <u>have never been</u> abroad.',
      '<u>Have</u> you <u>ever seen</u> a ghost?',
      'He <u>has tried</u> Thai food before.',
      'I <u>have visited</u> the national park several times.',
      'She <u>has lost</u> her purse at the theater.'
    ],
    correctAnswer: 5,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 15번: 상, 완료, 정답 "4,5"
  {
    id: 15,
    section: 'grammar',
    category: '문법',
    subCategory: '완료',
    questionText: "밑줄 친 (1)~(5) 중 어법상 어색한 두 개의 문장을 찾아 기호를 쓰시오. (쉼표로 구분)",
    questionContent: "A : (1) <u>How long have you had this car?</u>\nB : (2) <u>My father bought it for me</u> when I graduated from high school, (3) <u>so I have had it for about ten years.</u>\nA : So you must be good at driving. (4) <u>I've just bought my car three months ago.</u> I haven't driven on the highway yet.\nB : (5) <u>I am understanding how you feel each time you are behind the wheel.</u> You know it's always better to be safe than sorry when you drive.\nA : I know, but it is the honking and yelling from other cars that makes me most nervous when I drive.\nB : Just ignore them. It takes time for anyone to get used to driving.",
    correctAnswer: "4,5",
    points: 4,
    difficulty: 'advanced',
    inputType: 'text'
  },
  // 16번: 하, 형식, 정답 1
  {
    id: 16,
    section: 'grammar',
    category: '문법',
    subCategory: '형식',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것은?\n\nShe looks __________.",
    options: ['sleepy', 'kindly', 'an angel', 'me', 'interest'],
    correctAnswer: 1,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 17번: 중, 형식, 정답 3
  {
    id: 17,
    section: 'grammar',
    category: '문법',
    subCategory: '형식',
    questionText: "빈칸에 알맞지 않은 것은?\n\nMy mother __________ a bicycle to me.",
    options: ['sent', 'gave', 'bought', 'brought', 'showed'],
    correctAnswer: 3,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 18번: 상, 형식, 정답 3
  {
    id: 18,
    section: 'grammar',
    category: '문법',
    subCategory: '형식',
    questionText: "밑줄 친 (A)~(E) 중 어법상 어색한 것을 모두 고르시오.",
    questionContent: "After moving to a new city, (A) <u>I joined the company baseball team.</u> Being the oldest player, I had to play in the outfield. During a game, I made a few mistakes, but (B) <u>I kept hearing someone shouting.</u> \"Way to go, Mr. Green!\" and \"You can do it, Mr. Green!\" (C) <u>I was amazed someone would know my name in this strange city.</u> After the game, I met my wife and son and asked if they knew who was cheering for me in the crowd. My son spoke up and said, \"Dad, it was me.\" (D) <u>I asked why was he calling me Mr. Green</u> and he replied, (E) <u>\"I didn't want anyone know that I'm your son.\"</u>",
    options: ['0개', '1개', '2개', '3개', '4개'],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 19번: 하, 부정사, 정답 2
  {
    id: 19,
    section: 'grammar',
    category: '문법',
    subCategory: '부정사',
    questionText: "다음 빈칸에 들어갈 말로 알맞은 것은?\n\nHe decides __________ abroad.",
    options: ['go', 'to go', 'goes', 'going', 'to going'],
    correctAnswer: 2,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 20번: 중, 부정사, 정답 2
  {
    id: 20,
    section: 'grammar',
    category: '문법',
    subCategory: '부정사',
    questionText: "문장의 빈칸에 알맞은 말이 순서대로 짝지어진 것은?\n\n・I want __________ good at English.\n・He hopes __________ Scotland.",
    options: ['be … visit', 'to be … to visit', 'be … to visit', 'to be … visiting', 'being … to visit'],
    correctAnswer: 2,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 21번: 상, 부정사, 정답 4
  {
    id: 21,
    section: 'grammar',
    category: '문법',
    subCategory: '부정사',
    questionText: "어법상 올바른 문장의 개수로 알맞은 것을 고르시오.",
    questionContent: "(A) We don't have any time to discuss this issue any further.\n(B) It seems for them to enjoy spicy foods a lot.\n(C) Harry is sure to be positive about sending his son abroad.\n(D) He often sees his dad help his mom to do household chores.\n(E) Can you smell something awful coming from outside?\n(F) This is something for you to be grateful.\n(G) We are talking about a plan to get him give up his bad habit.\n(H) Tim appears to suffer from a headache for days.",
    options: ['1개', '2개', '3개', '4개', '5개'],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 22번: 하, 동명사, 정답 3
  {
    id: 22,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    questionText: "빈칸에 공통으로 들어가기에 적절한 것을 고르시오.\n\nThank you for _______ me.\nWould you mind _______ him?",
    options: ['help', 'to help', 'helping', 'helped', 'have helped'],
    correctAnswer: 3,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 23번: 중, 동명사, 정답 3
  {
    id: 23,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    questionText: "다음 중 어법상 틀린 것은?",
    options: [
      'My grandfather likes taking naps.',
      'Would you mind doing the dishes?',
      'We enjoyed to have you here with us.',
      "I'm excited about starting yoga.",
      'Swimming is an important survival skill.'
    ],
    correctAnswer: 3,
    points: 2,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 24번: 상, 동명사, 정답 1
  {
    id: 24,
    section: 'grammar',
    category: '문법',
    subCategory: '동명사',
    questionText: "어법상 올바른 문장의 개수로 알맞은 것을 고르시오.",
    questionContent: "(A) One thing I regret about today's match is not playing the game like I used to.\n(B) She flatly denied having been visited his place on the night of the accident.\n(C) I still remember to have a great time while traveling in Turkey.\n(D) His diligence led to his promoting to vice president at the age of 40.\n(E) He prohibited his son playing video games on weekdays.\n(F) After he stopped to take his medicine, his condition got drastically worse.\n(G) The store seems to need renovating to meet the changing tastes of its customers.",
    options: ['2개', '3개', '4개', '5개', '6개'],
    correctAnswer: 1,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 25번: 하, 수동태, 정답 3
  {
    id: 25,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    questionText: "빈칸에 알맞은 것은?\n\nCheese __________ from milk.",
    options: ['made', 'makes', 'is made', 'be made', 'have made'],
    correctAnswer: 3,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 26번: 중, 수동태, 정답 4
  {
    id: 26,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    questionText: "수동태 전환이 어색한 것은?",
    options: [
      'She wrote this book. => This book was written by her.',
      'They will invite him to the party. => He will be invited to the party.',
      'Thomas must clean his room. => His room must be cleaned by Thomas.',
      'Somebody uses the computer. => The computer was used by somebody.',
      'You can see the star from here. => The star can be seen from here by you.'
    ],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 27번: 상, 수동태, 정답 4
  {
    id: 27,
    section: 'grammar',
    category: '문법',
    subCategory: '수동태',
    questionText: "어법상 어색한 것끼리 짝지어진 것을 고르시오.",
    questionContent: "(A) It is said that the Internet has made our lives easier.\n(B) A new idea has suggested by Steve at the meeting.\n(C) The package will be delivered within a week.\n(D) His homework has just been finished by him.\n(E) Remember that those pets should be taken care of you.",
    options: ['(A), (D)', '(A), (E)', '(B), (D)', '(B), (E)', '(C), (E)'],
    correctAnswer: 4,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  // 28번: 하, 분사, 정답 2
  {
    id: 28,
    section: 'grammar',
    category: '문법',
    subCategory: '분사',
    questionText: "빈칸에 알맞은 말이 바르게 짝지어진 것을 고르시오.\n\nMy brother has ______ to Brazil.\nThey have ______ the book three times.",
    options: ['was, readed', 'been, read', 'was, read', 'been, readed', 'be, read'],
    correctAnswer: 2,
    points: 2,
    difficulty: 'basic',
    inputType: 'choice'
  },
  // 29번: 중, 분사, 정답 2
  {
    id: 29,
    section: 'grammar',
    category: '문법',
    subCategory: '분사',
    questionText: "다음 빈칸에 적절한 것을 고르시오.\n\nShe holds ______.",
    options: ['a slept baby', 'a sleeping baby', 'a baby sleeping', 'a baby slept', 'a baby having slept'],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  // 30번: 상, 분사, 정답 2
  {
    id: 30,
    section: 'grammar',
    category: '문법',
    subCategory: '분사',
    questionText: "어법상 어색한 문장이 몇 개인지 고르시오.",
    questionContent: "(A) He brought me a box filled with old stuff.\n(B) She found some books scattering on the floor.\n(C) We were watching lions laying on the grass.\n(D) She was terrified by the thought of going there alone.\n(E) Do you know a boy named Chris in your neighborhood?\n(F) The flower painted in bright colors is found to attract more bees.\n(G) We all agreed that the idea suggested by Harry would be a great hit.",
    options: ['1개', '2개', '3개', '4개', '5개'],
    correctAnswer: 2,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  }
];

// 섹션 1: 독해 (독해 1~10번)
export const readingQuestions: LevelTestQuestion[] = [
  {
    id: 31,
    section: 'reading',
    category: '독해',
    subCategory: '글의 목적',
    questionText: "다음 글의 목적으로 가장 적절한 것은?",
    questionContent: "Dear Ms. Cross,\n\nWe are excited to announce the opening of the newest Sunshine Stationery Store in Raleigh, North Carolina! As you know, the Sunshine Stationery Store has long been the industry standard for quality creative paper products of all kinds, and we couldn't have picked a better location for our next branch than the warm and inviting city of Raleigh. We are thrilled to welcome you to the Grand Opening of the Raleigh store on March 15, 2018. The opening celebration will be from 9 a.m. to 9 p.m. ― a full 12 hours of fun! We would love to show you all the Raleigh store has to offer and hope to see you there on the 15th!\n\nSincerely,\nDonna Deacon",
    options: [
      '신제품의 출시를 홍보하려고',
      '회사 창립 기념일에 초대하려고',
      '이전한 매장의 위치를 안내하려고',
      '신설 매장의 개업식에 초대하려고',
      '매장의 영업시간 변경을 안내하려고'
    ],
    correctAnswer: 4,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 32,
    section: 'reading',
    category: '독해',
    subCategory: '심경 파악',
    questionText: "다음 글에 드러난 'I'의 심경으로 가장 적절한 것은?",
    questionContent: "One day I caught a taxi to work. When I got into the back seat, I saw a brand new cell phone sitting right next to me. I asked the driver, \"Where did you drop the person off?\" and showed him the phone. He pointed at a girl walking up the street. We drove up to her and I rolled down the window yelling out to her. She was very thankful and by the look on her face I could tell how grateful she was. Her smile made me smile and feel really good inside. After she got the phone back, I heard someone walking past her say, \"Today's your lucky day!\"",
    options: ['angry', 'bored', 'scared', 'pleased', 'regretful'],
    correctAnswer: 4,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 33,
    section: 'reading',
    category: '독해',
    subCategory: '지칭 추론',
    questionText: "밑줄 친 부분이 가리키는 대상이 나머지 넷과 다른 것은?",
    questionContent: "Serene tried to do a pirouette in front of her mother but fell to the floor. Serene's mother helped ① <u>her</u> off the floor. She told her that she had to keep trying if she wanted to succeed. However, Serene was almost in tears. ② <u>She</u> had been practicing very hard the past week but she did not seem to improve. Serene's mother said that ③ <u>she</u> herself had tried many times before succeeding at Serene's age. She had fallen so often that she sprained her ankle and had to rest for three months before she was allowed to dance again. Serene was surprised. Her mother was a famous ballerina and to Serene, ④ <u>her</u> mother had never fallen or made a mistake in any of her performances. Listening to her mother made ⑤ <u>her</u> realize that she had to put in more effort than what she had been doing so far.\n\n* pirouette: 피루엣(한쪽 발로 서서 빠르게 도는 발레 동작)",
    options: ['①', '②', '③', '④', '⑤'],
    correctAnswer: 3,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 34,
    section: 'reading',
    category: '독해',
    subCategory: '도표 이해',
    questionText: "다음 도표의 내용과 일치하지 않는 것은?",
    questionContent: "The above graph shows how UK adults accessed the news in 2013 and in 2014. ① In both years, TV was the most popular way to access the news. ② Using websites or apps was the fourth most popular way in 2013, but rose to the second most popular way in 2014. ③ On the other hand, listening to the radio was the third most popular way in 2013, but fell to the fourth most popular way in 2014. ④ The percentage of UK adults using magazines in 2014 was higher than that in 2013. ⑤ The percentage of UK adults using newspapers in 2014 remained the same as that in 2013.",
    chartImage: "/images/uk-news-chart.png",
    options: ['①', '②', '③', '④', '⑤'],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 35,
    section: 'reading',
    category: '독해',
    subCategory: '어법 선택 (문맥)',
    questionText: "(A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?",
    questionContent: "The first underwater photographs were taken by an Englishman named William Thompson. In 1856, he waterproofed a simple box camera, attached it to a pole, and (A) [lowered / lowering] it beneath the waves off the coast of southern England. During the 10 minute exposure, the camera slowly flooded with seawater, but the picture survived. Underwater photography was born. Near the surface, (B) [where / which] the water is clear and there is enough light, it is quite possible for an amateur photographer to take great shots with an inexpensive underwater camera. At greater depths — it is dark and cold there — photography is the principal way of exploring a mysterious deep sea world, 95 percent of which has never (C) [seen / been seen] before.",
    options: [
      '(A) lowered\t\t(B) where\t\t(C) seen',
      '(A) lowered\t\t(B) where\t\t(C) been seen',
      '(A) lowered\t\t(B) which\t\t(C) seen',
      '(A) lowering\t\t(B) where\t\t(C) seen',
      '(A) lowering\t\t(B) which\t\t(C) been seen'
    ],
    correctAnswer: 2,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 36,
    section: 'reading',
    category: '독해',
    subCategory: '어휘 적절성',
    questionText: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
    questionContent: "Honesty is a fundamental part of every strong relationship. Use it to your advantage by being open with what you feel and giving a ① <u>truthful</u> opinion when asked. This approach can help you escape uncomfortable social situations and make friends with honest people. Follow this simple policy in life — never lie. When you ② <u>develop</u> a reputation for always telling the truth, you will enjoy strong relationships based on trust. It will also be more difficult to manipulate you. People who lie get into trouble when someone threatens to ③ <u>uncover</u> their lie. By living true to yourself, you'll ④ <u>avoid</u> a lot of headaches. Your relationships will also be free from the poison of lies and secrets. Don't be afraid to be honest with your friends, no matter how painful the truth is. In the long term, lies with good intentions ⑤ <u>comfort</u> people much more than telling the truth.\n\n* manipulate: (사람을) 조종하다",
    options: ['①', '②', '③', '④', '⑤'],
    correctAnswer: 5,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 37,
    section: 'reading',
    category: '독해',
    subCategory: '빈칸 추론',
    questionText: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
    questionContent: "The good news is, where you end up ten years from now is up to you. You are free to choose what you want to make of your life. It's called free will and it's your basic right. What's more, you can turn it on instantly! At any moment, you can choose to start showing more respect for yourself or stop hanging out with friends who bring you down. After all, you choose to be happy or miserable. The reality is that although you are free to choose, you can't choose the consequences of your choices. It's a package deal. As the old saying goes, \"__________________.\"\n\nChoice and consequence go together like mashed potatoes and gravy.",
    options: [
      'From saying to doing is a long step',
      'A good beginning makes a good ending',
      "One man's trash is another man's treasure",
      'If you pick up one end of the stick, you pick up the other',
      'The best means of destroying an enemy is to make him your friend'
    ],
    correctAnswer: 4,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 38,
    section: 'reading',
    category: '독해',
    subCategory: '빈칸 추론',
    questionText: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
    questionContent: "Just think for a moment of all the people upon whom your participation in your class depends. Clearly, the class requires a teacher to teach it and students to take it. However, it also depends on many other people and organizations. Someone had to decide when the class would be held and in what room, communicate that information to you, and enroll you in that class. Someone also had to write a textbook, and with the assistance of many other people — printers, editors, salespeople, and bookstore employees — it has arrived in your hands. Thus, a class that seems to involve just you, your fellow students, and your teacher is in fact __________________.",
    options: [
      'more interesting than playing games',
      'the product of the efforts of hundreds of people',
      'the place where students can improve writing skills',
      'most effective when combined with online learning',
      'the race where everyone is a winner'
    ],
    correctAnswer: 2,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 39,
    section: 'reading',
    category: '독해',
    subCategory: '글의 순서',
    questionText: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.",
    questionContent: "<div style='border: 2px solid #374151; padding: 12px; margin-bottom: 16px; background: #f9fafb; border-radius: 4px;'>Suppose that you are busy working on a project one day and you have no time to buy lunch. All of a sudden your best friend shows up with your favorite sandwich.</div>\n\n(A) The key difference between these two cases is the level of trust. You trust your best friend so much that you won't worry about him knowing you too well, but you certainly would not give the same level of trust to a stranger.\n\n(B) He tells you that he knows you are busy and he wants to help you out by buying you the sandwich. In this case, you are very likely to appreciate your friend's help.\n\n(C) However, if a stranger shows up with the same sandwich and offers it to you, you won't appreciate it. Instead, you would be confused. You would likely think \"Who are you, and how do you know what kind of sandwich I like to eat?\"",
    options: [
      '(A) - (C) - (B)',
      '(B) - (A) - (C)',
      '(B) - (C) - (A)',
      '(C) - (A) - (B)',
      '(C) - (B) - (A)'
    ],
    correctAnswer: 3,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 40,
    section: 'reading',
    category: '독해',
    subCategory: '문장 삽입',
    questionText: "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.",
    questionContent: "<div style='border: 2px solid #374151; padding: 12px; margin-bottom: 16px; background: #f9fafb; border-radius: 4px;'>A camping trip where each person attempted to gain the maximum rewards from the other campers in exchange for the use of his or her talents would quickly end in disaster and unhappiness.</div>\n\nThe philosopher G. A. Cohen provides an example of a camping trip as a metaphor for the ideal society. ( ① ) On a camping trip, he argues, it is unimaginable that someone would say something like, \"I cooked the dinner and therefore you can't eat it unless you pay me for my superior cooking skills.\" ( ② ) Rather, one person cooks dinner, another sets up the tent, another purifies the water, and so on, each in accordance with his or her abilities. ( ③ ) All these goods are shared and a spirit of community makes all participants happier. ( ④ ) So, we would have a better life in a more equal and cooperative society. ( ⑤ )\n\n* metaphor: 비유",
    options: ['①', '②', '③', '④', '⑤'],
    correctAnswer: 4,
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  }
];

// 섹션 2: 어휘 (1~50번) - 다중 선택 형식
export const vocabularyQuestions: LevelTestQuestion[] = [
  { id: 41, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "tribe", correctAnswers: ['종족', '부족'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 42, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "zone", correctAnswers: ['구역', '지대', '지역'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 43, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "sufficient", correctAnswers: ['충분한'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 44, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "big", correctAnswers: ['큰'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 45, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "set", correctAnswers: ['놓다', '두다', '세트', '한 쌍'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 46, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "land", correctAnswers: ['육지', '땅'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 47, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "exhibit", correctAnswers: ['전시하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 48, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "egg", correctAnswers: ['계란', '알'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 49, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "magazine", correctAnswers: ['잡지'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 50, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "confuse", correctAnswers: ['혼란시키다', '당혹하게 하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 51, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "disease", correctAnswers: ['질병', '질환'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 52, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "graduate", correctAnswers: ['졸업하다', '졸업생'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 53, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "warmth", correctAnswers: ['따뜻함'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 54, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "nutrition", correctAnswers: ['영양', '영양물'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 55, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "comment", correctAnswers: ['논평', '의견', '의견을 말하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 56, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "leak", correctAnswers: ['새다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 57, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "break out", correctAnswers: ['발발하다', '일어나다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 58, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "prize", correctAnswers: ['상', '상품'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 59, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "advertise", correctAnswers: ['광고하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 60, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "title", correctAnswers: ['제목', '표제'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 61, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "superior", correctAnswers: ['더 나은', '우수한'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 62, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "predator", correctAnswers: ['포식자', '약탈자'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 63, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "waste", correctAnswers: ['쓰레기', '낭비하다'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 64, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "trial", correctAnswers: ['시도', '재판'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 65, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "derive", correctAnswers: ['얻다', '비롯되다'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 66, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "elaborate", correctAnswers: ['정교한', '자세히 설명하다'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 67, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "match", correctAnswers: ['어울리다', '경기'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 68, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "contact", correctAnswers: ['연락하다', '접촉'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 69, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "electronic", correctAnswers: ['전자적인'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 70, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "claim", correctAnswers: ['주장하다', '요구하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 71, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "familiar", correctAnswers: ['익숙한', '친숙한'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 72, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "beard", correctAnswers: ['수염'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 73, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "invade", correctAnswers: ['침입하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 74, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "sequence", correctAnswers: ['연속', '순서'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 75, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "fasten", correctAnswers: ['매다', '고정시키다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 76, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "custom", correctAnswers: ['관습', '풍습'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 77, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "conclude", correctAnswers: ['결론을 내리다', '끝내다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 78, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "intuition", correctAnswers: ['직관'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 79, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "awkward", correctAnswers: ['어색한', '난처한'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 80, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "reservoir", correctAnswers: ['저수지', '저장소'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 81, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "illiterate", correctAnswers: ['문맹의'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 82, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "epidemic", correctAnswers: ['유행병'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 83, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "glide", correctAnswers: ['미끄러지다'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 84, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "swell", correctAnswers: ['붓다', '팽창하다'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 85, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "mischief", correctAnswers: ['장난'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' },
  { id: 86, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: "escape", correctAnswers: ['탈출하다'], points: 2, difficulty: 'basic', inputType: 'multiChoice' },
  { id: 87, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "chill", correctAnswers: ['한기', '냉각하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 88, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "welfare", correctAnswers: ['복지'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 89, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: "retire", correctAnswers: ['은퇴하다'], points: 2, difficulty: 'intermediate', inputType: 'multiChoice' },
  { id: 90, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: "contradict", correctAnswers: ['반박하다', '모순되다'], points: 2, difficulty: 'advanced', inputType: 'multiChoice' }
];

// 섹션 3: 문장 구조 분석 (42~51번 -> id 91~100)
export const sentenceQuestions: LevelTestQuestion[] = [
  {
    id: 91,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '주어동사찾기',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요.",
    questionContent: "Spending a lot of time practicing the violin strengthens the brain connections involved in learning music.",
    sentenceWords: ["Spending", "a", "lot", "of", "time", "practicing", "the", "violin", "strengthens", "the", "brain", "connections", "involved", "in", "learning", "music."],
    correctSubjects: ["Spending"],
    correctVerbs: ["strengthens"],
    points: 4,
    difficulty: 'intermediate',
    inputType: 'sentenceClick'
  },
  {
    id: 92,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '주어동사찾기',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요.",
    questionContent: "At the time, many children were working in factories in unsafe conditions.",
    sentenceWords: ["At", "the", "time,", "many", "children", "were", "working", "in", "factories", "in", "unsafe", "conditions."],
    correctSubjects: ["children"],
    optionalSubjects: ["many"],
    correctVerbs: ["were", "working"],
    points: 4,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  {
    id: 93,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '주어동사찾기',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요.",
    questionContent: "In addition to helping people in need, Addams dedicated her life to world peace as well.",
    sentenceWords: ["In", "addition", "to", "helping", "people", "in", "need,", "Addams", "dedicated", "her", "life", "to", "world", "peace", "as", "well."],
    correctSubjects: ["Addams"],
    correctVerbs: ["dedicated"],
    points: 4,
    difficulty: 'intermediate',
    inputType: 'sentenceClick'
  },
  {
    id: 94,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요. (복문: 여러 개 선택 가능)",
    questionContent: "After doing a study on everyone who lived there, he found that they were generally much healthier than the rest of the country.",
    sentenceWords: ["After", "doing", "a", "study", "on", "everyone", "who", "lived", "there,", "he", "found", "that", "they", "were", "generally", "much", "healthier", "than", "the", "rest", "of", "the", "country."],
    correctSubjects: ["he"],
    correctVerbs: ["found"],
    points: 5,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 95,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요.",
    questionContent: "By allowing people to easily replace the unhealthy ingredients in processed foods with healthier options, it has the potential to help provide a more nutritious diet.",
    sentenceWords: ["By", "allowing", "people", "to", "easily", "replace", "the", "unhealthy", "ingredients", "in", "processed", "foods", "with", "healthier", "options,", "it", "has", "the", "potential", "to", "help", "provide", "a", "more", "nutritious", "diet."],
    correctSubjects: ["it"],
    correctVerbs: ["has"],
    points: 5,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 96,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요. (주절의 S/V만 선택)",
    questionContent: "If you watch a capoeira performance today, you may notice how the musicians often change their tempo.",
    sentenceWords: ["If", "you", "watch", "a", "capoeira", "performance", "today,", "you", "may", "notice", "how", "the", "musicians", "often", "change", "their", "tempo."],
    correctSubjects: ["you"],
    correctVerbs: ["may", "notice"],
    points: 5,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 97,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요. (복문: 여러 개 선택 가능)",
    questionContent: "Puns are often used to make people laugh, but they can make people think more deeply as well.",
    sentenceWords: ["Puns", "are", "often", "used", "to", "make", "people", "laugh,", "but", "they", "can", "make", "people", "think", "more", "deeply", "as", "well."],
    correctSubjects: ["Puns", "they"],
    correctVerbs: ["are", "used", "can", "make"],
    points: 5,
    difficulty: 'intermediate',
    inputType: 'sentenceClick'
  },
  {
    id: 98,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '주어동사찾기',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요. (명령문: 주어 생략)",
    questionContent: "Take the example of an American boy getting dressed in the morning.",
    sentenceWords: ["Take", "the", "example", "of", "an", "American", "boy", "getting", "dressed", "in", "the", "morning."],
    correctSubjects: [],
    correctVerbs: ["Take"],
    points: 4,
    difficulty: 'intermediate',
    inputType: 'sentenceClick'
  },
  {
    id: 99,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요. (복문: 여러 개 선택 가능)",
    questionContent: "But movies and TV programs are shown without changes, so it is sometimes hard for even native English speakers to understand them.",
    sentenceWords: ["But", "movies", "and", "TV", "programs", "are", "shown", "without", "changes,", "so", "it", "is", "sometimes", "hard", "for", "even", "native", "English", "speakers", "to", "understand", "them."],
    correctSubjects: ["movies", "TV", "programs", "it"],
    optionalSubjects: ["and"],
    correctVerbs: ["are", "shown", "is"],
    points: 5,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 100,
    section: 'sentence',
    category: '문장 구조 분석',
    subCategory: '복문 구조 파악',
    questionText: "본주어(S)는 더블클릭, 본동사(V)는 클릭으로 선택하세요.",
    questionContent: "There have been a lot of cases where they were under pressure.",
    sentenceWords: ["There", "have", "been", "a", "lot", "of", "cases", "where", "they", "were", "under", "pressure."],
    correctSubjects: ["cases"],
    correctVerbs: ["have", "been"],
    points: 5,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  }
];

// 전체 문제 합치기
export const allLevelTestQuestions: LevelTestQuestion[] = [
  ...grammarQuestions,
  ...readingQuestions,
  ...vocabularyQuestions,
  ...sentenceQuestions
];

// 분석 카테고리 정의
export const analysisCategories = {
  grammar: {
    name: '문법 (Grammar)',
    subCategories: [
      { name: 'be동사', questions: [1, 2, 3] },
      { name: '일반동사', questions: [4, 5, 6] },
      { name: '조동사', questions: [7, 8, 9] },
      { name: '시제', questions: [10, 11, 12] },
      { name: '완료', questions: [13, 14, 15] },
      { name: '형식', questions: [16, 17, 18] },
      { name: '부정사', questions: [19, 20, 21] },
      { name: '동명사', questions: [22, 23, 24] },
      { name: '수동태', questions: [25, 26, 27] },
      { name: '분사', questions: [28, 29, 30] }
    ]
  },
  reading: {
    name: '독해 (Reading Comprehension)',
    subCategories: [
      { name: '글의 목적', questions: [31] },
      { name: '심경 파악', questions: [32] },
      { name: '지칭 추론', questions: [33] },
      { name: '도표 이해', questions: [34] },
      { name: '어법 선택 (문맥)', questions: [35] },
      { name: '어휘 적절성', questions: [36] },
      { name: '빈칸 추론', questions: [37, 38] },
      { name: '글의 순서', questions: [39] },
      { name: '문장 삽입', questions: [40] }
    ]
  },
  vocabulary: {
    name: '어휘 (Vocabulary)',
    subCategories: [
      { name: '기초', questions: [41, 42, 44, 45, 46, 48, 49, 60, 63, 67, 68, 86] },
      { name: '중급', questions: [43, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 62, 64, 69, 70, 71, 72, 73, 74, 75, 76, 77, 79, 87, 88, 89] },
      { name: '고급', questions: [65, 66, 78, 80, 81, 82, 83, 84, 85, 90] }
    ]
  },
  sentence: {
    name: '문장 구조 분석 (Sentence Analysis)',
    subCategories: [
      { name: '주어동사찾기', questions: [91, 92, 93, 98] },
      { name: '복문 구조 파악', questions: [94, 95, 96, 97, 99, 100] }
    ]
  }
};
