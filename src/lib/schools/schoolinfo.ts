import IDS from "@/data/schoolinfoIds.json";

/**
 * 학교알리미 학교 페이지 주소.
 *
 * 학교알리미는 학교마다 고유 식별자(SHL_IDF_CD)로 페이지를 연다. 이 값은
 * 학교알리미 OpenAPI의 학교 목록(apiType=0)에서 받아 둔 것이라 공식 경로다.
 *
 * '교과별 학업성취 사항'은 보안문자 뒤에 있어 사람이 직접 받아야 한다.
 * 그래서 프로그램은 파일을 대신 받지 않고, 그 화면까지 가는 길만 줄여 준다.
 */
const SCHOOLINFO_IDS = IDS as Record<string, string>;

export function schoolinfoUrl(code: string): string | null {
  const id = SCHOOLINFO_IDS[code];
  return id ? `https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do?SHL_IDF_CD=${id}` : null;
}
