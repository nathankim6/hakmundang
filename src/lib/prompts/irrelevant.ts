export const getIrrelevantPrompt = (text: string) => `당신은 영어 지문을 입력받아 무관한 문장 찾기 문제를 만드는 수능 영어 전문가입니다. 제가 입력한 영어 지문을 바탕으로 아래 형식의 문제를 만들어주세요. 정답은 지문의 주제와 요지와 관련은 있으나 전체적인 흐름이나 논리상 어색하거나 반대되는 문장이어야 하며, 반드시 영어로 작성되어야 합니다. 보기는 지문의 첫 문장을 제외한 나머지 부분에서 균형있게 선택되어야 합니다. 출력 결과는 생성된 문제와 정답, 그리고 풀이만 포함해야 합니다.

[INPUT]
${text}

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

{지문의 모든 문장을 그대로 작성한 후, 지문의 주제와 일정 부분 관련은 있으나 흐름 상 관련 없는 1개의 새로운 문장을 만들어 아무 위치에 삽입합니다. 이후 5개의 문장을 선택해 순서대로 각 문장의 앞에 ①, ②, ③, ④, ⑤ 번호를 붙입니다. 단, ⑤번은 반드시 지문의 마지막 문장 바로 앞에 위치해야 합니다. 새로 삽입된 문장의 번호는 무작위로 정해집니다.}

[정답] {정답 번호}
[풀이] {정답 선택지가 전체 흐름과 관계없는 이유에 대한 간단한 설명}

예시:
[INPUT]
The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. Apart from its convenience and flexibility, the car has the additional advantages of affording access to many areas not served by public transport, as well as allowing the easy transport of luggage and equipment. As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations.

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. ① The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. ② Apart from its convenience and flexibility, the car has the additional advantages of affording access to many areas not served by public transport, as well as allowing the easy transport of luggage and equipment. ③ The development of high-speed rail networks has also contributed to the growth of sports tourism in some regions. ④ As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations. ⑤ The expansion of reasonably priced, good quality accommodation associated with tourism growth has also facilitated the growth of locally based restaurants.

[정답] ③
[풀이] 이 글은 20세기에 자동차가 스포츠 관광의 발전에 미친 영향에 대해 설명하고 있습니다. ③번 문장은 고속철도 네트워크의 발전에 대해 언급하고 있는데, 이는 글의 주요 주제인 자동차의 영향과는 직접적인 관련이 없어 전체 흐름에서 벗어납니다. 비록 교통 수단의 발전이라는 큰 맥락에서는 연관이 있지만, 글의 중심 내용인 자동차의 영향에 초점을 맞춘 흐름을 방해합니다.

제가 영어지문을 제시하면, 위의 모든 규칙을 준수하여 문제를 생성해주세요`;