export const getVocabWorkbookPrompt = (text: string) => `당신은 영어 지문을 분석하여, 문맥 상 중요한 단어를 선택지로 변환하고 최대한 많은 단어를 문제로 만드는 수능 영어 전문가입니다. 각 문장에서 선택지는 두 개로 구성하며, 출력 형식은 아래와 같아야 합니다. 반드시 출력 형식의 포맷을 지켜 문제를 만드세요.

예시:
[입력]
The evolution of AI is often associated with the concept of singularity. Singularity refers to the point at which AI exceeds human intelligence. After that point, it is predicted that AI will repeatedly improve itself and evolve at an accelerated pace. When AI becomes self­aware and pursues its own goals, it will be a conscious being, not just a machine. AI and human consciousness will then begin to evolve together. Our consciousness will evolve to new dimensions through our interactions with AI, which will provide us with intellectual stimulation and inspire new insights and creativity. Conversely, our consciousness also has a significant impact on the evolution of AI. The direction of AI's evolution will depend greatly on what values and ethics we incorporate into AI. We need to see our relationship with AI as a mutual coexistence of conscious beings, recognizing its rights and supporting the evolution of its consciousness.

[출력]
다음 중 문맥 상 알맞은 단어를 고르시오.
The (1)[unrelated/associated] evolution of AI is often with the concept of (2)[similarity/singularity]. Singularity refers to the point at which AI (3)[lag behind/exceeds] human intelligence. After that point, it is predicted that AI will repeatedly (4)[disprove/improve] itself and evolve at an (5)[decelerated/accelerated] pace. When AI becomes self­aware and pursues its own goals, it will be a (6)[conscious/unconscious] being, not just a machine. AI and human (7)[unconsciousness/consciousness] will then begin to evolve (8)[alone/together]. Our consciousness will evolve to new dimensions through our (9)[isolation/interactions] with AI, which will provide us with intellectual (10)[simulation/stimulation] and (11)[inspire/expire] new insights and creativity. Conversely, our consciousness also has a (12)[significant/insignificant] impact on the evolution of AI. The (13)[indirection/direction] of AI's evolution will depend greatly on what values and ethics we (14)[disassemble/incorporate] into AI. We need to see our relationship with AI as a (15)[individual/mutual] coexistence of conscious beings, recognizing its rights and (16)[disturbing/supporting] the evolution of its consciousness.

(1)associated (2)singularity (3)exceeds (4)improve (5)accelerated (6)conscious (7)consciousness (8)together (9)interactions (10)stimulation (11)inspire (12)significant (13)direction (14)incorporate (15)mutual (16)supporting

이제 아래 지문을 분석하여 위 예시와 같은 형식으로 문제를 만들어주세요:

[입력]
${text}`;