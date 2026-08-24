"""완성된 PDF에서 유닛별 면 구간을 잡아 필수 구역이 모두 인쇄됐는지 확인한다."""
import subprocess, re, sys

FULL = ["독해", "핵심구문", "구문 훈련", "구문분석", "ORUN FLOW", "분석 Tip",
        "먼저 보기", "문장에 직접 표시", "READ RIGHT", "한 줄 해석",
        "소재와 핵심어 찾기", "글의 흐름 잡기", "주제문 만들기", "요약문 완성",
        "같은 뜻 찾기", "Knowledge Bank", "RE:RIGHT", "True / False",
        "순서 잡기", "영영풀이 매칭", "어법 기초", "빈칸 클로즈",
        "우리말 해석 쓰기", "조건 영작"]
SHORT = ["독해", "핵심구문", "구문 훈련", "구문분석", "ORUN FLOW", "분석 Tip",
         "먼저 보기", "문장에 직접 표시", "READ RIGHT", "한 줄 해석",
         "소재와 핵심어 찾기", "RE:RIGHT", "True / False", "순서 잡기"]

def norm(s):
    return re.sub(r'\s+', ' ', s)

def main(pdf, label):
    txt = subprocess.run(['pdftotext', pdf, '-'], capture_output=True, text=True).stdout
    pages = txt.split('\f')
    bad = 0
    for n in range(1, 37):
        full = (n - 1) % 3 == 0
        start = sum(10 if (u - 1) % 3 == 0 else 5 for u in range(1, n))
        span = 10 if full else 5
        body = norm(' '.join(pages[start:start + span]))
        miss = [m for m in (FULL if full else SHORT) if m not in body]
        if miss:
            print(f'{label} UNIT {n:02d} (p{start+1}-{start+span}): 누락 → {" · ".join(miss)}')
            bad += 1
    print(f'{label}: 본문 누락 유닛 {bad}건')

main(sys.argv[1], sys.argv[2])
