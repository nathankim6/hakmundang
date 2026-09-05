import b2 from "@/assets/covers/b2.json";
import eb from "@/assets/covers/eb.json";
import gi0 from "@/assets/covers/gi0.json";
import gi1 from "@/assets/covers/gi1.json";
import gi2 from "@/assets/covers/gi2.json";
import gz from "@/assets/covers/gz.json";
import m1 from "@/assets/covers/m1.json";
import m2 from "@/assets/covers/m2.json";
import m3 from "@/assets/covers/m3.json";
import n1 from "@/assets/covers/n1.json";
import n2 from "@/assets/covers/n2.json";
import n3 from "@/assets/covers/n3.json";
import p1 from "@/assets/covers/p1.json";
import p2 from "@/assets/covers/p2.json";
import pp from "@/assets/covers/pp.json";
import pt1 from "@/assets/covers/pt1.json";
import pt2 from "@/assets/covers/pt2.json";

export const COVERS: Record<string, string> = {
  b2: b2.url,
  eb: eb.url,
  gi0: gi0.url,
  gi1: gi1.url,
  gi2: gi2.url,
  gz: gz.url,
  m1: m1.url,
  m2: m2.url,
  m3: m3.url,
  n1: n1.url,
  n2: n2.url,
  n3: n3.url,
  p1: p1.url,
  p2: p2.url,
  pp: pp.url,
  pt1: pt1.url,
  pt2: pt2.url,
};

export const coverUrl = (id: string): string | undefined => COVERS[id];
