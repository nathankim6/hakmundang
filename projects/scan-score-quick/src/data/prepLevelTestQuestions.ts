// 브래니악 영어학원 BEAT - 초등부 진단평가 문제 데이터 (v2 신규 시험지, 186문항)
// PART 1 독해 13 · PART 2 문법 87 (A40·B27·C20) · PART 3 어휘 76 · PART 4 문장구조 10

export interface PrepLevelTestQuestion {
  id: number;
  section: 'reading' | 'grammar' | 'vocabulary' | 'sentenceAnalysis';
  category: string;
  subCategory: string;
  grammarLevel?: 'A' | 'B' | 'C';
  questionText: string;
  questionContent?: string;
  passageText?: string;
  options?: string[];
  correctAnswer?: string | number | number[];
  correctAnswers?: string[];
  explanation?: string;
  points: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  inputType: 'choice' | 'text' | 'multiText' | 'sentenceAnalysis' | 'sentenceClick' | 'wordArrangement';
  arrangeWords?: string[];
  sentenceText?: string;
  sentenceWords?: string[];
  correctSubjects?: string[];
  requireAllAnswers?: boolean;
  optionalSubjects?: string[];
  correctVerbs?: string[];
  optionalVerbs?: string[];
  fixedDistractors?: string[];
  fixedOptions?: string[];
}

export const prepReadingQuestions: PrepLevelTestQuestion[] = [
  {
    id: 1,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 글의 목적으로 가장 적절한 것은?`,
    passageText: `Dear Ms. Cross,
We are excited to announce the opening of the newest Sunshine Stationery Store in Raleigh, North Carolina! As you know, the Sunshine Stationery Store has long been the industry standard for quality creative paper products of all kinds, and we couldn't have picked a better location for our next branch than the warm and inviting city of Raleigh. We are thrilled to welcome you to the Grand Opening of the Raleigh store on March 15, 2018. The opening celebration will be from 9 a.m. to 9 p.m. ― a full 12 hours of fun! We would love to show you all the Raleigh store has to offer and hope to see you there on the 15th!
Sincerely,
Donna Deacon`,
    options: [`신제품의 출시를 홍보하려고`, `회사 창립 기념일에 초대하려고`, `이전한 매장의 위치를 안내하려고`, `신설 매장의 개업식에 초대하려고`, `매장의 영업시간 변경을 안내하려고`],
    correctAnswer: 4,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 2,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 글에 드러난 'I'의 심경으로 가장 적절한 것은?`,
    passageText: `One day I caught a taxi to work. When I got into the back seat, I saw a brand new cell phone sitting right next to me. I asked the driver, "Where did you drop the last person off?" and showed him the phone. He pointed at a girl and moved to her. We drove up to her and I rolled down the window yelling out to her. She was very thankful and by the look on her face I could tell how grateful she was. Her smile made me smile and feel really good inside. After she got the phone back, I heard someone walking past her say, "Today's your lucky day!"`,
    options: [`angry`, `bored`, `scared`, `pleased`, `regretful`],
    correctAnswer: 4,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 3,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 글에서 필자가 주장하는 바로 가장 적절한 것은?`,
    passageText: `Many people think of what might happen in the future based on past failures and get trapped by them. For example, if you have failed in a certain area before, when faced with the same situation, you anticipate what might happen in the future, and thus fear traps you in yesterday. Do not base your decision on what yesterday was. Your future is not your past and you have a better future. You must decide to forget and let go of your past. Your past experiences are the thief of today's dreams only when you allow them to control you.`,
    options: [`꿈을 이루기 위해 다양한 경험을 하라.`, `미래를 생각할 때 과거의 실패에 얽매이지 말라.`, `장래의 성공을 위해 지금의 행복을 포기하지 말라.`, `자신을 과신하지 말고 실현 가능한 목표부터 세우라.`, `결정을 내릴 때 남의 의견에 지나치게 의존하지 말라.`],
    correctAnswer: 2,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 4,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `Mae C. Jemison에 관한 다음 글의 내용과 일치하지 않는 것은?`,
    passageText: `Mae C. Jemison was named the first black woman astronaut in 1987. On September 12, 1992, she boarded the space shuttle Endeavor as a science mission specialist on the historic eight-day flight. Jemison left the National Aeronautic and Space Administration (NASA) in 1993. She was a professor of Environmental Studies at Dartmouth College from 1995 to 2002. Jemison was born in Decatur, Alabama, and moved to Chicago with her family when she was three years old. She graduated from Stanford University in 1977 with a degree in chemical engineering and Afro-American studies. Jemison received her medical degree from Cornell Medical School in 1981.`,
    options: [`1992년에 우주 왕복선에 탑승했다.`, `1993년에 NASA를 떠났다.`, `Dartmouth 대학의 환경학과 교수였다.`, `세 살 때 가족과 함께 Chicago로 이주했다.`, `Stanford 대학에서 의학 학위를 받았다.`],
    correctAnswer: 5,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 5,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?`,
    passageText: `Honesty is a fundamental part of every strong relationship. Use it to your advantage by being open with what you feel and giving a ① truthful opinion when asked. This approach can help you escape uncomfortable social situations and make friends with honest people. Follow this simple policy in life — never lie. When you ② develop a reputation for always telling the truth, you will enjoy strong relationships based on trust. It will also be more difficult to manipulate you. People who lie get into trouble when someone threatens to ③ uncover their lie. By living true to yourself, you'll ④ avoid a lot of headaches. Your relationships will also be free from the poison of lies and secrets. Don't be afraid to be honest with your friends, no matter how painful the truth is. In the long term, lies with good intentions ⑤ comfort people much more than telling the truth.
* manipulate: (사람을) 조종하다`,
    options: [`①`, `②`, `③`, `④`, `⑤`],
    correctAnswer: 5,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 6,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 빈칸에 들어갈 말로 가장 적절한 것은?`,
    passageText: `The good news is, where you end up ten years from now is up to you. You are free to choose what you want to make of your life. It's called free will and it's your basic right. What's more, you can turn it on instantly! At any moment, you can choose to start showing more respect for yourself or stop hanging out with friends who bring you down. After all, you choose to be happy or miserable. The reality is that although you are free to choose, you can't choose the consequences of your choices. It's a package deal. As the old saying goes, "."
Choice and consequence go together like mashed potatoes and gravy.`,
    options: [`From saying to doing is a long step`, `A good beginning makes a good ending`, `One man's trash is another man's treasure`, `If you pick up one end of the stick, you pick up the other`, `The best means of destroying an enemy is to make him your friend`],
    correctAnswer: 4,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 7,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `다음 빈칸에 들어갈 말로 가장 적절한 것은?`,
    passageText: `Just think for a moment of all the people upon whom your participation in your class depends. Clearly, the class requires a teacher to teach it and students to take it. However, it also depends on many other people and organizations. Someone had to decide when the class would be held and in what room, communicate that information to you, and enroll you in that class. Someone also had to write a textbook, and with the assistance of many other people — printers, editors, salespeople, and bookstore employees — it has arrived in your hands. Thus, a class that seems to involve just you, your fellow students, and your teacher is in fact .`,
    options: [`more interesting than playing games`, `the product of the efforts of hundreds of people`, `the place where students can improve writing skills`, `most effective when combined with online learning`, `the race where everyone is a winner`],
    correctAnswer: 2,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 8,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.`,
    passageText: `Suppose that you are busy working on a project one day and you have no time to buy lunch. All of a sudden your best friend shows up with your favorite sandwich
(A) The key difference between these two cases is the level of trust. You trust your best friend so much that you won't worry about him knowing you too well, but you certainly would not give the same level of trust to a stranger.
(B) He tells you that he knows you are busy and he wants to help you out by buying you the sandwich. In this case, you are very likely to appreciate your friend's help.
(C) However, if a stranger shows up with the same sandwich and offers it to you, you won't appreciate it. Instead, you would be confused. You would likely think "Who are you, and how do you know what kind of sandwich I like to eat?"`,
    options: [`(A) - (C) - (B)`, `(B) - (A) - (C)`, `(B) - (C) - (A)`, `(C) - (A) - (B)`, `(C) - (B) - (A)`],
    correctAnswer: 3,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 9,
    section: 'reading',
    category: '독해',
    subCategory: `독해`,
    questionText: `글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.`,
    passageText: `A camping trip where each person attempted to gain the maximum rewards from the other campers in exchange for the use of his or her talents would quickly end in disaster and unhappiness
The philosopher G. A. Cohen provides an example of a camping trip as a metaphor for the ideal society. ( ① ) On a camping trip, he argues, it is unimaginable that someone would say something like, "I cooked the dinner and therefore you can't eat it unless you pay me for my superior cooking skills." ( ② ) Rather, one person cooks dinner, another sets up the tent, another purifies the water, and so on, each in accordance with his or her abilities. ( ③ ) All these goods are shared and a spirit of community makes all participants happier. ( ④ ) So, we would have a better life in a more equal and cooperative society. ( ⑤ )
* metaphor: 비유`,
    options: [`①`, `②`, `③`, `④`, `⑤`],
    correctAnswer: 5,
    points: 5,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
];

export const prepGrammarAQuestions: PrepLevelTestQuestion[] = [
  {
    id: 10,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 빈칸에 들어갈 수 없는 것은?

Does _ have a computer?`,
    options: [`he`, `she`, `Nancy`, `they`, `your sister`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 11,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 밑줄 친 부분이 틀린 것은?`,
    options: [`Does Lisa want a glass of water?`, `Does the sun rise in the morning and sets in the evening?`, `Do they take a bus to school?`, `What kind of movies do you like most?`, `Does he drink a lot of milk?`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 12,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `우리말을 영어로 옮길 때 알맞은 것은?

너는 영어 선생님을 좋아하니?`,
    options: [`Do you an English teacher?`, `Do you like an English teacher?`, `Are you like an English teacher?`, `Does you like an English teacher?`, `Don't you like an English teacher?`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 13,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 의문문으로 바르게 바꾼 것은?

→ Do you ate the pizza on the table?
→ Does he played soccer last weekend?
→ Did they go shopping yesterday?
→ Did Sumin liked to play game?
→ Do David enjoy watching movie?`,
    options: [`You ate the pizza on the table.`, `He played soccer last weekend.`, `They went shopping yesterday.`, `Sumin liked to play game.`, `David enjoys watching movie.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 14,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 의문문으로 바르게 고친 문장을 고르세요.

→ Did my brother bought some flowers?
→ Does Susan go to high school?
→ Does you have a cell phone?
→ Do they has a big house?
→ Do she like movies?`,
    options: [`My brother bought some flowers.`, `Susan goes to high school.`, `You have a cell phone.`, `They have a big house.`, `She likes movies.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 15,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 대화의 빈칸에 알맞은 것은?

A : _ are you from?
B : I'm from Sydney, Australia.`,
    options: [`When`, `Where`, `How`, `What`, `Why`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 16,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `위의 밑줄 친 빈칸에 들어갈 단어가 알맞게 쓰인 것을 고르시오.

(1) _ do you get up?
(2) _ do you live?
(3) _ is your favorite animal?
(4) _ is your favorite actor?
(5) _ do you like him?`,
    options: [`when - what - what - how - why`, `when - where - what - who - why`, `where - when - why - who - what`, `where - when - why - how - what`, `how - where - when - who - what`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 17,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 빈칸에 didn't가 올 수 없는 것은?`,
    options: [`Bora _ help her mother last night.`, `Subin _ send me a Christmas card.`, `I _ doing my homework then.`, `Bomi and her sister _ clean the room.`, `They _ take guitar lessons last Sunday.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 18,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 어법상 옳은 문장은?`,
    options: [`Jessica were a singer.`, `Sumi was a good student.`, `His father were tall.`, `They was at the big park.`, `He were a nice doctor.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 19,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 어법상 어색한 문장을 모두 고르면?`,
    options: [`Bora cans go to the library on Friday.`, `What did you do on the weekend?`, `Sophy put her finger in her mouth.`, `Jessica didn't watched a movie at the theater.`, `Can you pick up the pen on the floor?`],
    correctAnswer: [1, 4], requireAllAnswers: true,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 20,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 중 어법상 바른 문장을 모두 고르세요.`,
    options: [`I must will stay here until morning.`, `May I leave a message?`, `He may caught a cold.`, `I not might come tomorrow.`, `This cannot be true.`],
    correctAnswer: [2, 5], requireAllAnswers: true,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 21,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 질문에 대한 답으로 알맞은 것은?

May I borrow this book?`,
    options: [`Yes, you are.`, `Yes, you might.`, `Yes, I can.`, `No, you're not may.`, `No, you may not.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 22,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `밑줄 친 부분을 can으로 바꿔 쓸 수 있는 것은?`,
    options: [`I am able to climb this mountain.`, `Will you be able to come to our party?`, `I would be able to finish eating it someday.`, `I'm pleased to be able to fine such a wise man.`, `Nobody will be able to master English in a year.`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 23,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장에서 'not'이 들어가기에 알맞은 곳은?

You ( 1 ) should ( 2 ) eat ( 3 ) too ( 4 ) much ( 5 ) chocolate.`,
    options: [`1`, `2`, `3`, `4`, `5`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 24,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞도록 괄호 안의 단어들을 배열하여 문장을 완성할 때 세 번째로 나오는 단어로 알맞은 것은?

학생들은 서로 도와야 한다
(students/ each/ help/ other/ should)`,
    options: [`students`, `each`, `help`, `other`, `should`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 25,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 대화의 빈칸에 들어갈 말로 알맞은 것은?

A: This cake _ good.
B: Can I eat some?`,
    options: [`tastes`, `talks`, `makes`, `sounds`, `finds`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 26,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 빈칸에 들어갈 말로 어색한것은?

My mother looks _ now.`,
    options: [`sad`, `happily`, `tired`, `excited`, `great`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 27,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장의 빈칸에 들어갈 말이 순서대로 짝지어진 것은?

• The food tastes _.
• I feel _.`,
    options: [`nicely - good`, `great - sadly`, `good - hungry`, `greatly - terribly`, `terrible - happily`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 28,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 대화의 빈칸에 들어갈 알맞은 단어가 차례대로 짝지어진 것은?

A: Hello. Andy. You  happy. What happened?
B: I got special allowance from my dad. It is 30,000 won.
I  great.
A: Good for you. Why don't we spend it together?`,
    options: [`look - feel`, `looks - feel`, `am - felt`, `look - feels`, `looks - felt`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 29,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 빈칸 A-C에 들어갈 알맞은 단어로 바르게 연결된 것은?

• Suho is playing the guitar. It _A_ wonderful.
• I'm having spaghetti. It _B_ delicious.
• They _C_ so happy.`,
    options: [`A: sound / B: eat / C: are`, `A: sounds / B: eats / C: looks`, `A: sounds / B: tastes / C: look`, `A: listen / B: taste / C: are`, `A: listens / B: tastes / C: looks`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 30,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장을 의문문으로 바르게 고친 것은?

Cathy likes movies.`,
    options: [`Do Cathy likes movies?`, `Does Cathy like movies?`, `Is Cathy likes movies?`, `Does Cathy likes movies?`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 31,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장을 의문문으로 바르게 고친 것은?

He has a book in his hand.`,
    options: [`Has he a book in his hand?`, `Do he have a book in his hand?`, `Does he have a book in his hand?`, `Does he has a book in his hand?`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 32,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장을 의문문으로 바르게 고친 것은?

The computer works fast.`,
    options: [`Do the computer work fast?`, `Does the computer works fast?`, `Is the computer work fast?`, `Does the computer work fast?`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 33,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장을 의문문으로 바르게 고친 것은?

Your sisters know him.`,
    options: [`Does your sisters know him?`, `Do your sisters know him?`, `Are your sisters know him?`, `Do your sisters knows him?`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 34,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `다음 문장을 의문문으로 바르게 고친 것은?

Cinderella cleaned the house.`,
    options: [`Does Cinderella cleaned the house?`, `Did Cinderella cleaned the house?`, `Did Cinderella clean the house?`, `Was Cinderella clean the house?`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 35,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `빈칸에 들어갈 알맞은 답은?

A: What is Min-ho doing?
B: . (hit the ball)`,
    options: [`He hits the ball`, `He is hitting the ball`, `He hit the ball`, `He was hitting the ball`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 36,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `빈칸에 들어갈 알맞은 답은?

A: What's Mi-na doing?
B: . (kick the ball)`,
    options: [`She kicks the ball`, `She kicked the ball`, `She is kicking the ball`, `She was kicking the ball`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 37,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `두 문장이 같은 뜻이 되도록 빈칸에 알맞은 것은?

Jack will pass the exam. = Jack _ the exam.`,
    options: [`is going to passing`, `is going pass`, `is going to pass`, `going to pass`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 38,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `두 문장이 같은 뜻이 되도록 빈칸에 알맞은 것은?

They will go to the museum. = They _ to the museum.`,
    options: [`are going go`, `are going to go`, `is going to go`, `going to go`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 39,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞게 주어진 말을 바르게 배열하시오.

(필요하면 적절히 형태를 바꿔 쓸 것)
나의 아버지는 설거지를 하신다.
[ my father / the dishes. / washes ]`,
    arrangeWords: [`my father`, `the dishes`, `washes`],
    correctAnswers: [`My father washes the dishes`],
    correctAnswer: `My father washes the dishes`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 40,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `어법상 틀린 부분을 고쳐 쓰세요.

(수정한 후의 정답 단어만 쓰세요)
My mom may cooks in the kitchen.
정답: _`,
    correctAnswer: `cook`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'text'
  },
  {
    id: 41,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `어법상 틀린 부분을 고쳐 쓰세요.

(수정한 후의 정답 단어만 쓰세요)
They not may be in the classroom.
정답: _`,
    correctAnswer: `may not`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'text'
  },
  {
    id: 42,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.

너는 그에게 사실을 말해야 한다.
[ him / the / you / truth. / tell / should ]`,
    arrangeWords: [`him`, `the`, `you`, `truth`, `tell`, `should`],
    correctAnswers: [`You should tell him the truth`],
    correctAnswer: `You should tell him the truth`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 43,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.

너는 새 컴퓨터를 사는 게 좋겠다.
[ buy / a / should / computer. / you / new ]`,
    arrangeWords: [`buy`, `a`, `should`, `computer`, `you`, `new`],
    correctAnswers: [`You should buy a new computer`],
    correctAnswer: `You should buy a new computer`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 44,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하여 문장을 완성하시오.

영화 보는 동안에 시끄럽게 해서는 안 된다.
-You  during the movie.
[ not / make / should / noise / a ]`,
    arrangeWords: [`not`, `make`, `should`, `noise`, `a`],
    correctAnswers: [`should not make a noise`],
    correctAnswer: `should not make a noise`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 45,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `빈칸에 들어갈 알맞은 형태는?

He loves _ abroad. (travel)`,
    options: [`travel`, `traveled`, `to traveling`, `traveling, to travel`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 46,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'A',
    questionText: `빈칸에 들어갈 알맞은 형태는?

I don't mind _ the door. (open)`,
    options: [`open`, `to open`, `opening`, `opened`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'basic',
    inputType: 'choice'
  },
  {
    id: 47,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞게 주어진 단어를 배열하시오.

무언가 좋은 일이 오늘 밤에 생길 것이다.
[ will happen / tonight. / good / something ]`,
    arrangeWords: [`will happen`, `tonight`, `good`, `something`],
    correctAnswers: [`Something good will happen tonight`],
    correctAnswer: `Something good will happen tonight`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 48,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞게 주어진 단어를 배열하시오.

우리 반의 Amy는 칠판에 동그라미를 그린다.
[ some circles / amy / in my class / draws / on the blackboard. ]`,
    arrangeWords: [`some circles`, `amy`, `in my class`, `draws`, `on the blackboard`],
    correctAnswers: [`Amy in my class draws some circles on the blackboard`],
    correctAnswer: `Amy in my class draws some circles on the blackboard`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
  {
    id: 49,
    section: 'grammar',
    category: '문법',
    subCategory: '서술형',
    grammarLevel: 'A',
    questionText: `다음 우리말에 맞게 주어진 단어를 배열하시오.

토니는 공중에서 공을 찼다.
[ in the air. / kicked / a ball / tony ]`,
    arrangeWords: [`in the air`, `kicked`, `a ball`, `tony`],
    correctAnswers: [`Tony kicked a ball in the air`],
    correctAnswer: `Tony kicked a ball in the air`,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'wordArrangement'
  },
];

export const prepGrammarBQuestions: PrepLevelTestQuestion[] = [
  {
    id: 50,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `빈칸에 알맞지 않은 말을 모두 고르세요.

Have you ever ?`,
    options: [`ridden a bike`, `catched the flu`, `sung a pop song`, `ate Vietnamese food`, `read this history book`],
    correctAnswer: [2, 4], requireAllAnswers: true,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 51,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `주어진 문장과 의미가 같은 것은?

He went to Europe, so he isn't here now.`,
    options: [`He has gone to Europe.`, `He hasn't been to Europe.`, `He has ever been to Europe.`, `He has been to Europe before.`, `He is going to go to Europe.`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 52,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `[3~4] 보기의 밑줄 친 부분과 쓰임이 같은 것은?

I have lost my math textbook.`,
    options: [`She has gone to Spain.`, `Jack has ridden horses.`, `I haven't been to Russia.`, `I have never fought online.`, `Have you written to a newspaper?`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 53,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `보기의 밑줄 친 부분과 쓰임이 같은 것은?

Have you ever seen this picture before?`,
    options: [`He has gone to Canada.`, `I have read this novel three times.`, `John has lived in Seoul for 6 years.`, `I have lost my wallet on my way home.`, `The singers have just arrived in Korea.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 54,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `빈칸에 들어갈 말로 바르게 짝지어진 것은?

• I  Chinese last month.
• I  Chinese since last month.`,
    options: [`was learning – learned`, `learned – have learned`, `have learned – learned`, `have learned – have learned`, `was learning – was learning`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 55,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 빈칸에 알맞은 말이 순서대로 짝지어진 것은?

• My uncle  the building.
• The building  by my uncle.`,
    options: [`designed – designed`, `designed – was designed`, `is designed – designed`, `was designed – was designed`, `was designed – was designing`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 56,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 중 수동태로 바꿀 수 없는 문장은?`,
    options: [`Tom cooked the steak.`, `They saw the movie yesterday.`, `He solved a very difficult question.`, `I sent a Christmas card to Jack.`, `He swam in the river last week.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 57,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `[8~9] 다음 문장을 수동태로 바르게 전환한 것은?

He didn't invite her to the party.`,
    options: [`He didn't invite to the party by her.`, `He isn't invited to the party by her.`, `She didn't invited to the party by him.`, `She wasn't invited to the party by him.`, `She was invited not to the party by him.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 58,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 문장을 수동태로 바르게 전환한 것은?

She looked after the newborn baby.`,
    options: [`The newborn baby looked by her after.`, `The newborn baby looked after by her.`, `The newborn baby is looked after by her.`, `The newborn baby was looked by her after.`, `The newborn baby was looked after by her.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 59,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 빈칸에 들어갈 말이 나머지와 다른 하나는?`,
    options: [`The table was covered  dirt.`, `The scientists were satisfied  the result.`, `The jar is filled  jelly beans.`, `He is particularly interested  old cars.`, `They were disappointed  my grades.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 60,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `주어진 문장의 밑줄 친 It과 쓰임이 같은 것은?

It is good to get up early in the morning.`,
    options: [`It's raining now.`, `What is it?`, `I saw it yesterday.`, `It's March 18th.`, `It's fun to play table tennis.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 61,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `[12~13] 주어진 문장의 밑줄 친 부분과 용법이 같은 것은?

I study English to talk with foreigners.`,
    options: [`I want to be a teacher.`, `Jihye is going to the library to study.`, `Minho likes to take care of sick people.`, `I need something to eat.`, `It is exciting to play tennis.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 62,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `주어진 문장의 밑줄 친 부분과 용법이 같은 것은?

I have some books to buy.`,
    options: [`I wish to travel around the world.`, `Give him something to eat.`, `I went to the cafe to meet him.`, `I hope to see you at the party.`, `It's fun to teach the students.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 63,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 a~f 중 어법상 틀린 문장의 개수로 알맞은 것은?

a) I enjoy talking with my grandmother.
b) Do you mind if I borrow your pen?
c) When will you decide meeting him?
d) He has many books to read in two days.
e) My dad made me to take out the trash.
f) I want you bring me my car key.`,
    options: [`1개`, `2개`, `3개`, `4개`, `5개`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 64,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 빈칸에 들어갈 단어가 나머지 넷과 다른 하나는?`,
    options: [`It was necessary  him to get the answer.`, `It is very kind  you to say so.`, `It is not difficult  her to win the prize.`, `It is helpful  me to wear a mask.`, `It was exciting  them to reach the top of the mountain.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 65,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `[16~17] 다음 빈칸에 들어갈 말로 알맞은 것은?

The red shirt made her  better.`,
    options: [`looks`, `look`, `looked`, `looking`, `to look`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 66,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 빈칸에 들어갈 말로 알맞은 것은?

Mom told me watching TV.`,
    options: [`stop`, `stopping`, `to stop`, `stopped`, `stops`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 67,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `어법상 틀린 것을 바르게 고친 것 중 잘못된 것은?`,
    options: [`I told him take a break and get some sleep. → to take`, `He made his son to keep a promise. → keep`, `Mom didn't allow me going to the movies. → go`, `I helped him moved the desk. → move`, `Jenny saw them to hide in the closet. → hide`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 68,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `[19~20] 다음 밑줄 친 부분 중 틀린 것을 고르시오.`,
    options: [`The cat tried to catch a mouse.`, `Many people choose not to marry.`, `He continued to ignore everything I said.`, `Ryan gave up to write his books in serials.`, `The officer promised to look into the matter.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 69,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `다음 밑줄 친 부분 중 틀린 것을 고르시오.`,
    options: [`I quit smoking about a year ago.`, `She decided majoring in business.`, `Do you mind sharing the table with us?`, `He enjoyed fishing when he was young.`, `They began to scream at the ghost house.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 70,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `빈칸에 들어갈 말이 순서대로 바르게 짝지어진 것은?

A:  you ever  to the Grand Canyon?
B: No, I . I really want to visit there someday.`,
    options: [`Did – go – didn't`, `Have – been – haven't`, `Have – gone – haven't`, `Are – been – am not`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 71,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 부분 중 어법상 틀린 것은?

I ①have ②took guitar lessons ③since ④last year.`,
    options: [`①`, `②`, `③`, `④`, `⑤`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 72,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 부분 중 어법상 틀린 것은?

She ①has lived ②in Jeju ③since ④five years.`,
    options: [`①`, `②`, `③`, `④`, `⑤`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 73,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 부분 중 어법상 틀린 것은?

Amy ①has lost her favorite ring ②last week.`,
    options: [`has lost`, `last week`, `her favorite`, `ring`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 74,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 동명사의 쓰임을 고르세요.

Reading comic books is very fun.`,
    options: [`주어`, `목적어`, `보어`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 75,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 동명사의 쓰임을 고르세요.

Cindy hates cleaning the bathroom.`,
    options: [`주어`, `목적어`, `보어`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
  {
    id: 76,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'B',
    questionText: `밑줄 친 동명사의 쓰임을 고르세요.

My hobby is playing basketball.`,
    options: [`주어`, `목적어`, `보어`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'intermediate',
    inputType: 'choice'
  },
];

export const prepGrammarCQuestions: PrepLevelTestQuestion[] = [
  {
    id: 77,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 밑줄 친 부분의 쓰임이 나머지 넷과 다른 것은?`,
    options: [`You may leave now.`, `It may be true.`, `It may rain this afternoon.`, `He may come back home today`, `He may be a teacher.`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 78,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `어법상 잘못된 것을 2개 고르면?`,
    options: [`She got up early to not miss the train.`, `He seems to know the answer.`, `Peter helped his brother fix the bike.`, `My parents wanted me enter the contest.`, `Jessy taught me how to use the machine.`],
    correctAnswer: [1, 4], requireAllAnswers: true,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 79,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `짝지어진 두 문장의 뜻이 다른 것은?

1) I don't have to worry about it.
= I must not worry about it.
2) I would like to drink some orange juice.
= I want to drink some orange juice.
3) Perhaps he is working.
= He may be working.
4) You are quite right in saying so.
= You may well say so.
5) Do you think I should apply for the job?
= Do you think I ought to apply for the job?`,
    options: [`1번`, `2번`, `3번`, `4번`, `5번`],
    correctAnswer: 1,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 80,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `밑줄 친 부분의 쓰임이 다른 하나는?`,
    options: [`We need chairs to sit on.`, `Please give me something to eat.`, `He went to Paris to study art.`, `She has lots of work to do today.`, `They have no house to live in.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 81,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 문장에서 어법상 올바른 문장은?`,
    options: [`Where did your cell phone found?`, `This cake didn't made by my mom.`, `The novels were written by my mom.`, `The vase was not breaking by the dog.`, `The books was bought by my father.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 82,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 수동태로 만들 수 없는 문장은?`,
    options: [`He helped lots of children in Africa.`, `Everybody calls her Ms. Smile.`, `She became more and more beautiful.`, `You must finish this work by tomorrow.`, `He filled the room with flowers.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 83,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 밑줄 친 It의 쓰임이 다른 것은?`,
    options: [`It is so hard for me to get up early in the morning.`, `It was great to spend time with your family.`, `It will be really fun to go to the Club Festival.`, `It was too cold outside so I didn't go out.`, `It would be better for you to visit us.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 84,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 의미가 다른 하나는?`,
    options: [`I was too tired to do anything.`, `I was not too tired to do anything.`, `I was so tired that I couldn't do anything.`, `I couldn't do anything because I was so tired.`, `Because I was too tired, I couldn't do anything.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 85,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `짝지어진 두 문장의 의미가 같은 것은?

1) Please tell me where to put this plant.
= Please tell me where you will put this plant.
2) I was so busy that I couldn't call you.
= I was busy enough to call you.
3) We are to see the motor show.
= We want to see the motor show.
4) The refrigerator was so expensive that he couldn't buy it.
= The refrigerator was too expensive to buy.
5) If you are to succeed, you should study hard.
= If you are able to succeed, you should study hard.`,
    options: [`1번`, `2번`, `3번`, `4번`, `5번`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 86,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 어법상 어색한 것을 고르시오.`,
    options: [`She heard the dog barking loudly.`, `The man watched her singing an opera.`, `Do you feel my legs shaking?`, `Did he really hear her to shout?`, `We saw them sleeping on the floor.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 87,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 괄호 안에 적절한 것이 바르게 짝지어진 것을 모두 고르시오.

a. I saw a lady ( sitting / sit / sat ) in the living room.
b. We looked at the monkey ( to take care / take care / took care ) of its baby.`,
    options: [`sitting, take care`, `sit, took care`, `sat, to take care`, `sit, take care`, `sitting, to take care`],
    correctAnswer: [1, 4], requireAllAnswers: true,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 88,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 문장에서 어색한 부분을 바르게 고친 것을 고르시오.

Koreans tend to keep silently when eating.`,
    options: [`Koreans tend keeping silently when eating.`, `Koreans tend to keep silent when eating.`, `Koreans tend to keeping silently when eating.`, `Koreans tends to keep silent when eating.`, `Koreans tend to keep silently when eat.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 89,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 어법상 올바른 것을 고르시오.`,
    options: [`My father never lets me to go to the zoo.`, `Please let him to watch the basketball game.`, `She had her daughter talking to her.`, `My mother doesn't let me ate junk food.`, `She made her robot clean her room.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 90,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 빈칸에 적절한 것을 모두 고르시오.

I will help my father _ the dishes.`,
    options: [`wash`, `washed`, `washing`, `to wash`, `to washing`],
    correctAnswer: [1, 4], requireAllAnswers: true,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 91,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 어법상 올바른 것을 고르시오.`,
    options: [`The chef let the soup to boil for two hours.`, `My parents made me clean the garage last weekend.`, `She had her cat wearing a funny costume.`, `The coach made the players to run ten laps.`, `We let our kids to stay up late on New Year's Eve.`],
    correctAnswer: 2,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 92,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 어법상 어색한 것을 고르시오.`,
    options: [`It's not far from here.`, `Is he your English teacher?`, `Why don't we clean up the room?`, `I take some pictures last weekend.`, `We picked up lots of bottles and cans today.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 93,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 형식이 다른 것을 고르시오.`,
    options: [`John asked me to join the meeting.`, `The teacher told the students to sit down.`, `I want you to keep calm until he comes.`, `They advised her to take a rest.`, `My uncle gave me a new watch.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 94,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `주어진 두 문장을 한 문장으로 적절하게 표현한 문장을 고르시오.

He lost his wallet. He doesn't have it now.`,
    options: [`He have lost his wallet.`, `He lost his wallet.`, `He had lost his wallet.`, `He has been lost his wallet.`, `He has lost his wallet.`],
    correctAnswer: 5,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 95,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 밑줄 친 부분이 다른 것을 고르시오.`,
    options: [`He is going to read the letters.`, `We are going to have a party tonight.`, `They are going to school right now.`, `She is going to play volleyball with her friends.`, `I'm going to drink some water.`],
    correctAnswer: 3,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
  {
    id: 96,
    section: 'grammar',
    category: '문법',
    subCategory: '문법',
    grammarLevel: 'C',
    questionText: `다음 중 어법상 어색한 것을 고르시오.`,
    options: [`Jenny resembles her mother very much.`, `I refused to do the dishes this morning.`, `We reached the subway station in twenty minutes.`, `Andy discussed about the problem with Kelly.`, `He drives his car carefully.`],
    correctAnswer: 4,
    points: 3,
    difficulty: 'advanced',
    inputType: 'choice'
  },
];

export const prepVocabularyQuestions: PrepLevelTestQuestion[] = [
{ id: 97, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `rude`, correctAnswers: [`버릇없는`, `무례한`], fixedDistractors: [`친절한`, `상냥한`, `정중한`], fixedOptions: [`무례한`, `상냥한`, `친절한`, `버릇없는`, `정중한`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 98, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `owl`, correctAnswers: [`올빼미`, `부엉이`], fixedDistractors: [`독수리`, `참새`, `비둘기`], fixedOptions: [`올빼미`, `독수리`, `참새`, `부엉이`, `비둘기`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 99, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `invest`, correctAnswers: [`투자하다`, `(수익을 위해) 투자하다`], fixedDistractors: [`저축하다`, `소비하다`, `낭비하다`], fixedOptions: [`(수익을 위해) 투자하다`, `소비하다`, `투자하다`, `낭비하다`, `저축하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 100, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `sunlight`, correctAnswers: [`햇빛`, `햇살`], fixedDistractors: [`달빛`, `별빛`, `그림자`], fixedOptions: [`별빛`, `햇살`, `달빛`, `그림자`, `햇빛`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 101, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `victim`, correctAnswers: [`희생자`, `피해자`], fixedDistractors: [`가해자`, `목격자`, `구조자`], fixedOptions: [`희생자`, `구조자`, `목격자`, `피해자`, `가해자`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 102, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `stuff`, correctAnswers: [`물건`, `것`, `~을채워넣다`], fixedDistractors: [`사람`, `장소`], fixedOptions: [`물건`, `사람`, `장소`, `것`, `~을채워넣다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 103, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `discuss`, correctAnswers: [`논의하다`, `토론하다`], fixedDistractors: [`침묵하다`, `회피하다`, `결정하다`], fixedOptions: [`침묵하다`, `토론하다`, `논의하다`, `회피하다`, `결정하다`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 104, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `soil`, correctAnswers: [`흙`, `토양`], fixedDistractors: [`모래`, `자갈`, `바위`], fixedOptions: [`모래`, `흙`, `토양`, `자갈`, `바위`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 105, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `view`, correctAnswers: [`견해`, `경관`, `전망`, `생각`], fixedDistractors: [`소리`], fixedOptions: [`소리`, `경관`, `견해`, `생각`, `전망`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 106, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `courage`, correctAnswers: [`용기`, `담력`], fixedDistractors: [`두려움`, `겁`, `불안`], fixedOptions: [`겁`, `담력`, `용기`, `불안`, `두려움`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 107, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `bit`, correctAnswers: [`약간`, `조금`], fixedDistractors: [`많이`, `전혀`, `거의`], fixedOptions: [`거의`, `조금`, `약간`, `많이`, `전혀`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 108, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `bug`, correctAnswers: [`작은 곤충`, `벌레`], fixedDistractors: [`새`, `물고기`, `동물`], fixedOptions: [`물고기`, `동물`, `작은 곤충`, `새`, `벌레`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 109, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `organ`, correctAnswers: [`장기`, `기관(악기)`, `오르간`], fixedDistractors: [`근육`, `뼈`], fixedOptions: [`근육`, `기관(악기)`, `뼈`, `오르간`, `장기`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 110, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `achieve`, correctAnswers: [`이루다`, `성취하다`], fixedDistractors: [`실패하다`, `포기하다`, `시작하다`], fixedOptions: [`포기하다`, `실패하다`, `성취하다`, `이루다`, `시작하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 111, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `comb`, correctAnswers: [`빗`, `빗질하다`, `빗다`], fixedDistractors: [`가위`, `거울`], fixedOptions: [`빗다`, `빗질하다`, `가위`, `빗`, `거울`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 112, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `street`, correctAnswers: [`도로`, `길거리`], fixedDistractors: [`건물`, `공원`, `광장`], fixedOptions: [`건물`, `도로`, `길거리`, `공원`, `광장`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 113, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `loud`, correctAnswers: [`큰 소리의`, `시끄러운`], fixedDistractors: [`조용한`, `부드러운`, `낮은`], fixedOptions: [`낮은`, `부드러운`, `큰 소리의`, `시끄러운`, `조용한`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 114, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `astronaut`, correctAnswers: [`우주비행사`], fixedDistractors: [`조종사`, `선원`, `탐험가`, `과학자`], fixedOptions: [`탐험가`, `조종사`, `우주비행사`, `선원`, `과학자`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 115, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `cross`, correctAnswers: [`건너다`, `횡단하다`, `교차하다`], fixedDistractors: [`피하다`, `돌아가다`], fixedOptions: [`돌아가다`, `피하다`, `횡단하다`, `건너다`, `교차하다`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 116, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `tiny`, correctAnswers: [`아주 적은`, `아주 작은`], fixedDistractors: [`커다란`, `거대한`, `넓은`], fixedOptions: [`거대한`, `넓은`, `아주 적은`, `아주 작은`, `커다란`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 117, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `brief`, correctAnswers: [`잠깐의`, `간결한`], fixedDistractors: [`길고긴`, `복잡한`, `지루한`], fixedOptions: [`길고긴`, `복잡한`, `잠깐의`, `지루한`, `간결한`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 118, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `cell`, correctAnswers: [`세포`], fixedDistractors: [`기관`, `장기`, `조직`, `근육`], fixedOptions: [`장기`, `세포`, `조직`, `근육`, `기관`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 119, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `market`, correctAnswers: [`시장`], fixedDistractors: [`상점`, `광장`, `공장`, `은행`], fixedOptions: [`은행`, `상점`, `광장`, `공장`, `시장`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 120, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `interact`, correctAnswers: [`상호작용하다`, `소통하다`], fixedDistractors: [`무시하다`, `방해하다`, `차단하다`], fixedOptions: [`방해하다`, `무시하다`, `소통하다`, `차단하다`, `상호작용하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 121, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `nearly`, correctAnswers: [`거의`], fixedDistractors: [`전혀`, `결코`, `완전히`, `정확히`], fixedOptions: [`결코`, `완전히`, `거의`, `정확히`, `전혀`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 122, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `numerous`, correctAnswers: [`많은`, `수많은`], fixedDistractors: [`적은`, `드문`, `유일한`], fixedOptions: [`드문`, `수많은`, `유일한`, `적은`, `많은`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 123, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `precious`, correctAnswers: [`귀중한`, `값비싼`], fixedDistractors: [`흔한`, `값싼`, `쓸모없는`], fixedOptions: [`값싼`, `흔한`, `귀중한`, `쓸모없는`, `값비싼`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 124, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `sharp`, correctAnswers: [`날카로운`, `뾰족한`, `급격한`], fixedDistractors: [`무딘`, `완만한`], fixedOptions: [`뾰족한`, `완만한`, `급격한`, `날카로운`, `무딘`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 125, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `degree`, correctAnswers: [`범위`, `정도`, `(온도단위) 도`], fixedDistractors: [`속도`, `무게`], fixedOptions: [`무게`, `속도`, `범위`, `정도`, `(온도단위) 도`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 126, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `occupation`, correctAnswers: [`점유`, `직업`], fixedDistractors: [`취미`, `휴식`, `여가`], fixedOptions: [`여가`, `휴식`, `점유`, `직업`, `취미`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 127, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `provide`, correctAnswers: [`공급하다`, `제공하다`], fixedDistractors: [`거절하다`, `빼앗다`, `숨기다`], fixedOptions: [`제공하다`, `빼앗다`, `숨기다`, `공급하다`, `거절하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 128, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `develop`, correctAnswers: [`개발하다`, `발전하다`], fixedDistractors: [`퇴화하다`, `감소하다`, `파괴하다`], fixedOptions: [`개발하다`, `퇴화하다`, `발전하다`, `파괴하다`, `감소하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 129, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `improve`, correctAnswers: [`향상시키다`, `개선하다`], fixedDistractors: [`악화시키다`, `약화시키다`, `유지하다`], fixedOptions: [`개선하다`, `유지하다`, `향상시키다`, `악화시키다`, `약화시키다`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 130, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `relationship`, correctAnswers: [`관계`], fixedDistractors: [`감정`, `기억`, `약속`, `친구`], fixedOptions: [`약속`, `친구`, `기억`, `관계`, `감정`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 131, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `social`, correctAnswers: [`사회적인`], fixedDistractors: [`개인적인`, `비밀의`, `고립된`, `독립적인`], fixedOptions: [`개인적인`, `사회적인`, `비밀의`, `독립적인`, `고립된`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 132, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `behave`, correctAnswers: [`행동하다`], fixedDistractors: [`관찰하다`, `기억하다`, `이해하다`, `느끼다`], fixedOptions: [`기억하다`, `이해하다`, `관찰하다`, `느끼다`, `행동하다`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 133, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `terrible`, correctAnswers: [`끔찍한`], fixedDistractors: [`멋진`, `훌륭한`, `평범한`, `흥미로운`], fixedOptions: [`흥미로운`, `훌륭한`, `멋진`, `끔찍한`, `평범한`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 134, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `positive`, correctAnswers: [`긍정적인`], fixedDistractors: [`부정적인`, `중립적인`, `회의적인`, `불확실한`], fixedOptions: [`불확실한`, `부정적인`, `중립적인`, `회의적인`, `긍정적인`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 135, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `ride`, correctAnswers: [`타다`], fixedDistractors: [`걷다`, `달리다`, `내리다`, `멈추다`], fixedOptions: [`멈추다`, `걷다`, `달리다`, `타다`, `내리다`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 136, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `emotion`, correctAnswers: [`감정`], fixedDistractors: [`이성`, `행동`, `기억`, `생각`], fixedOptions: [`기억`, `행동`, `감정`, `생각`, `이성`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 137, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `proper`, correctAnswers: [`적절한`], fixedDistractors: [`부적절한`, `어색한`, `지나친`, `부족한`], fixedOptions: [`부족한`, `적절한`, `어색한`, `지나친`, `부적절한`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 138, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `proud`, correctAnswers: [`자랑스러워하는`], fixedDistractors: [`부끄러운`, `겸손한`, `실망한`, `두려운`], fixedOptions: [`실망한`, `부끄러운`, `자랑스러워하는`, `두려운`, `겸손한`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 139, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `approach`, correctAnswers: [`접근하다`], fixedDistractors: [`멀어지다`, `회피하다`, `후퇴하다`, `벗어나다`], fixedOptions: [`회피하다`, `멀어지다`, `후퇴하다`, `접근하다`, `벗어나다`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 140, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `despite`, correctAnswers: [`~에도 불구하고`], fixedDistractors: [`~때문에`, `~덕분에`, `~동안에`, `~대신에`], fixedOptions: [`~동안에`, `~대신에`, `~때문에`, `~덕분에`, `~에도 불구하고`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 141, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `generate`, correctAnswers: [`발생시키다`], fixedDistractors: [`소멸시키다`, `감소시키다`, `유지하다`, `보존하다`], fixedOptions: [`유지하다`, `감소시키다`, `보존하다`, `소멸시키다`, `발생시키다`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 142, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `describe`, correctAnswers: [`묘사하다`], fixedDistractors: [`숨기다`, `왜곡하다`, `지우다`, `기록하다`], fixedOptions: [`숨기다`, `묘사하다`, `기록하다`, `지우다`, `왜곡하다`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 143, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `habitat`, correctAnswers: [`서식지`], fixedDistractors: [`습관`, `행동`, `특성`, `생태`], fixedOptions: [`특성`, `행동`, `서식지`, `습관`, `생태`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 144, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `allow`, correctAnswers: [`허락하다`], fixedDistractors: [`금지하다`, `거절하다`, `방해하다`, `막다`], fixedOptions: [`거절하다`, `막다`, `방해하다`, `허락하다`, `금지하다`], points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 145, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `relieve`, correctAnswers: [`경감하다`, `안도시키다`], fixedDistractors: [`악화시키다`, `긴장시키다`, `심화시키다`], fixedOptions: [`악화시키다`, `안도시키다`, `경감하다`, `긴장시키다`, `심화시키다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 146, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `expert`, correctAnswers: [`전문가`], fixedDistractors: [`초보자`, `견습생`, `관찰자`, `조수`], fixedOptions: [`관찰자`, `견습생`, `초보자`, `전문가`, `조수`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 147, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `derive`, correctAnswers: [`얻다`, `비롯되다`], fixedDistractors: [`졸린`, `배부른`, `일반적인`], fixedOptions: [`졸린`, `얻다`, `일반적인`, `비롯되다`, `배부른`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 148, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `elaborate`, correctAnswers: [`자세히 설명하다`, `정교한`], fixedDistractors: [`활기찬`, `아름다운`, `낮다`], fixedOptions: [`활기찬`, `자세히 설명하다`, `낮다`, `아름다운`, `정교한`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 149, section: 'vocabulary', category: '어휘', subCategory: '기초', questionText: `match`, correctAnswers: [`어울리다`, `경기`], fixedDistractors: [`열다`, `뜨거운`, `슬픈`], fixedOptions: [`열다`, `뜨거운`, `어울리다`, `경기`, `슬픈`], requireAllAnswers: true, points: 2, difficulty: 'basic', inputType: 'multiText' as any },
{ id: 150, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `contact`, correctAnswers: [`연락하다`, `접촉`], fixedDistractors: [`유용한`, `정직한`, `희귀한`], fixedOptions: [`연락하다`, `희귀한`, `접촉`, `유용한`, `정직한`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 151, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `electronic`, correctAnswers: [`전자적인`], fixedDistractors: [`거친`, `가져오다`, `느린`, `불친절한`], fixedOptions: [`거친`, `전자적인`, `불친절한`, `느린`, `가져오다`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 152, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `claim`, correctAnswers: [`주장하다`, `요구하다`], fixedDistractors: [`늙다`, `약한`, `못생긴`], fixedOptions: [`주장하다`, `약한`, `늙다`, `요구하다`, `못생긴`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 153, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `familiar`, correctAnswers: [`익숙한`, `친숙한`], fixedDistractors: [`배고픈`, `행복한`, `어둡다`], fixedOptions: [`행복한`, `배고픈`, `친숙한`, `익숙한`, `어둡다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 154, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `beard`, correctAnswers: [`수염`], fixedDistractors: [`새로운`, `활기찬`, `불필요한`, `느린`], fixedOptions: [`활기찬`, `새로운`, `느린`, `수염`, `불필요한`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 155, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `invade`, correctAnswers: [`침입하다`], fixedDistractors: [`새로운`, `건강한`, `낮다`, `빠른`], fixedOptions: [`새로운`, `침입하다`, `빠른`, `낮다`, `건강한`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 156, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `sequence`, correctAnswers: [`연속`, `순서`], fixedDistractors: [`바쁜`, `배고픈`, `늙다`], fixedOptions: [`바쁜`, `늙다`, `배고픈`, `순서`, `연속`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 157, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `fasten`, correctAnswers: [`고정시키다`, `매다`], fixedDistractors: [`즐거운`, `참여하다`, `보내다`], fixedOptions: [`즐거운`, `고정시키다`, `보내다`, `매다`, `참여하다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 158, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `custom`, correctAnswers: [`관습`, `풍습`], fixedDistractors: [`좁다`, `재미없는`, `어둡다`], fixedOptions: [`어둡다`, `관습`, `풍습`, `재미없는`, `좁다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 159, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `conclude`, correctAnswers: [`끝내다`, `결론을 내리다`], fixedDistractors: [`목마른`, `어둡다`, `길다`], fixedOptions: [`어둡다`, `목마른`, `끝내다`, `결론을 내리다`, `길다`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 160, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `intuition`, correctAnswers: [`직관`], fixedDistractors: [`사다`, `간단한`, `넓다`, `참여하다`], fixedOptions: [`간단한`, `사다`, `참여하다`, `넓다`, `직관`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 161, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `awkward`, correctAnswers: [`어색한`, `난처한`], fixedDistractors: [`거친`, `부드러운`, `아름다운`], fixedOptions: [`어색한`, `거친`, `난처한`, `아름다운`, `부드러운`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 162, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `reservoir`, correctAnswers: [`저장소`, `저수지`], fixedDistractors: [`한가한`, `젊다`, `뜨거운`], fixedOptions: [`한가한`, `저장소`, `젊다`, `저수지`, `뜨거운`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 163, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `illiterate`, correctAnswers: [`문맹의`], fixedDistractors: [`활기찬`, `작다`, `새로운`, `어리석은`], fixedOptions: [`어리석은`, `작다`, `새로운`, `활기찬`, `문맹의`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 164, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `epidemic`, correctAnswers: [`유행병`], fixedDistractors: [`한가한`, `겁쟁이`, `지루한`, `중요한`], fixedOptions: [`지루한`, `유행병`, `겁쟁이`, `한가한`, `중요한`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 165, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `glide`, correctAnswers: [`미끄러지다`], fixedDistractors: [`지루한`, `빠른`, `젊다`, `현명한`], fixedOptions: [`빠른`, `지루한`, `미끄러지다`, `현명한`, `젊다`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 166, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `swell`, correctAnswers: [`붓다`, `팽창하다`], fixedDistractors: [`시작하다`, `예쁜`, `잃다`], fixedOptions: [`예쁜`, `잃다`, `시작하다`, `붓다`, `팽창하다`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 167, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `mischief`, correctAnswers: [`장난`], fixedDistractors: [`흔한`, `느린`, `짧다`, `어둡다`], fixedOptions: [`느린`, `어둡다`, `짧다`, `장난`, `흔한`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 168, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `escape`, correctAnswers: [`탈출하다`], fixedDistractors: [`슬픈`, `부드러운`, `졸린`, `배고픈`], fixedOptions: [`졸린`, `슬픈`, `배고픈`, `부드러운`, `탈출하다`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 169, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `chill`, correctAnswers: [`냉각하다`, `한기`], fixedDistractors: [`졸린`, `피곤한`, `받다`], fixedOptions: [`졸린`, `받다`, `한기`, `냉각하다`, `피곤한`], requireAllAnswers: true, points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 170, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `welfare`, correctAnswers: [`복지`], fixedDistractors: [`짧다`, `끝내다`, `아픈`, `넓다`], fixedOptions: [`짧다`, `넓다`, `아픈`, `복지`, `끝내다`], points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
{ id: 171, section: 'vocabulary', category: '어휘', subCategory: '중급', questionText: `retire`, correctAnswers: [`은퇴하다`], fixedDistractors: [`아픈`, `친절한`, `넓다`, `부드러운`], fixedOptions: [`친절한`, `넓다`, `은퇴하다`, `부드러운`, `아픈`], points: 2, difficulty: 'intermediate', inputType: 'multiText' as any },
{ id: 172, section: 'vocabulary', category: '어휘', subCategory: '고급', questionText: `contradict`, correctAnswers: [`모순되다`, `반박하다`], fixedDistractors: [`배고픈`, `늙다`, `친절한`], fixedOptions: [`늙다`, `모순되다`, `배고픈`, `반박하다`, `친절한`], requireAllAnswers: true, points: 2, difficulty: 'advanced', inputType: 'multiText' as any },
];

export const prepSentenceAnalysisQuestions: PrepLevelTestQuestion[] = [
  {
    id: 173,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `Spending a lot of time practicing the violin strengthens the brain connections involved in learning music.`,
    sentenceWords: [`Spending`, `a`, `lot`, `of`, `time`, `practicing`, `the`, `violin`, `strengthens`, `the`, `brain`, `connections`, `involved`, `in`, `learning`, `music.`],
    correctSubjects: [`Spending`],
    optionalSubjects: [`a`, `lot`, `of`, `time`, `practicing`, `the`, `violin`],
    correctVerbs: [`strengthens`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 174,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `At the time, many children were working in factories in unsafe conditions.`,
    sentenceWords: [`At`, `the`, `time,`, `many`, `children`, `were`, `working`, `in`, `factories`, `in`, `unsafe`, `conditions.`],
    correctSubjects: [`many`],
    optionalSubjects: [`children`],
    correctVerbs: [`were`, `working`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 175,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `In addition to helping people in need, Addams dedicated her life to world peace as well.`,
    sentenceWords: [`In`, `addition`, `to`, `helping`, `people`, `in`, `need,`, `Addams`, `dedicated`, `her`, `life`, `to`, `world`, `peace`, `as`, `well.`],
    correctSubjects: [`Addams`],
    optionalSubjects: [],
    correctVerbs: [`dedicated`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 176,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `After doing a study on everyone who lived there, he found that they were generally much healthier than the rest of the country.`,
    sentenceWords: [`After`, `doing`, `a`, `study`, `on`, `everyone`, `who`, `lived`, `there,`, `he`, `found`, `that`, `they`, `were`, `generally`, `much`, `healthier`, `than`, `the`, `rest`, `of`, `the`, `country.`],
    correctSubjects: [`he`],
    optionalSubjects: [],
    correctVerbs: [`found`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 177,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `By allowing people to easily replace the unhealthy ingredients in processed foods with healthier options, it has the potential to help provide a more nutritious diet.`,
    sentenceWords: [`By`, `allowing`, `people`, `to`, `easily`, `replace`, `the`, `unhealthy`, `ingredients`, `in`, `processed`, `foods`, `with`, `healthier`, `options,`, `it`, `has`, `the`, `potential`, `to`, `help`, `provide`, `a`, `more`, `nutritious`, `diet.`],
    correctSubjects: [`it`],
    optionalSubjects: [],
    correctVerbs: [`has`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 178,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `If you watch a capoeira performance today, you may notice how the musicians often change their tempo.`,
    sentenceWords: [`If`, `you`, `watch`, `a`, `capoeira`, `performance`, `today,`, `you`, `may`, `notice`, `how`, `the`, `musicians`, `often`, `change`, `their`, `tempo.`],
    correctSubjects: [`you`],
    optionalSubjects: [],
    correctVerbs: [`may`, `notice`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 179,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `Puns are often used to make people laugh, but they can make people think more deeply as well.`,
    sentenceWords: [`Puns`, `are`, `often`, `used`, `to`, `make`, `people`, `laugh,`, `but`, `they`, `can`, `make`, `people`, `think`, `more`, `deeply`, `as`, `well.`],
    correctSubjects: [`Puns`],
    optionalSubjects: [],
    correctVerbs: [`are`],
    optionalVerbs: [`used`],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 180,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `Take the example of an American boy getting dressed in the morning.`,
    sentenceWords: [`Take`, `the`, `example`, `of`, `an`, `American`, `boy`, `getting`, `dressed`, `in`, `the`, `morning.`],
    correctSubjects: [],
    optionalSubjects: [`You`],
    correctVerbs: [`Take`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 181,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `But movies and TV programs are shown without changes, so it is sometimes hard for even native English speakers to understand them.`,
    sentenceWords: [`But`, `movies`, `and`, `TV`, `programs`, `are`, `shown`, `without`, `changes,`, `so`, `it`, `is`, `sometimes`, `hard`, `for`, `even`, `native`, `English`, `speakers`, `to`, `understand`, `them.`],
    correctSubjects: [`movies`],
    optionalSubjects: [`and`, `TV`, `programs`],
    correctVerbs: [`are`, `shown`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 182,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `There have been a lot of cases where they were under pressure.`,
    sentenceWords: [`There`, `have`, `been`, `a`, `lot`, `of`, `cases`, `where`, `they`, `were`, `under`, `pressure.`],
    correctSubjects: [`a`],
    optionalSubjects: [`lot`, `of`, `cases`],
    correctVerbs: [`have`, `been`],
    optionalVerbs: [],
    points: 4,
    difficulty: 'advanced',
    inputType: 'sentenceClick'
  },
  {
    id: 183,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `By using reusable containers, you can save the Earth!`,
    sentenceWords: [`By`, `using`, `reusable`, `containers,`, `you`, `can`, `save`, `the`, `Earth!`],
    correctSubjects: [`you`],
    optionalSubjects: [],
    correctVerbs: [`can`, `save`],
    optionalVerbs: [],
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  {
    id: 184,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `If both teams failed to move, the judges gave 5 more minutes.`,
    sentenceWords: [`If`, `both`, `teams`, `failed`, `to`, `move,`, `the`, `judges`, `gave`, `5`, `more`, `minutes.`],
    correctSubjects: [`the`],
    optionalSubjects: [`judges`],
    correctVerbs: [`gave`],
    optionalVerbs: [],
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  {
    id: 185,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `What will the world be like in the future?`,
    sentenceWords: [`What`, `will`, `the`, `world`, `be`, `like`, `in`, `the`, `future?`],
    correctSubjects: [`the`],
    optionalSubjects: [`world`],
    correctVerbs: [`will`, `be`],
    optionalVerbs: [],
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
  {
    id: 186,
    section: 'sentenceAnalysis' as any,
    category: '문장구조',
    subCategory: '주어동사파악',
    questionText: `문장에서 본 주어(S)와 본 동사(V)를 클릭하여 찾으세요. (더블클릭: 본 주어, 클릭: 본 동사)`,
    sentenceText: `Explore different future jobs for your wonderful life!`,
    sentenceWords: [`Explore`, `different`, `future`, `jobs`, `for`, `your`, `wonderful`, `life!`],
    correctSubjects: [],
    optionalSubjects: [`You`],
    correctVerbs: [`Explore`],
    optionalVerbs: [],
    points: 5,
    difficulty: 'basic',
    inputType: 'sentenceClick'
  },
];

export const allPrepQuestions: PrepLevelTestQuestion[] = [
  ...prepReadingQuestions,
  ...prepGrammarAQuestions,
  ...prepGrammarBQuestions,
  ...prepGrammarCQuestions,
  ...prepVocabularyQuestions,
  ...prepSentenceAnalysisQuestions,
];

// Analysis categories - 문항별 세분화 분석
// 문법: 문법 토픽별 분류 (의문문/부정문, 시제, 조동사, 감각동사, to부정사/동명사, 수동태, 현재완료, 사역·지각동사 등)
// 어휘: CEFR 기준 (A1-A2 기초 / B1-B2 중급 / C1-C2 고급)
// 문장구조 분석: 독립 카테고리 (독해 sentenceClick + 문장구조 섹션 통합)
export const prepAnalysisCategories = {
  reading: {
    name: '독해 (Reading)',
    subCategories: [
      { name: '독해 (지문이해)', questions: prepReadingQuestions.filter(q => q.inputType === 'choice').map(q => q.id) },
    ],
  },
  grammarA: {
    name: '문법 A구간 (기초)',
    subCategories: [
      { name: 'BE동사·일반동사 (의문문/부정문)', questions: [10, 11, 12, 13, 14, 17, 18, 19, 30, 31, 32, 33, 34] },
      { name: '의문사', questions: [15, 16] },
      { name: '조동사 (can/may/should)', questions: [20, 21, 22, 23, 24, 40, 41, 42, 43, 44] },
      { name: '감각동사 / 2형식', questions: [25, 26, 27, 28, 29] },
      { name: '시제 (진행형·미래)', questions: [35, 36, 37, 38] },
      { name: 'to부정사·동명사', questions: [45, 46] },
      { name: '문장 배열 (어순)', questions: [39, 47, 48, 49] },
    ],
  },
  grammarB: {
    name: '문법 B구간 (중급)',
    subCategories: [
      { name: '현재완료', questions: [50, 51, 52, 53, 54, 70, 71, 72, 73] },
      { name: '수동태', questions: [55, 56, 57, 58, 59] },
      { name: '가주어 it / to부정사 용법', questions: [60, 61, 62, 64] },
      { name: '동명사', questions: [63, 74, 75, 76] },
      { name: '사역·지각동사 (5형식)', questions: [65, 66, 67] },
      { name: 'to부정사 vs 동명사', questions: [68, 69] },
    ],
  },
  grammarC: {
    name: '문법 C구간 (심화)',
    subCategories: [
      { name: '조동사 심화', questions: [77, 79] },
      { name: 'to부정사 심화·구문', questions: [78, 80, 83, 84, 85, 88, 93] },
      { name: '수동태 심화', questions: [81, 82, 92, 96] },
      { name: '사역·지각동사 심화', questions: [86, 87, 89, 90, 91] },
      { name: '시제·기타', questions: [94, 95] },
    ],
  },
  vocabulary: {
    name: '어휘 (Vocabulary)',
    subCategories: [
      { name: '기초 (CEFR A1-A2)', questions: [97, 98, 100, 103, 107, 111, 112, 113, 114, 115, 119, 121, 129, 133, 135, 142, 144, 149] },
      { name: '중급 (CEFR B1-B2)', questions: [99, 101, 102, 104, 105, 106, 108, 109, 110, 116, 117, 118, 120, 122, 123, 124, 125, 127, 128, 130, 131, 132, 134, 136, 137, 138, 139, 140, 141, 143, 145, 146, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 161, 168, 169, 171] },
      { name: '고급 (CEFR C1-C2)', questions: [126, 147, 148, 160, 162, 163, 164, 165, 166, 167, 170, 172] },
    ],
  },
  sentenceAnalysis: {
    name: '문장구조 분석 (Sentence Analysis)',
    subCategories: [
      { 
        name: '문장구조 분석 (단문)', 
        questions: [
          ...prepReadingQuestions.filter(q => q.inputType === 'sentenceClick').map(q => q.id),
          ...prepSentenceAnalysisQuestions.map(q => q.id)
        ] 
      },
    ],
  },
};

export const prepSectionNames: Record<string, string> = {
  reading: '독해',
  grammarA: '문법 A구간',
  grammarB: '문법 B구간',
  grammarC: '문법 C구간',
  vocabulary: '어휘',
  sentenceAnalysis: '문장구조',
};

// 어휘 = 1점, 나머지 = 2점
export const getPrepQuestionPoints = (q: PrepLevelTestQuestion): number => {
  return q.section === 'vocabulary' ? 1 : 2;
};

export const calculatePrepTotalMaxScore = (): number => {
  return allPrepQuestions.reduce((total, q) => total + getPrepQuestionPoints(q), 0);
};
