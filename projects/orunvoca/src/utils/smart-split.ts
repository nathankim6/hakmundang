// 괄호 내부의 쉼표를 무시하고 구분자로 분리하는 스마트 스플릿 함수
export const smartSplitIgnoringParens = (text: string, delimiters: RegExp): string[] => {
  const results: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') { parenDepth++; current += char; }
    else if (char === ')') { parenDepth = Math.max(0, parenDepth - 1); current += char; }
    else if (delimiters.test(char) && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) results.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }
  const last = current.trim();
  if (last.length > 0) results.push(last);
  return results;
};

// 괄호가 의미의 핵심 문맥인지 판별
export const hasContextualParentheses = (text: string): boolean => {
  if (/\([^)]*등[이의을를에]\)\s*[가-힣]+/.test(text)) return true;
  if (/\([^)]*[이가]\)\s*[가-힣]+/.test(text)) return true;
  if (/^\(/.test(text.trim())) return true;
  return false;
};

// 괄호 내용을 선택적으로 제거하는 함수
export const cleanParenthesesSmart = (text: string): string => {
  if (hasContextualParentheses(text)) return text;
  return text.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
};

// 품사 단독 단어 (선지가 될 수 없음)
const POS_ONLY = ['동사', '명사', '형용사', '부사', '전치사', '접속사', '대명사', '감탄사', '조동사'];

// 깨진 선지 하나를 정리 (불완전 괄호, 고아 물결표 등)
export const sanitizeChoice = (raw: string): string => {
  if (!raw) return '';
  let t = String(raw).trim();

  // 번호 접두사 / 품사 마커 제거
  t = t.replace(/^\d+[).\]]\s*/, '').replace(/\[([명동형부])\]\s*/g, '').trim();

  // 괄호 짝이 맞지 않으면 괄호 조각 제거
  const open = (t.match(/\(/g) || []).length;
  const close = (t.match(/\)/g) || []).length;
  if (open !== close) {
    t = t.replace(/\([^)]*$/g, '').replace(/^[^(]*\)/g, '').replace(/[()]/g, '').trim();
  }

  // 고아 물결표 정리: "~" 뒤에 조사가 오지 않으면 제거
  t = t.replace(/^~(?![을를에와과이가의로])/, '').trim();
  t = t.replace(/~+$/, '').trim();

  // 잔여 구두점 정리
  t = t.replace(/^[,;·/\-\s]+|[,;·/\-\s]+$/g, '').replace(/\s+/g, ' ').trim();

  return t;
};

// 선지 배열 정리: 깨진 조각/품사 단독/중복 제거
export const sanitizeChoices = (choices: (string | null | undefined)[]): string[] => {
  const out: string[] = [];
  for (const raw of choices || []) {
    const cleaned = sanitizeChoice(raw as string);
    if (!cleaned) continue;
    // 의미 없는 조각 제거
    if (!/[가-힣a-zA-Z]/.test(cleaned)) continue;
    if (cleaned.replace(/[^가-힣a-zA-Z]/g, '').length < 2) continue;
    if (POS_ONLY.includes(cleaned)) continue;
    if (!out.includes(cleaned)) out.push(cleaned);
  }
  return out;
};

// ─────────────────────────────────────────────
// 결정적(deterministic) 의미 분리기
// 괄호 안 내용은 절대 분리하지 않고, 구분자(; , · /)와 번호로만 분리한다.
// ─────────────────────────────────────────────
export const splitMeanings = (raw: string): string[] => {
  if (!raw) return [];

  // 1) 괄호 내용을 토큰으로 보호 (내부 쉼표가 분리되지 않도록)
  const parens: string[] = [];
  let text = String(raw).replace(/\([^()]*\)/g, (m) => {
    parens.push(m);
    return `\u0001${parens.length - 1}\u0001`;
  });

  // 2) 품사 마커는 구분자로 처리 ([명] ... [동] ...)
  text = text.replace(/\[(명|동|형|부|명사|동사|형용사|부사)\]/g, ';');

  // 3) 번호 목록(1. 2. / 1) 2))도 구분자로
  text = text.replace(/(^|\s)\d+[).]\s*/g, ';');

  // 4) 구분자 기준 분리 (괄호는 이미 토큰화됨)
  const parts = text
    .split(/[;,·]|\s\/\s|\//)
    .map((p) => p.trim())
    .filter(Boolean);

  // 5) 괄호 복원 + 정리
  const restored = parts.map((p) =>
    p.replace(/\u0001(\d+)\u0001/g, (_m, i) => parens[Number(i)] || '')
      .replace(/\s+/g, ' ')
      .trim()
  );

  return sanitizeChoices(restored);
};

// AI 분리 결과가 신뢰할 만한지 검증 (괄호 깨짐 / 의미 유실 방지)
export const isValidSplitResult = (original: string[], result: string[]): boolean => {
  if (!Array.isArray(result) || result.length === 0) return false;
  for (const r of result) {
    if (typeof r !== 'string') return false;
    const open = (r.match(/\(/g) || []).length;
    const close = (r.match(/\)/g) || []).length;
    if (open !== close) return false; // 괄호가 깨진 분리
    const stripped = r.replace(/[^가-힣a-zA-Z]/g, '');
    if (stripped.length < 2) return false; // "~" 같은 조각 발생
  }
  return true;
};


