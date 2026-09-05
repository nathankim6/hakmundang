// 지문 기반 독해 문제집 데이터 (수능 영어 서술형 대비)
// 파일: 1_수정본.docx ~ 5_수정본.docx

export interface ReadingProblem {
  number: number;
  type: 'arrangement' | 'summary-abc' | 'summary-single' | 'fill-blank' | 'topic-sentence';
  question: string;
  passage: string;  // 각 문제마다 개별 지문
  options?: string;  // 보기 단어들
  conditions?: string;  // 조건
  answer: string | string[];
  explanation?: string;
}

export interface ReadingUnit {
  number: number;
  title: string;
  problems: ReadingProblem[];
}

export interface ReadingWorkbook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  units: ReadingUnit[];
}

// Unit 1 지문
const unit1Passage = `Generalization without specific examples that humanize writing is boring to the listener and to the reader. Who wants to read platitudes all day? Who wants to hear the words great, greater, best, smartest, finest, humanitarian, on and on and on without specific examples? Instead of using these 'nothing words,' leave them out completely and just describe the particulars. There is nothing worse than reading a scene in a novel in which a main character is described up front as heroic or brave or tragic or funny, while thereafter, the writer quickly moves on to something else. That's no good, no good at all. You have to use less one word descriptions and more detailed, engaging descriptions if you want to make something real.`;

// Unit 2 지문
const unit2Passage = `One dynamic that can change dramatically in sport is the concept of the home-field advantage, in which perceived demands and resources seem to play a role. Under normal circumstances, the home ground would appear to provide greater perceived resources (fans, home field, and so on). However, researchers Roy Baumeister and Andrew Steinhilber were among the first to point out that these competitive factors can change; for example, the success percentage for home teams in the final games of a playoff or World Series seems to drop. Fans can become part of the perceived demands rather than resources under those circumstances. This change in perception can also explain why a team that's struggling at the start of the year will often welcome a road trip to reduce perceived demands and pressures.`;

// Unit 3 지문
const unit3Passage = `We are connected to the night sky in many ways. It has always inspired people to wonder and to imagine. Since the dawn of civilization, our ancestors created myths and told legendary stories about the night sky. Elements of those narratives became embedded in the social and cultural identities of many generations. On a practical level, the night sky helped past generations to keep track of time and create calendars ― essential to developing societies as aids to farming and seasonal gathering. For many centuries, it also provided a useful navigation tool, vital for commerce and for exploring new worlds. Even in modern times, many people in remote areas of the planet observe the night sky for such practical purposes.`;

// Unit 4 지문
const unit4Passage = `Rejection is an everyday part of our lives, yet most people can't handle it well. For many, it's so painful that they'd rather not ask for something at all than ask and risk rejection. Yet, as the old saying goes, if you don't ask, the answer is always no. Avoiding rejection negatively affects many aspects of your life. All of that happens only because you're not tough enough to handle it. For this reason, consider rejection therapy. Come up with a request or an activity that usually results in a rejection. Working in sales is one such example. Asking for discounts at the stores will also work. By deliberately getting yourself rejected you'll grow a thicker skin that will allow you to take on much more in life, thus making you more successful at dealing with unfavorable circumstances.`;

// Unit 5 지문
const unit5Passage = `With the Internet, everything changed. Product problems, overpromises, the lack of customer support, differential pricing ― all of the issues that customers actually experienced from a marketing organization suddenly popped out of the box. No longer were there any controlled communications or even business systems. Consumers could generally learn through the Web whatever they wanted to know about a company, its products, its competitors, its distribution systems, and, most of all, its truthfulness when talking about its products and services. Just as important, the Internet opened up a forum for customers to compare products, experiences, and values with other customers easily and quickly. Now the customer had a way to talk back to the marketer and to do so through public forums instantly.`;

// 독해 문제집 1 - 수능 영어 서술형 대비
export const readingWorkbook1: ReadingWorkbook = {
  id: 'reading-workbook-1',
  title: 'ORUN WRITING',
  subtitle: '독해 지문 기반 서답형',
  description: '수능 영어 지문을 활용한 배열, 요약, 빈칸 완성 연습',
  units: [
    {
      number: 1,
      title: 'Generalization and Specific Examples',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `Generalization without specific examples that humanize writing is boring to the listener and to the reader. Who wants to read platitudes all day? Who wants to hear the words great, greater, best, smartest, finest, humanitarian, on and on and on without specific examples? Instead of using these 'nothing words,' leave them out completely and just describe the particulars. There is nothing worse than reading a scene in a novel in which a main character is described up front as heroic or brave or tragic or funny, while thereafter, the writer quickly moves on to something else. That's no good, no good at all. (A) [당신이 무언가를 실제적으로 만들고 싶다면 한 단어 묘사는 덜 사용하고 더 상세하고 매력적인 묘사를 더 많이 사용해야 한다.]`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'detailed / use / descriptions / want / You / to / less / something / make / real / one / if / engaging / have / more / word / you / and / to / descriptions',
          answer: 'You have to use less one word descriptions and more detailed, engaging descriptions if you want to make something real.',
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: unit1Passage,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]
Effective writing requires avoiding vague (A)__________ and 'nothing words' in favor of specific examples and detailed descriptions that (B)__________ the content and make it more (C)__________ to readers.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['generalization', 'humanize', 'engaging'],
          explanation: `(A) generalization: 원문에서 "Generalization without specific examples that humanize writing is boring"이라고 명시되어 있으며, 피해야 할 글쓰기 방식의 핵심 문제점을 나타낸다.
(B) humanize: 원문에서 "specific examples that humanize writing"이라고 언급되어 있으며, 구체적인 예시가 글쓰기에 미치는 긍정적 효과를 설명한다.
(C) engaging: 원문에서 "more detailed, engaging descriptions"라고 명시되어 있으며, 효과적인 글쓰기가 달성해야 할 목표를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: unit1Passage,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]
Good writing requires (A) _________________________________.`,
          options: 'examples / specific / rather / vague / and / than / details / generalizations',
          answer: 'specific details and examples rather than vague generalizations',
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `Generalization without specific examples that humanize writing is boring to the listener and to the reader. Who wants to read platitudes all day? Who wants to hear the words great, greater, best, smartest, finest, humanitarian, on and on and on without specific examples? Instead of using these 'nothing words,' leave them out completely and just describe the particulars. There is nothing worse than reading a scene in a novel in which a main character is described up front as heroic or brave or tragic or funny, while thereafter, the writer quickly moves on to something else. That's no good, no good at all. ____________________ if you want to make something real.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `12단어로 빈칸을 완성하시오.
다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'descriptions / You / more / have / to / engaging / use / less / detailed / and / one word / descriptions',
          answer: 'You have to use less one word descriptions and more detailed engaging descriptions',
          explanation: `주어진 단어를 모두 사용하여 문맥에 맞게 배열해야 한다. 원문의 "You have to use less one word descriptions and more detailed, engaging descriptions"를 참고한다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: unit1Passage,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: Writers / rather / than / should / descriptive / words / use / examples / specific / general`,
          options: 'Writers / rather / than / should / descriptive / words / use / examples / specific / general',
          answer: 'Writers should use specific descriptive examples rather than general words.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. 본문의 핵심은 '일반적인 단어보다 구체적이고 상세한 묘사를 사용해야 한다'는 것이므로, 이를 반영한 문장을 구성한다.`,
        },
      ],
    },
    {
      number: 2,
      title: 'Home-Field Advantage in Sports',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `One dynamic that can change dramatically in sport is the concept of the home-field advantage, in which perceived demands and resources seem to play a role. Under normal circumstances, the home ground would appear to provide greater perceived resources (fans, home field, and so on). However, researchers Roy Baumeister and Andrew Steinhilber were among the first to point out that these competitive factors can change; for example, the success percentage for home teams in the final games of a playoff or World Series seems to drop. (A) [팬들은 그러한 상황에서 자원이 아닌 인지된 요구의 일부가 될 수 있다.] This change in perception can also explain why a team that's struggling at the start of the year will often welcome a road trip to reduce perceived demands and pressures.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'become / circumstances / under / rather / can / those / Fans / of / than / perceived / part / resources / the / demands',
          answer: 'Fans can become part of the perceived demands rather than resources under those circumstances.',
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: unit2Passage,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]
The home-field advantage in sports can change dramatically because (A)__________ can shift from being perceived resources to perceived (B)__________, which explains why home teams' success rates drop in final games and why (C)__________ teams often welcome road trips.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['fans', 'demands', 'struggling'],
          explanation: `(A) fans: 원문에서 "Fans can become part of the perceived demands rather than resources"라고 명시되어 있으며, 홈 어드밴티지 변화의 핵심 요소를 나타낸다.
(B) demands: 원문에서 "Fans can become part of the perceived demands rather than resources"라고 언급되어 있으며, 팬들이 변화하는 역할을 보여준다.
(C) struggling: 원문에서 "a team that's struggling at the start of the year will often welcome a road trip"라고 명시되어 있으며, 원정 경기를 환영하는 팀의 상황을 설명한다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: unit2Passage,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>
In sports, (A) _________________________________ depending on the situation and pressure levels.

<보기>`,
          options: 'resources / perceived / demands / can / home-field / and / advantage / change',
          answer: 'home-field advantage can change perceived demands and resources',
          explanation: `주어진 8개의 단어(resources / perceived / demands / can / home-field / and / advantage / change)를 모두 사용하여 문맥에 맞는 문장을 완성한다. 본문의 핵심 내용인 '홈필드 어드밴티지가 인지된 요구와 자원을 변화시킬 수 있다'는 의미를 담는다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `One dynamic that can change dramatically in sport is the concept of the home-field advantage, in which perceived demands and resources seem to play a role. Under normal circumstances, the home ground would appear to provide greater perceived resources (fans, home field, and so on). However, researchers Roy Baumeister and Andrew Steinhilber were among the first to point out that these competitive factors can change; for example, the success percentage for home teams in the final games of a playoff or World Series seems to drop. ______________________ under those circumstances. This change in perception can also explain why a team that's struggling at the start of the year will often welcome a road trip to reduce perceived demands and pressures.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'Fans / can / become / part / of / the / perceived / demands / rather / than / resources',
          answer: 'Fans can become part of the perceived demands rather than resources',
          explanation: `주어진 11개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 원문에서 "Fans can become part of the perceived demands rather than resources under those circumstances"라고 되어 있으며, 빈칸 뒤에 이미 "under those circumstances"가 있으므로 앞부분만 완성한다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: unit2Passage,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: can / advantage / change / specific / circumstances / Home-field / dramatically / on / the / depending`,
          options: 'can / advantage / change / specific / circumstances / Home-field / dramatically / on / the / depending',
          answer: 'Home-field advantage can change dramatically depending on the specific circumstances.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. 본문의 핵심은 '홈필드 어드밴티지가 특정 상황에 따라 극적으로 변할 수 있다'는 것이다.`,
        },
      ],
    },
    {
      number: 3,
      title: 'Night Sky and Human Civilization',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `We are connected to the night sky in many ways. It has always inspired people to wonder and to imagine. Since the dawn of civilization, our ancestors created myths and told legendary stories about the night sky. (A) [그러한 이야기들의 요소들은 여러 세대의 사회적, 문화적 정체성에 내재되었다.] On a practical level, the night sky helped past generations to keep track of time and create calendars ― essential to developing societies as aids to farming and seasonal gathering. For many centuries, it also provided a useful navigation tool, vital for commerce and for exploring new worlds. Even in modern times, many people in remote areas of the planet observe the night sky for such practical purposes.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'embedded / of / the / and / narratives / became / in / many / cultural / those / social / Elements / identities / generations / of',
          answer: 'Elements of those narratives became embedded in the social and cultural identities of many generations.',
          explanation: `주어(Elements of those narratives) + 동사(became) + 보어(embedded) + 전치사구(in the social and cultural identities of many generations)의 구조로 배열한다. 'become embedded in ~'은 '~에 내재되다'라는 의미이다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: unit3Passage,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]
The night sky has served humanity by inspiring cultural (A)__________ and providing practical tools for tracking time, creating (B)__________, and offering (C)__________ for commerce and exploration throughout history.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['identities', 'calendars', 'navigation'],
          explanation: `(A) identities: 원문에서 "Elements of those narratives became embedded in the social and cultural identities of many generations"라고 명시되어 있으며, 밤하늘이 문화적으로 미친 영향의 핵심을 나타낸다.
(B) calendars: 원문에서 "the night sky helped past generations to keep track of time and create calendars"라고 언급되어 있으며, 밤하늘의 실용적 기능 중 하나를 보여준다.
(C) navigation: 원문에서 "it also provided a useful navigation tool, vital for commerce and for exploring new worlds"라고 명시되어 있으며, 밤하늘의 중요한 실용적 역할을 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: unit3Passage,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]
The night sky has served humanity (A)________________________________.

[보기]`,
          options: 'practical / and / purposes / both / for / cultural',
          answer: 'for both cultural and practical purposes',
          explanation: `주어진 6개의 단어(practical / and / purposes / both / for / cultural)를 모두 사용하여 문맥에 맞는 문장을 완성한다. 'for both A and B' 구문을 활용하여 밤하늘이 문화적 목적과 실용적 목적 모두를 위해 인류에게 봉사해왔다는 의미를 담는다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `We are connected to the night sky in many ways. It has always inspired people to wonder and to imagine. Since the dawn of civilization, our ancestors created myths and told legendary stories about the night sky. Elements of those narratives became embedded in the social and cultural identities of many generations. On a practical level, ____________________ and create calendars ― essential to developing societies as aids to farming and seasonal gathering. For many centuries, it also provided a useful navigation tool, vital for commerce and for exploring new worlds. Even in modern times, many people in remote areas of the planet observe the night sky for such practical purposes.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'the / night / sky / helped / past / generations / to / keep / track / of / time',
          answer: 'the night sky helped past generations to keep track of time',
          explanation: `주어진 11개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 원문에서 "the night sky helped past generations to keep track of time and create calendars"라고 되어 있으며, 빈칸 뒤에 이미 "and create calendars"가 있으므로 앞부분만 완성한다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: unit3Passage,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: night / served / sky / cultural / purposes / The / has / and / practical / both`,
          options: 'night / served / sky / cultural / purposes / The / has / and / practical / both',
          answer: 'The night sky has served both cultural and practical purposes.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. 본문의 핵심은 '밤하늘이 문화적, 실용적 목적 모두를 위해 인류에게 봉사해왔다'는 것이다.`,
        },
      ],
    },
    {
      number: 4,
      title: 'Rejection Therapy',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `Rejection is an everyday part of our lives, yet most people can't handle it well. For many, it's so painful that they'd rather not ask for something at all than ask and risk rejection. Yet, as the old saying goes, if you don't ask, the answer is always no. (A) [거부를 피하는 것은 당신의 삶의 많은 측면에 부정적으로 영향을 미친다.] All of that happens only because you're not tough enough to handle it. For this reason, consider rejection therapy. Come up with a request or an activity that usually results in a rejection. Working in sales is one such example. Asking for discounts at the stores will also work. (B) [의도적으로 자신이 거부당하게 함으로써 당신은 더 두꺼운 피부를 기를 것이고, 그것은 당신이 인생에서 훨씬 더 많은 것을 감당할 수 있게 해줄 것이다.] thus making you more successful at dealing with unfavorable circumstances.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.

(B)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: `(A) many / negatively / rejection / your / life / affects / of / Avoiding / aspects

(B) yourself / that / much / deliberately / rejected / By / allow / will / more / getting / you'll / grow / a / thicker / skin / to / take / on / in / life / you`,
          answer: ['(A) Avoiding rejection negatively affects many aspects of your life.', "(B) By deliberately getting yourself rejected you'll grow a thicker skin that will allow you to take on much more in life,"],
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: unit4Passage,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]
While most people avoid (A)__________ because it's painful, deliberately practicing rejection (B)__________ helps you develop thicker skin and become more (C)__________ at handling difficult situations in life.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['rejection', 'therapy', 'successful'],
          explanation: `(A) rejection: 원문에서 "they'd rather not ask for something at all than ask and risk rejection"이라고 명시되어 있으며, 사람들이 피하려는 핵심 대상을 나타낸다.
(B) therapy: 원문에서 "consider rejection therapy"라고 언급되어 있으며, 거부감을 극복하기 위한 구체적인 방법론을 의미한다.
(C) successful: 원문에서 "making you more successful at dealing with unfavorable circumstances"라고 명시되어 있으며, 거부 요법을 통해 얻을 수 있는 최종적인 결과를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: unit4Passage,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]
Since most people avoid rejection due to fear, (A) _________________________ to build resilience and achieve greater success.

[보기]`,
          options: 'therapy / rejection / deliberately / experiencing / can / help / you',
          answer: 'deliberately experiencing rejection therapy can help you',
          explanation: `주어진 7개의 단어(therapy / rejection / deliberately / experiencing / can / help / you)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '의도적으로 거부 치료를 경험하는 것이 당신을 도울 수 있다'는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `Rejection is an everyday part of our lives, yet most people can't handle it well. For many, it's so painful that they'd rather not ask for something at all than ask and risk rejection. Yet, as the old saying goes, if you don't ask, the answer is always no. Avoiding rejection negatively affects many aspects of your life. All of that happens only because you're not tough enough to handle it. For this reason, consider rejection therapy. Come up with a request or an activity that usually results in a rejection. Working in sales is one such example. Asking for discounts at the stores will also work. ______________________ you'll grow a thicker skin that will allow you to take on much more in life, thus making you more successful at dealing with unfavorable circumstances.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `5단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'By / deliberately / getting / yourself / rejected',
          answer: 'By deliberately getting yourself rejected',
          explanation: `주어진 5개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 'By + 동명사' 구문으로 '~함으로써'라는 의미를 나타내며, 빈칸 뒤의 "you'll grow a thicker skin..."과 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: unit4Passage,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오.
보기: help / build / people / to / rejection / resistance / Practicing / rejection / can / therapy / handle`,
          options: 'help / build / people / to / rejection / resistance / Practicing / rejection / can / therapy / handle',
          answer: 'Practicing rejection therapy can help people build resistance to handle rejection.',
          explanation: `주어진 11개의 단어(rejection이 2번 포함)를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '거부 치료를 연습하는 것이 사람들이 거부를 다루는 저항력을 기르는 데 도움이 될 수 있다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 5,
      title: 'Internet and Customer Power',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `With the Internet, everything changed. Product problems, overpromises, the lack of customer support, differential pricing ― all of the issues that customers actually experienced from a marketing organization suddenly popped out of the box. No longer were there any controlled communications or even business systems. Consumers could generally learn through the Web whatever they wanted to know about a company, its products, its competitors, its distribution systems, and, most of all, its truthfulness when talking about its products and services. Just as important, the Internet opened up a forum for customers to compare products, experiences, and values with other customers easily and quickly. (A) [이제 고객은 마케터에게 반박할 방법을 갖게 되었고, 공개 포럼을 통해 즉시 그렇게 할 수 있게 되었다.]`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'forums / customer / to / the / had / through / way / talk / marketer / public / a / do / back / and / so / Now / instantly / the / to / to',
          answer: 'Now the customer had a way to talk back to the marketer and to do so through public forums instantly.',
          explanation: `부사(Now) + 주어(the customer) + 동사(had) + 목적어(a way to talk back to the marketer) + 등위접속(and to do so through public forums instantly)의 구조이다. 'talk back to ~'는 '~에게 반박하다'라는 의미이다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: unit5Passage,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]
The Internet eliminated companies' (A)__________ communications by allowing consumers to access information about businesses and providing public (B)__________ where customers can (C)__________ products and talk back to marketers instantly.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['controlled', 'forums', 'compare'],
          explanation: `(A) controlled: 원문에서 "No longer were there any controlled communications"라고 명시되어 있으며, 인터넷이 제거한 기업의 기존 커뮤니케이션 방식을 나타낸다.
(B) forums: 원문에서 "the Internet opened up a forum for customers"와 "through public forums instantly"라고 언급되어 있으며, 인터넷이 제공한 새로운 소통 공간을 의미한다.
(C) compare: 원문에서 "customers to compare products, experiences, and values with other customers"라고 명시되어 있으며, 고객들이 인터넷을 통해 할 수 있게 된 핵심 활동을 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: unit5Passage,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]
The Internet transformed marketing by (A) _________________________________.

[보기]`,
          options: 'giving / customers / transparency / control / and',
          answer: 'giving customers transparency and control',
          explanation: `주어진 5개의 단어를 모두 사용하여 문맥에 맞는 문장을 완성한다. 인터넷이 고객에게 투명성과 통제력을 부여했다는 의미를 담는다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `With the Internet, everything changed. Product problems, overpromises, the lack of customer support, differential pricing ― all of the issues that customers actually experienced from a marketing organization suddenly popped out of the box. No longer were there any controlled communications or even business systems. Consumers could generally learn through the Web whatever they wanted to know about a company, its products, its competitors, its distribution systems, and, most of all, its truthfulness when talking about its products and services. Just as important, the Internet opened up a forum for customers to compare products, experiences, and values with other customers easily and quickly. Now ____________________ and to do so through public forums instantly.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'the / customer / had / a / way / to / talk / back / to / the / marketer',
          answer: 'the customer had a way to talk back to the marketer',
          explanation: `주어진 11개의 단어(the, to 각각 2번 포함)를 모두 사용하여 원문의 문장을 재구성한다. 빈칸 뒤의 "and to do so through public forums instantly"와 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: unit5Passage,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: Internet / gave / customers / control / over / marketing / information / The / and / communication`,
          options: 'Internet / gave / customers / control / over / marketing / information / The / and / communication',
          answer: 'The Internet gave customers control over marketing information and communication.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '인터넷이 고객에게 마케팅 정보와 커뮤니케이션에 대한 통제력을 부여했다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 6,
      title: 'Head to Heart Journey',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `(A) [우리가 하게 될 가장 긴 여행은 우리의 머리와 마음 사이의 18인치이다.] If we take this journey, it can shorten our misery in the world. Impatience, judgment, frustration, and anger reside in our heads. When we live in that place too long, it makes us unhappy. But when we take the journey from our heads to our hearts, something shifts inside. What if we were able to love everything that gets in our way? What if we tried loving the shopper who unknowingly steps in front of us in line, the driver who cuts us off in traffic, the swimmer who splashes us with water during a belly dive, or the reader who pens a bad online review of our writing? Every person who makes us miserable is like us ― a human being, most likely doing the best they can, deeply loved by their parents, a child, or a friend. And how many times have we unknowingly stepped in front of someone in line? Cut someone off in traffic? Splashed someone in a pool? Or made a negative statement about something we've read? (B) [우리가 만나는 모든 사람 안에 우리의 일부가 존재한다는 것을 기억하는 것이 도움이 된다.]`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.

(B)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: `(A) journey / will / our / eighteen / we / head / longest / make / The / between / heart / is / and / the / inches

(B) helps / every / we / meet / that / piece / person / remember / a / It / to / resides / us / of / in`,
          answer: ['(A) The longest journey we will make is the eighteen inches between our head and heart.', '(B) It helps to remember that a piece of us resides in every person we meet.'],
          explanation: `(A) 주어(The longest journey we will make) + 동사(is) + 보어(the eighteen inches between our head and heart)의 구조이다. 관계절 'we will make'가 주어를 수식한다.

(B) 가주어(It) + 동사(helps) + 진주어(to remember that ~)의 구조이다. that절 내에서 'a piece of us'가 주어, 'resides'가 동사이다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `The longest journey we will make is the eighteen inches between our head and heart. If we take this journey, it can shorten our misery in the world. Impatience, judgment, frustration, and anger reside in our heads. When we live in that place too long, it makes us unhappy. But when we take the journey from our heads to our hearts, something shifts inside. What if we were able to love everything that gets in our way? What if we tried loving the shopper who unknowingly steps in front of us in line, the driver who cuts us off in traffic, the swimmer who splashes us with water during a belly dive, or the reader who pens a bad online review of our writing? Every person who makes us miserable is like us ― a human being, most likely doing the best they can, deeply loved by their parents, a child, or a friend. And how many times have we unknowingly stepped in front of someone in line? Cut someone off in traffic? Splashed someone in a pool? Or made a negative statement about something we've read? It helps to remember that a piece of us resides in every person we meet.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

Taking the (A)__________ from our head to heart can reduce misery by learning to (B)__________ those who annoy us, recognizing that they are (C)__________ beings like ourselves who make similar mistakes.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['journey', 'love', 'human'],
          explanation: `(A) journey: 원문에서 "The longest journey we will make is the eighteen inches between our head and heart"라고 명시되어 있으며, 글 전체의 핵심 개념을 나타낸다.
(B) love: 원문에서 "What if we were able to love everything that gets in our way?"라고 언급되어 있으며, 타인을 대하는 새로운 방식의 핵심을 보여준다.
(C) human: 원문에서 "Every person who makes us miserable is like us ― a human being"이라고 명시되어 있으며, 타인을 이해하는 관점의 기초가 되는 중요한 개념이다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `The longest journey we will make is the eighteen inches between our head and heart. If we take this journey, it can shorten our misery in the world. Impatience, judgment, frustration, and anger reside in our heads. When we live in that place too long, it makes us unhappy. But when we take the journey from our heads to our hearts, something shifts inside. What if we were able to love everything that gets in our way? What if we tried loving the shopper who unknowingly steps in front of us in line, the driver who cuts us off in traffic, the swimmer who splashes us with water during a belly dive, or the reader who pens a bad online review of our writing? Every person who makes us miserable is like us ― a human being, most likely doing the best they can, deeply loved by their parents, a child, or a friend. And how many times have we unknowingly stepped in front of someone in line? Cut someone off in traffic? Splashed someone in a pool? Or made a negative statement about something we've read? It helps to remember that a piece of us resides in every person we meet.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>

Moving from thinking with our heads to feeling with our hearts allows us to (A)_________________________________.

<보기>`,
          options: 'love / and / who / understand / people / us / annoy',
          answer: 'love and understand people who annoy us',
          explanation: `주어진 7개의 단어(love / and / who / understand / people / us / annoy)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '우리를 짜증나게 하는 사람들을 사랑하고 이해하다'라는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `The longest journey we will make is the eighteen inches between our head and heart. If we take this journey, it can shorten our misery in the world. Impatience, judgment, frustration, and anger reside in our heads. When we live in that place too long, it makes us unhappy. But when we take the journey from our heads to our hearts, something shifts inside. What if we were able to love everything that gets in our way? What if we tried loving the shopper who unknowingly steps in front of us in line, the driver who cuts us off in traffic, the swimmer who splashes us with water during a belly dive, or the reader who pens a bad online review of our writing? Every person who makes us miserable is like us ― a human being, most likely doing the best they can, deeply loved by their parents, a child, or a friend. And how many times have we unknowingly stepped in front of someone in line? Cut someone off in traffic? Splashed someone in a pool? Or made a negative statement about something we've read? ______________________.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `15단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'It / helps / to / remember / that / a / piece / of / us / resides / in / every / person / we / meet',
          answer: 'It helps to remember that a piece of us resides in every person we meet',
          explanation: `주어진 15개의 단어를 모두 사용하여 원문의 마지막 문장을 재구성한다. 가주어-진주어 구문으로 '우리가 만나는 모든 사람 안에 우리의 일부가 존재한다는 것을 기억하는 것이 도움이 된다'는 의미이다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `The longest journey we will make is the eighteen inches between our head and heart. If we take this journey, it can shorten our misery in the world. Impatience, judgment, frustration, and anger reside in our heads. When we live in that place too long, it makes us unhappy. But when we take the journey from our heads to our hearts, something shifts inside. What if we were able to love everything that gets in our way? What if we tried loving the shopper who unknowingly steps in front of us in line, the driver who cuts us off in traffic, the swimmer who splashes us with water during a belly dive, or the reader who pens a bad online review of our writing? Every person who makes us miserable is like us ― a human being, most likely doing the best they can, deeply loved by their parents, a child, or a friend. And how many times have we unknowingly stepped in front of someone in line? Cut someone off in traffic? Splashed someone in a pool? Or made a negative statement about something we've read? It helps to remember that a piece of us resides in every person we meet.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오.
보기: from / happiness / understanding / head / heart / to / our / bring / Moving / can / and`,
          options: 'from / happiness / understanding / head / heart / to / our / bring / Moving / can / and',
          answer: 'Moving from our head to heart can bring happiness and understanding.',
          explanation: `주어진 11개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '우리의 머리에서 마음으로 이동하는 것이 행복과 이해를 가져다 줄 수 있다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 7,
      title: 'Transportation and Human Progress',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `There is nothing more fundamental to the human spirit than the need to be mobile. It is the intuitive force that sparks our imaginations and opens pathways to life-changing opportunities. It is the catalyst for progress and personal freedom. Public transportation has been vital to that progress and freedom for more than two centuries. (A) [교통 산업은 항상 여행자들을 한 목적지에서 다른 목적지로 운반하는 것 이상의 일을 해왔다.] It connects people, places, and possibilities. It provides access to what people need, what they love, and what they aspire to become. In so doing, it grows communities, creates jobs, strengthens the economy, expands social and commercial networks, saves time and energy, and helps millions of people achieve a better life.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'more / from / industry / one / to / done / always / carry / has / travelers / The / destination / transportation / another / than',
          answer: 'The transportation industry has always done more than carry travelers from one destination to another.',
          explanation: `주어(The transportation industry) + 동사(has done) + 부사(always) + 비교구문(more than carry travelers from one destination to another)의 구조이다. 'do more than + 동사원형'은 '~하는 것 이상을 하다'라는 의미이다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `There is nothing more fundamental to the human spirit than the need to be mobile. It is the intuitive force that sparks our imaginations and opens pathways to life-changing opportunities. It is the catalyst for progress and personal freedom. Public transportation has been vital to that progress and freedom for more than two centuries. The transportation industry has always done more than carry travelers from one destination to another. It connects people, places, and possibilities. It provides access to what people need, what they love, and what they aspire to become. In so doing, it grows communities, creates jobs, strengthens the economy, expands social and commercial networks, saves time and energy, and helps millions of people achieve a better life.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

Human (A)__________ is fundamental to the spirit, and public transportation serves as more than just carrying people by (B)__________ communities and possibilities while helping millions achieve better (C)__________.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['mobility', 'connecting', 'life'],
          explanation: `(A) mobility: 원문에서 "the need to be mobile"이라고 명시되어 있으며, 인간 정신의 가장 근본적인 욕구를 나타낸다.
(B) connecting: 원문에서 "It connects people, places, and possibilities"라고 언급되어 있으며, 대중교통이 수행하는 핵심 기능을 보여준다.
(C) life: 원문에서 "helps millions of people achieve a better life"라고 명시되어 있으며, 대중교통이 궁극적으로 달성하고자 하는 목표를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `There is nothing more fundamental to the human spirit than the need to be mobile. It is the intuitive force that sparks our imaginations and opens pathways to life-changing opportunities. It is the catalyst for progress and personal freedom. Public transportation has been vital to that progress and freedom for more than two centuries. The transportation industry has always done more than carry travelers from one destination to another. It connects people, places, and possibilities. It provides access to what people need, what they love, and what they aspire to become. In so doing, it grows communities, creates jobs, strengthens the economy, expands social and commercial networks, saves time and energy, and helps millions of people achieve a better life.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]

Public transportation is essential because (A) __________________________________.

[보기]`,
          options: 'communities / it / connects / and / people / opportunities / and / creates',
          answer: 'it connects people and communities and creates opportunities',
          explanation: `주어진 7개의 단어(communities / it / connects / and / people / opportunities / creates)를 모두 사용하여 문맥에 맞는 문장을 완성한다. 대중교통이 사람들과 지역사회를 연결하고 기회를 창출한다는 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `There is nothing more fundamental to the human spirit than the need to be mobile. It is the intuitive force that sparks our imaginations and opens pathways to life-changing opportunities. It is the catalyst for progress and personal freedom. Public transportation has been vital to that progress and freedom for more than two centuries. The transportation industry has always done more than carry travelers from one destination to another. It connects people, places, and possibilities. It provides access to what people need, what they love, and what they aspire to become. In so doing, ______________________, expands social and commercial networks, saves time and energy, and helps millions of people achieve a better life.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `8단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'it / grows / communities / creates / jobs / strengthens / the / economy',
          answer: 'it grows communities creates jobs strengthens the economy',
          explanation: `주어진 8개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 병렬 구조로 대중교통이 지역사회를 성장시키고, 일자리를 창출하고, 경제를 강화한다는 내용을 담고 있다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `There is nothing more fundamental to the human spirit than the need to be mobile. It is the intuitive force that sparks our imaginations and opens pathways to life-changing opportunities. It is the catalyst for progress and personal freedom. Public transportation has been vital to that progress and freedom for more than two centuries. The transportation industry has always done more than carry travelers from one destination to another. It connects people, places, and possibilities. It provides access to what people need, what they love, and what they aspire to become. In so doing, it grows communities, creates jobs, strengthens the economy, expands social and commercial networks, saves time and energy, and helps millions of people achieve a better life.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: social / Public / connects / and / enables / people / transportation / and / progress / communities`,
          options: 'social / Public / connects / and / enables / people / transportation / and / progress / communities',
          answer: 'Public transportation connects people and communities and enables social progress.',
          explanation: `주어진 10개의 단어(and 2번 포함)를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '대중교통이 사람들과 지역사회를 연결하고 사회적 진보를 가능하게 한다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 8,
      title: 'Sustainable Growth Strategy',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `Back in 1996, an American airline was faced with an interesting problem. At a time when most other airlines were losing money or going under, over 100 cities were begging the company to service their locations. However, that's not the interesting part. What's interesting is that the company turned down over 95 percent of those offers and began serving only four new locations. (A) [회사 경영진이 성장의 상한선을 설정했기 때문에 회사는 엄청난 성장을 거절했다.] Sure, its executives wanted to grow each year, but they didn't want to grow too much. Unlike other famous companies, they wanted to set their own pace, one that could be sustained in the long term. By doing this, they established a safety margin for growth that helped them continue to thrive at a time when the other airlines were flailing.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'set / leadership / for / an / It / turned / growth / company / down / because / had / upper / limit / tremendous / growth',
          answer: 'It turned down tremendous growth because company leadership had set an upper limit for growth.',
          explanation: `주어(It) + 동사(turned down) + 목적어(tremendous growth) + 이유절(because company leadership had set an upper limit for growth)의 구조이다. 'turn down'은 '거절하다'라는 의미이며, 과거완료 'had set'은 주절의 행위보다 먼저 일어난 일을 나타낸다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `Back in 1996, an American airline was faced with an interesting problem. At a time when most other airlines were losing money or going under, over 100 cities were begging the company to service their locations. However, that's not the interesting part. What's interesting is that the company turned down over 95 percent of those offers and began serving only four new locations. It turned down tremendous growth because company leadership had set an upper limit for growth. Sure, its executives wanted to grow each year, but they didn't want to grow too much. Unlike other famous companies, they wanted to set their own pace, one that could be sustained in the long term. By doing this, they established a safety margin for growth that helped them continue to thrive at a time when the other airlines were flailing.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

In 1996, an American airline deliberately rejected most expansion opportunities by setting an upper (A)__________ for growth, choosing to maintain a sustainable (B)__________ rather than pursuing rapid expansion, which helped them (C)__________ while other airlines struggled.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['limit', 'pace', 'thrive'],
          explanation: `(A) limit: 원문에서 "company leadership had set an upper limit for growth"라고 명시되어 있으며, 이 항공사가 성장을 제한한 핵심 전략을 나타낸다.
(B) pace: 원문에서 "they wanted to set their own pace, one that could be sustained in the long term"이라고 언급되어 있으며, 지속가능한 성장을 위한 회사의 접근 방식을 보여준다.
(C) thrive: 원문에서 "helped them continue to thrive at a time when the other airlines were flailing"라고 명시되어 있으며, 신중한 성장 전략의 긍정적 결과를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `Back in 1996, an American airline was faced with an interesting problem. At a time when most other airlines were losing money or going under, over 100 cities were begging the company to service their locations. However, that's not the interesting part. What's interesting is that the company turned down over 95 percent of those offers and began serving only four new locations. It turned down tremendous growth because company leadership had set an upper limit for growth. Sure, its executives wanted to grow each year, but they didn't want to grow too much. Unlike other famous companies, they wanted to set their own pace, one that could be sustained in the long term. By doing this, they established a safety margin for growth that helped them continue to thrive at a time when the other airlines were flailing.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>

An American airline succeeded by (A) _________________________ while other airlines were struggling.

<보기>`,
          options: 'growth / limiting / their / to / ensure / sustainable / development',
          answer: 'limiting their growth to ensure sustainable development',
          explanation: `주어진 7개의 단어(growth / limiting / their / to / ensure / sustainable / development)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '지속 가능한 발전을 보장하기 위해 성장을 제한함으로써'라는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `Back in 1996, an American airline was faced with an interesting problem. At a time when most other airlines were losing money or going under, over 100 cities were begging the company to service their locations. However, that's not the interesting part. What's interesting is that the company turned down over 95 percent of those offers and began serving only four new locations. It turned down tremendous growth because company leadership had set an upper limit for growth. Sure, its executives wanted to grow each year, but they didn't want to grow too much. Unlike other famous companies, they wanted to set their own pace, one that could be sustained in the long term. ______________________ that helped them continue to thrive at a time when the other airlines were flailing.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'By / doing / this / they / established / a / safety / margin / for / growth',
          answer: 'By doing this they established a safety margin for growth',
          explanation: `주어진 10개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 'By doing this'는 '이렇게 함으로써'라는 의미이며, 빈칸 뒤의 "that helped them continue to thrive..."와 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `Back in 1996, an American airline was faced with an interesting problem. At a time when most other airlines were losing money or going under, over 100 cities were begging the company to service their locations. However, that's not the interesting part. What's interesting is that the company turned down over 95 percent of those offers and began serving only four new locations. It turned down tremendous growth because company leadership had set an upper limit for growth. Sure, its executives wanted to grow each year, but they didn't want to grow too much. Unlike other famous companies, they wanted to set their own pace, one that could be sustained in the long term. By doing this, they established a safety margin for growth that helped them continue to thrive at a time when the other airlines were flailing.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: strategies / long-term / success / The / chose / growth / for / limited / airline / sustainable`,
          options: 'strategies / long-term / success / The / chose / growth / for / limited / airline / sustainable',
          answer: 'The airline chose limited growth strategies for sustainable long-term success.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '그 항공사는 지속 가능한 장기적 성공을 위해 제한된 성장 전략을 선택했다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 9,
      title: 'Computerized Society and Consumer Burden',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. (A) [크고 작은 회사들은 소비자들의 등에 일을 떠넘겨왔다.] Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'large / backs / and / onto / off-loaded / the / work / Companies / have / small / of / consumers',
          answer: 'Companies large and small have off-loaded work onto the backs of consumers.',
          explanation: `주어(Companies large and small) + 동사(have off-loaded) + 목적어(work) + 전치사구(onto the backs of consumers)의 구조이다. 'off-load A onto B'는 'A를 B에게 떠넘기다'라는 의미이다. 'large and small'은 'Companies'를 후위 수식한다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. Companies large and small have off-loaded work onto the backs of consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

While the computerized society promised to give machines repetitive work and provide humans with more (A)__________, companies have instead (B)__________ work onto consumers, making them do tasks that were previously performed by (C)__________.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['leisure time', 'off-loaded', 'employees'],
          explanation: `(A) leisure time: 원문에서 "allowing us humans to pursue higher purposes and to have more leisure time"이라고 명시되어 있으며, 컴퓨터화된 사회가 약속했던 핵심 혜택을 나타낸다.
(B) off-loaded: 원문에서 "Companies large and small have off-loaded work onto the backs of consumers"라고 언급되어 있으며, 기업들이 실제로 취한 행동을 보여준다.
(C) employees: 원문에서 "jobs that used to be done by airline employees or travel agents"라고 명시되어 있으며, 과거에 이러한 업무를 담당했던 주체를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. Companies large and small have off-loaded work onto the backs of consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[요약문]

Contrary to expectations, computerization has not reduced our workload but instead (A)__________________________.

[보기]`,
          options: 'consumers / to / work / transferred / has / it',
          answer: 'it has transferred work to consumers',
          explanation: `주어진 6개의 단어(consumers / to / work / transferred / has / it)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '그것(컴퓨터화)이 일을 소비자에게 전가했다'는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. ______________________ consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'Companies / large / and / small / have / off-loaded / work / onto / the / backs / of',
          answer: 'Companies large and small have off-loaded work onto the backs of',
          explanation: `주어진 11개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 빈칸 뒤의 "consumers"와 연결되어 '크고 작은 회사들이 소비자들의 등에 일을 떠넘겼다'는 완전한 문장을 이룬다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `The promise of a computerized society, we were told, was that it would pass to machines all of the repetitive drudgery of work, allowing us humans to pursue higher purposes and to have more leisure time. It didn't work out this way. Instead of more time, most of us have less. Companies large and small have off-loaded work onto the backs of consumers. Things that used to be done for us, as part of the value-added service of working with a company, we are now expected to do ourselves. With air travel, we're now expected to complete our own reservations and check-in, jobs that used to be done by airline employees or travel agents. At the grocery store, we're expected to bag our own groceries and, in some supermarkets, to scan our own purchases.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `8단어로 빈칸을 완성하시오.
보기: Companies / have / transferred / work / to / consumers / from / employees`,
          options: 'Companies / have / transferred / work / to / consumers / from / employees',
          answer: 'Companies have transferred work from employees to consumers.',
          explanation: `주어진 8개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '회사들이 직원들로부터 소비자에게 일을 전가했다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 10,
      title: 'Excellence and Credibility',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `Individuals who perform at a high level in their profession often have instant credibility with others. People admire them, they want to be like them, and they feel connected to them. When they speak, others listen ― even if the area of their skill has nothing to do with the advice they give. Think about a world-famous basketball player. He has made more money from endorsements than he ever did playing basketball. Is it because of his knowledge of the products he endorses? No. It's because of what he can do with a basketball. The same can be said of an Olympic medalist swimmer. People listen to him because of what he can do in the pool. And when an actor tells us we should drive a certain car, we don't listen because of his expertise on engines. We listen because we admire his talent.

(A) [뛰어남은 사람들을 연결시킨다.]

(B) [만약 당신이 어떤 분야에서 높은 수준의 능력을 가지고 있다면, 다른 사람들이 그것 때문에 당신과 연결되기를 원할 수도 있다.]`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.

(B)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: `(A) connects / Excellence / people

(B) level / you / to / others / If / may / connect / it / with / desire / of / high / ability / in / an / area / a / possess / because / you / of`,
          answer: ['(A) Excellence connects people.', '(B) If you possess a high level of ability in an area, others may desire to connect with you because of it.'],
          explanation: `(A) 주어(Excellence) + 동사(connects) + 목적어(people)의 간결한 SVO 구조이다.

(B) 조건절(If you possess a high level of ability in an area) + 주절(others may desire to connect with you because of it)의 구조이다. 'desire to + 동사원형'은 '~하기를 원하다'라는 의미이다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `Individuals who perform at a high level in their profession often have instant credibility with others. People admire them, they want to be like them, and they feel connected to them. When they speak, others listen ― even if the area of their skill has nothing to do with the advice they give. Think about a world-famous basketball player. He has made more money from endorsements than he ever did playing basketball. Is it because of his knowledge of the products he endorses? No. It's because of what he can do with a basketball. The same can be said of an Olympic medalist swimmer. People listen to him because of what he can do in the pool. And when an actor tells us we should drive a certain car, we don't listen because of his expertise on engines. We listen because we admire his talent. Excellence connects. If you possess a high level of ability in an area, others may desire to connect with you because of it.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

High-level performers gain instant (A)__________ with others who (B)__________ them, making people listen to their advice even when their (C)__________ has nothing to do with what they're endorsing.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['credibility', 'admire', 'skill'],
          explanation: `(A) credibility: 원문에서 "Individuals who perform at a high level in their profession often have instant credibility with others"라고 명시되어 있으며, 뛰어난 성과를 내는 사람들이 얻는 핵심 이점을 나타낸다.
(B) admire: 원문에서 "People admire them"이라고 언급되어 있으며, 사람들이 고성과자에 대해 느끼는 감정을 보여준다.
(C) skill: 원문에서 "even if the area of their skill has nothing to do with the advice they give"라고 명시되어 있으며, 그들의 조언과 무관할 수 있는 영역을 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `Individuals who perform at a high level in their profession often have instant credibility with others. People admire them, they want to be like them, and they feel connected to them. When they speak, others listen ― even if the area of their skill has nothing to do with the advice they give. Think about a world-famous basketball player. He has made more money from endorsements than he ever did playing basketball. Is it because of his knowledge of the products he endorses? No. It's because of what he can do with a basketball. The same can be said of an Olympic medalist swimmer. People listen to him because of what he can do in the pool. And when an actor tells us we should drive a certain car, we don't listen because of his expertise on engines. We listen because we admire his talent. Excellence connects. If you possess a high level of ability in an area, others may desire to connect with you because of it.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>

People with exceptional professional skills gain credibility and influence because (A)__________________________.

<보기>`,
          options: 'connects / and / excellence / others / attracts / people',
          answer: 'excellence connects people and attracts others',
          explanation: `주어진 6개의 단어(connects / and / excellence / others / attracts / people)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '뛰어남이 사람들을 연결하고 다른 사람들을 끌어들인다'는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `Individuals who perform at a high level in their profession often have instant credibility with others. People admire them, they want to be like them, and they feel connected to them. When they speak, others listen ― even if the area of their skill has nothing to do with the advice they give. Think about a world-famous basketball player. He has made more money from endorsements than he ever did playing basketball. Is it because of his knowledge of the products he endorses? No. It's because of what he can do with a basketball. The same can be said of an Olympic medalist swimmer. People listen to him because of what he can do in the pool. And when an actor tells us we should drive a certain car, we don't listen because of his expertise on engines. We listen because we admire his talent. Excellence connects. ________________________, others may desire to connect with you because of it.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `11단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'If / you / possess / a / high / level / of / ability / in / an / area',
          answer: 'If you possess a high level of ability in an area',
          explanation: `주어진 11개의 단어를 모두 사용하여 원문의 문장을 재구성한다. 조건절로 '만약 당신이 어떤 분야에서 높은 수준의 능력을 가지고 있다면'이라는 의미이며, 빈칸 뒤의 주절과 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `Individuals who perform at a high level in their profession often have instant credibility with others. People admire them, they want to be like them, and they feel connected to them. When they speak, others listen ― even if the area of their skill has nothing to do with the advice they give. Think about a world-famous basketball player. He has made more money from endorsements than he ever did playing basketball. Is it because of his knowledge of the products he endorses? No. It's because of what he can do with a basketball. The same can be said of an Olympic medalist swimmer. People listen to him because of what he can do in the pool. And when an actor tells us we should drive a certain car, we don't listen because of his expertise on engines. We listen because we admire his talent. Excellence connects. If you possess a high level of ability in an area, others may desire to connect with you because of it.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `9단어로 빈칸을 완성하시오.
보기: in / credibility / areas / influence / unrelated / excellence / creates / and / Professional`,
          options: 'in / credibility / areas / influence / unrelated / excellence / creates / and / Professional',
          answer: 'Professional excellence creates credibility and influence in unrelated areas.',
          explanation: `주어진 9개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '전문적인 뛰어남이 관련 없는 분야에서도 신뢰성과 영향력을 만들어낸다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 11,
      title: 'Brain as a City',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `Think of the brain as a city. If you were to look out over a city and ask "where is the economy located?" you'd see there's no good answer to the question. Instead, the economy emerges from the interaction of all the elements ― from the stores and the banks to the merchants and the customers. And so it is with the brain's operation: it doesn't happen in one spot. Just as in a city, no neighborhood of the brain operates in isolation. In brains and in cities, everything emerges from the interaction between residents, at all scales, locally and distantly. (A) [마치 기차가 재료와 직물을 도시로 가져와서 그것들이 경제로 가공되는 것처럼, 감각 기관으로부터의 원시 전기화학적 신호들이 뉴런들의 고속도로를 따라 운반된다.] There the signals undergo processing and transformation into our conscious reality.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: 'electrochemical / superhighways / trains / which / Just / and / along / the / processed / as / bring / become / raw / economy / transported / neurons / textiles / materials / so / signals / from / into / of / city / sensory / organs / are / a / the',
          answer: 'Just as trains bring materials and textiles into a city, which become processed into the economy, so the raw electrochemical signals from sensory organs are transported along superhighways of neurons.',
          explanation: `'Just as A, so B' 구문으로 '마치 A인 것처럼, B도 그렇다'라는 의미의 비교 구문이다. 관계대명사 which가 앞 절 전체를 선행사로 받아 '그것들이 경제로 가공되는'이라는 의미를 추가한다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `Think of the brain as a city. If you were to look out over a city and ask "where is the economy located?" you'd see there's no good answer to the question. Instead, the economy emerges from the interaction of all the elements ― from the stores and the banks to the merchants and the customers. And so it is with the brain's operation: it doesn't happen in one spot. Just as in a city, no neighborhood of the brain operates in isolation. In brains and in cities, everything emerges from the interaction between residents, at all scales, locally and distantly. Just as trains bring materials and textiles into a city, which become processed into the economy, so the raw electrochemical signals from sensory organs are transported along superhighways of neurons. There the signals undergo processing and transformation into our conscious reality.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

The brain operates like a (A)__________ where no single area works in isolation, but everything emerges from the (B)__________ of various elements, with signals being processed and transformed into our conscious (C)__________.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['city', 'interaction', 'reality'],
          explanation: `(A) city: 원문에서 "Think of the brain as a city"라고 명시되어 있으며, 뇌의 작동 방식을 설명하는 핵심 비유이다.
(B) interaction: 원문에서 "the economy emerges from the interaction of all the elements"와 "everything emerges from the interaction between residents"라고 언급되어 있으며, 뇌와 도시 모두에서 기능이 발생하는 중요한 과정을 나타낸다.
(C) reality: 원문에서 "transformation into our conscious reality"라고 명시되어 있으며, 뇌에서 신호 처리의 최종 결과를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `Think of the brain as a city. If you were to look out over a city and ask "where is the economy located?" you'd see there's no good answer to the question. Instead, the economy emerges from the interaction of all the elements ― from the stores and the banks to the merchants and the customers. And so it is with the brain's operation: it doesn't happen in one spot. Just as in a city, no neighborhood of the brain operates in isolation. In brains and in cities, everything emerges from the interaction between residents, at all scales, locally and distantly. Just as trains bring materials and textiles into a city, which become processed into the economy, so the raw electrochemical signals from sensory organs are transported along superhighways of neurons. There the signals undergo processing and transformation into our conscious reality.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>

Both the brain and a city function through (A)__________________________.

<보기>`,
          options: 'interactions / all / of / elements / the / complex',
          answer: 'complex interactions of all the elements',
          explanation: `주어진 6개의 단어(interactions / all / of / elements / the / complex)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '모든 요소들의 복잡한 상호작용'이라는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `Think of the brain as a city. If you were to look out over a city and ask "where is the economy located?" you'd see there's no good answer to the question. Instead, the economy emerges from the interaction of all the elements ― from the stores and the banks to the merchants and the customers. And so it is with the brain's operation: it doesn't happen in one spot. Just as in a city, no neighborhood of the brain operates in isolation. In brains and in cities, everything emerges from the interaction between residents, at all scales, locally and distantly. Just as trains bring materials and textiles into a city, which become processed into the economy, so the raw electrochemical signals from sensory organs are transported along superhighways of neurons. There ______________________ into our conscious reality.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `6단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'the / signals / undergo / processing / and / transformation',
          answer: 'the signals undergo processing and transformation',
          explanation: `주어진 6개의 단어를 모두 사용하여 원문의 문장을 재구성한다. '신호들이 처리와 변환을 겪는다'라는 의미이며, 빈칸 뒤의 "into our conscious reality"와 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `Think of the brain as a city. If you were to look out over a city and ask "where is the economy located?" you'd see there's no good answer to the question. Instead, the economy emerges from the interaction of all the elements ― from the stores and the banks to the merchants and the customers. And so it is with the brain's operation: it doesn't happen in one spot. Just as in a city, no neighborhood of the brain operates in isolation. In brains and in cities, everything emerges from the interaction between residents, at all scales, locally and distantly. Just as trains bring materials and textiles into a city, which become processed into the economy, so the raw electrochemical signals from sensory organs are transported along superhighways of neurons. There the signals undergo processing and transformation into our conscious reality.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `10단어로 빈칸을 완성하시오.
보기: from / cities / like / operations / Brain / through / function / parts / different / interaction`,
          options: 'from / cities / like / operations / Brain / through / function / parts / different / interaction',
          answer: 'Brain operations function like cities through interaction from different parts.',
          explanation: `주어진 10개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '뇌의 작동은 다른 부분들로부터의 상호작용을 통해 도시처럼 기능한다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
    {
      number: 12,
      title: 'Curiosity and Brain Development',
      problems: [
        {
          number: 1,
          type: 'arrangement',
          passage: `According to educational psychologist Susan Engel, curiosity begins to decrease as young as four years old. By the time we are adults, we have fewer questions and more default settings. As Henry James put it, "Disinterested curiosity is past, the mental grooves and channels set." The decline in curiosity can be traced in the development of the brain through childhood. Though smaller than the adult brain, the infant brain contains millions more neural connections. The wiring, however, is a mess; the lines of communication between infant neurons are far less efficient than between those in the adult brain.

(A) [아기의 세상에 대한 지각은 결과적으로 매우 풍부하면서도 극도로 무질서하다.]

(B) [그 신념들을 가능하게 하는 신경 경로들은 더 빠르고 더 자동적이 된다], while the ones that the child doesn't use regularly are pruned away.`,
          question: `1. [서답형] 다음 글을 읽고, 물음에 답하시오.

(A)를 어법에 맞게 주어진 단어를 배열하시오.

(B)를 어법에 맞게 주어진 단어를 배열하시오.`,
          options: `(A) world / rich / disordered / both / baby's / wildly / The / perception / consequently / of / intensely / the / and / is

(B) automatic / faster / The / pathways / become / beliefs / and / enable / that / more / those / neural`,
          answer: ["(A) The baby's perception of the world is consequently both intensely rich and wildly disordered.", '(B) The neural pathways that enable those beliefs become faster and more automatic.'],
          explanation: `(A) 주어(The baby's perception of the world) + 동사(is) + 부사(consequently) + 보어(both intensely rich and wildly disordered)의 구조이다. 'both A and B' 구문이 사용되었다.

(B) 주어(The neural pathways that enable those beliefs) + 동사(become) + 보어(faster and more automatic)의 구조이다. 관계대명사 that이 주어를 수식한다.`,
        },
        {
          number: 2,
          type: 'summary-abc',
          passage: `According to educational psychologist Susan Engel, curiosity begins to decrease as young as four years old. By the time we are adults, we have fewer questions and more default settings. As Henry James put it, "Disinterested curiosity is past, the mental grooves and channels set." The decline in curiosity can be traced in the development of the brain through childhood. Though smaller than the adult brain, the infant brain contains millions more neural connections. The wiring, however, is a mess; the lines of communication between infant neurons are far less efficient than between those in the adult brain. The baby's perception of the world is consequently both intensely rich and wildly disordered. As children absorb more evidence from the world around them, certain possibilities become much more likely and more useful and harden into knowledge or beliefs. The neural pathways that enable those beliefs become faster and more automatic, while the ones that the child doesn't use regularly are pruned away.`,
          question: `2. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[요약문]

While infant brains have millions more neural (A)__________ creating rich but disordered perception, the decline in curiosity occurs as children develop and their neural pathways become more (B)__________ through pruning unused connections, ultimately hardening useful possibilities into fixed (C)__________.

(A) ________________________

(B) ________________________

(C) ________________________`,
          answer: ['connections', 'automatic', 'beliefs'],
          explanation: `(A) connections: 원문에서 "the infant brain contains millions more neural connections"라고 명시되어 있으며, 유아 뇌의 핵심 특징을 나타낸다.
(B) automatic: 원문에서 "The neural pathways that enable those beliefs become faster and more automatic"이라고 언급되어 있으며, 뇌 발달 과정에서 일어나는 변화를 보여준다.
(C) beliefs: 원문에서 "harden into knowledge or beliefs"라고 명시되어 있으며, 호기심 감소의 결과로 형성되는 고정된 사고를 나타낸다.`,
        },
        {
          number: 3,
          type: 'summary-single',
          passage: `According to educational psychologist Susan Engel, curiosity begins to decrease as young as four years old. By the time we are adults, we have fewer questions and more default settings. As Henry James put it, "Disinterested curiosity is past, the mental grooves and channels set." The decline in curiosity can be traced in the development of the brain through childhood. Though smaller than the adult brain, the infant brain contains millions more neural connections. The wiring, however, is a mess; the lines of communication between infant neurons are far less efficient than between those in the adult brain. The baby's perception of the world is consequently both intensely rich and wildly disordered. As children absorb more evidence from the world around them, certain possibilities become much more likely and more useful and harden into knowledge or beliefs. The neural pathways that enable those beliefs become faster and more automatic, while the ones that the child doesn't use regularly are pruned away.`,
          question: `3. 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

<요약문>

As children grow up, (A)__________________________.

<보기>`,
          options: 'pathways / efficient / but / neural / become / more / less / flexible',
          answer: 'neural pathways become more efficient but less flexible',
          explanation: `주어진 8개의 단어(pathways / efficient / but / neural / become / more / less / flexible)를 모두 사용하여 문맥에 맞는 문장을 완성한다. '신경 경로가 더 효율적이지만 덜 유연해진다'는 의미로 본문의 핵심 내용을 담고 있다.`,
        },
        {
          number: 4,
          type: 'fill-blank',
          passage: `According to educational psychologist Susan Engel, curiosity begins to decrease as young as four years old. By the time we are adults, we have fewer questions and more default settings. As Henry James put it, "Disinterested curiosity is past, the mental grooves and channels set." The decline in curiosity can be traced in the development of the brain through childhood. Though smaller than the adult brain, the infant brain contains millions more neural connections. The wiring, however, is a mess; the lines of communication between infant neurons are far less efficient than between those in the adult brain. The baby's perception of the world is consequently both intensely rich and wildly disordered. As children absorb more evidence from the world around them, certain possibilities become much more likely and more useful and harden into knowledge or beliefs. ______________________ become faster and more automatic, while the ones that the child doesn't use regularly are pruned away.`,
          question: `4. 다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.`,
          conditions: `7단어로 빈칸을 완성하시오. 다음 단어를 한 번씩 사용하여 배열하시오.`,
          options: 'The / neural / pathways / that / enable / those / beliefs',
          answer: 'The neural pathways that enable those beliefs',
          explanation: `주어진 7개의 단어를 모두 사용하여 원문의 문장을 재구성한다. '그 신념들을 가능하게 하는 신경 경로들'이라는 의미의 주어부이며, 빈칸 뒤의 "become faster and more automatic"과 자연스럽게 연결된다.`,
        },
        {
          number: 5,
          type: 'topic-sentence',
          passage: `According to educational psychologist Susan Engel, curiosity begins to decrease as young as four years old. By the time we are adults, we have fewer questions and more default settings. As Henry James put it, "Disinterested curiosity is past, the mental grooves and channels set." The decline in curiosity can be traced in the development of the brain through childhood. Though smaller than the adult brain, the infant brain contains millions more neural connections. The wiring, however, is a mess; the lines of communication between infant neurons are far less efficient than between those in the adult brain. The baby's perception of the world is consequently both intensely rich and wildly disordered. As children absorb more evidence from the world around them, certain possibilities become much more likely and more useful and harden into knowledge or beliefs. The neural pathways that enable those beliefs become faster and more automatic, while the ones that the child doesn't use regularly are pruned away.`,
          question: `5. 다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.`,
          conditions: `9단어로 빈칸을 완성하시오.
보기: curiosity / decreases / Human / brain / as / develops / the / with / age`,
          options: 'curiosity / decreases / Human / brain / as / develops / the / with / age',
          answer: 'Human curiosity decreases with age as the brain develops.',
          explanation: `주어진 9개의 단어를 모두 사용하여 본문의 주제를 담은 문장을 만든다. '인간의 호기심은 뇌가 발달함에 따라 나이가 들면서 감소한다'는 본문의 핵심 메시지를 담고 있다.`,
        },
      ],
    },
  ],
};

export const readingWorkbooks: ReadingWorkbook[] = [readingWorkbook1];
