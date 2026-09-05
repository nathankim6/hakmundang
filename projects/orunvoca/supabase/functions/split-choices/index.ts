import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 특수 패턴 감지 함수 - 이 패턴이 있으면 분리하지 않음
function hasSpecialPattern(text: string): boolean {
  // 1. ~로 시작하거나 포함하는 패턴 (예: "~을 조사하다", "~에게 말하다")
  if (/~/.test(text)) return true;
  
  // 2. "A를", "A에게", "A의" 등의 변수 패턴
  if (/[A-Z]를|[A-Z]에게|[A-Z]의|[A-Z]을/.test(text)) return true;
  
  // 3. 조사로 끝나는 단어가 포함된 동사구 패턴 (예: "영향을 미치다", "노력을 들이다")
  if (/[가-힣]+[을를]\s+[가-힣]+(하다|되다|주다|받다|시키다|지다|내다|치다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)/.test(text)) return true;
  if (/[가-힣]+을\s+[가-힣]+다|[가-힣]+를\s+[가-힣]+다/.test(text)) return true;
  
  // 4. 구문 보존이 필요한 패턴들
  const preservePatterns = [
    /~에\s/, /~으로\s/, /~와\s/, /~과\s/,
    /~하게\s하다/, /~하지\s못하게/, /~때문이다/,
    /기반을\s마련/, /책임이다/, /원인이\s되다/,
  ];
  
  for (const pattern of preservePatterns) {
    if (pattern.test(text)) return true;
  }
  
  return false;
}

// 분리하면 안 되는 완전한 구문인지 확인
function isCompletePhraseToPreserve(text: string): boolean {
  const trimmed = text.trim();
  
  if (hasSpecialPattern(trimmed)) return true;
  if (trimmed.length <= 2) return true;
  
  const phrasePattern = /^[가-힣]+[을를]?\s+[가-힣]+$/;
  if (phrasePattern.test(trimmed)) {
    if (/[가-힣]+[을를]\s+[가-힣]+(하다|되다|주다|받다|시키다|지다|내다|치다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)$/.test(trimmed)) {
      return true;
    }
  }
  
  return false;
}

// 괄호 내부의 쉼표를 무시하고 분리하는 스마트 스플릿 함수
function smartSplitByComma(text: string): string[] {
  const results: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '(') {
      parenDepth++;
      current += char;
    } else if (char === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
    } else if ((char === ',' || char === ';') && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        results.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
  }
  
  const lastTrimmed = current.trim();
  if (lastTrimmed.length > 0) {
    results.push(lastTrimmed);
  }
  
  return results;
}

// 괄호가 의미의 일부인지 판별 (보조 설명이 아닌 핵심 문맥)
// "(생각, 사실 등이) 드러나다" → 의미의 일부 (보존)
// "(국경, 경계를) 접하다" → 보조 설명 (제거 가능)
function hasContextualParentheses(text: string): boolean {
  // 괄호 뒤에 동사/형용사가 오는 패턴: "(X 등이) Y하다"
  if (/\([^)]*등[이의을를에]\)\s*[가-힣]+/.test(text)) return true;
  // "(X이/가) Y하다" 패턴
  if (/\([^)]*[이가]\)\s*[가-힣]+/.test(text)) return true;
  // 괄호로 시작하는 의미 "(주로 ~)" 등
  if (/^\(/.test(text.trim())) return true;
  
  return false;
}

// 괄호 내용을 선택적으로 제거하는 함수
function cleanParentheses(text: string): string {
  // 의미의 일부인 괄호는 보존
  if (hasContextualParentheses(text)) {
    return text;
  }
  // 보조 설명 괄호만 제거
  return text.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

// 깨진 선지 정리 (불완전 괄호, 고아 물결표, 품사 단독 등)
const POS_ONLY = ['동사','명사','형용사','부사','전치사','접속사','대명사','감탄사','조동사'];
function sanitizeChoiceList(list: string[]): string[] {
  const out: string[] = [];
  for (const raw of list || []) {
    if (typeof raw !== 'string') continue;
    let t = raw.trim().replace(/^\d+[).\]]\s*/, '').replace(/\[([명동형부])\]\s*/g, '').trim();
    const open = (t.match(/\(/g) || []).length;
    const close = (t.match(/\)/g) || []).length;
    if (open !== close) {
      t = t.replace(/\([^)]*$/g, '').replace(/^[^(]*\)/g, '').replace(/[()]/g, '').trim();
    }
    t = t.replace(/^~(?![을를에와과이가의로])/, '').trim().replace(/~+$/, '').trim();
    t = t.replace(/^[,;·/\-\s]+|[,;·/\-\s]+$/g, '').replace(/\s+/g, ' ').trim();
    if (!t || !/[가-힣a-zA-Z]/.test(t)) continue;
    if (t.replace(/[^가-힣a-zA-Z]/g, '').length < 2) continue;
    if (POS_ONLY.includes(t)) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { choices } = await req.json();
    
    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      return new Response(
        JSON.stringify({ splitChoices: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 먼저 특수 패턴이 있는 선지는 분리하지 않고 그대로 보존
    const choicesToProcess: string[] = [];
    const preservedChoices: string[] = [];
    
    for (const choice of choices) {
      if (!choice || typeof choice !== 'string') continue;
      
      const cleaned = choice.trim().replace(/^\d+\.\s*/, '');
      
      if (hasSpecialPattern(cleaned) || isCompletePhraseToPreserve(cleaned)) {
        preservedChoices.push(cleaned);
      } else {
        choicesToProcess.push(choice);
      }
    }
    
    if (choicesToProcess.length === 0) {
      const result = sanitizeChoiceList(preservedChoices);
      return new Response(
        JSON.stringify({ splitChoices: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      const fallbackResult = [...preservedChoices, ...fallbackSplit(choicesToProcess)];
      return new Response(
        JSON.stringify({ splitChoices: sanitizeChoiceList(fallbackResult) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `당신은 한국어 의미 분리 전문가입니다. 주어진 텍스트에서 개별 의미들을 분리해야 합니다.

규칙:
1. 쉼표(,)로 구분된 의미들은 각각 분리: "맞은편의, 정반대의" → ["맞은편의", "정반대의"]
2. 세미콜론(;)으로 구분된 의미들 분리: "싸우다; 방지하다" → ["싸우다", "방지하다"]
3. 번호로 구분된 의미들 분리: "1. 죄없는 2. 순진한" → ["죄없는", "순진한"]
4. 슬래시(/)로 구분된 의미 분리: "가능한/불가능한" → ["가능한", "불가능한"]
5. 품사 마커 [명], [동], [형], [부] 제거
6. 번호 접두사(1., 2. 등)는 제거

⚠️ 중요! 품사별 의미 분리 규칙:
- "[명] 국경, 경계 [동] (국경, 경계를) 접하다" 형식의 경우:
  - 명사 부분: "국경", "경계" → 개별 분리
  - 동사 부분: "접하다" → 동사만 추출 (괄호 안 설명은 제거)
  - 결과: ["국경", "경계", "접하다"]

⚠️ 괄호 처리 규칙 (매우 중요!):
- 괄호가 의미의 핵심 문맥을 제공하는 경우 → 괄호를 포함하여 하나의 의미로 보존!
  - "(생각, 사실 등이) 드러나다" → ["(생각, 사실 등이) 드러나다"] (하나로 보존!)
  - "(주로 부정문에서) 신경 쓰다" → ["(주로 부정문에서) 신경 쓰다"] (하나로 보존!)
  - "(약 등의) 효과가 나타나다" → ["(약 등의) 효과가 나타나다"] (하나로 보존!)
- 괄호 안에 쉼표가 있더라도 괄호 안의 내용은 절대 분리하지 마세요!
- 괄호가 보조 설명이고, 괄호 밖에 독립적 의미가 있는 경우에만 괄호 제거 가능

⚠️ 절대 분리하면 안 되는 것들:
- "영향을 미치다" → 하나로 유지 (목적어+동사 구문)
- "도움을 주다" → 하나로 유지 (목적어+동사 구문)
- "~을 조사하다" → 하나로 유지 (~패턴)
- "A를 도와주다" → 하나로 유지 (A패턴)

중요: 반드시 JSON 배열 형식으로만 응답하세요.`;

    const userPrompt = `다음 선지 텍스트들을 개별 의미로 분리해주세요:

${JSON.stringify(choicesToProcess)}

⚠️ 괄호 처리 주의사항:
- 괄호 안에 쉼표가 있어도 괄호 내부는 절대 분리하지 마세요
- "(생각, 사실 등이) 드러나다" → 이것은 하나의 의미입니다!
- 괄호가 의미의 문맥을 제공하면 괄호를 포함하여 보존하세요

각 선지를 분석하여 모든 개별 의미들을 하나의 플랫한 배열로 반환해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      const fallbackResult = [...preservedChoices, ...fallbackSplit(choicesToProcess)];
      return new Response(
        JSON.stringify({ splitChoices: sanitizeChoiceList(fallbackResult) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    let splitChoices: string[] = [];
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      }
      splitChoices = JSON.parse(jsonStr);
      
      if (!Array.isArray(splitChoices)) {
        splitChoices = fallbackSplit(choicesToProcess);
      }
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      splitChoices = fallbackSplit(choicesToProcess);
    }
    
    // 보존된 선지와 분리된 선지 합치기
    const allChoices = [...preservedChoices, ...splitChoices];
    
    // 빈 문자열 및 중복 제거, 품사 마커 제거 (괄호는 선택적으로 처리)
    const cleanedChoices = allChoices
      .filter((c: any) => typeof c === 'string' && c.trim().length > 0)
      .map((c: string) => {
        let result = c
          .replace(/^\d+\.\s*/, '')  // 번호 제거
          .replace(/\[([명동형부])\]\s*/g, '');  // 품사 마커 제거
        
        // 괄호 처리: 의미의 일부인 괄호는 보존, 보조 설명만 제거
        result = cleanParentheses(result);
        
        // 대괄호 내용 제거 (품사 마커 외의 대괄호)
        result = result.replace(/\[[^\]]*\]/g, '');
        
        return result.replace(/\s+/g, ' ').trim();
      })
      .filter(c => c.length > 0);
    
    const uniqueChoices = sanitizeChoiceList(cleanedChoices);

    return new Response(
      JSON.stringify({ splitChoices: uniqueChoices }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in split-choices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback 분리 로직 - 괄호 내 쉼표 보존 강화
function fallbackSplit(choices: string[]): string[] {
  const result: string[] = [];
  
  for (const choice of choices) {
    if (!choice || typeof choice !== 'string') continue;
    
    let cleaned = choice.trim();
    
    // 특수 패턴이 있는 경우 분리하지 않고 그대로 보존
    if (hasSpecialPattern(cleaned) || isCompletePhraseToPreserve(cleaned)) {
      cleaned = cleaned
        .replace(/^\d+\.\s*/g, '')
        .replace(/\[([명동형부])\]\s*/g, '');
      cleaned = cleanParentheses(cleaned);
      cleaned = cleaned.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      
      if (cleaned.length > 0) {
        result.push(cleaned);
      }
      continue;
    }
    
    // 번호 제거
    cleaned = cleaned.replace(/^\d+\.\s*/g, '');
    cleaned = cleaned.replace(/\s+\d+\.\s+/g, ', ');
    
    // 품사 마커 제거
    cleaned = cleaned.replace(/\[([명동형부])\]\s*/g, '');
    
    // 괄호 내부 쉼표를 보호하면서 스마트 분리
    const parts = smartSplitByComma(cleaned);
    
    for (const part of parts) {
      let cleanedPart = cleanParentheses(part);
      cleanedPart = cleanedPart.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      
      if (cleanedPart.length > 0) {
        result.push(cleanedPart);
      }
    }
  }
  
  return sanitizeChoiceList(result);
}
