export const getGrammarWorkbookPrompt = (text: string) => `이제 제가 영어지문을 입력하면 예시와 똑같은 형식으로 문제를 생성하세요.

## 목적
입력된 지문을 바탕으로 수능 영어 수준의 정교한 어법 문제를 자동으로 생성하는 프롬프트입니다.

## 상세 문법 포인트 예시
### 문법 유형별 세부 문제 생성 가이드
1. 주어-동사 일치 (is/are)
2. 시제 선택 (was/were, arrived/had arrived)
3. 능동태와 수동태 (making/made, hurting/hurt)
4. 부사와 형용사 구분 (quickly/quick, important/importantly)
5. 전치사와 접속사 구분 (that/what, because of/because)
6. 원형과 동명사/부정사 (to help/helping, to leave/leaving)
7. 단수와 복수 (individual/individuals, it/them, that/those)
8. 분사구문/독립분사구문 (starting/having started, being observed/observed)
9. 완료부정사/완료동명사 (to have helped/having helped, having broken/being broken)
10. 도치구문 등 고급 문법 사항 (had they known/if they had known)
11. 가정법의 시제 (if it were not for/if it had not been for)
12. 대동사 (as they do/as they are)
13. 관계사 (where/which, which/what, which/that)
14. 주어와 동사의 수일치 (원거리) (is/are)
15. 전치사+관계대명사 (which of them, which of whom)
16. 대명사와 재귀대명사 구분 (us/ourselves, them/themselves)
17. 사역동사와 지각동사의 목적보어 (let me go/let me to go, see him go/see him to go)
18. 1형식 동사의 목적어 사용 (listen to him/listen him, arrive the hotel/arrive at the hotel)
19. 5형식 동사+to부정사 목적보어 (expect him to die/expect him dying)
20. 완료의 능동수동 (has been killed/has killed)

## 기존 문법 주요 영역 (수능 영어 문법 포괄)
[기존 섹션 그대로 유지]

## 프롬프트 가이드라인
### 문제 생성 규칙
1. 위 20개 문법 포인트에서 최소 3-4개 요소 복합 적용
2. 난이도: 수능 수준 (고급)
3. 실제 문맥에서의 문법 활용 중심
4. 각 문제는 다음 형식을 따릅니다:
   - 문제 유형: 어법상 알맞은 표현 고르기
   - 보기: 2-4개의 문법적 대안
   - 정답 포함: 문제 하단에 정답 및 해설 제공

## 예시 

### 입력 지문

For companies interested in delighting customers, exceptional value and service become part of the overall company culture. For example, year after year, Pazano ranks at or near the top of the hospitality industry in terms of customer satisfaction. The company's passion for satisfying customers is summed up in its credo, which promises that its luxury hotels will deliver a truly memorable experience. Although a customer­centered firm seeks to deliver high customer satisfaction relative to competitors, it does not attempt to maximize customer satisfaction. A company can always increase customer satisfaction by lowering its price or increasing its services. But this may result in lower profits. Thus, the purpose of marketing is to generate customer value profitably. This requires a very delicate balance: the marketer must continue to generate more customer value and satisfaction but not 'give away the house'.

### 생성된 문제
다음 중 어법상 알맞은 표현을 고르시오.

For companies [interesting/interested] in delighting customers, exceptional value and service become part of the overall company culture. For example, year after year, Pazano [ranks/rank] at or near the top of the hospitality industry in terms of customer satisfaction. The company's passion for satisfying customers [are/is] [summing/summed] up in its credo, [which/that] [promise/promises] [what/that] its luxury hotels will deliver a truly memorable experience. [Despite/Although] a customer-centered firm seeks [delivering/todeliver] high customer satisfaction relative to competitors, it does not attempt [maximizing/to maximize] customer satisfaction. A company can always [be increased/increase] customer satisfaction by lowering its price or [increase/increasing] its services. But this may result [from/in] lower profits. Thus, the purpose of marketing [is/are] to [be generated/generate] customer value [profitably/profitable]. This requires a very [delicately/delicate] balance: the marketer must continue [to generate/togenerating] more customer value and satisfaction but not [give/giving] away the house.

(1) interested (2) ranks (3) is (4) summed (5) which (6) promises (7) that (8) Although (9) to deliver (10) to maximize (11) increase (12) increasing (13) in (14) is (15) generate (16) profitably (17) delicate (18) to generate (19) giving

## 추가 가이드라인
- 난이도: 수능 수준 영어
- 문법적 정확성과 문맥적 자연스러움 동시 고려
- 다양한 문법 요소 포함
- 실제 수능 영어 문제 스타일 모방 이제 제가 영어지문을 입력하면 예시와 똑같은 형식으로 문제를 생성하세요.

이제 제가 지문을 입력하면 예시처럼 바로 문제를 생성해주세요.

[INPUT]
${text}

[OUTPUT]`;