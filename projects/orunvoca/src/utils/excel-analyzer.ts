interface ExcelColumn {
  index: number;
  type: 'day' | 'word' | 'meaning' | 'example' | 'number' | 'englishDefinition' | 'wordType' | 'synonym1' | 'synonym1Meaning' | 'synonym2' | 'synonym2Meaning' | 'synonym3' | 'synonym3Meaning' | 'antonym1' | 'antonym1Meaning' | 'antonym2' | 'antonym2Meaning' | 'antonym3' | 'antonym3Meaning' | 'unknown';
  confidence: number;
  samples: string[];
}

// CSV 헤더 매핑 (17헤더 형식)
const CSV_HEADER_MAPPING: Record<string, string> = {
  'day': 'day',
  '유형': 'wordType',
  '단어': 'word',
  '뜻': 'meaning',
  '예문': 'example',
  '영영풀이': 'englishDefinition',
  '동의어1': 'synonym1',
  '동의어1뜻': 'synonym1Meaning',
  '동의어2': 'synonym2',
  '동의어2뜻': 'synonym2Meaning',
  '동의어3': 'synonym3',
  '동의어3뜻': 'synonym3Meaning',
  '반의어1': 'antonym1',
  '반의어1뜻': 'antonym1Meaning',
  '반의어2': 'antonym2',
  '반의어2뜻': 'antonym2Meaning',
  '반의어3': 'antonym3',
  '반의어3뜻': 'antonym3Meaning',
};

interface AnalysisResult {
  columnMapping: Record<string, number>;
  rowStartIndex: number;
  confidence: number;
  detectedStructure: string;
}

export class ExcelAnalyzer {
  // 영어 단어 패턴 개선 (옳은보카, 능률 고교필수2000 대응)
  private static isEnglishWord(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const cleaned = text.trim();
    
    // 공백이나 특수문자만 있는 경우 제외
    if (!/[a-zA-Z]/.test(cleaned)) return false;
    
    // 주로 영어로 구성되고, 한국어가 섞여있지 않은 경우
    // 옳은보카 표제어: "breathe in", "check in", "come along" 등
    // 능률 교재의 단어 형태: "ability", "able", "about" 등
    return /^[a-zA-Z][a-zA-Z\s\-'.,()+]*[a-zA-Z]?$/.test(cleaned) && 
           !(/[가-힣]/.test(cleaned)) && // 한국어 포함 시 제외
           cleaned.split(/\s+/).length <= 10; // 구동사/숙어 포함하여 최대 10개 요소
  }

  // 한국어 뜻 패턴 개선 (능률 교재 형태 대응)
  private static isKoreanMeaning(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const cleaned = text.trim();
    
    // 한국어가 포함되어 있어야 함
    if (!/[가-힣]/.test(cleaned)) return false;
    
    // 능률 교재 뜻 패턴: "능력", "할 수 있는", "~에 대하여" 등
    return (
      // 기본 한국어 단어/구문
      /[가-힣]/.test(cleaned) && 
      (
        // 일반적인 뜻 패턴
        cleaned.includes(',') || cleaned.includes(';') || cleaned.includes('·') ||
        cleaned.includes('하다') || cleaned.includes('되다') || cleaned.includes('이다') ||
        cleaned.includes('~') || cleaned.includes('…') ||
        // 품사 표시 포함
        /\([가-힣]+\)/.test(cleaned) ||
        // 한국어 길이가 충분한 경우
        cleaned.length >= 2
      )
    );
  }

  // 예문 패턴 개선
  private static isEnglishExample(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    
    // 영어가 포함되어야 하고, 문장 형태여야 함
    return /[a-zA-Z]/.test(trimmed) && 
           trimmed.split(/\s+/).length >= 3 && // 최소 3개 단어
           (
             // 문장부호로 끝나거나
             /[.!?]$/.test(trimmed) ||
             // 대문자로 시작하는 긴 텍스트
             (/^[A-Z]/.test(trimmed) && trimmed.length > 10) ||
             // 영어 단어가 많이 포함된 긴 텍스트  
             (trimmed.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word)).length >= 3)
           );
  }

  // Day/번호 패턴 개선 (옳은보카, 능률 교재 대응)
  private static isDayOrNumber(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.toString().trim();
    
    // 다양한 Day 형식과 번호 형식 지원
    // 옳은보카: "DAY 01", "DAY 02" 등
    return /^(day\s*\d+|DAY\s*\d+|Day\s*\d+|\d+일차?|\d+차시?|단원\s*\d+|UNIT\s*\d+|Unit\s*\d+|\d+)$/i.test(trimmed) ||
           /^\d+$/.test(trimmed) ||
           /^제\s*\d+.*[과장]$/.test(trimmed); // "제1과", "제1장" 등
  }

  // 컬럼 타입 분석
  private static analyzeColumn(values: any[], columnIndex: number): ExcelColumn {
    const samples = values
      .filter(val => val != null && val !== '')
      .map(val => val.toString().trim())
      .slice(0, 10); // 처음 10개 샘플만 분석

    if (samples.length === 0) {
      return {
        index: columnIndex,
        type: 'unknown',
        confidence: 0,
        samples: []
      };
    }

    // 각 타입별 점수 계산 (능률 교재 최적화)
    const scores = {
      day: 0,
      word: 0,
      meaning: 0,
      example: 0,
      number: 0
    };

    samples.forEach(sample => {
      if (this.isDayOrNumber(sample)) {
        scores.day += 1.0; // Day 감지 가중치 증가
        scores.number += 0.8;
      }
      if (this.isEnglishWord(sample)) {
        scores.word += 1.2; // 영어 단어 가중치 증가
      }
      if (this.isKoreanMeaning(sample)) {
        scores.meaning += 1.2; // 한국어 뜻 가중치 증가
      }
      if (this.isEnglishExample(sample)) {
        scores.example += 1.0;
      }
      
      // 추가 휴리스틱: 컬럼 위치 기반 가중치
      if (columnIndex === 0 && this.isDayOrNumber(sample)) {
        scores.day += 0.5; // 첫 번째 컬럼은 Day일 확률 높음
      }
      if (columnIndex === 1 && this.isEnglishWord(sample)) {
        scores.word += 0.3; // 두 번째 컬럼은 단어일 확률 높음
      }
      if (columnIndex === 2 && this.isKoreanMeaning(sample)) {
        scores.meaning += 0.3; // 세 번째 컬럼은 뜻일 확률 높음
      }
    });

    // 가장 높은 점수의 타입 선택 (임계값 낮춤)
    const maxScore = Math.max(...Object.values(scores));
    const detectedType = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as keyof typeof scores;

    return {
      index: columnIndex,
      type: maxScore > 0.2 ? detectedType : 'unknown', // 임계값을 0.3에서 0.2로 낮춤
      confidence: maxScore / samples.length,
      samples: samples.slice(0, 3)
    };
  }

  // 헤더 행 감지 (옳은보카 양식 추가)
  private static detectHeaderRow(data: any[][]): { rowIndex: number; headerMapping: Record<string, number> | null } {
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // CSV 17헤더 형식 감지
      const headerMapping = this.detectCSVHeaders(row);
      if (headerMapping && Object.keys(headerMapping).length >= 3) {
        return { rowIndex: i + 1, headerMapping };
      }

      const hasHeaderKeywords = row.some(cell => {
        if (!cell) return false;
        const text = cell.toString().toLowerCase();
        return text.includes('단어') || text.includes('word') || 
               text.includes('뜻') || text.includes('meaning') ||
               text.includes('예문') || text.includes('example') ||
               text.includes('day') || text.includes('날짜') ||
               text.includes('표제어') || text.includes('의미') ||
               text.includes('유형') || text.includes('번호');
      });

      if (hasHeaderKeywords) return { rowIndex: i + 1, headerMapping: null }; // 다음 행부터 데이터
    }

    // 헤더가 명확하지 않으면 첫 번째 행을 데이터로 가정
    return { rowIndex: 0, headerMapping: null };
  }

  // CSV 17헤더 형식 감지
  private static detectCSVHeaders(row: any[]): Record<string, number> | null {
    const mapping: Record<string, number> = {};
    
    row.forEach((cell, index) => {
      if (!cell) return;
      const headerText = cell.toString().trim().toLowerCase();
      
      // 정확한 헤더 매칭
      Object.entries(CSV_HEADER_MAPPING).forEach(([koreanHeader, englishKey]) => {
        if (headerText === koreanHeader.toLowerCase()) {
          mapping[englishKey] = index;
        }
      });
    });

    // 최소 day, word, meaning이 있어야 유효한 CSV 형식으로 간주
    if (mapping.day !== undefined && mapping.word !== undefined && mapping.meaning !== undefined) {
      return mapping;
    }
    
    return null;
  }

  // 메인 분석 함수
  public static analyzeExcelStructure(data: any[][]): AnalysisResult {
    if (!data || data.length === 0) {
      throw new Error('Excel 데이터가 비어있습니다.');
    }

    // 헤더 행 감지
    const { rowIndex: dataStartRow, headerMapping } = this.detectHeaderRow(data);
    const actualData = data.slice(dataStartRow);

    if (actualData.length === 0) {
      throw new Error('분석할 데이터가 없습니다.');
    }

    // CSV 헤더 매핑이 있으면 바로 사용
    if (headerMapping) {
      return {
        columnMapping: headerMapping,
        rowStartIndex: dataStartRow,
        confidence: 1.0,
        detectedStructure: 'CSV 17헤더 형식 감지됨'
      };
    }

    // 각 컬럼 분석
    const maxColumns = Math.max(...actualData.map(row => row ? row.length : 0));
    const columns: ExcelColumn[] = [];

    for (let col = 0; col < maxColumns; col++) {
      const columnValues = actualData
        .map(row => row && row[col] !== undefined ? row[col] : null)
        .filter(val => val !== null);

      if (columnValues.length > 0) {
        columns.push(this.analyzeColumn(columnValues, col));
      }
    }

    // 컬럼 매핑 생성
    const columnMapping: Record<string, number> = {};
    const typeToColumn: Record<string, ExcelColumn[]> = {};

    // 타입별 컬럼 그룹화
    columns.forEach(col => {
      if (col.type !== 'unknown') {
        if (!typeToColumn[col.type]) {
          typeToColumn[col.type] = [];
        }
        typeToColumn[col.type].push(col);
      }
    });

    // 가장 신뢰도 높은 컬럼 선택
    Object.entries(typeToColumn).forEach(([type, cols]) => {
      const bestColumn = cols.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      columnMapping[type] = bestColumn.index;
    });

    // 필수 컬럼 확인 (word, meaning)
    if (!columnMapping.word || !columnMapping.meaning) {
      // 폴백: 휴리스틱 방법으로 재시도
      const fallbackMapping = this.fallbackAnalysis(actualData);
      Object.assign(columnMapping, fallbackMapping);
    }

    // 신뢰도 계산
    const confidence = columns
      .filter(col => col.type !== 'unknown')
      .reduce((sum, col) => sum + col.confidence, 0) / columns.length;

    // 구조 설명 생성
    const detectedStructure = this.generateStructureDescription(columnMapping, columns);

    return {
      columnMapping,
      rowStartIndex: dataStartRow,
      confidence,
      detectedStructure
    };
  }

  // 폴백 분석 (능률 교재 형태 최적화)
  private static fallbackAnalysis(data: any[][]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    if (data.length === 0) return mapping;

    // 여러 행을 샘플링하여 더 정확한 분석
    const sampleRows = data.slice(0, Math.min(5, data.length)).filter(row => row && row.length > 0);
    if (sampleRows.length === 0) return mapping;

    const maxColumns = Math.max(...sampleRows.map(row => row.length));
    
    // 각 컬럼별 점수 계산
    for (let col = 0; col < maxColumns; col++) {
      const columnSamples = sampleRows
        .map(row => row[col])
        .filter(val => val != null && val !== '')
        .map(val => val.toString().trim())
        .slice(0, 5);

      if (columnSamples.length === 0) continue;

      // 컬럼별 타입 점수
      const scores = {
        day: 0,
        word: 0,
        meaning: 0,
        example: 0
      };

      columnSamples.forEach(sample => {
        if (this.isDayOrNumber(sample)) scores.day += 1;
        if (this.isEnglishWord(sample)) scores.word += 1;
        if (this.isKoreanMeaning(sample)) scores.meaning += 1;
        if (this.isEnglishExample(sample)) scores.example += 1;
      });

      // 가장 높은 점수의 타입을 해당 컬럼에 할당
      const maxScore = Math.max(...Object.values(scores));
      if (maxScore > 0) {
        const bestType = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
        if (bestType && !mapping[bestType]) {
          mapping[bestType] = col;
        }
      }
    }

    // 필수 컬럼이 없는 경우 기본 매핑 시도
    if (!mapping.word || !mapping.meaning) {
      for (let col = 0; col < maxColumns; col++) {
        const firstSample = sampleRows[0]?.[col]?.toString().trim();
        if (!firstSample) continue;

        if (!mapping.word && this.isEnglishWord(firstSample)) {
          mapping.word = col;
        } else if (!mapping.meaning && this.isKoreanMeaning(firstSample)) {
          mapping.meaning = col;
        }
      }
    }

    return mapping;
  }

  // 구조 설명 생성
  private static generateStructureDescription(
    mapping: Record<string, number>, 
    columns: ExcelColumn[]
  ): string {
    const descriptions = [];
    
    Object.entries(mapping).forEach(([type, index]) => {
      const column = columns.find(col => col.index === index);
      const typeName = {
        day: 'Day/번호',
        word: '영어 단어',
        meaning: '한국어 뜻',
        example: '영어 예문',
        number: '번호'
      }[type] || type;
      
      descriptions.push(`${index + 1}열: ${typeName}${column ? ` (신뢰도: ${Math.round(column.confidence * 100)}%)` : ''}`);
    });

    return descriptions.length > 0 ? descriptions.join(', ') : '구조를 자동 감지하지 못했습니다';
  }

  // 추출된 영어 예문 정리
  public static extractEnglishSentence(text: string): string | undefined {
    if (!text) return undefined;
    
    console.log('Processing example text:', text);
    
    // 문장 단위로 분리
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      // 영어 문장 확인 (영어 글자 포함, 최소 3단어, 순한국어가 아님)
      if (/[a-zA-Z]/.test(sentence) && 
          sentence.split(' ').length >= 3 && 
          !/^[가-힣\s]+$/.test(sentence)) {
        const result = sentence.trim() + '.';
        console.log('Extracted English sentence:', result);
        return result;
      }
    }
    
    // 명확한 영어 문장을 찾지 못한 경우 영어 패턴 매칭 시도
    const englishMatch = text.match(/[A-Z][a-zA-Z\s'",.-]*[.!?]/);
    const result = englishMatch ? englishMatch[0].trim() : undefined;
    console.log('English match result:', result);
    return result;
  }
}