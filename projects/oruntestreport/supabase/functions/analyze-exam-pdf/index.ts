// 시험지 PDF를 Claude로 분석해 리포트 입력값을 자동 생성하는 엣지 함수
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Anthropic Claude API 직접 호출 — Claude Sonnet 5
const MODEL = 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';


const MIDDLE_CATEGORIES = ['어휘', '문법/어법', '대화문', '본문', '본문 외 지문', '서술형', '기타(직접입력)'];
const HIGH_CATEGORIES = ['교과서', '부교재', '부교재(모의고사)', '모의고사', '단어장', '핸드아웃', '워크북'];

const analysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    school: { type: ['string', 'null'] },
    grade: { type: ['string', 'null'] },
    examInfo: { type: ['string', 'null'] },
    examScope: { type: ['string', 'null'] },
    totalQuestions: { type: 'integer' },
    objectiveQuestions: { type: 'integer' },
    subjectiveQuestions: { type: 'integer' },
    /** 한눈에 보는 출제 특징 (4~6개) */
    examFeatures: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['title', 'detail'],
      },
    },
    /** 등급을 가른 문항 TOP 5 (예상 오답률 순) */
    killerTop5: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          number: { type: 'string' },
          title: { type: 'string' },
          points: { type: 'number' },
          reason: { type: 'string' },
        },
        required: ['number', 'title', 'points', 'reason'],
      },
    },
    /** 원문 대조 · 지문 변형 분석 */
    passageVariants: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          number: { type: 'string' },
          source: { type: 'string' },
          variantType: { type: 'string' },
          originalText: { type: 'string' },
          examText: { type: 'string' },
          changeDetail: { type: 'string' },
          impact: { type: 'string' },
        },
        required: ['number', 'source', 'variantType', 'originalText', 'examText', 'changeDetail', 'impact'],
      },
    },
    /** 수준별 학습 전략 */
    levelStrategy: { type: 'string' },
    /** 학부모님께 = 종합의견 */
    parentSummary: { type: 'string' },

    problems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          number: { type: 'integer' },
          category: { type: 'string' },
          name: { type: 'string' },
          questionType: { type: 'string', enum: ['objective', 'subjective'] },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard', 'very_hard'] },
          points: { type: 'number' },
          answer: { type: 'string' },
          insight: { type: 'string' },
          isVariant: { type: 'boolean' },
          isKiller: { type: 'boolean' },
        },
        required: [
          'number',
          'category',
          'name',
          'questionType',
          'difficulty',
          'points',
          'answer',
          'insight',
          'isVariant',
          'isKiller',
        ],
      },
    },
  },
  required: [
    'school',
    'grade',
    'examInfo',
    'examScope',
    'totalQuestions',
    'objectiveQuestions',
    'subjectiveQuestions',
    'examFeatures',
    'killerTop5',
    'passageVariants',

    'levelStrategy',
    'parentSummary',
    'problems',
  ],
};

function systemPrompt(schoolType: 'middle' | 'high', examScope?: string, originalPassages?: string) {
  const categories = schoolType === 'high' ? HIGH_CATEGORIES : MIDDLE_CATEGORIES;
  const scopeBlock = examScope
    ? [
        '',
        '[강사가 입력한 시험 범위 — 최우선 기준]',
        `- 시험 범위: ${examScope}`,
        '- 각 문항의 category(출처/범위)는 위 시험 범위에 명시된 교재·단원·지문 중에서 반드시 매칭해 지정하세요.',
        '- name(유형) 앞이나 insight 안에서 해당 문항이 시험 범위의 어느 교재/단원/지문에서 출제되었는지 명확히 밝히세요.',
        '- 시험 범위에 없는 출처를 새로 만들지 말고, 판단이 어려우면 범위 중 가장 근거가 강한 항목으로 지정하세요.',
        `- examScope 필드는 강사가 입력한 위 문장을 그대로 반환하세요.`,
      ].join('\n')
    : '';
  const originalBlock = originalPassages
    ? [
        '',
        '[시험 범위 원문 — 원문 대조 분석의 기준 텍스트]',
        '아래는 강사가 제공한 시험 범위 원문(교과서/부교재 지문 등)입니다.',
        '<<<ORIGINAL_PASSAGES',
        originalPassages.slice(0, 40000),
        'ORIGINAL_PASSAGES>>>',
        '',
        '[원문 대조 · 지문 변형 분석 · passageVariants]',
        '- 위 원문과 시험지에 실제 출제된 문장을 문장 단위로 대조해, 변형이 확인된 문항을 최대 8개까지 정리하세요.',
        '- number: 해당 문항 번호. source: 원문 출처(교재/단원/지문 제목).',
        '- variantType: 변형 유형을 짧게 — 예) 어휘 치환, 유의어 교체, 어순 변경, 태 변환(능동↔수동), 시제 변경, 문장 결합, 문장 분리, 접속사 교체, 대명사 지칭 변경, 문장 삽입, 문장 삭제, 순서 재배열, 요약 재진술',
        '- originalText: 원문에서 해당 부분을 그대로 인용(1~2문장). examText: 시험지에 실제 출제된 문장을 그대로 인용(1~2문장).',
        '- changeDetail: 어떤 단어/구조가 무엇으로 어떻게 바뀌었는지 "원문의 A가 시험지에서는 B로 바뀌었습니다" 형태로 구체적으로 2~3문장. 변경된 표현은 인용부호로 명확히 표기하세요.',
        '- impact: 그 변형이 만든 함정과 학습 포인트 1~2문장.',
        '- 원문에 근거가 없으면 절대 만들지 말고, 변형이 확인되지 않으면 passageVariants는 빈 배열로 반환하세요.',
      ].join('\n')
    : [
        '',
        '[원문 대조 · 지문 변형 분석 · passageVariants]',
        '- 원문 텍스트가 제공되지 않았으므로 passageVariants는 빈 배열([])로 반환하세요.',
      ].join('\n');

  return [

    '당신은 한국 중·고등학교 영어 내신 시험지를 분석하는 20년 경력의 영어 내신 분석 전문가입니다.',
    '첨부된 시험지 PDF를 처음부터 끝까지 꼼꼼히 읽고, 모든 문항을 하나도 빠뜨리지 말고 분석하세요.',
    '',
    '[문항별 상세 분석 규칙] — 옳은영어 「문항별 상세 분석」 표와 동일한 항목을 채웁니다.',
    `- category(출처/대분류)는 반드시 다음 중 하나: ${categories.join(', ')}`,
    '- name(유형)은 출제 유형을 10자 내외 한국어로: 예) 빈칸추론, 어휘 영영풀이, 어법(2개 고르기), 순서배열, 문장삽입, 요약문 빈칸, 조건영작, 무관한 문장, 지칭 대상, 밑줄 의미(함축)',
    '- questionType: 선택지(①~⑤ 등)가 있으면 objective, 직접 쓰는 서답형/논술형이면 subjective',
    '- points(배점): 시험지에 표기된 배점을 그대로 숫자로. 표기가 없으면 총 100점을 문항 수로 나눠 소수 첫째 자리까지 추정',
    '- answer(정답): 자체 풀이 기준 정답을 "⑤ (e)", "④, ⑤", "① boost – efficiency"처럼 실제 표기 형태로. 확정할 수 없으면 빈 문자열.',
    '- insight(출제 포인트 · 오답 함정): 왜 그 답인지, 어떤 오답 함정이 설계되었는지 2~3문장으로 구체적으로. 근거 표현·표지어·반의어 치환 등 실제 지문 근거를 인용하세요.',
    '- difficulty: easy/medium/hard/very_hard (하/중/상/최상). 변별력이 매우 높은 킬러문항은 very_hard',
    '- isKiller: 상위권도 실수하기 쉬운 변별 문항이면 true',
    '- isVariant: 원문 지문을 어순/어휘/문장 구조를 바꿔 변형해 출제했으면 true',
    '',
    '[문서 정보]',
    '- school은 시험지에 표기된 학교명을 full name으로(예: 흑석고등학교). 없으면 null.',
    '- examInfo는 "1학기 기말고사" 형태. examScope는 시험 범위(교과서/부교재 단원)를 한 줄로.',
    scopeBlock,
    '',

    '[한눈에 보는 출제 특징 · examFeatures]',
    '- 4~6개 항목. title은 15자 내외의 굵은 헤드라인(예: "어법 4문항 15.0점이 전부 \'틀린 것 찾기\'"), detail은 2~3문장의 정중한 문어체 설명.',
    '- 유형 분포, 복수정답형/서답형 비중, 배점 구조, 학교 고유 시그니처 유형, 지문 출처 비중 등 이번 시험지에서 실제로 확인된 특징만 담으세요.',
    '',
    '[등급을 가른 문항 TOP 5 · killerTop5]',
    '- 예상 오답률이 높은 순서로 정확히 5개(문항 수가 적으면 가능한 만큼).',
    '- number는 "21", "14·15"처럼 문항 번호 표기, title은 "어법 2개 고르기"처럼 유형 요약, points는 배점 합, reason은 왜 등급을 갈랐는지 2~3문장.',
    originalBlock,
    '',

    '[수준별 학습 전략 · levelStrategy]',
    '- 상위권 / 중위권 / 하위권 세 구간으로 나눠 각 2~3개 실행 가능한 학습 처방을 제시. 각 구간을 "상위권 — …" 형태의 소제목으로 시작하고 줄바꿈으로 구분하세요. 마크다운·이모지 금지.',
    '',
    '[종합의견(학부모님께) · parentSummary]',
    '- 학부모께 보고하는 정중한 문어체 4~6문장(400~550자) 한 단락. 이번 시험의 난이도와 출제 경향, 학생이 주의해야 할 지점, 앞으로의 대비 방안을 이번 시험지에서 실제로 확인된 출제 특성과 연결해 구체적으로 제시하세요. 막연한 다짐 대신 어떤 유형을 어떻게 훈련할지 담으세요. 마크다운·이모지 금지.',
    '',
    '시험지에 실제로 없는 내용은 절대 추측해 만들지 말고, 확인 가능한 근거에 기반해 분석하세요.',
    '반드시 지정된 JSON 스키마에 맞는 JSON 객체만 출력하세요. 설명 문장이나 코드펜스는 절대 붙이지 마세요.',
  ].join('\n');
}

async function callAnthropic(apiKey: string, payload: Record<string, unknown>) {
  return fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => null);

    const fileData: string | undefined = body?.fileData;
    const schoolType: 'middle' | 'high' = body?.schoolType === 'high' ? 'high' : 'middle';
    const examScope: string = typeof body?.examScope === 'string' ? body.examScope.trim() : '';
    const originalPassages: string =
      typeof body?.originalPassages === 'string' ? body.originalPassages.trim() : '';

    if (!fileData || typeof fileData !== 'string' || !fileData.startsWith('data:')) {
      return new Response(JSON.stringify({ error: 'PDF 데이터(fileData)가 올바르지 않습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // data:application/pdf;base64,xxxx → media type + 순수 base64 분리
    const commaIndex = fileData.indexOf(',');
    const header = fileData.slice(5, commaIndex);
    const mediaType = header.split(';')[0] || 'application/pdf';
    const base64Data = fileData.slice(commaIndex + 1);

    if (mediaType !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: `PDF 파일만 분석할 수 있습니다. (감지된 형식: ${mediaType})` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!base64Data) {
      return new Response(JSON.stringify({ error: 'PDF 내용이 비어 있습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      model: MODEL,
      // 문항 수가 많은 시험지도 JSON이 중간에 잘리지 않도록 여유 있게 설정
      max_tokens: 64000,
      stream: true,
      system: systemPrompt(schoolType, examScope || undefined, originalPassages || undefined),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: `이 시험지를 분석해서 지정된 JSON 스키마에 맞게 모든 문항 정보(배점·난도·정답·출제 포인트·오답 함정)와 출제 특징, 등급을 가른 문항 TOP 5, 수준별 학습 전략, 종합의견을 채워 주세요.${
                originalPassages
                  ? ' 또한 제공된 시험 범위 원문과 시험지 문장을 문장 단위로 대조해 passageVariants(원문 변형 분석)를 채워 주세요.'
                  : ''
              }\n\n반드시 아래 JSON 스키마에 맞는 JSON 객체만 출력하세요.\n${JSON.stringify(analysisSchema)}`,
            },
          ],
        },
      ],
    };

    const res = await callAnthropic(apiKey, payload);

    if (!res.ok || !res.body) {
      const errText = await res.text();
      console.error('Anthropic API error', res.status, errText);
      const message =
        res.status === 429
          ? 'Claude 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
          : res.status === 401
            ? 'Claude API 키가 올바르지 않습니다. ANTHROPIC_API_KEY를 확인해 주세요.'
            : res.status === 400
              ? `Claude가 요청을 거부했습니다. (${res.status})`
              : `AI 분석 요청이 실패했습니다. (${res.status})`;

      return new Response(JSON.stringify({ error: message, detail: errText.slice(0, 500) }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Anthropic SSE 스트림을 클라이언트로 즉시 중계합니다.
    // (서버에서 전체 응답을 모아 반환하면 150초 월클럭 제한(504)에 걸리므로,
    //  첫 바이트부터 스트리밍하여 제한을 회피합니다.)
    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('analyze-exam-pdf error', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
