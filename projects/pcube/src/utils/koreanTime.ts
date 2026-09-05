/**
 * Korean Standard Time (KST, UTC+9) 유틸리티
 * 앱 전체에서 한국 시간 기준으로 날짜/시간을 처리합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 현재 한국 시간을 Date 객체로 반환합니다.
 * 주의: 반환된 Date의 getFullYear/getMonth/getDate 등은 KST 기준 값입니다.
 */
export function getKSTNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + KST_OFFSET_MS);
}

/**
 * 현재 한국 시간을 "yyyy-MM-dd" 형식의 문자열로 반환합니다.
 */
export function getKSTDateString(date?: Date): string {
  const d = date ? toKST(date) : getKSTNow();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 주어진 Date를 KST 기준 Date 객체로 변환합니다.
 */
export function toKST(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + KST_OFFSET_MS);
}

/**
 * 현재 KST 기준 ISO 문자열을 반환합니다 (DB 저장용).
 * 실제 UTC ISO 문자열을 반환하므로 DB 저장 시 사용합니다.
 */
export function getKSTISOString(): string {
  return new Date().toISOString();
}

/**
 * KST 기준 오늘 자정의 Date 객체를 반환합니다.
 */
export function getKSTToday(): Date {
  const kst = getKSTNow();
  kst.setHours(0, 0, 0, 0);
  return kst;
}

/**
 * KST 기준으로 toLocaleDateString을 호출합니다.
 */
export function formatKSTLocale(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    ...options,
    timeZone: 'Asia/Seoul',
  });
}

/**
 * KST 기준으로 toLocaleString을 호출합니다.
 */
export function formatKSTLocaleDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ko-KR', {
    ...options,
    timeZone: 'Asia/Seoul',
  });
}
