import pymupdf, sys
f=sys.argv[1]
d=pymupdf.open(f)
TOP,BOT=52,792     # pt, below header rule / above footer rule
for i in range(d.page_count):
    pg=d[i]
    pix=pg.get_pixmap(matrix=pymupdf.Matrix(1,1), colorspace=pymupdf.csGRAY)
    w,h,s=pix.width,pix.height,pix.samples
    end=TOP
    for y in range(min(h,BOT), TOP, -1):
        row=s[y*w:(y+1)*w]
        dark=sum(1 for v in row if v<244)
        if dark>4: end=y; break
    pc=100*(end-TOP)/(BOT-TOP)
    print(f"p{i+1:>2}  {end-TOP:>4}/{BOT-TOP}  {pc:>5.1f}%  {'#'*int(pc/3)}")
