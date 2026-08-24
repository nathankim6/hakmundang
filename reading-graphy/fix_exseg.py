"""'먼저 보기' 표의 칸 폭을 재배분한다 — 행 합계는 그대로 두고 단어 잘림만 없앤다.

여유가 있는 칸에서 폭을 걷어 좁은 칸에 준다. 어떤 칸도 '단어잘림한계' 아래로는 내리지 않는다.
"""
import sys, os, re
from exseg_lib import parse, hard_need, soft_need

def rebalance(widths, cells):
    n = len(cells)
    hard = [hard_need(c['text'], c['bold'], c['bordered']) for c in cells]
    soft = [soft_need(c['text'], c['bold'], c['bordered']) for c in cells]
    total = sum(widths)
    if sum(hard) > total:
        return None, hard, total          # 물리적으로 불가능
    new = [max(w, h) for w, h in zip(widths, hard)]
    over = sum(new) - total
    # 1차: soft를 넘는 여유부터 걷는다 (전체가 한 줄에 들어가고도 남는 폭)
    for cap in (soft, hard):
        if over <= 0:
            break
        slack = [max(0, new[i] - max(cap[i], hard[i])) for i in range(n)]
        pool = sum(slack)
        if pool <= 0:
            continue
        take = min(over, pool)
        for i in range(n):
            if slack[i] <= 0:
                continue
            cut = round(take * slack[i] / pool)
            cut = min(cut, slack[i])
            new[i] -= cut
            over -= cut
    # 반올림 잔차는 여유가 가장 큰 칸에서 정리
    i = max(range(n), key=lambda k: new[k] - hard[k])
    new[i] -= over
    assert sum(new) == total and all(new[k] >= hard[k] for k in range(n))
    return new, hard, total

changed = infeasible = 0
for f in sorted(sys.argv[1:]):
    src = open(f).read()
    p = parse(src)
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    if not p:
        print(f'{tag}: 파싱 실패'); continue
    m, widths, cells = p
    if all(c['w'] >= hard_need(c['text'], c['bold'], c['bordered']) for c in cells):
        continue
    new, hard, total = rebalance(widths, cells)
    if new is None:
        print(f'{tag}: 재배분 불가 (필요 {sum(hard)} > 행 폭 {total})'); infeasible += 1; continue
    # 폭 인자를 위치 기반으로 교체한다(라벨 중복·topMark 인자 유무와 무관하게 정확).
    from exseg_lib import CALL
    body = m.group(4)
    spans = [(mm.start(5), mm.end(5)) for mm in CALL.finditer(body)]
    assert len(spans) == len(new), (tag, len(spans), len(new))
    for (a, b), nw in sorted(zip(spans, new), reverse=True):
        body = body[:a] + str(nw) + body[b:]
    head = m.group(1) + ', '.join(str(x) for x in new) + m.group(3)
    src = src[:m.start()] + head + body + src[m.end():]
    open(f, 'w').write(src)
    print(f'{tag}: {widths} → {new}')
    changed += 1
print(f'수정 {changed}건, 불가 {infeasible}건')
