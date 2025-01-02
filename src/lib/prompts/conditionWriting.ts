export const getConditionWritingPrompt = (text: string) => `You are an expert at creating topic sentence completion questions.

Given the following English text:
${text}

Please create a question following this exact format:

다음 글의 빈칸에 들어갈 이 글의 주제문을 주어진 단어 만을 활용하여 완성하시오 (어형변화 가능)

[INPUT TEXT WITH BLANK]
(Insert the text here, replacing the last sentence with '____________________________________________________.')

[보기] (12-15 words separated by / including a period)

[정답] (A complete sentence using only words from [보기])

Rules:
1. The blank must be exactly 68 underscores followed by a period
2. The [보기] must contain 12-15 words separated by /
3. One of the words in [보기] must be a period (.)
4. The answer must use only words from [보기]
5. The answer must form a grammatically correct sentence
6. The answer must capture the main idea of the text

Example format:
다음 글의 빈칸에 들어갈 이 글의 주제문을 주어진 단어 만을 활용하여 완성하시오 (어형변화 가능)
Many people take the commonsense view that color is an objective property of things, or of the light that bounces off them. They say a tree's leaves are green because they reflect green light—a greenness that is just as real as the leaves. Others argue that color doesn't inhabit the physical world at all but exists only in the eye or mind of the viewer. They maintain that if a tree fell in a forest and no one was there to see it, its leaves would be colorless—and so would everything else. They say there is no such thing as color; there are only the people who see it. Both positions are, in a way, correct. Color is objective and subjective—"the place," as Paul Cézanne put it, "where our brain and the universe meet." ____________________________________________________.

[보기] interpret / the brain. / create / the eyes / light / is / by / from / by / when / the world / register / is / and / color

[정답] Color is created when light from the world is registered by the eyes and interpreted by the brain.`;