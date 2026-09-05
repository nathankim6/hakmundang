-- 임시로 기존 잘못된 데이터 삭제
DELETE FROM card_sets WHERE title = '능률 고교필수2000';

-- 올바른 구조의 MD보카 수능 단어장 생성
INSERT INTO card_sets (title, description, test_type, word_data, selected_days, include_derivatives) VALUES 
('MD보카 수능 단어장', 'MD보카 수능 핵심 단어 모음', 'meaning', '[
  {"word": "abandon", "meaning": "버리다, 포기하다", "day": "Day 01", "number": 1},
  {"word": "abide", "meaning": "참다, 견디다", "day": "Day 01", "number": 2},
  {"word": "abolish", "meaning": "폐지하다", "day": "Day 01", "number": 3},
  {"word": "absorb", "meaning": "흡수하다", "day": "Day 01", "number": 4},
  {"word": "abstract", "meaning": "추상적인", "day": "Day 01", "number": 5},
  {"word": "abundant", "meaning": "풍부한", "day": "Day 01", "number": 6},
  {"word": "academic", "meaning": "학문의", "day": "Day 01", "number": 7},
  {"word": "accelerate", "meaning": "가속하다", "day": "Day 01", "number": 8},
  {"word": "accept", "meaning": "받아들이다", "day": "Day 01", "number": 9},
  {"word": "access", "meaning": "접근", "day": "Day 01", "number": 10},
  {"word": "accommodate", "meaning": "수용하다", "day": "Day 02", "number": 1},
  {"word": "accomplish", "meaning": "성취하다", "day": "Day 02", "number": 2},
  {"word": "accord", "meaning": "일치", "day": "Day 02", "number": 3},
  {"word": "accurate", "meaning": "정확한", "day": "Day 02", "number": 4},
  {"word": "accuse", "meaning": "비난하다", "day": "Day 02", "number": 5},
  {"word": "achieve", "meaning": "달성하다", "day": "Day 02", "number": 6},
  {"word": "acquire", "meaning": "얻다", "day": "Day 02", "number": 7},
  {"word": "adapt", "meaning": "적응하다", "day": "Day 02", "number": 8},
  {"word": "adequate", "meaning": "적절한", "day": "Day 02", "number": 9},
  {"word": "adjacent", "meaning": "인접한", "day": "Day 02", "number": 10}
]'::jsonb, ARRAY['01', '02'], true);

-- 올바른 구조의 능률 고교필수2000 단어장 생성 (표제어와 파생어 포함)
INSERT INTO card_sets (title, description, test_type, word_data, selected_days, include_derivatives) VALUES 
('능률 고교필수2000', '능률 출판사 고등학교 필수 2000 단어', 'meaning', '[
  {"word": "fair", "meaning": "공정한", "day": "Day 01", "number": 1, "type": "표제어"},
  {"word": "fairly", "meaning": "공정하게", "day": "Day 01", "number": 1, "type": "파생어"},
  {"word": "fairness", "meaning": "공정함", "day": "Day 01", "number": 1, "type": "파생어"},
  {"word": "attempt", "meaning": "시도하다", "day": "Day 01", "number": 2, "type": "표제어"},
  {"word": "merely", "meaning": "단지", "day": "Day 01", "number": 3, "type": "표제어"},
  {"word": "mere", "meaning": "단순한", "day": "Day 01", "number": 3, "type": "파생어"},
  {"word": "comfort", "meaning": "편안함", "day": "Day 01", "number": 4, "type": "표제어"},
  {"word": "comfortable", "meaning": "편안한", "day": "Day 01", "number": 4, "type": "파생어"},
  {"word": "comfortingly", "meaning": "위로가 되게", "day": "Day 01", "number": 4, "type": "파생어"},
  {"word": "import", "meaning": "수입하다", "day": "Day 01", "number": 5, "type": "표제어"},
  {"word": "importer", "meaning": "수입업자", "day": "Day 01", "number": 5, "type": "파생어"},
  {"word": "importable", "meaning": "수입할 수 있는", "day": "Day 01", "number": 5, "type": "파생어"},
  {"word": "register", "meaning": "등록하다", "day": "Day 01", "number": 6, "type": "표제어"},
  {"word": "registration", "meaning": "등록", "day": "Day 01", "number": 6, "type": "파생어"},
  {"word": "accuse", "meaning": "비난하다", "day": "Day 01", "number": 7, "type": "표제어"},
  {"word": "accusation", "meaning": "비난", "day": "Day 01", "number": 7, "type": "파생어"},
  {"word": "include", "meaning": "포함하다", "day": "Day 01", "number": 8, "type": "표제어"},
  {"word": "inclusion", "meaning": "포함", "day": "Day 01", "number": 8, "type": "파생어"},
  {"word": "including", "meaning": "~을 포함하여", "day": "Day 01", "number": 8, "type": "파생어"},
  {"word": "exclude", "meaning": "제외하다", "day": "Day 01", "number": 9, "type": "표제어"},
  {"word": "exclusion", "meaning": "제외", "day": "Day 01", "number": 9, "type": "파생어"},
  {"word": "approach", "meaning": "접근하다", "day": "Day 01", "number": 10, "type": "표제어"},
  {"word": "reliable", "meaning": "신뢰할 수 있는", "day": "Day 01", "number": 11, "type": "표제어"},
  {"word": "rely", "meaning": "의존하다", "day": "Day 01", "number": 11, "type": "파생어"},
  {"word": "reliance", "meaning": "의존", "day": "Day 01", "number": 11, "type": "파생어"},
  {"word": "locate", "meaning": "위치를 찾다", "day": "Day 01", "number": 12, "type": "표제어"},
  {"word": "location", "meaning": "위치", "day": "Day 01", "number": 12, "type": "파생어"},
  {"word": "celebrity", "meaning": "유명인", "day": "Day 01", "number": 13, "type": "표제어"},
  {"word": "handle", "meaning": "다루다", "day": "Day 01", "number": 14, "type": "표제어"},
  {"word": "aware", "meaning": "알고 있는", "day": "Day 01", "number": 15, "type": "표제어"},
  {"word": "awareness", "meaning": "인식", "day": "Day 01", "number": 15, "type": "파생어"},
  {"word": "commit", "meaning": "범하다, 헌신하다", "day": "Day 02", "number": 1, "type": "표제어"},
  {"word": "commitment", "meaning": "헌신", "day": "Day 02", "number": 1, "type": "파생어"},
  {"word": "hence", "meaning": "따라서", "day": "Day 02", "number": 2, "type": "표제어"},
  {"word": "assert", "meaning": "주장하다", "day": "Day 02", "number": 3, "type": "표제어"},
  {"word": "assertion", "meaning": "주장", "day": "Day 02", "number": 3, "type": "파생어"},
  {"word": "distribute", "meaning": "분배하다", "day": "Day 02", "number": 4, "type": "표제어"},
  {"word": "distribution", "meaning": "분배", "day": "Day 02", "number": 4, "type": "파생어"},
  {"word": "steep", "meaning": "가파른", "day": "Day 02", "number": 5, "type": "표제어"},
  {"word": "steeply", "meaning": "가파르게", "day": "Day 02", "number": 5, "type": "파생어"},
  {"word": "former", "meaning": "이전의", "day": "Day 02", "number": 6, "type": "표제어"},
  {"word": "latter", "meaning": "후자의", "day": "Day 02", "number": 7, "type": "표제어"}
]'::jsonb, ARRAY['01', '02'], true);