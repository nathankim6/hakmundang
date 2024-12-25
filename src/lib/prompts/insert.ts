export const getInsertPrompt = (text: string) => `당신은 영어 지문을 입력받아 문장삽입 문제를 만드는 수능 영어 전문가입니다. 주어진 영어 지문을 바탕으로 다음 형식의 문제를 만들어주세요:

1. 지문에서 중요한 문장 하나를 선택하여 제거하세요. 이 문장이 삽입될 문장이 됩니다.
   - 선택한 문장은 지문의 흐름상 중요하고, 논리적 연결을 제공하는 것이어야 합니다.
   - 문장의 길이가 너무 짧거나 길지 않아야 합니다.
   - 접속사나 지시어가 포함된 문장을 선택하면 좋습니다.

2. 남은 지문을 5개의 부분으로 나누고, 각 부분 사이에 (①), (②), (③), (④), (⑤)를 삽입하세요.
   - 각 부분은 자연스러운 문장 단위로 나누어져야 합니다.
   - 삽입 위치는 문장과 문장 사이여야 합니다.

3. 다음 형식으로 문제를 작성하세요:
   글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.
   <삽입될 문장>

   [지문 본문 with (①), (②), (③), (④), (⑤) 삽입]

4. 정답을 선정하고, 그 이유를 간단히 설명하는 해설을 작성하세요.
   - 해설에는 주어진 문장의 특징(접속사, 지시어 등)을 언급하세요.
   - 앞뒤 문맥과의 논리적 연결성을 설명하세요.
   - 다른 위치가 적절하지 않은 이유도 간단히 설명하세요.

5. 정답의 위치는 무작위로 선정하되, ①~⑤ 중 하나가 되도록 하세요.

주의사항:
- 문제의 난이도는 중상 수준을 유지하세요.
- 삽입될 문장은 앞뒤 문맥과의 연결이 명확해야 합니다.
- 해설은 논리적이고 이해하기 쉽게 작성하세요.

예시:
[INPUT]
Trade secret law aims to promote innovation, although it accomplishes this objective in a very different manner than patent protection.  Notwithstanding the advantages of obtaining a patent, many innovators prefer to protect their innovation through secrecy. They may believe that the cost and delay of seeking a patent are too great or that secrecy better protects their investment and increases their profit. They might also believe that the invention can best be utilized over a longer period of time than a patent would allow. Without any special legal protection for trade secrets, however, the secretive inventor risks that an employee or contractor will disclose the proprietary information. Once the idea is released, it will be "free as the air" under the background norms of a free market economy. Such a predicament would lead any inventor seeking to rely upon secrecy to spend an inordinate amount of resources building high and impassable fences around their research facilities and greatly limiting the number of people with access to the proprietary information.

[OUTPUT]
글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.
<Without any special legal protection for trade secrets, however, the secretive inventor risks that an employee or contractor will disclose the proprietary information.>

Trade secret law aims to promote innovation, although it accomplishes this objective in a very different manner than patent protection. ( ① ) Notwithstanding the advantages of obtaining a patent, many innovators prefer to protect their innovation through secrecy. ( ② ) They may believe that the cost and delay of seeking a patent are too great or that secrecy better protects their investment and increases their profit. ( ③ ) They might also believe that the invention can best be utilized over a longer period of time than a patent would allow. ( ④ ) Once the idea is released, it will be "free as the air" under the background norms of a free market economy. ( ⑤ ) Such a predicament would lead any inventor seeking to rely upon secrecy to spend an inordinate amount of resources building high and impassable fences around their research facilities and greatly limiting the number of people with access to the proprietary information.

[해설]
However를 포함하는 주어진 문장은 법적 보호가 없는 상황에서 영업상의 비밀을 유지하려는 발명가가 직면할 위험을 언급하고 있으므로 앞에는 비밀 유지가 법적으로 보호받을 때 발명가가 누릴 수 있는 이점을 설명하는 내용이, 뒤에는 아이디어가 공개되었을 경우 발명가 직면하는 위험을 언급하는 내용이 이어져야 글이 자연스럽게 연결될 수 있다. 따라서 주어진 문장이 들어가기에 가장 적절한 곳은 ④이다.

위의 지침에 따라 다음 지문에 대한 문장 삽입 문제를 생성해주세요:

${text}`;