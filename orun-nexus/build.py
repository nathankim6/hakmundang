# -*- coding: utf-8 -*-
"""ORUN NEXUS UNIVERSE 조립기.

src/head.html + src/body.html + data/{grammar,reading,vocab}.json + src/engine.js
→ ORUN_NEXUS_UNIVERSE.html (자기완결 단일 파일)

데이터를 고치면 data/gen_*.py 를 돌린 뒤 이 스크립트를 다시 돌린다.
grammar.json 은 원본 넥서스에서 그대로 뽑은 것이라 재생성하지 않는다.
"""
import io, os

HERE = os.path.dirname(os.path.abspath(__file__))


def read(*parts):
    with io.open(os.path.join(HERE, *parts), encoding="utf-8") as f:
        return f.read()


def main():
    head = read("src", "head.html")
    body = read("src", "body.html")
    engine = read("src", "engine.js")

    blobs = []
    for gid, fname in (("grammar", "grammar.json"),
                       ("reading", "reading.json"),
                       ("vocab", "vocab.json")):
        raw = read("data", fname).strip()
        # </script> 가 데이터 안에 나타나면 조기 종료된다 — JSON 문자열 안에서도
        # < 이스케이프는 동일한 값이므로 안전하게 눌러 둔다.
        raw = raw.replace("</", "<\\/")
        blobs.append('<script type="application/json" id="nexus-data-%s">%s</script>' % (gid, raw))

    out = (head.rstrip() + "\n\n"
           + body.rstrip() + "\n\n"
           + "\n".join(blobs) + "\n"
           + "<script>\n" + engine.rstrip() + "\n</script>\n")

    dest = os.path.join(HERE, "ORUN_NEXUS_UNIVERSE.html")
    with io.open(dest, "w", encoding="utf-8") as f:
        f.write(out)
    print("built:", dest, "%.2f MB" % (os.path.getsize(dest) / 1048576.0))


if __name__ == "__main__":
    main()
