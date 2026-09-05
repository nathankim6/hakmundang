import type { RCQuestion, WeeklyRCData } from '@/types/readingComprehension';

/**
 * 고1 ORUN WEEKLY 독해문제 데이터
 * PDF 파일에서 추출한 문제 데이터를 여기에 입력합니다.
 * 
 * 각 주차별 8문제 (전반부 4 + 후반부 4)
 * 총 20주 × 8문제 = 160문제
 */

// 샘플 데이터 (Week 1 - 실제 데이터로 교체 예정)
const sampleQuestion: RCQuestion = {
  id: 1,
  year: '2013년 3월 34번',
  errorRate: '57.5%',
  questionType: '다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.',
  passage: `People think identical twins are exactly alike in every way: they look alike, they dress in matching clothes, and they share the same likes and dislikes. Parents of identical twins, however, know differently. In fact, identical twins are __________ individuals. For example, my own children have always shown about a twenty-five percent difference in their weight. Also, they don't act alike either. One likes to dance; the other likes to play basketball. Certainly, we encourage them to pursue their individual interests, but they decide to do these activities all on their own.`,
  choices: [
    { label: '①', text: 'active', percentage: '22.6%' },
    { label: '②', text: 'paired', percentage: '10.7%' },
    { label: '③', text: 'unique', percentage: '46.2%' },
    { label: '④', text: 'talented', percentage: '11.0%' },
    { label: '⑤', text: 'thoughtful', percentage: '5.2%' },
  ],
  answer: '③',
  translation: '사람들은 일란성 쌍둥이는 모든 면에서 정확히 똑같다고 생각한다. 그들은 똑같이 생겼고, 똑같은 옷을 입고, 좋아하고 싫어하는 것도 같다. 그러나 일란성 쌍둥이의 부모들은 다르게 알고 있다. 사실, 일란성 쌍둥이는 구별되는 개인이다. 예를 들면, 나의 아이들은 체중에 있어서 항상 25퍼센트 정도의 차이를 보여 왔다. 또한, 그들은 서로 비슷하게 행동하지도 않는다. 한 명은 춤추기를 좋아하고, 또 다른 한 명은 농구하는 것을 좋아한다. 확실히, 우리는 그들이 개별적인 흥미를 추구하도록 장려하지만, 그들은 이러한 활동을 하는 것을 완전히 그들 스스로 결정한다.',
  explanation: '일란성 쌍둥이는 모든 면에서 같다고 생각하지만 사실은 구별되는(unique) 개인이라는 내용의 글이다.',
  vocabulary: [
    { english: 'matching', korean: '조화되는; 매칭' },
    { english: 'thoughtful', korean: '사려 깊은' },
    { english: 'identical twins', korean: '일란성 쌍둥이' },
    { english: 'paired', korean: '둘씩 짝지어진' },
    { english: 'unique', korean: '구별되는' },
    { english: 'pursue', korean: '추구하다' },
    { english: 'on their own', korean: '그들 스스로' },
  ],
};

// 모든 문제 배열 (PDF에서 추출 후 채움)
export const allRCQuestions: RCQuestion[] = [
  sampleQuestion,
  // ... 나머지 문제 추가 예정
];

/**
 * 주차별 독해문제 분배
 * 160문제를 20주에 8문제씩 배분
 */
export function distributeRCWeekly(questions: RCQuestion[]): WeeklyRCData[] {
  const weeks: WeeklyRCData[] = [];
  
  for (let w = 0; w < 20; w++) {
    const start = w * 8;
    const weekQuestions = questions.slice(start, start + 8);
    
    weeks.push({
      weekNumber: w + 1,
      firstHalf: weekQuestions.slice(0, 4),
      secondHalf: weekQuestions.slice(4, 8),
    });
  }
  
  return weeks;
}
