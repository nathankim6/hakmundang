import { A4Page } from "./A4Page";

interface AppendixExamPageProps {
  pageNumber: number;
  totalPages: number;
  pageIndex: number;
}

// 단어를 첫 글자 + _______ 로 변환하는 함수
function maskWord(text: string): string {
  // 괄호, 슬래시, 기호 등은 유지하고 영단어만 마스킹
  return text.replace(/[a-zA-Z]{2,}/g, (word) => {
    return word[0] + '_______';
  });
}

// 동사 문형 데이터 (원본과 동일)
const verbPatternData = {
  title: "주요동사 문형정리",
  subtitle: "by SJ T",
  sections: [{
    title: "1형식 동사",
    description: "주어-동사만으로 문장이 성립. 수동태 불가",
    items: [
      { verb: "rise", meaning: "오르다, 생겨나다" },
      { verb: "emerge", meaning: "나타나다" },
      { verb: "grow", meaning: "자라다, 커지다" },
      { verb: "disappear", meaning: "사라지다" },
      { verb: "occur = take place = happen = arise", meaning: "발생하다" },
      { verb: "belong to", meaning: "속하다" },
      { verb: "consist of (= be made up of)", meaning: "구성되다" },
      { verb: "consist with", meaning: "~와 일치하다" },
      { verb: "result from", meaning: "~로부터 생겨나다" },
      { verb: "result in", meaning: "~의 결과가 되다" },
    ]
  }, {
    title: "특별한 의미로 사용되는 1형식 동사",
    items: [
      { verb: "do", meaning: "충분하다, 좋다" },
      { verb: "count", meaning: "중요하다" },
      { verb: "matter", meaning: "문제가 되다, 중요하다" },
      { verb: "pay", meaning: "이익이 되다" },
      { verb: "work", meaning: "작동하다, 효과가 있다" },
    ]
  }, {
    title: "2형식 동사",
    description: "주어를 설명하는 보어를 취함. 주로 형용사",
    items: [
      { verb: "remain, stay, keep, lie, hold, rest + 형용사", meaning: "~한 상태로 남다" },
      { verb: "감각동사 look, sound, smell, taste, feel + 형용사", meaning: "~하게 보이다" },
      { verb: "become, grow, get, turn, run, go, fall + 형용사", meaning: "~하게 되다" },
      { verb: "appear, seem, prove, turn out + 형용사/to V", meaning: "~인 것처럼 보이다" },
    ]
  }]
};

const verbPatternDataPage2 = {
  sections: [{
    title: "3형식 동사",
    description: "동사 다음 반드시 명사 목적어를 취하는 동사, 전치사 불가",
    items: [
      { verb: "reach", meaning: "~에 다다르다" },
      { verb: "accompany", meaning: "~와 동행하다" },
      { verb: "approach", meaning: "~에 다가가다" },
      { verb: "discuss", meaning: "~와 토론하다" },
      { verb: "attend", meaning: "~에 참석하다" },
      { verb: "mention", meaning: "~를 언급하다" },
      { verb: "obey", meaning: "~에 복종하다" },
      { verb: "explain", meaning: "~를 설명하다" },
      { verb: "address", meaning: "~에게 연설하다" },
      { verb: "consider", meaning: "~를 고려하다" },
      { verb: "oppose", meaning: "~에 반대하다" },
      { verb: "survive", meaning: "~에서 살아남다" },
      { verb: "answer", meaning: "~에 대답하다" },
      { verb: "leave", meaning: "~를 떠나다" },
      { verb: "contact", meaning: "~와 접촉하다" },
      { verb: "await", meaning: "~를 기다리다" },
      { verb: "marry", meaning: "~와 결혼하다" },
      { verb: "enter", meaning: "~에 들어가다" },
      { verb: "inhabit", meaning: "~에 살다" },
      { verb: "face / influence / affect", meaning: "~를 직면하다 / ~에 영향을 끼치다" },
    ]
  }, {
    title: "4형식으로 쓸 수 없는 동사",
    items: [
      { verb: "mention A to B", meaning: "B에게 A를 말하다" },
      { verb: "explain A to B", meaning: "B에게 A를 설명하다" },
      { verb: "describe A to B", meaning: "B에게 A를 설명하다" },
      { verb: "introduce A to B", meaning: "B에게 A를 소개하다" },
      { verb: "announce A to B", meaning: "B에게 A를 알리다" },
      { verb: "say / suggest / propose A to B", meaning: "B에게 A를 말하다/제안하다" },
    ]
  }]
};

const verbPatternDataPage3 = {
  sections: [{
    title: "4형식동사 → 3형식 전환시 사용하는 전치사",
    items: [
      { verb: "to: give, tell, send, show, lend, offer, teach, bring, pay, promise, owe, pass, hand, award, sell, grant, write", meaning: "" },
      { verb: "for: buy, make, get, find, cook, choose, order, secure, win", meaning: "" },
      { verb: "of: ask, require, inquire, beg, demand", meaning: "" },
    ]
  }, {
    title: "반드시 4형식으로만 쓰는 동사",
    items: [
      { verb: "spare A B", meaning: "A에게서 B를 면제해주다" },
      { verb: "pardon A B", meaning: "A에게 B를 용서해주다" },
      { verb: "envy A B", meaning: "A에게 B를 질투하다" },
      { verb: "cost A B", meaning: "A에게 B의 비용이 들게하다" },
      { verb: "save A B", meaning: "A에게 B를 덜어주다" },
      { verb: "take A B", meaning: "A에게 B(시간/노력)를 취하다" },
      { verb: "forgive A B", meaning: "A에게 B를 용서하다" },
    ]
  }, {
    title: "'말하다'류 동사 정리",
    items: [
      { verb: "tell + 명사 / tell A about B / tell A B / tell + 목적어 + to V", meaning: "~에게 ~를 말하다" },
      { verb: "say + (that절 또는 '대사') / say + 명사", meaning: "~라고 말하다" },
      { verb: "speak (1형식) / speak on·about / speak + (언어)명사", meaning: "말하다, ~에 대해 말하다" },
      { verb: "talk (1형식) / talk to·about·with", meaning: "말걸다, ~에 대해 말하다" },
    ]
  }, {
    title: "목적보어 앞에 to부정사를 취하는 5형식 동사",
    items: [
      { verb: "find + O + (to be) 형용사", meaning: "~가 ~라고 생각하다" },
      { verb: "feel / consider + O + (to be) 형용사", meaning: "~가 ~라고 느끼다/여기다" },
      { verb: "suppose / believe + O + to be 형용사", meaning: "~를 ~라고 생각하다" },
      { verb: "know / think + O + to be 형용사", meaning: "~가 ~임을 알다/생각하다" },
    ]
  }]
};

const verbPatternDataPage4 = {
  sections: [{
    title: "목적보어 앞에 as를 취하는 5형식 동사",
    items: [
      { verb: "think of A as B / look upon A as B", meaning: "A가 B라고 생각하다/바라보다" },
      { verb: "regard A as B / view A as B", meaning: "A가 B라고 간주하다/바라보다" },
      { verb: "describe A as B / define A as B", meaning: "A를 B라고 기술하다/정의하다" },
    ]
  }, {
    title: "as와 to be가 둘 다 오는 5형식 동사",
    items: [
      { verb: "consider A as B / consider + O + to V", meaning: "A를 B라고 생각하다" },
      { verb: "imagine A as B / imagine + O + to V", meaning: "A를 B라고 상상하다" },
      { verb: "appoint / elect / choose A as B", meaning: "A를 B로 임명/선출/선택하다" },
    ]
  }, {
    title: "명사 목적보어를 취하는 5형식 동사",
    items: [
      { verb: "call A B / name A B / make A B", meaning: "A를 B라고 부르다/명명하다/만들다" },
    ]
  }, {
    title: "목적보어에 to부정사가 오는 5형식 동사",
    items: [
      { verb: "advise / allow / cause / encourage + O + to V", meaning: "조언/허락/야기/격려하다" },
      { verb: "expect / force / compel / order + O + to V", meaning: "기대/강요/강요/명령하다" },
      { verb: "persuade / ask / enable / instruct + O + to V", meaning: "설득/요구/가능케/지시하다" },
      { verb: "urge / require / invite / lead + O + to V", meaning: "촉구/요구/권유/이끌다" },
    ]
  }, {
    title: "사역동사",
    items: [
      { verb: "make + O + 동사원형", meaning: "~가 ~하도록 시키다(만들다)" },
      { verb: "have + O + 동사원형 또는 -ing", meaning: "~가 ~하도록 시키다(가지다)" },
      { verb: "let + O + 동사원형", meaning: "~가 ~하도록 허락하다" },
    ]
  }, {
    title: "지각동사",
    items: [
      { verb: "see / look at / watch + O + 동사원형/-ing", meaning: "~가 ~하는 것을 보다" },
      { verb: "notice / observe + O + 동사원형/-ing", meaning: "~가 ~하는 것을 알아채다/관찰하다" },
      { verb: "listen to / hear / feel + O + 동사원형/-ing", meaning: "~가 ~하는 것을 듣다/느끼다" },
    ]
  }, {
    title: "준사역동사",
    items: [
      { verb: "help + O + 동사원형/to V", meaning: "~가 ~할 것을 돕다" },
      { verb: "get + O + to V / 형용사 / -ing", meaning: "~가 ~할 것을 시키다" },
      { verb: "bid + O + 동사원형/to V / lead / enable + O + to V", meaning: "명하다/이끌다/가능케하다" },
    ]
  }]
};

const allPagesData = [verbPatternData, verbPatternDataPage2, verbPatternDataPage3, verbPatternDataPage4];
export const APPENDIX_EXAM_PAGE_COUNT = 4;

// 간지 페이지
export function AppendixExamDividerPage({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div className="flex-1 flex flex-col items-center justify-center relative" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
      }}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #c9a227 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #c9a227 0%, transparent 70%)' }} />
        </div>
        <div className="absolute top-8 left-8 w-20 h-20" style={{ borderTop: '2px solid rgba(201, 162, 39, 0.3)', borderLeft: '2px solid rgba(201, 162, 39, 0.3)' }} />
        <div className="absolute top-8 right-8 w-20 h-20" style={{ borderTop: '2px solid rgba(201, 162, 39, 0.3)', borderRight: '2px solid rgba(201, 162, 39, 0.3)' }} />
        <div className="absolute bottom-8 left-8 w-20 h-20" style={{ borderBottom: '2px solid rgba(201, 162, 39, 0.3)', borderLeft: '2px solid rgba(201, 162, 39, 0.3)' }} />
        <div className="absolute bottom-8 right-8 w-20 h-20" style={{ borderBottom: '2px solid rgba(201, 162, 39, 0.3)', borderRight: '2px solid rgba(201, 162, 39, 0.3)' }} />

        <div className="relative z-10 text-center px-12">
          <div className="inline-block px-8 py-2 rounded-full mb-8" style={{ border: '1px solid rgba(201, 162, 39, 0.4)', background: 'rgba(201, 162, 39, 0.1)' }}>
            <span className="text-sm font-medium tracking-[0.4em] uppercase" style={{ color: '#c9a227' }}>Exam</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-wide" style={{ color: '#ffffff', fontFamily: "'Pretendard', sans-serif" }}>
            주요동사 문형 TEST
          </h1>
          <div className="w-32 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#c9a227' }}>
            첫 글자를 보고 단어를 완성하세요
          </h2>
          <p className="text-sm opacity-60" style={{ color: '#ffffff' }}>
            Name: __________________ &nbsp;&nbsp; Date: __________________
          </p>
        </div>

        <div className="absolute bottom-16 flex items-center gap-4">
          <div className="w-8 h-px" style={{ backgroundColor: 'rgba(201, 162, 39, 0.3)' }} />
          <span className="text-xs tracking-widest" style={{ color: 'rgba(201, 162, 39, 0.5)' }}>ORUN ACADEMY</span>
          <div className="w-8 h-px" style={{ backgroundColor: 'rgba(201, 162, 39, 0.3)' }} />
        </div>
      </div>
    </A4Page>
  );
}

export function AppendixExamPage({ pageNumber, totalPages, pageIndex }: AppendixExamPageProps) {
  const isFirstPage = pageIndex === 0;
  const pageData = allPagesData[pageIndex];

  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div className="flex flex-col h-full p-3 relative" style={{ background: 'linear-gradient(135deg, #fefcf8 0%, #f8f4eb 100%)' }}>
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-8 h-8" style={{ borderTop: '2px solid #c9a227', borderLeft: '2px solid #c9a227' }} />
        <div className="absolute top-2 right-2 w-8 h-8" style={{ borderTop: '2px solid #c9a227', borderRight: '2px solid #c9a227' }} />
        <div className="absolute bottom-2 left-2 w-8 h-8" style={{ borderBottom: '2px solid #c9a227', borderLeft: '2px solid #c9a227' }} />
        <div className="absolute bottom-2 right-2 w-8 h-8" style={{ borderBottom: '2px solid #c9a227', borderRight: '2px solid #c9a227' }} />

        <div className="flex-1 px-3 flex flex-col">
          {isFirstPage && (
            <div className="text-center mb-2">
              <div className="inline-block px-5 py-1 rounded-full mb-1" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <span className="text-[11px] font-medium tracking-[0.3em] text-amber-300 uppercase">EXAM</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#1a1a2e', fontFamily: "'Pretendard', sans-serif" }}>
                주요동사 문형 TEST
              </h1>
              <p className="text-[11px] text-amber-700">첫 글자를 보고 단어를 완성하세요</p>
            </div>
          )}

          {!isFirstPage && (
            <div className="text-center mb-2">
              <span className="text-[11px] font-medium px-4 py-1 rounded-full" style={{ backgroundColor: '#1a1a2e', color: '#c9a227' }}>
                주요동사 문형 TEST ({pageIndex + 1}/4)
              </span>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            {pageData.sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="flex-1 flex flex-col mb-1.5 last:mb-0">
                <div className="flex items-center gap-2 mb-1 pb-0.5" style={{ borderBottom: '2px solid #c9a227' }}>
                  <div className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#1a1a2e', color: '#c9a227' }}>
                    {section.title.match(/^\d/)?.[0] ?? '●'}
                  </div>
                  <h2 className="text-[13px] font-bold" style={{ color: '#1a1a2e' }}>{section.title}</h2>
                </div>

                {'description' in section && typeof section.description === 'string' && (
                  <p className="text-[11px] mb-1 pl-8 italic" style={{ color: '#666666' }}>{section.description}</p>
                )}

                <div className="flex-1 rounded-lg overflow-hidden" style={{ border: '1px solid #e5d9c3', backgroundColor: '#ffffff' }}>
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex text-[12px] leading-snug" style={{
                      borderBottom: itemIdx < section.items.length - 1 ? '1px solid #f0ebe0' : 'none',
                      backgroundColor: itemIdx % 2 === 0 ? '#ffffff' : '#faf8f4'
                    }}>
                      <div className="flex-1 px-3 py-1.5 font-medium tracking-wide" style={{
                        color: '#1a1a2e',
                        borderRight: item.meaning ? '1px solid #e5d9c3' : 'none',
                        fontFamily: "'Courier New', monospace",
                      }}>
                        {maskWord(item.verb)}
                      </div>
                      {item.meaning && (
                        <div className="w-[35%] px-3 py-1.5" style={{ color: '#555555' }}>
                          {item.meaning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between px-4">
          <span className="text-[10px] font-medium" style={{ color: '#c9a227' }}>ORUN ACADEMY</span>
          <span className="text-[10px] px-3 py-0.5 rounded-full" style={{ backgroundColor: '#1a1a2e', color: '#c9a227' }}>
            EXAM - {pageIndex + 1}
          </span>
        </div>
      </div>
    </A4Page>
  );
}
