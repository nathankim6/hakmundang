import sys, glob, os, re

def scan(src):
    """소스를 훑어 블록 주석 구간을 찾되, 문자열/정규식 리터럴 안의 /* 는 무시한다."""
    i, n = 0, len(src)
    comments = []
    while i < n:
        c = src[i]
        if c in '"\'`':                       # 문자열 리터럴 건너뛰기
            q = c; i += 1
            while i < n:
                if src[i] == '\\': i += 2; continue
                if src[i] == q: i += 1; break
                i += 1
            continue
        if c == '/' and i+1 < n and src[i+1] == '/':   # 줄 주석
            j = src.find('\n', i)
            i = n if j < 0 else j+1
            continue
        if c == '/' and i+1 < n and src[i+1] == '*':   # 블록 주석
            j = src.find('*/', i+2)
            end = n if j < 0 else j+2
            comments.append((i, end, src[i:end]))
            i = end
            continue
        i += 1
    return comments

CODE = re.compile(r'K\.push\(|exSeg\(|new TableRow|new Paragraph|writeField\(|\bT\(\[')
bad = 0
for f in sorted(sys.argv[1:]):
    src = open(f).read()
    for start, end, body in scan(src):
        if CODE.search(body):
            line = src[:start].count('\n') + 1
            lines = body.count('\n') + 1
            print(f'{f}:{line}  주석이 코드 {lines}줄을 삼킴 → {body[:60].strip()}...')
            bad += 1
print('삼킨 주석 발견:', bad)
