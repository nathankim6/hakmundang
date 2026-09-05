// 고등부 레벨테스트 문제 데이터

export interface HighSchoolLevelTestQuestion {
  id: number;
  section: 'vocabulary' | 'grammar' | 'practical' | 'reading';
  category: string;
  subCategory: string;
  questionText: string;
  questionContent?: string; // 추가 지문이나 내용
  passageText?: string; // 독해 지문
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: string[]; // 복수 정답 허용
  explanation?: string; // 해설
  points: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  inputType: 'choice' | 'text'; // 객관식, 주관식
}

// PART 1: Vocabulary (1~7번) - 총 28점
export const hsVocabularyQuestions: HighSchoolLevelTestQuestion[] = [
  {
    id: 1,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '동의어/유의어 파악',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nHe's a very shy man but was always <u><strong>friendly</strong></u> to me.",
    options: ['rude', 'strange', 'kind', 'necessary'],
    correctAnswer: 3,
    explanation: "*friendly*와 문맥상 가장 적절한 것은 '친절한' 의미를 가진 kind이다.",
    points: 4,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 2,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '숙어/구동사',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nYou'll pay for it if you <u><strong>keep on</strong></u> behaving this way.",
    options: ['enjoy', 'avoid', 'finish', 'continue'],
    correctAnswer: 4,
    explanation: "*keep on ~ing(계속 ~하다)*의 의미와 가장 가까운 것은 **continue(계속하다)**이다.",
    points: 4,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 3,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '고급 어휘',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nI will also speak about <u><strong>a peril</strong></u> that now faces the industry.",
    options: ['a danger', 'a merit', 'a reality', 'a legend'],
    correctAnswer: 1,
    explanation: "*peril(위험)*의 동의어는 **danger(위험)**이다.",
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 4,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '숙어/구동사',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nIt seemed as if she was doing it <u><strong>on purpose</strong></u> to get a rise out of people.",
    options: ['accidentally', 'dangerously', 'intentionally', 'unfortunately'],
    correctAnswer: 3,
    explanation: "*on purpose(일부러)*의 동의어는 **intentionally(의도적으로)**이다.",
    points: 4,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 5,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '고급 어휘',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nThis young, promising life was over in seconds, but his <u><strong>humiliation</strong></u> wasn't.",
    options: ['shame', 'jealousy', 'apathy', 'desolation'],
    correctAnswer: 1,
    explanation: "*humiliation(굴욕)*의 동의어는 **shame(수치심, 굴욕)**이다.",
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 6,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '고급 어휘',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nEach of the colonies had <u><strong>distinctive</strong></u> differences in their religion, government and economy.",
    options: ['respective', 'insignificant', 'traditional', 'characteristic'],
    correctAnswer: 4,
    explanation: "*distinctive(독특한, 특징적인)*의 동의어는 **characteristic(특징적인)**이다.",
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 7,
    section: 'vocabulary',
    category: '어휘',
    subCategory: '고급 어휘',
    questionText: "Choose the one which is closest in meaning to the underlined part.\n\nAll countries will be judged against the new <u><strong>criteria</strong></u>.",
    options: ['assets', 'standards', 'distances', 'populations'],
    correctAnswer: 2,
    explanation: "*criteria(기준, 표준)*의 동의어는 **standards(기준)**이다.",
    points: 4,
    difficulty: 'advanced',
    inputType: 'choice'
  }
];

// PART 2: Grammar (8~15번) - 총 36점
export const hsGrammarQuestions: HighSchoolLevelTestQuestion[] = [
  {
    id: 8,
    section: 'grammar',
    category: '문법',
    subCategory: '어법성 판단 (틀린 부분 찾기)',
    questionText: "Choose the one which is grammatically <em>incorrect</em> among the four underlined parts.",
    questionContent: "Privacy concerns <span class='hs-box'>①<u>existing</u></span> wherever identifiable data <span class='hs-box'>②<u>relating to</u></span> a person or persons <span class='hs-box'>③<u>is collected</u></span> and <span class='hs-box'>④<u>stored</u></span>, in digital form or otherwise.",
    options: ['①existing', '②relating to', '③is collected', '④stored'],
    correctAnswer: 1,
    explanation: "주어인 'Privacy concerns'와 연결되는 올바른 서술어 형태인 동사 exist로 바꿔야 합니다. (existing → exist)",
    points: 5,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 9,
    section: 'grammar',
    category: '문법',
    subCategory: '어법성 판단 (틀린 부분 찾기)',
    questionText: "Choose the one which is grammatically <em>incorrect</em> among the four underlined parts.",
    questionContent: "Policing <span class='hs-box'>①<u>has included</u></span> <span class='hs-box'>②<u>an array of</u></span> activities in different situations, but the predominant <span class='hs-box'>③<u>those</u></span> are <span class='hs-box'>④<u>concerned</u></span> with the preservation of order.",
    options: ['①has included', '②an array of', '③those', '④concerned'],
    correctAnswer: 3,
    explanation: "[난이도:상 출제의도: 대명사 one] 앞에서 언급한 명사의 반복을 피하기 위해 대명사 one을 사용한다. 복수형 activities를 대신하므로 복수형 ones가 필요하다. (those → ones)",
    points: 5,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 10,
    section: 'grammar',
    category: '문법',
    subCategory: '어법성 판단 (틀린 부분 찾기)',
    questionText: "Choose the one which is grammatically <em>incorrect</em> among the four underlined parts.",
    questionContent: "The study compared <span class='hs-box'>①<u>how different</u></span> generations <span class='hs-box'>②<u>perceived</u></span> our political system <span class='hs-box'>③<u>and what</u></span> they <span class='hs-box'>④<u>will change</u></span> about it.",
    options: ['①how different', '②perceived', '③and what', '④will change'],
    correctAnswer: 4,
    explanation: "[난이도:중/출제의도:시제일치] *how different generations perceived(과거시제)*와 일치해야 하므로 **would change(과거형 가정법)**가 적절하다. (will → would)",
    points: 4,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 11,
    section: 'grammar',
    category: '문법',
    subCategory: '어법성 판단 (틀린 부분 찾기)',
    questionText: "Choose the one which is grammatically <em>incorrect</em> among the four underlined parts.",
    questionContent: "<span class='hs-box'>①<u>To have</u></span> access to the forums, you must be a <span class='hs-box'>②<u>registering</u></span> member of PoliceOne and <span class='hs-box'>③<u>have</u></span> your law enforcement status <span class='hs-box'>④<u>verified</u></span> by our staff.",
    options: ['①To have', '②registering', '③have', '④verified'],
    correctAnswer: 2,
    explanation: "[난이도:중/출제의도:분사] *a registered member(등록된 회원)*이 되어야 하므로 registered가 맞다. (registering → registered)",
    points: 4,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 12,
    section: 'grammar',
    category: '문법',
    subCategory: '어법 교정',
    questionText: "Correct any grammatical errors in the following sentence. Write only the corrected word.\n\nI heard the orchestra to play at Carnegie Hall last summer.",
    correctAnswers: ["play", "playing"],
    explanation: "[난이도:하/출제의도:지각동사] hear + 목적어 + 동사원형(-ing) 구조이므로 play 또는 playing이 맞다. (to play → play)",
    points: 4,
    difficulty: 'basic',
    inputType: 'text'
  },
  {
    id: 13,
    section: 'grammar',
    category: '문법',
    subCategory: '시제',
    questionText: "Correct any grammatical errors in the following sentence. Write only the corrected phrase.\n\nThe soldier seems to die in last year's war, but records show he was dead earlier.",
    correctAnswer: "to have died",
    explanation: "[난이도:상/출제의도:완료부정사] *seems to have + p.p(과거 사실의 표현)*가 되어야 한다. (die → have died)",
    points: 5,
    difficulty: 'advanced',
    inputType: 'text'
  },
  {
    id: 14,
    section: 'grammar',
    category: '문법',
    subCategory: '가정법',
    questionText: "Correct any grammatical errors in the following sentence. Write only the corrected word.\n\nSally would answer the phone if she will be in her office right now.",
    correctAnswer: "were",
    explanation: "[난이도:중/출제의도: 가정법] 가정법 현재에서 if + 주어 + were 형태가 적절하다. (will be → were)",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'text'
  },
  {
    id: 15,
    section: 'grammar',
    category: '문법',
    subCategory: '의미구별',
    questionText: "Correct any grammatical errors in the following sentence. Write only the corrected word.\n\nThe pioneers worked very hardly to clear away the forest and planting crops.",
    correctAnswer: "hard",
    explanation: "[난이도:하/출제의도: 부사] *hard(열심히)*는 부사로 **hardly(거의 ~않다)**와 의미가 다르다. (hardly → hard)",
    points: 4,
    difficulty: 'basic',
    inputType: 'text'
  }
];

// PART 3: Practical English (16~18번) - 총 14점
export const hsPracticalQuestions: HighSchoolLevelTestQuestion[] = [
  {
    id: 16,
    section: 'practical',
    category: '영작',
    subCategory: '한영 번역 (영작)',
    questionText: "우리말을 영어로 잘못 옮긴 것은?",
    options: [
      "스컹크는 지독한 냄새가 난다.\n→ Skunk smells terrible.",
      "이것은 매장에서 가장 저렴한 스웨터이다.\n→ This is the least expensive sweater in the store.",
      "생명체는 세포라는 미세한 구조물로 구성된다.\n→ Living things are consisted of minute structures called cells.",
      "대부분의 동물들은 이후의 더 큰 보상보다, 지금 당장의 더 작은 보상을 선호한다.\n→ Most animals prefer smaller rewards right now, rather than greater ones in the future."
    ],
    correctAnswer: 3,
    explanation: "Living things consist of minute structures called cells. (be consisted of ❌ → consist of ⭕)",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 17,
    section: 'practical',
    category: '영작',
    subCategory: '한영 번역 (영작)',
    questionText: "우리말을 영어로 잘못 옮긴 것은?",
    options: [
      "그의 아이디어는 아무 쓸모가 없었다.\n→ His idea was no more use than a headache.",
      "생수는 수돗물의 2000배의 비용이 든다.\n→ Bottled water costs 2000 times as more as tap water.",
      "미국의 소비자들은 저렴한 제품을 찾아다니는데 익숙하다.\n→ American consumers are accustomed to hunting out bargains.",
      "폭설로 인해 철도운행이 지연되는 일은 흔히 일어난다.\n→ It often happens that railway traffic is suspended by a heavy snowfall."
    ],
    correctAnswer: 2,
    explanation: "Bottled water costs 2000 times as much as tap water. (as more as ❌ → as much as ⭕)",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 18,
    section: 'practical',
    category: '영작',
    subCategory: '영한 해석',
    questionText: "다음을 우리말로 바르게 해석한 것은?\n\nNeither SNS nor instant message has anything to do with decline of attention span.",
    options: [
      "SNS도 문자메시지도 집중력 저하와 상관이 없다.",
      "SNS나 문자메시지는 집중력이 저하된 상태로는 할 수 없다.",
      "SNS도 문자메시지도 집중력 저하에 대해 할 수 있는 일이 없다.",
      "SNS나 문자메시지는 집중력을 저하시키지만 중요한 문제는 아니다."
    ],
    correctAnswer: 1,
    explanation: "Neither A nor B has anything to do with ~ = A도 B도 ~와 상관이 없다",
    points: 4,
    difficulty: 'intermediate',
    inputType: 'choice'
  }
];

// PART 4: Reading (19~22번) - 총 22점
export const hsReadingQuestions: HighSchoolLevelTestQuestion[] = [
  {
    id: 19,
    section: 'reading',
    category: '독해',
    subCategory: '글의 제목/주제',
    questionText: "다음 글을 읽고 글의 제목으로 가장 적절한 것을 고르시오.",
    passageText: "It has been well established that given proper conditions of temperature and moisture, green plants absorb carbon dioxide from the atmosphere and return oxygen to it. Called photosynthesis, this process involves the synthesis of carbon dioxide and water by the chloroplasts in plant cells. It is activated by light, and produces oxygen as a product. One molecule of oxygen is produced for every molecule of carbon dioxide consumed. Respiration is this process in reverse.",
    options: [
      "How Plants Exchange Gases with the Environment",
      "The Role of Temperature in Plant Growth",
      "Why Green Plants Need Water and Sunlight",
      "The Function of Chloroplasts in Plant Cells",
      "Comparing Plant Growth in Different Climates"
    ],
    correctAnswer: 1,
    explanation: "광합성 과정을 통해 식물이 환경과 가스를 교환하는 방식을 설명하는 내용이므로 적절한 제목이다.",
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 20,
    section: 'reading',
    category: '독해',
    subCategory: '글의 순서',
    questionText: "주어진 글 다음에 이어질 글의 순서로 가장 알맞은 것은?",
    passageText: "Social engineering is the art of manipulating people so they give up confidential information.\n\n(A) Criminals use social engineering tactics because it is usually easier to exploit your natural inclination to trust than it is to discover ways to hack your software.\n\n(B) The types of information criminals are seeking can vary, but when individuals are targeted the criminals are usually trying to trick you into giving them your passwords or bank information, or access your computer to secretly install malicious software that will give them access to your passwords and bank information.\n\n(C) For example, it is much easier to fool someone into giving you their password than it is for you to try hacking their password.",
    options: [
      "(A) - (B) - (C)",
      "(A) - (C) - (B)",
      "(B) - (A) - (C)",
      "(C) - (A) - (B)"
    ],
    correctAnswer: 3,
    explanation: "첫 문장에서 정보에 대한 언급이 있으므로 두 번째 문장은 그 정보를 부연하는 (B)가 이어져야 한다. 그 다음으로는 소셜엔지니어링 기법이 이용되는 이유 (A)와 그 예시 (C)가 차례로 이어져야 한다.",
    points: 6,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 21,
    section: 'reading',
    category: '독해',
    subCategory: '문장 삽입',
    questionText: "다음 문장의 위치로 가장 적절한 곳은?",
    questionContent: "<strong>This makes them devilishly hard to control or cure.</strong>",
    passageText: "Viruses are one of the last great biological enemy facing modern humans. The prospect of a new viral outbreak, for which we do not have a vaccine, remains a serious threat. ① Viruses can evolve at incredible rates, and are very simple – basically just a packet of genetic material (DNA or RNA) wrapped in protein. ② Antibiotics target bacteria-specific biochemical pathways, but the simplicity of viruses leaves few cracks in their armor – there are no such pathways to target. ③ Their swift evolution means that viruses can jump over from animals to humans, as in the case of avian or swine flu. ④ Even when vaccines are devised, they cannot always keep pace with the evolution of viruses like influenza and HIV. Our fear of viruses is well-founded.",
    options: ['①', '②', '③', '④'],
    correctAnswer: 2,
    explanation: "'바이러스의 특징이 치료를 어렵게 한다.'는 제시문장은 바이러스의 특징을 상술한 문장 다음에, 바이러스 치료의 어려움을 부연하는 문장 이전에 위치해야하므로 ②에 삽입해야한다.",
    points: 5,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 22,
    section: 'reading',
    category: '독해',
    subCategory: '빈칸 추론',
    questionText: "밑줄 친 부분에 들어갈 표현으로 가장 적절한 것을 고르시오.",
    passageText: "Globalization and the increasing inter-dependence of nations have made territorial war nearly obsolete. If wars are raging in the mid-21st century, they will probably be \"resource wars\" — conflicts over access to food, water, and energy. Fighting over resources is hardly new, but wars like these will become more common and more intense. The first reason has to do with rising standards of living. As huge numbers of people emerge from poverty in Asia and Africa, they will want to live better, which means consuming more. The second factor will be climate change, which may severely disrupt networks on which humanity depends for food, water, and energy.\n\nClimate change will shape the fate of nations. Its effects will inevitably _________________.",
    options: [
      "halt globalization",
      "turn some against others",
      "speed up the depletion of resources",
      "shape international cooperation on environmental issues"
    ],
    correctAnswer: 2,
    explanation: "기후 변화로 인해 국가 간 갈등이 심화될 수 있다는 내용과 일치한다. 'turn against sb'는 '~에게 등을 돌리다, 배신하다'라는 뜻이다.",
    points: 6,
    difficulty: 'advanced',
    inputType: 'choice'
  }
];

// 전체 고등부 문제 배열
export const allHighSchoolQuestions: HighSchoolLevelTestQuestion[] = [
  ...hsVocabularyQuestions,
  ...hsGrammarQuestions,
  ...hsPracticalQuestions,
  ...hsReadingQuestions
];

// 고등부 분석 카테고리 정의
export const hsAnalysisCategories = {
  vocabulary: {
    name: '어휘 (Vocabulary)',
    subCategories: [
      { name: '동의어/유의어 파악', questions: [1] },
      { name: '숙어/구동사', questions: [2, 4] },
      { name: '고급 어휘', questions: [3, 5, 6, 7] }
    ]
  },
  grammar: {
    name: '문법 (Grammar)',
    subCategories: [
      { name: '어법성 판단 (틀린 부분 찾기)', questions: [8, 9, 10, 11] },
      { name: '어법 교정', questions: [12, 13, 14, 15] }
    ]
  },
  practical: {
    name: '실용영어 (Practical English)',
    subCategories: [
      { name: '한영 번역 (영작)', questions: [16, 17] },
      { name: '영한 해석', questions: [18] }
    ]
  },
  reading: {
    name: '독해 (Reading Comprehension)',
    subCategories: [
      { name: '글의 제목/주제', questions: [19] },
      { name: '글의 순서', questions: [20] },
      { name: '문장 삽입', questions: [21] },
      { name: '빈칸 추론', questions: [22] }
    ]
  }
};

// 고등부 섹션 이름
export const hsSectionNames: Record<string, string> = {
  vocabulary: '어휘',
  grammar: '문법',
  practical: '실용영어',
  reading: '독해'
};
