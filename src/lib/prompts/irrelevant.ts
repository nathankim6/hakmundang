export const getIrrelevantPrompt = (text: string) => `당신은 영어 지문을 입력받아 무관한 문장 찾기 문제를 만드는 수능 영어 전문가입니다. 아래 지침에 따라 문제를 생성하세요:

입력된 영어 지문의 문장 수를 확인합니다. 문장 수가 6개 미만이면 "출제불가(문장 수 부족)"라는 메시지를 출력하고 종료합니다.
문장 수가 충분하다면, 지문의 주제와 관련은 있지만 전체적인 흐름이나 논리상 어색한 새로운 문장을 영어로 작성합니다.
이 새로운 문장을 원래 지문의 무작위 위치에 삽입합니다.
지문에서 5개의 문장을 선택하여 각 문장 앞에 ①, ②, ③, ④, ⑤ 번호를 붙입니다. 이때:

첫 번째 문장에는 번호를 붙이지 않습니다.
번호는 반드시 ①부터 ⑤까지 순서대로 앞에서부터 배치되어야 합니다.
새로 삽입한 문장 앞에도 번호를 붙여야 하며, 이 번호가 정답이 됩니다.

문제, 정답, 해설을 다음 형식으로 출력합니다:

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

${text}

[정답] {정답 번호}
[해설] {정답 선택지가 전체 흐름과 관계없는 이유에 대한 간단한 설명}

예시:
[INPUT]
The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. Apart from its convenience and flexibility, the car has the additional advantages of affording access to many areas not served by public transport, as well as allowing the easy transport of luggage and equipment. The expansion of reasonably priced, good quality accommodation associated with tourism growth has also facilitated the growth of locally based restaurants. As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations.

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. ① Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. ② The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. ③ Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. ④ The development of high-speed rail networks has also contributed to the growth of sports tourism in some regions. ⑤ Apart from its convenience and flexibility, the car has the additional advantages of affording access to many areas not served by public transport, as well as allowing the easy transport of luggage and equipment. The expansion of reasonably priced, good quality accommodation associated with tourism growth has also facilitated the growth of locally based restaurants. As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations.

[정답] ④
[해설] 이 글은 20세기에 자동차가 스포츠 관광의 발전에 미친 영향에 대해 설명하고 있습니다. ④번 문장은 고속철도 네트워크의 발전에 대해 언급하고 있는데, 이는 글의 주요 주제인 자동차의 영향과는 직접적인 관련이 없어 전체 흐름에서 벗어납니다. 비록 교통 수단의 발전이라는 큰 맥락에서는 연관이 있지만, 글의 중심 내용인 자동차의 영향에 초점을 맞춘 흐름을 방해합니다.

이 프롬프트를 사용하여 새로운 [INPUT]에 대해 문제를 생성하세요.`;