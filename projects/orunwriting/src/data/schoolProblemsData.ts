// 학교별 기출문제 데이터

export interface SchoolProblem {
  number: number;
  question: string;
  passage?: string;
  options?: string;
  conditions?: string;
  answer: string | string[];
  explanation?: string;
}

export interface SchoolUnit {
  schoolName: string;
  grade: number;
  semester: string;
  exam: string;
  problems: SchoolProblem[];
}

export const schoolUnits: SchoolUnit[] = [
  {
    schoolName: "구암고등학교",
    grade: 1,
    semester: "1학기",
    exam: "중간고사",
    problems: [
      {
        number: 1,
        question: "[서답형 1] 다음 글의 내용을 한 문장으로 요약할 때, 빈칸 (A)와 (B)에 들어갈 말을 본문에서 찾아서 그대로 쓰시오.(각1점, 총2점)",
        passage: `Recent research suggests that evolving humans' relationship with dogs changed the structure of both species' brains. One of the various physical changes caused by domestication is a reduction in the size of the brain: 16 percent for horses, 34 percent for pigs, and 10 to 30 percent for dogs. This is because once humans started to take care of these animals, they no longer needed various brain functions in order to survive. Animals who were fed and protected by humans did not need many of the skills necessary for their wild ancestors to survive and lost the parts of the brain related to those capacities.

↓

The domestication of animals led to a (A)_______ in brain size because humans took care of them, making some brain functions no longer (B)_______.`,
        answer: ["(A) reduced", "(B) necessary / needed"],
        explanation: "가축화로 인해 뇌 크기가 '감소(reduction/reduced)'했고, 일부 뇌 기능이 더 이상 '필요하지 않게(necessary/needed)' 되었다."
      },
      {
        number: 2,
        question: "[서답형 2] 다음 글을 한 문장으로 요약할 때 빈칸에 알맞은 말을 <보기>의 단어들을 모두 사용하여 영작하시오. (필요시 단어 형태 변형 가능.) (3점)",
        passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. Companies large and small have off-loaded work onto the backs of consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.

↓

Rather than freeing us from the repetitive drudgery of work, _________________________________.`,
        options: "the computerized / society / have / off-load / more / work / on / consumers",
        answer: "the computerized society has off-loaded more work on consumers",
        explanation: "컴퓨터화된 사회가 소비자들에게 더 많은 일을 떠넘겼다는 내용."
      },
      {
        number: 3,
        question: "[서답형 3] 다음 글의 내용과 일치하도록 빈칸 (A)에 알맞은 단어는 글에서 찾아 그대로 쓰고, 빈칸 (B)에 알맞은 단어는 글에서 찾아 변형하여 쓰시오. (각2점, 총4점)",
        passage: `In Lewis Carroll's Through the Looking-Glass, the Red Queen takes Alice on a race through the countryside. They run and they run, but then Alice discovers that they're still under the same tree that they started from. The Red Queen explains to Alice: "here, you see, it takes all the running you can do, to keep in the same place." Biologists sometimes use this Red Queen Effect to explain an evolutionary principle. If foxes evolve to run faster so they can catch more rabbits, then only the fastest rabbits will live long enough to make a new generation of bunnies that run even faster - in which case, of course, only the fastest foxes will catch enough rabbits to thrive and pass on their genes. Even though they might run, the two species just stay in place.`,
        conditions: `Imagine a fox and a rabbit running around a track. The fox is trying to catch the rabbit, and the rabbit is running to escape, but they both keep running without success. This is like the (A)________ between species — they have to constantly adapt just to survive. They try to run faster, but they still stay in the same place. (B)________ can be seen as a cycle of survival rather than a (A)________ to win.`,
        answer: ["(A) competition", "(B) evolution"],
        explanation: "종 간의 경쟁(competition)과 진화(evolution)는 승리를 위한 것이 아니라 생존의 순환이다."
      },
      {
        number: 4,
        question: "[서답형 4] 주어진 단어를 적절히 배열하여 (A)에 들어갈 문장을 영작하시오. (반드시 동사의 어형 변화를 해야 함.) (4점)",
        passage: `Rejection is an everyday part of our lives, yet most people can't handle it well. For many, it's so painful that they'd rather not ask for something at all than ask and risk rejection. Yet, as the old saying goes, if you don't ask, the answer is always no. Avoiding rejection negatively affects many aspects of your life. All of that happens only because you're not tough enough to handle it. For this reason, consider rejection therapy. Come up with a request or an activity that usually results in a rejection. Working in sales is one such example. Asking for discounts at the stores will also work.

(A) _________________________________, you'll grow a thicker skin that will allow you to take on much more in life, thus making you more successful at dealing with unfavorable circumstances.`,
        options: "yourself / by / get / reject / deliberately",
        conditions: "(A) = 의도적으로 스스로를 거절당할 상황에 놓이게 함으로써",
        answer: "By deliberately getting yourself rejected",
        explanation: "'by + 동명사' 구문을 사용하여 '의도적으로 거절당함으로써'를 표현."
      },
      {
        number: 5,
        question: "[서답형 5] 다음 글을 한 문장으로 요약할 때, 빈칸 (A)와 (B)에 각각 들어갈 적절한 한 단어를 본문에서 찾아서 쓰시오. (각2점, 총4점)",
        passage: `When it comes to climate change, many blame the fossil fuel industry for pumping greenhouse gases, the agricultural sector for burning rainforests, or the fashion industry for producing excessive clothes. But wait, what drives these industrial activities? Our consumption. Climate change is a summed product of each person's behavior. That's why we should be responsible for our behaviors. For example, the fossil fuel industry is a popular scapegoat in the climate crisis. But why do they drill and burn fossil fuels? We provide them strong financial incentives: some people regularly travel on airplanes and cars that burn fossil fuels. Some people waste electricity generated by burning fuel in power plants. Some people use and throw away plastic products derived from crude oil every day. Blaming the fossil fuel industry while engaging in these behaviors is a slap in our own face.

↓

Climate change is a result of our (A)_______, so we must recognize our responsibility for the environmental problems instead of (B)_______ industries.`,
        answer: ["(A) consumption / behaviors", "(B) blaming"],
        explanation: "기후 변화는 우리의 '소비/행동'의 결과이며, 산업을 '비난하는' 대신 책임을 인식해야 한다."
      },
      {
        number: 6,
        question: "[서답형 6] 다음 글의 내용을 한 문장으로 요약하고자 한다. <보기>에 주어진 단어를 모두 사용하여 문장을 완성하시오. (3점)",
        passage: `In their study in 2007 Katherine Kinzler and her colleagues at Harvard showed that our tendency to identify with an in-group to a large degree begins in infancy and may be innate. Kinzler and her team took a bunch of five-month-olds whose families only spoke English and showed the babies two videos. In one video, a woman was speaking English. In the other, a woman was speaking Spanish. Then they were shown a screen with both women side by side, not speaking. In infant psychology research, the standard measure for affinity or interest is attention - babies will apparently stare longer at the things they like more. In Kinzler's study, the babies stared at the English speakers longer. In other studies, researchers have found that infants are more likely to take a toy offered by someone who speaks the same language as them. Psychologists routinely cite these and other experiments as evidence of our built-in evolutionary preference for "our own kind."

↓

Infants' more favorable responses to those who use a familiar language show that there can be _________________________________.`,
        options: "an intrinsic / prefer / in-group / tendency / members / to",
        answer: "an intrinsic tendency to prefer in-group members",
        explanation: "익숙한 언어를 사용하는 사람에게 더 호의적인 반응은 '내집단 구성원을 선호하는 본질적인 경향'이 있음을 보여준다."
      }
    ]
  },
  {
    schoolName: "당곡고등학교",
    grade: 1,
    semester: "1학기",
    exam: "중간고사",
    problems: [
      {
        number: 1,
        question: "[서술형 1] 윗글 (D)의 밑줄 친 부분에 <보기>의 영영풀이를 참고하여, 주어진 철자로 시작하는 적절한 단어를 넣어 영어 문장을 완성하시오. (반드시 feel로 시작해서 4단어로 쓸 것) [4점]",
        passage: `(D) We usually think that experts are more knowledgeable than the rest of us and perhaps they are more intelligent as well. But one thing experts do have is more experience. As they acquire more experiences, they are able to organize this new knowledge so that they can access it quickly. This type of organized expert knowledge is called chunking. Another important characteristic of expert learners is that they know how to help themselves learn. They know more strategies to help organize their learning, and they check their understanding more often. In short, they are good at self-regulation. This ability to self-regulate helps them _______ _______ _______ _______ at their studies.`,
        options: `-s___ : able to take care of yourself without needing help from others
-c___ : having the necessary ability or skills`,
        answer: "feel self-sufficient and competent",
        explanation: "self-sufficient(자립적인)와 competent(유능한)를 사용하여 4단어로 완성."
      },
      {
        number: 2,
        question: "[서술형 2] 다음 글의 밑줄 친 (A)~(E) 중 어법상 틀린 곳이 있는 것을 2개 찾아 그 기호를 쓰고, 어법에 맞게 고치시오. (단, 임의로 일부분을 생략하지 않고 반드시 밑줄 친 부분 전체를 다시 쓸 것.) [6점 - 각 3점]",
        passage: `Rejection is an everyday part of our lives, yet most people can't handle it well. For many, it's (A) <u>so painful that they'd rather not ask for something at all than ask and risk rejection</u>. Yet, as the old saying goes, if you don't ask, the answer is always no. Avoiding rejection negatively affects many aspects of your life. All of that happens only (B) <u>because you're not enough tough to handle them</u>. For this reason, consider rejection therapy. Come up with (C) <u>a request what usually results from a rejection</u>. (D) <u>Working in sales</u> is one such example. Asking for discounts at the stores will also work. By deliberately getting yourself rejected you'll grow a thicker skin that will permit you (E) <u>to take on much more in life</u>, making you more successful at dealing with unfavorable circumstances.`,
        answer: ["(B) because you're not enough tough to handle them → because you're not tough enough to handle it", "(C) a request what usually results from a rejection → a request that/which usually results in a rejection"],
        explanation: "(B) enough는 형용사 뒤에 위치, them→it. (C) what→that/which, results from→results in."
      },
      {
        number: 3,
        question: "[서술형 3] 다음 글의 밑줄 친 부분에 주어진 우리말 해석에 맞게 <보기>의 단어들을 활용하여 영어 문장을 완성하시오. (단, 반드시 <조건>을 지키시오.) [4점]",
        passage: `Noise-cancelling technology is not only used in music devices. Other fields also take advantage of this technology, such as ticket offices at tourist attractions which are often very noisy. Microphones are installed in ticket offices to detect external noise, and an opposite sound wave is generated and transmitted through a speaker, enabling the ticket agent to hear the customer's voice clearly. Another area in which this technology is used is drive-through fast-food restaurants and coffee shops. They use noise-cancelling headsets to improve communication between employees and customers by eliminating vehicle noise. These noise-cancelling headsets help drive-through employees take orders accurately. The same technology is also used for cars, whose audio systems generate waves to cancel out unpleasant sounds such as engine, wind, and road noise. Thanks to noise-cancelling devices, (운전자들이 산만한 소음들에 방해받지 않고 운전에 집중하는 것이 가능하다.)`,
        options: "noises / on / drive / to / possible / by / without / concentrate / distract / disturb",
        conditions: `1. 주어진 단어들을 모두 한 번씩 사용할 것
2. 필요하면 단어 형태를 바꾸거나 단어를 추가할 것`,
        answer: "it is possible for drivers to concentrate on driving without being disturbed/distracted by noises",
        explanation: "가주어 it + be possible for + 목적격 + to부정사 구문과 without being p.p. 구문 사용."
      },
      {
        number: 4,
        question: "[서술형 4] 다음 글의 밑줄 친 (A)~(E) 중 어법상 틀린 곳이 있는 것을 2개 찾아 그 기호를 쓰고, 어법에 맞게 고치시오. (단, 임의로 일부분을 생략하지 않고 반드시 밑줄 친 부분 전체를 다시 쓸 것.) [6점 - 각 3점]",
        passage: `(A) <u>Everything in the world around us was finished in the mind of its creator before it was started</u>. The houses we live in, the cars we drive, and our clothing—all of these began with an idea. (B) <u>Each idea was then studied, refining and perfected before the first nail drove</u>. Long before the idea was turned into a physical reality, (C) <u>the mind had pictured the finished product</u>. (D) <u>The human being designs his or her own future through much the same process</u>. We begin with an idea about how the future will be. Over a period of time we refine and perfect the vision. Before long, our every thought, decision and activity are all working in harmony (E) <u>to bringing into existence which we have mentally concluded about the future</u>.`,
        answer: ["(B) Each idea was then studied, refining and perfected before the first nail drove → Each idea was then studied, refined and perfected before the first nail was driven", "(E) to bringing into existence which we have mentally concluded about the future → to bring into existence what we have mentally concluded about the future"],
        explanation: "(B) refining→refined, drove→was driven (수동태). (E) to bringing→to bring, which→what."
      },
      {
        number: 5,
        question: "[서술형 5] 다음 글의 내용을 한 문장으로 요약하고자 한다. <보기>의 단어들을 배열하여 밑줄 친 부분을 완성하시오. (단어 형태를 바꾸지 말고 모두 한 번씩 쓸 것) [4점]",
        passage: `People commonly make the mistaken assumption that because a person has one type of characteristic, then they automatically have other characteristics which go with it. In one study, university students were given descriptions of a guest lecturer before he spoke to the group. Half the students received a description containing the word 'warm', the other half were told the speaker was 'cold.' The guest lecturer then led a discussion, after which the students were asked to give their impressions of him. As expected, there were large differences between the impressions formed by the students, depending upon their original information of the lecturer. It was also found that those students who expected the lecturer to be warm tended to interact with him more.

↓

The study shows that different expectations _________________________________.`,
        options: "affect / also / but / is formed / not / only / our behaviors / the impressions and the relationship / we form / which",
        answer: "affect not only the impressions which we form but also the relationship and our behaviors",
        explanation: "not only A but also B 구문을 사용하여 기대가 인상뿐만 아니라 관계와 행동에도 영향을 미친다는 내용."
      },
      {
        number: 6,
        question: "[서술형 6] 다음 글의 밑줄 친 부분에 주어진 우리말 해석에 맞게 <보기>의 단어들을 활용하여 빈칸 (A), (B)를 완성하시오. (단, 반드시 <조건>을 지키시오.) [6점, 각 3점]",
        passage: `When you face a severe source of stress, you may fight back, reacting immediately. While this served your ancestors well when they were attacked by a wild animal, it is less helpful today unless you are attacked physically. (A)_________________________________ technology makes it much easier to worsen a situation with a quick response. I know I have been guilty of responding too quickly to people, on email in particular, in a harsh tone that only made things worse. The more something causes your heart to race, (B)_________________________________ it is more important to take a step back before speaking or typing a single word. This will give you time to think things through and find a way to deal with the other person in a healthier manner.`,
        options: `(A) a situation / easier / it / make / much / technology / to / worsen
(B) back / important / is / it / more / step / the / to`,
        conditions: `1. 주어진 단어들을 모두 한 번씩 사용할 것
2. 필요하면 단어 형태를 바꿀 것`,
        answer: ["(A) Technology makes it much easier to worsen a situation", "(B) the more important it is to take a step back"],
        explanation: "(A) make it + 형용사 + to부정사 구문, (B) the 비교급, the 비교급 구문."
      }
    ]
  },
  {
    schoolName: "성남고등학교",
    grade: 1,
    semester: "1학기",
    exam: "중간고사",
    problems: [
      {
        number: 1,
        question: "[서답형 1] 다음 글 (A)와 의미가 같아지도록, 빈칸에 들어갈 가장 적절한 단어를 쓰시오. (괄호 안에 주어진 철자로 시작하는 한 단어를 사용하고, 어법에 맞는 형태로 쓸 것) [5점, 각 1점]",
        passage: `(A)
It would be hard to overstate how important meaningful work is to human beings — work that provides a sense of fulfillment and empowerment. Those who have found deeper meaning in their careers find their days much more energizing and satisfying, and count their employment as one of their greatest sources of joy and pride. Sonya Lyubomirsky, professor of psychology at the University of California, has conducted numerous workplace studies showing that when people are more fulfilled on the job, they not only produce higher quality work and a greater output, but also generally earn higher incomes. Those most satisfied with their work are also much more likely to be happier with their lives overall. For her book Happiness at Work, researcher Jessica Pryce-Jones conducted a study of 3,000 workers in seventy-nine countries, finding that those who took greater satisfaction from their work were 100 percent more likely to have a happier life overall.
* numerous: 수많은

↓

Meaningful work would be so essential to human beings that it cannot be emphasized enough — work that provides them (w_______) a sense of fulfillment and empowerment. Individuals who have derived a deeper sense of purpose in their professions feel much more energized and satisfied in their daily lives, (c_______) their careers a central source of pride and happiness. Multiple workplace studies (c_______) by Sonya Lyubomirsky, professor of psychology at the University of California, have shown that job fulfillment is associated not only with improved performance but also with higher earnings. Moreover, those who are happiest with their jobs are far more likely to experience greater (s_______) with their overall lives. Jessica Pryce-Jones, the author of Happiness at Work, researched 3,000 employees across seventy-nine countries, and found that those who were more satisfied with their jobs were (t_______) more likely to live happier lives overall.`,
        answer: ["(w) with", "(c) considering", "(c) conducted", "(s) satisfaction", "(t) twice"],
        explanation: "원문과 요약문을 비교하여 의미가 같아지도록 빈칸을 채움. provides→with, count→considering, has conducted→conducted, satisfied→satisfaction, 100 percent→twice."
      },
      {
        number: 2,
        question: "[서답형 2] 다음 글을 읽고, 물음에 답하시오.",
        passage: `Long ago, when the world was young, an old Native American spiritual leader Odawa had a dream on a high mountain. In his dream, Iktomi, the great spirit and searcher of wisdom, (a) <u>appeared</u> to him in the form of a spider. Iktomi spoke to him in a holy language. Iktomi told Odawa about the cycles of life. He said, "We all begin our lives as babies, move on to childhood, and then to adulthood. Finally, we come to old age, (b) <u>where</u> we must be taken care of as babies again." Iktomi also told him (c) <u>that</u> there are good and bad forces in each stage of life. "If we listen to the good forces, (d) <u>they</u> will guide us in the right direction. But if we listen to the bad forces, they will lead us the wrong way and may harm us," Iktomi said. When Iktomi finished (e) <u>to speak</u>, he spun a web and gave it to Odawa. He said to Odawa, "The web is a perfect circle with a hole in the center. Use the web to help your people (f) <u>reach</u> their goals. Make good use of their ideas, dreams, and visions. If you believe in the great spirit, the web will catch your good ideas and the bad (g) <u>ones</u> will go through the hole." Right after Odawa woke up, he went back to his village. Odawa shared Iktomi's lesson with his people. Today, many Native Americans have dream catchers (h) <u>hanging</u> above their beds. Dream catchers (A) 나쁜 꿈을 걸러준다고 믿어진다. The good dreams are captured in the web of life and carried with the people. The bad dreams pass through the hole in the web and (i) <u>is</u> no longer a part of their lives.`,
        conditions: `[2-1] 밑줄 친 (a)~(i) 중에서 어법상 틀린 것 두 개를 찾아 바르게 고치시오. [2점, 각 1점]

(1) (   )  __________ → __________
(2) (   )  __________ → __________

[2-2] 밑줄 친 (A)의 의미와 일치하도록 [보기]의 주어진 어휘를 순서대로 배열하시오. [3점] (주어진 어휘 모두 사용, 필요시 어휘 추가 및 변형 가능)

[보기]
believe / filter out / bad dreams

Dream catchers ____________________________.`,
        answer: ["[2-1] (e) to speak → speaking", "[2-1] (i) is → are", "[2-2] Dream catchers are believed to filter out bad dreams"],
        explanation: "[2-1] (e) finish는 동명사를 목적어로 취함 (to speak → speaking). (i) 주어가 The bad dreams로 복수이므로 is → are. [2-2] '나쁜 꿈을 걸러준다고 믿어진다' = are believed to filter out bad dreams."
      }
    ]
  },
  {
    schoolName: "숭의여자고등학교",
    grade: 2,
    semester: "1학기",
    exam: "중간고사",
    problems: [
      {
        number: 1,
        question: "[서답형 1(서술형)] 다음 ①~⑥의 문장에서 어법상 틀린 곳을 두 개 찾아 그 번호를 쓰고, 아래의 조건과 답안 작성 형식에 맞게 잘못된 부분을 각각 바르게 고치시오. [각 2점, 총 4점]",
        passage: `① You can choose whether to carry on a thought or to add emotion to it and this is the part of your mind that lets you down frequently because - fueled by emotions - you make the wrong decisions time and time again.
② When your judgment is clouded by emotions, this puts in biases and all kinds of other negativities that hold you back.
③ This forced business to develop closer relations with buyers and clients, which in turn made business realize that it was not enough to produce a quality product at a reasonable price.
④ Armed with scientific knowledge, people build tools and machines that transform how we live, making our lives far easier and better.
⑤ The modernization of society led to a marketing revolution that destroyed the view which production would create its own demand.
⑥ Nowadays our soil is less healthy and so do the plants grown on it.`,
        conditions: `<답안 작성 형식>
(문장 번호): (잘못된 부분) → (바르게 고친 부분)

1. 틀린 문장 안에서 어법이 틀린 부분은 한 개임.
2. 문장 번호를 안 쓰면 오답 처리함.
3. 어법이 맞는 것을 고치면 감점함.
4. 문장 전체를 쓰지 않고 번호와 함께 틀린 부분만 적어도 됨.`,
        answer: ["⑤: which → that", "⑥: do → are"],
        explanation: "⑤ the view 뒤에 동격절을 이끄는 접속사는 that이어야 함 (which ✗). ⑥ be동사(is)에 대응하는 도치이므로 do → are."
      },
      {
        number: 2,
        question: "[서답형 2(서술형)] 다음 글을 읽고, 글의 후반부에서 Matthew가 느낄 수 있는 감정을 아래의 조건과 답안 작성 형식에 맞게 우리말로 쓰시오. [2점]",
        passage: `One Saturday morning, Matthew's mother told Matthew that she was going to take him to the park. A big smile came across his face. As he loved to play outside, he ate his breakfast and got dressed quickly so they could go. When they got to the park, Matthew ran all the way over to the swing set. That was his favorite thing to do at the park. But the swings were all being used. His mother explained that he could use the slide until a swing became available, but it was broken. Suddenly, his mother got a phone call and she told Matthew they had to leave. His heart sank.`,
        conditions: `<조건>
1. 답안 작성 형식에 맞추어 제시된 주어 중 하나로 시작할 것.
2. 반드시 주어 동사를 갖춘 완전한 우리말로 쓸 것.

<답안 작성 형식>
Matthew는 / Matthew의 마음[감정]은 _____________________.`,
        answer: "Matthew는 실망감을 느꼈다. / Matthew의 마음은 실망스러웠다. / Matthew는 슬펐다.",
        explanation: "공원에서 그네도 미끄럼틀도 이용하지 못하고 갑자기 떠나야 해서 실망했다."
      },
      {
        number: 3,
        question: "[서답형 3(서술형)] 다음 글에서 화자가 겪은 문제 상황과 그에 대한 해결 방식을 주어진 단어로 시작하여, 각각 한 문장의 영어로 쓰시오. [각 2점, 총 4점]",
        passage: `Every night, I had flashbacks of my injury. I could not watch sports anymore because it was just too painful. So I shut out everything related to sports from my life. Two years passed and I was still trying to get used to my ordinary high school life without sports. Then one day, I came across an interesting university major called sports medicine. It deals with the treatment and prevention of sports injuries. A light bulb went on in my head. This was my chance to stop running away from my problems and fears. So I made up my mind and applied to this major. Today, thanks to my brave decision, I am studying to be a star on the sidelines instead of on the playing field.`,
        conditions: `(1) 문제 상황: The writer _________________________________
(2) 해결 방식: The writer _________________________________`,
        answer: ["(1) The writer could not watch sports anymore because of the painful flashbacks of the injury.", "(2) The writer decided to study sports medicine to stop running away from problems and fears."],
        explanation: "부상의 플래시백으로 스포츠를 볼 수 없었던 문제를 스포츠 의학 전공을 선택하여 해결."
      },
      {
        number: 4,
        question: "[서답형 4(서술형)] 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸에 들어갈 문장을 보기의 조건에 맞게 영어로 쓰시오. [4점]",
        passage: `For the most part, people who live or work in cities walk throughout the day — to go from the parking lot to the office, to shop, and to run errands. It's often easier and cheaper to walk a few blocks than to wait for a taxi or subway. In this way, exercise can be structured into the daily routine. This is not the case for people who live in the suburbs. Because the suburbs are spread out, it's too far to walk to the office or run to the store. Walking to the bus stop used to provide at least some movement, but now most public transportation is limited, so suburban people drive everywhere. The price they pay is limited physical movement during the day.

◆ suburb: 교외 ◆◆ run errands: 용무를 보다

↓

People in cities naturally walk throughout the day while commuting, shopping, or running errands. This routine movement makes it easier for them to include physical activity in their daily lives. In contrast, suburban residents rely heavily on cars because of long distances and limited public transportation. As a result, they ____________________________.`,
        conditions: `<조건>
1. 주어진 단어만 모두 한 번씩 사용할 것.
2. 필요시 주어진 단어를 변형할 것.

[ during / to / and / the / has / fewer / day / move / exercise / chances / lacks / physical ]`,
        answer: "have fewer chances to exercise and lack the physical move during the day",
        explanation: "주어진 단어를 모두 활용하여 교외 거주자들의 제한된 신체 활동을 표현."
      },
      {
        number: 5,
        question: "[서답형 5(서술형)] 다음 글에서 어법상 틀린 부분을 두 개 찾아 바르게 고친 후, 고친 문장 전체를 다시 쓰시오. [각 3점, 총 6점]",
        passage: `A job search is not a passive task. When you are searching, you are not browsing, nor are you "just looking". Browsing is not an effective way to reach a goal you claim to want to reach. If you are acting with purpose, if you are serious about anything you chose to do, then you need to be direct, focused and whenever possible, clever. Everyone else searches for a job has the same goal, competing for the same jobs. You must do more than the rest of the herd. Regardless of how long it may take you to find and get the job you want, be proactive will logically get you results faster than if you rely only on browsing online job boards and emailing an occasional resume. Leave those activities to the rest of the sheep.`,
        conditions: `<조건>
1. 문장 전체를 쓰지 않고 틀린 부분만 쓸 경우 감점.
2. 틀린 문장 안에서 어법이 틀린 부분은 한 개이므로 한 개만 쓰시오.

(단, 문장 전체를 쓰지 않고 틀린 부분만 쓸 경우 감점. 틀린 문장 안에서 어법이 틀린 부분은 한 개이므로 한 개만 쓰시오.)`,
        answer: ["Everyone else searches for a job has the same goal → Everyone else searching for a job has the same goal", "be proactive will logically get you results faster → being proactive will logically get you results faster"],
        explanation: "Everyone else searching (현재분사로 수식), being proactive (동명사 주어)."
      }
    ]
  },
  {
    schoolName: "영등포고등학교",
    grade: 1,
    semester: "1학기",
    exam: "중간고사",
    problems: [
      {
        number: 1,
        question: "[서답형 1] 윗글의 내용을 아래와 같이 요약할 때 빈칸 (A), (B)에 들어갈 말을 본문에서 찾아 각각 2단어 그대로 쓰시오. (6점) [어형변화 하지 말 것]",
        passage: `According to the above story, Octopuses camouflage themselves to (A) _______ by their hunters or their prey. This behavior demonstrates cognitive ability as it involves acquiring (B) _______ of the surrounding animals and applying it for survival.`,
        answer: ["(A) escape detection", "(B) detailed knowledge"],
        explanation: "문어가 사냥꾼이나 먹이에게 발각을 피하기 위해 위장하며, 이는 주변 동물에 대한 상세한 지식을 습득하는 인지 능력을 보여준다."
      },
      {
        number: 2,
        question: "[서답형 2] 윗글의 밑줄 친 우리말을 <보기>에 주어진 단어 모두를 활용하여 영작하시오. (6점) [어형변화 가능]",
        passage: `The scientists _________________________________________.`,
        options: "argue / clear evidence / discover / octopuses / of / that / the behavior / this is / tools / use / who",
        answer: "who discovered the behavior argue that this is clear evidence of octopuses using tools",
        explanation: "관계대명사 who와 동명사 구문을 사용하여 문장 완성."
      },
      {
        number: 3,
        question: "[서답형 3] 다음 글의 밑줄 친 (A), (B)가 의미하는 것을 본문에서 찾아 각각 1단어 그대로 쓰시오. (4점) [어형변화 하지 말것]",
        passage: `In 2012, scientists met at the University of Cambridge to talk about consciousness in humans and animals. Consciousness means having subjective experiences or awareness. The scientists found that animals have emotions and can have consciousness like humans. For example, African grey parrots have shown evidence of consciousness that is almost as advanced as <u>(A) that</u> of humans. Even octopuses have the brain structures needed for subjective experiences. Drugs that affect human consciousness also affect some animals in similar ways. So, the scientists concluded that consciousness is not just for humans. Animals can have it too. Since the Cambridge Declaration, research on animal consciousness has been actively carried out. Scientists are still working to find out exactly how animal consciousness works. Not all animals are conscious, but <u>(B) those</u> with complex nervous systems are more likely to be. All things considered, it would be a wise and safe choice to assume that animals have feelings and to treat them with respect and kindness.`,
        answer: ["(A) consciousness", "(B) animals"],
        explanation: "(A) that은 앞의 consciousness를 가리키고, (B) those는 앞의 animals를 가리킨다."
      },
      {
        number: 4,
        question: "[서답형 4] 다음 글을 읽고 빈칸 (A), (B) 각각에 적절한 한 단어를 본문에서 찾아 넣어 문장을 완성하시오. (4점) [어형변화 가능]",
        passage: `Our emotions are thought to exist because they have contributed to our survival as a species. Fear has helped us avoid dangers, expressing anger helps us scare off threats, and expressing positive emotions helps us bond with others. From an evolutionary perspective, an emotion is a kind of "program" that, when triggered, directs many of our activities (including attention, perception, memory, movement, expressions, etc.). For example, fear makes us very attentive, narrows our perceptual focus to threatening stimuli, will cause us either to confront a situation (fight) or avoid it (flight), and may cause us to remember an experience more acutely (so that we avoid the threat in the future). Regardless of the specific ways in which they activate our systems, the specific emotions we possess are thought to exist because they have helped us (as a species) survive challenges within our environment long ago. If they had not helped us adapt and survive, they would not have evolved with us.

↓

Emotions are believed to have evolved as survival mechanisms, (A)_______ humans to confront threats, avoid dangers, and form social bonds. If emotions had not aided human survival and (B)_______, they would not have existed through evolution.`,
        answer: ["(A) enabling", "(B) adaptation"],
        explanation: "감정은 생존 메커니즘으로 진화했으며, 인간이 위협에 맞서고 사회적 유대를 형성할 수 있게 했다."
      },
      {
        number: 5,
        question: "[서답형 5] 다음 글을 읽고 빈칸 (A), (B) 각각에 주어진 철자로 시작하는 한 단어를 넣어 문장을 완성하시오. (4점)",
        passage: `By improving accessibility of the workplace for workers that are typically at a disadvantage in the labour market, AI can improve inclusiveness in the workplace. AI-powered assistive devices to aid workers with visual, speech or hearing difficulties are becoming more widespread, improving the access to, and the quality of work for people with disabilities. For example, speech recognition solutions for people with dysarthric voices, or live captioning systems for deaf and hard of hearing people can facilitate communication with colleagues and access to jobs where inter-personal communication is necessary. AI can also enhance the capabilities of low-skilled workers, with potentially positive effects on their wages and career prospects. For example, AI's capacity to translate written and spoken word in real-time can improve the performance of non-native speakers in the workplace. Ultimately, AI presents the opportunity for p__(A)_______ a more inclusive and accessible workplace for individuals who f__(B)_______ disadvantages in the labor market.

•dysarthric (신경 장애로 인한) 구음(構音) 장애의`,
        answer: ["(A) promoting / providing", "(B) face / facing"],
        explanation: "AI가 노동 시장에서 불이익을 겪는 개인들을 위해 더 포용적이고 접근 가능한 직장을 촉진/제공할 기회를 제시한다."
      },
      {
        number: 6,
        question: "[서답형 6] 다음 글을 읽고 빈칸 (A), (B), (C) 각각에 적절한 한 단어를 넣어 글을 완성하시오. (6점)",
        passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, enabling us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. Companies large and small have off-loaded work onto the backs of consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.

↓

The promise of a computerized society was to (A)_______ repetitive tasks to machines, giving humans more leisure time and opportunities to pursue higher purposes. However, the (B)_______ has happened—many companies have transferred tasks onto consumers instead. For example, at McDonald's, customers use self-service kiosks to select, order, and (C)_______ for their meals—tasks once handled by store staffs.`,
        answer: ["(A) pass / delegate", "(B) opposite / reverse", "(C) pay"],
        explanation: "컴퓨터화된 사회의 약속은 반복적인 작업을 기계에 넘기는 것이었지만, 반대 상황이 일어났고, 고객이 직접 선택, 주문, 결제를 한다."
      }
    ]
  }
];

export const SCHOOL_PROBLEMS_PER_PAGE = 2;
