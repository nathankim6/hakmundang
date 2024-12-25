export const getIrrelevantPrompt = (text: string) => `아래 예시와 같은 형식으로, 제가 입력한 영어 지문을 바탕으로 문제를 만들어주세요. 정답은 지문의 주제와 일부 관련은 있으나 전체적인 흐름이나 논리상 어색한 문장이어야 합니다. 보기는 지문의 첫 문장을 제외한 나머지 부분에서 균형있게 선택되어야 합니다.

[INPUT]
${text}

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

{지문의 첫 문장을 그대로 작성한 후, 나머지 부분에서 균형있게 선택한 4개의 문장과 1개의 새로운 문장으로 구성합니다. 선택된 4개의 문장과 새로운 문장 앞에 ①, ②, ③, ④, ⑤ 번호를 붙입니다. 새로운 문장(정답)의 위치는 무작위로 배치합니다.}

[정답] {정답 번호}
[풀이]
{정답 선택지가 전체 흐름과 관계없는 이유에 대한 간단한 설명}

예시:
[INPUT]
The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. Apart from its convenience and flexibility, the car has the additional advantages of affording access to many areas not served by public transport, as well as allowing the easy transport of luggage and equipment. As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations.

[OUTPUT]
다음 글에서 전체 흐름과 관계 없는 문장은?

The expansion of sports tourism in the twentieth century has been influenced by further developments in transportation. ① Just as the railways revolutionized travel in the nineteenth century, so the automobile produced even more dramatic changes in the twentieth. ② The significance of the car in the development of sport and tourism generally has attracted considerable coverage and it has had no less an impact on sports tourism specifically. ③ Although originally invented towards the end of the nineteenth century, it started to become a mass form of transport in the 1920s in the USA and rather later in Britain. ④ The expansion of reasonably priced, good quality accommodation associated with tourism growth has also facilitated the growth of locally based restaurants. ⑤ As a result, it was invaluable for the development of many forms of sports tourism but especially those which require the transportation of people and equipment to relatively remote locations.

[정답] ④
[풀이]
이 글은 20세기에 교통수단이 발전하면서 스포츠 관광이 확대되었고, 특히 자동차가 스포츠와 관광 발전에 중요한 역할을 했다는 내용을 다루고 있다. 그러나 ④번 문장은 관광 성장과 관련된 합리적인 가격의 숙박 시설 확대가 현지 식당의 성장을 촉진했다는 내용을 담고 있어, 교통수단의 발전과 스포츠 관광의 확대라는 글의 중심 주제와 관계가 없다.`;