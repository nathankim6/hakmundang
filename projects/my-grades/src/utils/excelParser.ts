import * as XLSX from 'xlsx';
import { StudentScore, QuestionAnswer, StudentAnswers } from '@/types/report';

export function getScoreClass(score: number, max: number): string {
  return 'text-foreground font-semibold';
}

export function calculateAverage(student: StudentScore): number {
  const scores = [student.vocabulary, student.grammar, student.reading, student.writing].filter(s => s > 0);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

type SheetType = 'vocabulary' | 'vocabulary_score' | 'grammar' | 'reading' | 'writing_array' | 'writing_conditional' | 'unknown';

interface QuestionMeta {
  questionNumber: number;
  questionType: string;
  isSubjective: boolean;
  colIndex: number; // 엑셀 열 인덱스
}

function detectSheetType(sheetName: string): SheetType {
  const normalized = sheetName.toLowerCase().trim();
  
  console.log(`[detectSheetType] Analyzing sheet: "${sheetName}" -> normalized: "${normalized}"`);
  
  // Check for level-specific sheets first (these contain student data)
  // Support various formats: (L1), (L2), (L3), L1, L2, L3, etc.
  if (normalized.match(/독해.*[(\[]?l?[123][)\]]?/i) || normalized.includes('독해(l1)') || normalized.includes('독해(l2)') || normalized.includes('독해(l3)')) {
    console.log(`[detectSheetType] -> reading (level-specific)`);
    return 'reading';
  }
  if (normalized.match(/문법.*[(\[]?l?[123][)\]]?/i) || normalized.includes('문법(l1)') || normalized.includes('문법(l2)') || normalized.includes('문법(l3)')) {
    console.log(`[detectSheetType] -> grammar (level-specific)`);
    return 'grammar';
  }
  // 배열영작 시트 감지
  if (normalized.includes('배열영작')) {
    console.log(`[detectSheetType] -> writing_array`);
    return 'writing_array';
  }
  // 조건영작 시트 감지
  if (normalized.includes('조건영작')) {
    console.log(`[detectSheetType] -> writing_conditional`);
    return 'writing_conditional';
  }
  // 일반 영작 시트 (배열/조건이 합쳐진 경우)
  if (normalized.match(/영작.*[(\[]?l?[123][)\]]?/i) || normalized.includes('영작(l1)') || normalized.includes('영작(l2)') || normalized.includes('영작(l3)')) {
    console.log(`[detectSheetType] -> writing_array (general writing sheet)`);
    return 'writing_array';
  }
  
  // 어휘 시트 감지: 옳은보카4, 옳은보카5, 옳은보카6, 또는 어휘100 등
  if (normalized.includes('옳은보카') || (normalized.includes('어휘') && normalized.match(/100/))) {
    console.log(`[detectSheetType] -> vocabulary_score`);
    return 'vocabulary_score';
  }
  // Skip other vocabulary sheets (like 어휘20) - they don't contain final scores
  if (normalized.includes('어휘')) {
    console.log(`[detectSheetType] -> unknown (non-score vocabulary sheet)`);
    return 'unknown';
  }
  
  // General checks (without level suffix - these are usually metadata sheets)
  if (normalized === '독해' || normalized === '문법' || normalized === '영작') {
    console.log(`[detectSheetType] -> unknown (metadata sheet)`);
    return 'unknown';
  }
  
  // Final fallback checks
  if (normalized.includes('문법')) {
    console.log(`[detectSheetType] -> grammar (fallback)`);
    return 'grammar';
  }
  if (normalized.includes('독해')) {
    console.log(`[detectSheetType] -> reading (fallback)`);
    return 'reading';
  }
  if (normalized.includes('영작')) {
    console.log(`[detectSheetType] -> writing_array (fallback)`);
    return 'writing_array';
  }
  
  console.log(`[detectSheetType] -> unknown`);
  return 'unknown';
}

// 메타데이터 시트 ("문법", "독해")에서 레벨별 문제 유형 매핑 추출
// 구조: 문제번호 | L1 | L2 | L3
type LevelTypeMap = Record<string, string[]>; // e.g., { "L1": ["부정사", "부정사", ...], "L2": [...] }

function parseMetadataSheet(sheet: XLSX.WorkSheet): LevelTypeMap {
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | undefined)[][];
  const result: LevelTypeMap = {};
  
  if (jsonData.length < 2) return result;
  
  // Find header row with L1, L2, L3
  let headerRow = -1;
  const levelCols: Record<string, number> = {}; // "L1" → col index
  
  for (let r = 0; r < Math.min(5, jsonData.length); r++) {
    const row = jsonData[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = row[c]?.toString()?.trim()?.toUpperCase() || '';
      if (val.match(/^L[123]$/)) {
        levelCols[val] = c;
        headerRow = r;
      }
    }
    if (Object.keys(levelCols).length >= 2) break;
  }
  
  if (headerRow < 0 || Object.keys(levelCols).length === 0) return result;
  
  // Initialize arrays
  for (const level of Object.keys(levelCols)) {
    result[level] = [];
  }
  
  // Parse question type rows (Q1, Q2, ...)
  for (let r = headerRow + 1; r < jsonData.length; r++) {
    const row = jsonData[r];
    if (!row) continue;
    
    // Check if first column has a question number pattern (Q1, Q2, 1, 2, etc.)
    const firstVal = row[0]?.toString()?.trim() || '';
    if (!firstVal.match(/^(Q?\d+)$/i) && !firstVal.match(/^\d+$/)) continue;
    
    for (const [level, col] of Object.entries(levelCols)) {
      const typeVal = row[col]?.toString()?.trim() || '';
      result[level].push(typeVal);
    }
  }
  
  console.log(`[parseMetadataSheet] Parsed level types:`, Object.entries(result).map(([k, v]) => `${k}: ${v.length} types`));
  return result;
}

// 시트 이름에서 레벨 추출 (e.g., "문법(L1)" → "L1", "독해(L2)" → "L2")
function extractLevelFromSheetName(sheetName: string): string | null {
  const match = sheetName.match(/[(\[]?(L[123])[)\]]?/i);
  return match ? match[1].toUpperCase() : null;
}

function extractQuestionMeta(sheet: XLSX.WorkSheet, sheetType: SheetType): { meta: QuestionMeta[]; metaByCol: Map<number, QuestionMeta>; startCol: number } {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const meta: QuestionMeta[] = [];
  const metaByCol = new Map<number, QuestionMeta>();
  let startCol = 2; // Default: data starts at column C (index 2)
  
  // Find header row with question types - first pass to find startCol
  for (let row = 0; row <= Math.min(5, range.e.r); row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
      const value = cell?.v?.toString()?.trim() || '';
      
      if (value.match(/^L[123]$/i)) {
        startCol = col + 1;
        console.log(`[extractQuestionMeta] Found level marker "${value}" at col ${col}, setting startCol to ${startCol}`);
      }
    }
  }
  
  // Look for question type headers row
  // Strategy: find the row that has the most text values (2-10 chars) in the question columns
  let bestRow = -1;
  let bestRowCount = 0;
  
  for (let row = 0; row <= Math.min(5, range.e.r); row++) {
    let count = 0;
    for (let col = startCol; col <= range.e.c; col++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
      const value = cell?.v?.toString()?.trim() || '';
      if (value && value.length >= 1 && value.length <= 15 && !value.match(/^\d+$/) && !value.match(/^[OXox]$/)) {
        count++;
      }
    }
    if (count > bestRowCount) {
      bestRowCount = count;
      bestRow = row;
    }
  }
  
  if (bestRow >= 0 && bestRowCount >= 3) {
    let questionNumber = 1;
    for (let col = startCol; col <= range.e.c; col++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: bestRow, c: col })];
      const value = cell?.v?.toString()?.trim() || '';
      
      const isSubjective = sheetType === 'writing_array' || sheetType === 'writing_conditional' || (sheetType === 'grammar' && questionNumber > 30);
      
      const m: QuestionMeta = {
        questionNumber,
        questionType: value || '',
        isSubjective,
        colIndex: col,
      };
      meta.push(m);
      metaByCol.set(col, m);
      questionNumber++;
    }
    console.log(`[extractQuestionMeta] Found ${meta.length} question types at row ${bestRow}, sample types:`, meta.slice(0, 5).map(m => `Q${m.questionNumber}=${m.questionType}`));
  }
  
  return { meta, metaByCol, startCol };
}

function isAnswerRow(row: (string | number | undefined)[], sheetType: SheetType): boolean {
  let oxCount = 0;
  let numberCount = 0;
  
  for (const cell of row) {
    const val = cell?.toString()?.trim()?.toUpperCase();
    if (val === 'O' || val === 'X') {
      oxCount++;
    }
    // 조건영작 시트는 숫자(0-10)로 채점됨
    if (sheetType === 'writing_conditional') {
      const numVal = Number(cell);
      if (!isNaN(numVal) && numVal >= 0 && numVal <= 10) {
        numberCount++;
      }
    }
  }
  
  // 조건영작 시트는 숫자가 3개 이상이면 답안 행
  if (sheetType === 'writing_conditional') {
    return numberCount >= 3;
  }
  
  return oxCount >= 3;
}

function extractStudentFromRow(
  row: (string | number | undefined)[],
  sheetType: SheetType,
  questionMeta: QuestionMeta[],
  startCol: number,
  metaByCol?: Map<number, QuestionMeta>
): { name: string; level?: string; gradeNumber?: string; answers: QuestionAnswer[] } | null {
  // Find name column - usually column 2 or 3
  let name = '';
  let level = '';
  let gradeNumber = '';
  
  // Check first few columns for name and level
  for (let i = 0; i < Math.min(6, row.length); i++) {
    const val = row[i]?.toString()?.trim() || '';
    
    // "Top" as standalone level
    if (val.match(/^(FO|INTER|AD|IVY|NT|TOP|신규생)$/i)) {
      level = val.toUpperCase();
      continue;
    }
    
    const combinedMatch = val.match(/^(\d)(FO|INT|INTER|AD|IVY|NT|TOP)$/i);
    if (combinedMatch) {
      gradeNumber = combinedMatch[1];
      const levelPart = combinedMatch[2].toUpperCase();
      level = levelPart === 'INT' ? 'INTER' : levelPart;
      continue;
    }
    
    if (val.match(/^L[123]$/i)) continue;
    if (val.match(/^(중|고)[123]$/)) continue;
    
    const nameMatch = val.match(/^([가-힣]{2,4})\d*$/);
    if (nameMatch && !name) {
      name = nameMatch[1];
    }
  }
  
  if (!name) {
    return null;
  }
  
  // Extract answers - use column index to look up meta
  const answers: QuestionAnswer[] = [];
  let questionNum = 1;
  
  for (let i = startCol; i < row.length; i++) {
    const val = row[i]?.toString()?.trim();
    const upperVal = val?.toUpperCase();
    
    if (upperVal === 'O' || upperVal === 'X' || (sheetType === 'writing_conditional' && !isNaN(Number(val)) && val !== '')) {
      const meta = questionMeta.find(m => m.questionNumber === questionNum) || metaByCol?.get(i);
      const isSubjective = meta?.isSubjective || 
        sheetType === 'writing_array' || 
        sheetType === 'writing_conditional' ||
        (sheetType === 'grammar' && questionNum > 30);
      
      const isConditionalWriting = sheetType === 'writing_conditional';
      const partialScore = isConditionalWriting && !isNaN(Number(val)) ? Number(val) : undefined;
      
      answers.push({
        questionNumber: questionNum,
        questionType: meta?.questionType || '',
        isCorrect: upperVal === 'O' || (isConditionalWriting && Number(val) === 10),
        isSubjective,
        partialScore,
      });
      
      questionNum++;
    }
  }
  
  if (answers.length < 3) {
    return null;
  }
  
  console.log(`[extractStudentFromRow] Found student "${name}" level="${level}" gradeNumber="${gradeNumber}" answers=${answers.length}, sample types:`, answers.slice(0, 3).map(a => `Q${a.questionNumber}=${a.questionType}`));
  return { name, level, gradeNumber: gradeNumber || undefined, answers };
}

export function parseExcelFile(file: File): Promise<StudentScore[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('[parseExcelFile] Sheet names:', workbook.SheetNames);
        
         const studentsMap = new Map<string, StudentScore>();
         let detectedGrade = ''; // 엑셀에서 감지한 학년
         
         // First pass: detect grade from all sheets
         for (const sheetName of workbook.SheetNames) {
           if (detectedGrade) break;
           
           const sheet = workbook.Sheets[sheetName];
           const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | undefined)[][];
           
           for (let i = 0; i < Math.min(10, jsonData.length); i++) {
             const row = jsonData[i];
             if (!row) continue;
             for (let j = 0; j < Math.min(10, row.length); j++) {
               const val = row[j]?.toString()?.trim() || '';
               if (val.match(/^(중1|중2|고1|고2|고3)$/)) {
                 detectedGrade = val;
                 console.log(`[parseExcelFile] Detected grade: ${detectedGrade} in sheet "${sheetName}"`);
                 break;
               }
             }
             if (detectedGrade) break;
           }
         }
         
         // Pre-pass: parse metadata sheets ("문법", "독해", "영작") for level-to-type mappings
         const grammarTypesByLevel: LevelTypeMap = {};
         const readingTypesByLevel: LevelTypeMap = {};
         const writingTypesByLevel: LevelTypeMap = {};
         
         for (const sheetName of workbook.SheetNames) {
           const normalized = sheetName.toLowerCase().trim();
           if (normalized === '문법') {
             const metaMap = parseMetadataSheet(workbook.Sheets[sheetName]);
             Object.assign(grammarTypesByLevel, metaMap);
             console.log(`[parseExcelFile] Parsed grammar metadata from "${sheetName}":`, Object.keys(metaMap));
           } else if (normalized === '독해') {
             const metaMap = parseMetadataSheet(workbook.Sheets[sheetName]);
             Object.assign(readingTypesByLevel, metaMap);
             console.log(`[parseExcelFile] Parsed reading metadata from "${sheetName}":`, Object.keys(metaMap));
           } else if (normalized === '영작') {
             const metaMap = parseMetadataSheet(workbook.Sheets[sheetName]);
             Object.assign(writingTypesByLevel, metaMap);
             console.log(`[parseExcelFile] Parsed writing metadata from "${sheetName}":`, Object.keys(metaMap));
           }
         }
         
         for (const sheetName of workbook.SheetNames) {
            const sheetType = detectSheetType(sheetName);
            console.log(`[parseExcelFile] Processing sheet "${sheetName}" as type: ${sheetType}`);
            
            if (sheetType === 'unknown') continue;
            
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | undefined)[][];
            
            if (jsonData.length < 2) continue;
            
            // 시트 이름에서 레벨 추출하여 메타데이터 시트의 유형 매핑 적용
            const sheetLevel = extractLevelFromSheetName(sheetName);
            let levelTypes: string[] | null = null;
            if (sheetType === 'grammar' && sheetLevel && grammarTypesByLevel[sheetLevel]) {
              levelTypes = grammarTypesByLevel[sheetLevel];
              console.log(`[parseExcelFile] Using grammar metadata for ${sheetLevel}: ${levelTypes.length} types`);
            } else if (sheetType === 'reading' && sheetLevel && readingTypesByLevel[sheetLevel]) {
              levelTypes = readingTypesByLevel[sheetLevel];
              console.log(`[parseExcelFile] Using reading metadata for ${sheetLevel}: ${levelTypes.length} types`);
            } else if ((sheetType === 'writing_array' || sheetType === 'writing_conditional') && Object.keys(writingTypesByLevel).length > 0) {
              // 영작 메타데이터: 레벨 구분 없이 모든 레벨에 동일한 유형 적용
              // Q1~Q20은 배열영작, Q21~Q30은 조건영작
              const anyLevel = Object.keys(writingTypesByLevel)[0];
              const allWritingTypes = writingTypesByLevel[anyLevel];
              if (allWritingTypes && allWritingTypes.length > 0) {
                if (sheetType === 'writing_array') {
                  levelTypes = allWritingTypes.slice(0, 20); // Q1~Q20
                } else {
                  levelTypes = allWritingTypes.slice(20, 30); // Q21~Q30
                }
                console.log(`[parseExcelFile] Using writing metadata for ${sheetType}: ${levelTypes.length} types`);
              }
            }
            
            const { meta, metaByCol, startCol } = extractQuestionMeta(sheet, sheetType);
            
            // 메타데이터 시트에서 가져온 유형이 있으면 덮어쓰기
            let finalMeta = meta;
            let finalMetaByCol = metaByCol;
            if (levelTypes && levelTypes.length > 0) {
              finalMeta = [];
              finalMetaByCol = new Map();
              for (let q = 0; q < levelTypes.length; q++) {
                const questionNumber = q + 1;
                const isSubjective = (sheetType === 'grammar' && questionNumber > 30) || 
                  sheetType === 'writing_array' || sheetType === 'writing_conditional';
                const m: QuestionMeta = {
                  questionNumber,
                  questionType: levelTypes[q],
                  isSubjective,
                  colIndex: startCol + q,
                };
                finalMeta.push(m);
                finalMetaByCol.set(startCol + q, m);
              }
              console.log(`[parseExcelFile] Applied ${finalMeta.length} metadata types for ${sheetName}`);
            }
            
            console.log(`[parseExcelFile] Extracted ${finalMeta.length} question meta, startCol: ${startCol}`);
           
           // Process student rows
           for (let i = 1; i < jsonData.length; i++) {
             const row = jsonData[i];
             if (!row || row.length < 3) continue;
             
            // Handle vocabulary score sheet differently
            if (sheetType === 'vocabulary_score') {
              // Look for name, level, and score
               let name = '';
               let level = '';
               let gradeNumber = '';
               let score = 0;
              
              console.log(`[parseExcelFile] Vocabulary row ${i}:`, row.slice(0, 10));
              
              // 어휘 시트 구조: 난이도(옳은보카4)|반(1FO)|이름|Q1|...|Q100|점수|맞은개수|총문항
              // First pass: find name and level from first few columns
              for (let j = 0; j < Math.min(10, row.length); j++) {
                const val = row[j]?.toString()?.trim() || '';
                if (!val) continue;
                
                // Skip 옳은보카 difficulty markers
                if (val.includes('옳은보카') || val.includes('난이도')) {
                  continue;
                }
                
                // Check for level code (standalone)
                if (val.match(/^(FO|INTER|AD|IVY|NT|TOP|신규생)$/i) && !level) {
                  level = val.toUpperCase();
                  continue;
                }
                
                // Check for combined grade+level codes like "1FO", "1INT", "2AD"
                const combinedMatch = val.match(/^(\d)(FO|INT|INTER|AD|IVY|NT|TOP)$/i);
                if (combinedMatch && !level) {
                  gradeNumber = combinedMatch[1];
                  const levelPart = combinedMatch[2].toUpperCase();
                  level = levelPart === 'INT' ? 'INTER' : levelPart;
                  continue;
                }
                
                // Check for Korean name (2-4 characters, may have numbers after)
                const nameMatch = val.match(/^([가-힣]{2,4})\d*$/);
                if (nameMatch && !name) {
                  name = nameMatch[1];
                }
              }
              
              // 어휘 시트 구조: ...|Q100|점수|맞은개수|총문항
              // 점수는 뒤에서 3번째, 맞은개수는 뒤에서 2번째, 총문항은 마지막
              // 점수 열을 찾기: 뒤에서 3번째 숫자 값 사용
              if (row.length >= 3) {
                // 먼저 뒤에서 3번째 시도 (점수 열)
                const scoreIdx = row.length - 3;
                const scoreVal = row[scoreIdx];
                if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '') {
                  const numVal = Number(scoreVal);
                  if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                    score = numVal;
                    console.log(`[parseExcelFile] Found vocabulary score for "${name}" at column ${scoreIdx}: ${score}`);
                  }
                }
                
                // 점수를 못 찾았으면 뒤에서 2번째 시도 (맞은개수)
                if (score === 0) {
                  const correctIdx = row.length - 2;
                  const correctVal = row[correctIdx];
                  if (correctVal !== undefined && correctVal !== null && correctVal !== '') {
                    const numVal = Number(correctVal);
                    if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                      score = numVal;
                      console.log(`[parseExcelFile] Found vocabulary score (correctCount) for "${name}" at column ${correctIdx}: ${score}`);
                    }
                  }
                }
              }
              
              if (name) {
                // Create unique key using name + level
                let studentKey = level ? `${name}_${level}` : name;
                let existing = studentsMap.get(studentKey);
                
                // 어휘 시트에서 레벨이 없거나 매칭이 안되면 이름으로 기존 학생 찾기
                if (!existing && !level) {
                  for (const [key, student] of studentsMap.entries()) {
                    if (key.startsWith(`${name}_`)) {
                      existing = student;
                      studentKey = key;
                      level = student.level || '';
                      console.log(`[parseExcelFile] Vocabulary: matched "${name}" to existing key "${key}"`);
                      break;
                    }
                  }
                }
                
                if (!existing) {
                  existing = createEmptyStudent(name);
                }
                
                existing.vocabulary = score;
                if (level) existing.level = level;
                if (detectedGrade) existing.grade = detectedGrade;
                
                // Generate classCode - use per-student gradeNumber if available, fallback to detectedGrade
                const gNum = gradeNumber || (detectedGrade ? detectedGrade.replace(/[^0-9]/g, '') : '');
                if (gNum && level) {
                  const levelCode = level === 'INTER' ? 'INT' : level;
                  existing.classCode = levelCode === '신규생' ? '신규생' : `${gNum}${levelCode}`;
                }
                
                studentsMap.set(studentKey, existing);
                console.log(`[parseExcelFile] Vocabulary score: ${name} (${level || 'no level'}) = ${score}, classCode: ${existing.classCode || 'none'}`);
              }
              continue;
            }
            
            // 조건영작 시트 디버깅
            if (sheetType === 'writing_conditional') {
              console.log(`[parseExcelFile] Processing conditional writing sheet, rows: ${jsonData.length}`);
              console.log(`[parseExcelFile] First few rows:`, jsonData.slice(0, 5).map((r, i) => `Row ${i}: ${JSON.stringify(r?.slice(0, 15))}`));
            }
             
             if (!isAnswerRow(row, sheetType)) {
               if (sheetType === 'writing_conditional' && i < 10) {
                 console.log(`[parseExcelFile] Row ${i} skipped by isAnswerRow:`, row?.slice(0, 15));
               }
               continue;
             }
             
             const studentData = extractStudentFromRow(row, sheetType, finalMeta, startCol, finalMetaByCol);
             if (!studentData) {
               if (sheetType === 'writing_conditional' && i < 10) {
                 console.log(`[parseExcelFile] Row ${i} failed extractStudentFromRow`);
               }
               continue;
             }
             
             // Create unique key using name + level
             // 조건영작 시트는 레벨 정보가 없으므로 이름으로만 기존 학생 찾기
             let studentKey = studentData.level ? `${studentData.name}_${studentData.level}` : studentData.name;
             let existing = studentsMap.get(studentKey);
             
             // 조건영작 시트: 레벨 없이 이름만 있으면 기존 학생 중에서 이름으로 검색
             if (!existing && sheetType === 'writing_conditional' && !studentData.level) {
               // 이름으로 시작하는 키를 찾아서 매칭
               for (const [key, student] of studentsMap.entries()) {
                 if (key.startsWith(`${studentData.name}_`)) {
                   existing = student;
                   studentKey = key;
                   console.log(`[parseExcelFile] Conditional writing: matched "${studentData.name}" to existing key "${key}"`);
                   break;
                 }
               }
             }
             
             if (!existing) {
               existing = createEmptyStudent(studentData.name);
             }
             
             if (studentData.level) {
               existing.level = studentData.level;
             }
             
             if (detectedGrade) {
               existing.grade = detectedGrade;
             }
             
              // 학년과 레벨을 조합하여 classCode 생성 (예: 1FO, 2AD)
              // per-student gradeNumber from combined code (e.g., "2AD") takes priority
              const gNum = studentData.gradeNumber || (detectedGrade ? detectedGrade.replace(/[^0-9]/g, '') : '');
              if (gNum && studentData.level) {
                const levelCode = studentData.level === 'INTER' ? 'INT' : studentData.level;
                existing.classCode = levelCode === '신규생' ? '신규생' : `${gNum}${levelCode}`;
              }
             
             // Store answers in the appropriate subject
             if (!existing.answers) {
               existing.answers = {
                 vocabulary: [],
                 grammar: [],
                 reading: [],
                 writing: [],
                 writingArray: [],
                 writingConditional: [],
               };
             }
             
             switch (sheetType) {
               case 'grammar':
                 existing.answers.grammar = studentData.answers;
                 existing.grammar = Math.round((studentData.answers.filter(a => a.isCorrect).length / studentData.answers.length) * 100);
                 break;
               case 'reading':
                 existing.answers.reading = studentData.answers;
                 existing.reading = Math.round((studentData.answers.filter(a => a.isCorrect).length / studentData.answers.length) * 100);
                 break;
                case 'writing_array':
                    // 배열영작: 한 문제당 5점, 100점 만점 환산
                    existing.answers.writingArray = studentData.answers;
                    existing.writingArray = studentData.answers.length > 0 
                      ? studentData.answers.filter(a => a.isCorrect).length * 5
                      : 0;
                   
                   // writing 배열에도 추가 (정오표용)
                   existing.answers.writing = [...(existing.answers.writing || []), ...studentData.answers];
                   
                   console.log(`[parseExcelFile] Array writing for ${studentData.name}: ${studentData.answers.length} items, score=${existing.writingArray}`);
                   break;
                   
                case 'writing_conditional':
                   // 조건영작: 부분점수 합산 (10문제 * 10점 = 100점 만점)
                   existing.answers.writingConditional = studentData.answers;
                   const conditionalTotal = studentData.answers.reduce((sum, a) => sum + (a.partialScore ?? 0), 0);
                   existing.writingConditional = conditionalTotal;
                   
                   // writing 배열에도 추가 (정오표용) - 문항 번호를 21-30으로 재설정
                   const conditionalWithOffset = studentData.answers.map(a => ({
                     ...a,
                     questionNumber: a.questionNumber + 20  // 1-10 -> 21-30
                   }));
                   existing.answers.writing = [...(existing.answers.writing || []), ...conditionalWithOffset];
                   
                   console.log(`[parseExcelFile] Conditional writing for ${studentData.name}: ${studentData.answers.length} items, total=${conditionalTotal}`);
                   console.log(`[parseExcelFile] Conditional details:`, studentData.answers.map(a => ({ q: a.questionNumber, partial: a.partialScore })));
                   break;
               case 'vocabulary':
                 existing.answers.vocabulary = studentData.answers;
                 existing.vocabulary = Math.round((studentData.answers.filter(a => a.isCorrect).length / studentData.answers.length) * 100);
                 break;
             }
             
             studentsMap.set(studentKey, existing);
             console.log(`[parseExcelFile] Updated student "${studentData.name}" (${studentData.level || 'no level'}) for ${sheetType}`);
           }
         }
         
         // 모든 시트 파싱 후, 영작 전체 점수 계산 (배열영작 + 조건영작 평균)
         for (const student of studentsMap.values()) {
           if (student.writingArray > 0 || student.writingConditional > 0) {
             student.writing = Math.round((student.writingArray + student.writingConditional) / 2);
             console.log(`[parseExcelFile] Final writing score for ${student.name}: array=${student.writingArray}, conditional=${student.writingConditional}, total=${student.writing}`);
           }
         }
         
         const students = Array.from(studentsMap.values());
         console.log(`[parseExcelFile] Parsed ${students.length} students`);
         
         resolve(students);
      } catch (error) {
        console.error('[parseExcelFile] Error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function createEmptyStudent(name: string): StudentScore {
  return {
    name,
    vocabulary: 0,
    grammar: 0,
    reading: 0,
    writing: 0,
    writingArray: 0,
    writingConditional: 0,
    answers: {
      vocabulary: [],
      grammar: [],
      reading: [],
      writing: [],
      writingArray: [],
      writingConditional: [],
    },
  };
}
