import { forwardRef } from 'react';
import { StudentScore, QuestionAnswer, GRADE_CRITERIA, SubjectAverages } from '@/types/report';
import { getScoreClass, calculateAverage } from '@/utils/excelParser';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import orunLogo from '@/assets/orun-logo.jpg';
import vocabularyIcon from '@/assets/icons/vocabulary-icon.png';
import grammarIcon from '@/assets/icons/grammar-icon.png';
import readingIcon from '@/assets/icons/reading-icon.png';
import writingIcon from '@/assets/icons/writing-icon.png';
import achievementIcon from '@/assets/icons/achievement-icon.png';
import answerIcon from '@/assets/icons/answer-icon.png';

interface ReportCardProps {
  student: StudentScore;
  index: number;
  allStudents: StudentScore[];
  overallAverages: SubjectAverages;
  totalStudents: number;
}

// Component to display answer table for a subject with subjective/objective separation
const AnswerTable = ({ answers, subjectName }: { answers: QuestionAnswer[]; subjectName: string }) => {
  if (!answers || answers.length === 0) return null;

  const objectiveAnswers = answers.filter(a => !a.isSubjective);
  const subjectiveAnswers = answers.filter(a => a.isSubjective);
  
  const objectiveCorrect = objectiveAnswers.filter(a => a.isCorrect).length;
  const subjectiveCorrect = subjectiveAnswers.filter(a => a.isCorrect).length;
  const totalCorrect = answers.filter(a => a.isCorrect).length;
  const totalPercentage = Math.round((totalCorrect / answers.length) * 100);
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getPercentageBadgeColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-success/20 text-success';
    if (percentage >= 50) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  const getTotalBadgeColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-success text-success-foreground';
    if (percentage >= 50) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };
  
  const renderAnswerTable = (groupAnswers: QuestionAnswer[], title: string, icon: string, correctCount: number) => {
    if (groupAnswers.length === 0) return null;
    
    const percentage = Math.round((correctCount / groupAnswers.length) * 100);
    const columnsPerRow = 10;
    const rows: QuestionAnswer[][] = [];
    
    for (let i = 0; i < groupAnswers.length; i += columnsPerRow) {
      rows.push(groupAnswers.slice(i, i + columnsPerRow));
    }
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1 bg-muted/50 rounded">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{icon}</span>
            <span className="text-[11px] font-semibold text-foreground">{title}</span>
          </div>
           <span className="text-[11px] font-bold text-foreground">
              {correctCount}/{groupAnswers.length}
            </span>
        </div>
        <div className="space-y-2">
          {rows.map((rowAnswers, rowIdx) => {
            // Use actual answer count for last row, full columns for other rows
            const isLastRow = rowIdx === rows.length - 1;
            const colCount = isLastRow ? rowAnswers.length : columnsPerRow;
            const colWidth = `${100 / colCount}%`;
            
            return (
              <table key={rowIdx} className="w-full text-[10px] border-collapse table-fixed">
                <thead>
                  <tr>
                    {rowAnswers.map((answer, idx) => (
                      <th 
                        key={idx} 
                        className="border border-border bg-muted px-1 py-0.5 text-center font-bold text-foreground"
                        style={{ width: colWidth }}
                      >
                        Q{answer.questionNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {rowAnswers.map((answer, idx) => {
                      // 조건영작 (Q21~Q30): 5점=X, 6~9점=△, 10점=O
                      const isConditional = answer.partialScore !== undefined;
                      let displaySymbol: string;
                      let displayClass: string;
                      
                      if (isConditional) {
                        const score = answer.partialScore ?? 0;
                        if (score >= 10) {
                          displaySymbol = 'O';
                          displayClass = 'bg-success/20 text-success';
                        } else if (score >= 6) {
                          displaySymbol = '△';
                          displayClass = 'bg-warning/20 text-warning';
                        } else {
                          displaySymbol = 'X';
                          displayClass = 'bg-destructive/20 text-destructive';
                        }
                      } else {
                        displaySymbol = answer.isCorrect ? 'O' : 'X';
                        displayClass = answer.isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive';
                      }
                      
                      return (
                        <td 
                          key={idx} 
                          className={`border border-border px-1 py-0.5 text-center font-bold ${displayClass}`}
                          style={{ width: colWidth }}
                        >
                          {displaySymbol}{isConditional && <span className="text-[7px] font-normal text-foreground">({answer.partialScore}/10점)</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    {rowAnswers.map((answer, idx) => (
                      <td 
                        key={idx} 
                        className="border border-border px-0.5 py-1 text-center text-[9px] text-foreground/70 break-keep"
                        style={{ width: colWidth }}
                      >
                        {answer.questionType || ''}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-4 bg-primary rounded-full"></span>
          {subjectName}
        </h5>
        <span className="text-xs text-muted-foreground">
            총 <span className="font-semibold text-foreground">{totalCorrect}</span>/{answers.length}
          </span>
      </div>
      
      {/* Content */}
      <div className="p-3 space-y-3">
        {objectiveAnswers.length > 0 && subjectiveAnswers.length > 0 ? (
          <>
            {renderAnswerTable(objectiveAnswers, '객관식', '📝', objectiveCorrect)}
            {renderAnswerTable(subjectiveAnswers, '주관식', '✏️', subjectiveCorrect)}
          </>
        ) : (
          renderAnswerTable(answers, '정답', '✓', totalCorrect)
        )}
      </div>
    </div>
  );
};

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(({ student, index, allStudents, overallAverages, totalStudents }, ref) => {
  const average = calculateAverage(student);

  // Calculate per-difficulty averages: for each subject, average only students with the same difficulty
  const getDifficultyAverage = (subjectKey: 'vocabulary' | 'grammar' | 'reading' | 'writing'): number => {
    const difficultyKeys: Record<string, keyof StudentScore> = {
      vocabulary: 'vocabDifficulty',
      grammar: 'grammarDifficulty',
      reading: 'readingDifficulty',
      writing: 'writingDifficulty',
    };
    const diffKey = difficultyKeys[subjectKey];
    const myDifficulty = student[diffKey] as string | undefined;
    
    if (!myDifficulty) {
      // Fallback to overall average if no difficulty info
      return overallAverages[subjectKey];
    }
    
    const sameDiffStudents = allStudents.filter(s => (s[diffKey] as string | undefined) === myDifficulty);
    if (sameDiffStudents.length === 0) return overallAverages[subjectKey];
    
    const sum = sameDiffStudents.reduce((acc, s) => acc + (s[subjectKey] as number), 0);
    return Math.round((sum / sameDiffStudents.length) * 10) / 10;
  };

  const difficultyAverages: SubjectAverages = {
    vocabulary: getDifficultyAverage('vocabulary'),
    grammar: getDifficultyAverage('grammar'),
    reading: getDifficultyAverage('reading'),
    writing: getDifficultyAverage('writing'),
    overall: 0,
  };
  difficultyAverages.overall = Math.round(((difficultyAverages.vocabulary + difficultyAverages.grammar + difficultyAverages.reading + difficultyAverages.writing) / 4) * 10) / 10;
  
  // Generate class code from grade and level (e.g., 중1 + FO → 1FO)
  const generateClassCode = (): string | null => {
    if (!student.grade || !student.level) return null;
    
    // Extract number from grade (중1 → 1, 중2 → 2)
    const gradeMatch = student.grade.match(/(\d)/);
    if (!gradeMatch) return null;
    
    const gradeNum = gradeMatch[1];
    
    // Map level to short code
    const levelMap: Record<string, string> = {
      'FO': 'FO',
      'INTER': 'NT',
      'NT': 'NT',
      'AD': 'AD',
      'IVY': 'IVY',
      '신규생': '신규생',
    };
    
    const levelCode = levelMap[student.level] || student.level;
    return levelCode === '신규생' ? '신규생' : `${gradeNum}${levelCode}`;
  };
  
  const classCode = student.classCode || generateClassCode();
  
  // Get default difficulty based on grade and level
  const getDefaultDifficulty = (subjectKey: 'vocabulary' | 'grammar' | 'reading' | 'writing'): string => {
    const gradeData = GRADE_CRITERIA.find(g => g.grade === student.grade);
    if (!gradeData) return '-';
    
    const levelData = gradeData.levels.find(l => l.level === student.level);
    if (!levelData) return '-';
    
    return levelData[subjectKey];
  };
  
  const subjects = [
    { name: '어휘', key: 'vocabulary' as const, score: student.vocabulary, iconSrc: vocabularyIcon, max: 100, difficulty: student.vocabDifficulty || getDefaultDifficulty('vocabulary'), answers: [] as QuestionAnswer[], showVocabStats: true },  // 어휘는 정오표 미표시, 통계는 표시
    { name: '문법', key: 'grammar' as const, score: student.grammar, iconSrc: grammarIcon, max: 100, difficulty: student.grammarDifficulty || getDefaultDifficulty('grammar'), answers: student.answers?.grammar || [] },
    { name: '독해', key: 'reading' as const, score: student.reading, iconSrc: readingIcon, max: 100, difficulty: student.readingDifficulty || getDefaultDifficulty('reading'), answers: student.answers?.reading || [] },
    { name: '영작', key: 'writing' as const, score: student.writing, iconSrc: writingIcon, max: 100, difficulty: student.writingDifficulty || getDefaultDifficulty('writing'), answers: student.answers?.writing || [], 
      subScores: [
        { name: '배열영작', score: student.writingArray, answers: student.answers?.writingArray || [] },
        { name: '조건영작', score: student.writingConditional, answers: student.answers?.writingConditional || [] },
      ]
    },
  ];

  const hasAnyAnswers = subjects.some(s => s.answers.length > 0);

  const getGradeLabel = (avg: number): string => {
    if (avg >= 95) return 'S';
    if (avg >= 90) return 'A+';
    if (avg >= 85) return 'A';
    if (avg >= 80) return 'B+';
    if (avg >= 75) return 'B';
    if (avg >= 70) return 'C+';
    if (avg >= 60) return 'C';
    return 'D';
  };

  const getGradeColor = (avg: number): string => {
    if (avg >= 90) return 'bg-success text-success-foreground';
    if (avg >= 70) return 'bg-primary text-primary-foreground';
    if (avg >= 50) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  // Calculate stats for each subject
  const getSubjectStats = (answers: QuestionAnswer[]) => {
    if (!answers || answers.length === 0) return null;
    
    const objective = answers.filter(a => !a.isSubjective);
    const subjective = answers.filter(a => a.isSubjective);
    
    return {
      total: answers.length,
      correct: answers.filter(a => a.isCorrect).length,
      objectiveTotal: objective.length,
      objectiveCorrect: objective.filter(a => a.isCorrect).length,
      subjectiveTotal: subjective.length,
      subjectiveCorrect: subjective.filter(a => a.isCorrect).length,
    };
  };

  // Debug: Log class code generation
  console.log(`[ReportCard] Student: ${student.name}, grade: ${student.grade}, level: ${student.level}, classCode: ${classCode}`);

  return (
    <div ref={ref} className="report-card rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Compact Header */}
      <div className="relative bg-gradient-to-r from-[hsl(210,60%,22%)] via-[hsl(210,55%,28%)] to-[hsl(210,50%,32%)]">
        <div className="relative z-10 px-4 pt-3 pb-5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Logo + Title + Student */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Logo */}
              <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={orunLogo} alt="Orun" className="w-8 h-8 object-contain" />
              </div>
              
              {/* Title & Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm font-bold text-white/90 whitespace-nowrap">4대천왕</h1>
                  <span className="text-white/40">|</span>
                  <h2 className="text-lg font-bold text-white truncate">{student.name}</h2>
                  {classCode && (
                    <span className="text-[hsl(45,100%,55%)] text-xs font-bold flex-shrink-0">
                      {classCode}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/50 tracking-wide leading-normal mt-0.5">Orun English: The Supreme Four Championship</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5">
        {/* Compact Scores Grid - Premium Minimal Design */}
        <div className="p-4 bg-gradient-to-br from-card to-secondary/10 rounded-2xl border border-border shadow-sm">
          <div className="grid grid-cols-4 gap-3">
          {subjects.map((subject) => {
            const iconSrc = subject.iconSrc;
            const stats = getSubjectStats(subject.answers);
            const hasObjectiveSubjective = stats && stats.objectiveTotal > 0 && stats.subjectiveTotal > 0;
            const hasStats = stats && stats.total > 0;
            const scorePercentage = (subject.score / subject.max) * 100;
            
            return (
              <div
                key={subject.name}
                className="relative bg-card rounded-lg border border-border/40 overflow-hidden group hover:border-border transition-colors"
              >
                {/* Top accent line - unique color per subject */}
                <div className={`h-0.5 ${
                  subject.key === 'vocabulary' ? 'bg-[hsl(210,80%,55%)]' :
                  subject.key === 'grammar' ? 'bg-[hsl(160,60%,45%)]' :
                  subject.key === 'reading' ? 'bg-[hsl(35,85%,55%)]' :
                  subject.key === 'writing' ? 'bg-[hsl(280,60%,55%)]' :
                  'bg-primary'
                }`} />
                
                <div className="px-2 py-2">
                  {/* Header with icon */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <img src={iconSrc} alt={subject.name} className="w-5 h-5 object-contain" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {subject.name}
                      {subject.key === 'vocabulary' && subject.difficulty && subject.difficulty !== '-' && (
                        <span className="text-[10px] text-muted-foreground/70 ml-0.5">({subject.difficulty})</span>
                      )}
                    </span>
                  </div>
                  
                  {/* Score */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">{subject.score}</span>
                    <span className="text-[10px] text-muted-foreground">/ {subject.max}점</span>
                  </div>
                  
                  {/* Stats row - compact */}
                  {'showVocabStats' in subject && subject.showVocabStats ? (
                    // 어휘: 100문제 중 맞춘 개수 표시
                    <div className="mt-1.5 pt-1.5 border-t border-border/30 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
                      <span className="text-muted-foreground">
                        정답<span className="font-medium text-foreground ml-0.5">{subject.score}/100점</span>
                      </span>
                    </div>
                  ) : subject.key === 'writing' && subject.subScores ? (
                    // 영작: 배열영작 / 조건영작 분리 표시
                    <div className="mt-1.5 pt-1.5 border-t border-border/30 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
                      <span className="text-muted-foreground">
                        배열<span className="font-medium text-foreground ml-0.5">{student.writingArray}/100점</span>
                      </span>
                      <span className="text-muted-foreground">
                        조건<span className="font-medium text-foreground ml-0.5">{student.writingConditional}/100점</span>
                      </span>
                    </div>
                  ) : (hasObjectiveSubjective || hasStats) && (
                    <div className="mt-1.5 pt-1.5 border-t border-border/30 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
                      {hasObjectiveSubjective ? (
                        <>
                          <span className="text-muted-foreground">
                            객관<span className="font-medium text-foreground ml-0.5">{stats.objectiveCorrect}/{stats.objectiveTotal}개</span>
                          </span>
                          <span className="text-muted-foreground">
                            주관<span className="font-medium text-foreground ml-0.5">{stats.subjectiveCorrect}/{stats.subjectiveTotal}개</span>
                          </span>
                        </>
                      ) : hasStats && (
                        <span className="text-muted-foreground">
                          정답<span className="font-medium text-foreground ml-0.5">{stats.correct}/{stats.total}개</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>


        {/* Subject Achievement - Vertical Bar Chart */}
        <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/5 via-card to-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={achievementIcon} alt="성취도" className="w-6 h-6 object-contain" />
                <h4 className="text-sm font-bold text-foreground tracking-tight">영역별 성취도</h4>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: 'hsl(210, 60%, 25%)' }}></div>
                  <span className="text-muted-foreground font-medium">내 점수</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-border border border-muted-foreground/30"></div>
                  <span className="text-muted-foreground font-medium">같은 난이도 평균</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Content */}
          <div className="p-5 bg-card">
            <div className="relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[9px] text-muted-foreground font-medium">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-10">
                {/* Grid lines */}
                <div className="relative h-36 bg-gradient-to-t from-secondary/10 to-transparent rounded-lg overflow-hidden">
                  {[0, 25, 50, 75, 100].map((line) => (
                    <div 
                      key={line}
                      className={`absolute left-0 right-0 border-t ${line === 100 ? 'border-transparent' : 'border-border/20'}`}
                      style={{ bottom: `${line}%` }}
                    />
                  ))}
                  
                  {/* Bars container */}
                  <div className="absolute inset-0 flex items-end justify-around px-6 pb-0 pt-2">
                    {subjects.map((subject) => {
                      const subjectKey = subject.key as keyof Omit<SubjectAverages, 'overall'>;
                      const avg = difficultyAverages[subjectKey];
                      const myPercentage = (subject.score / subject.max) * 100;
                      const avgPercentage = (avg / subject.max) * 100;
                      
                      return (
                        <div key={subject.name} className="flex flex-col items-center gap-1 flex-1 max-w-20">
                          {/* Bar group */}
                          <div className="relative w-full h-28 flex items-end justify-center gap-2">
                            {/* Average bar */}
                            <div 
                              className="w-7 bg-border/80 rounded-t-md transition-all duration-700 relative shadow-inner"
                              style={{ height: `${avgPercentage}%`, minHeight: avgPercentage > 0 ? '6px' : '0' }}
                            >
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-primary font-semibold whitespace-nowrap">
                                {avg.toFixed(0)}
                              </span>
                            </div>
                            
                            {/* My score bar - 네이비 계열 통일 */}
                            <div 
                              className="w-7 rounded-t-md transition-all duration-1000 relative shadow-md"
                              style={{ 
                                height: `${myPercentage}%`, 
                                minHeight: myPercentage > 0 ? '6px' : '0',
                                backgroundColor: 'hsl(210, 60%, 25%)',
                              }}
                            >
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-foreground whitespace-nowrap">
                                {subject.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex justify-around mt-3 px-6">
                  {subjects.map((subject) => (
                    <div key={subject.name} className="flex-1 max-w-20 text-center">
                      <span className="text-[11px] font-bold text-foreground tracking-wide">{subject.name}</span>
                    </div>
                  ))}
                </div>
               </div>
             </div>
           </div>
           
           {/* 취약유형 TOP3 - 문법 & 독해 */}
           {(() => {
             const getWeakTypes = (answers: QuestionAnswer[]) => {
               if (!answers || answers.length === 0) return [];
               const typeStats: Record<string, { total: number; wrong: number }> = {};
               for (const a of answers) {
                 if (!a.questionType) continue;
                 if (!typeStats[a.questionType]) typeStats[a.questionType] = { total: 0, wrong: 0 };
                 typeStats[a.questionType].total++;
                 if (!a.isCorrect) typeStats[a.questionType].wrong++;
               }
               return Object.entries(typeStats)
                 .filter(([, s]) => s.wrong > 0)
                 .map(([type, s]) => ({ type, wrong: s.wrong, total: s.total, rate: Math.round((s.wrong / s.total) * 100) }))
                 .sort((a, b) => b.wrong - a.wrong || b.rate - a.rate)
                 .slice(0, 3);
             };
             
             const grammarWeak = getWeakTypes(student.answers?.grammar || []);
             const readingWeak = getWeakTypes(student.answers?.reading || []);
             
             if (grammarWeak.length === 0 && readingWeak.length === 0) return null;
             
             return (
               <div className="mt-4 grid grid-cols-2 gap-3">
                 {[{ name: '문법', weak: grammarWeak, icon: grammarIcon }, { name: '독해', weak: readingWeak, icon: readingIcon }].map(({ name, weak, icon }) => (
                   weak.length > 0 && (
                     <div key={name} className="bg-card border border-border rounded-xl p-3">
                       <div className="flex items-center gap-1.5 mb-2">
                         <img src={icon} alt={name} className="w-4 h-4 object-contain" />
                         <span className="text-[11px] font-bold text-foreground">{name} 취약유형 TOP3</span>
                       </div>
                       <div className="space-y-1.5">
                         {weak.map((w, idx) => (
                           <div key={w.type} className="flex items-center justify-between text-[10px]">
                             <div className="flex items-center gap-1.5">
                               <span className="text-[10px] font-bold text-[hsl(210,60%,20%)]">{idx + 1}</span>
                               <span className="font-medium text-foreground">{w.type}</span>
                             </div>
                             <span className="text-destructive font-semibold">{w.wrong}/{w.total}문항 오답</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )
                 ))}
               </div>
             );
           })()}
         </div>

        {/* Answer Tables (정오표) - Separated by Objective/Subjective */}
        {hasAnyAnswers && (
          <div className="p-4 bg-gradient-to-br from-card to-muted/30 rounded-2xl border-2 border-muted shadow-md">
            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 pb-3 border-b border-border">
              <img src={answerIcon} alt="정오표" className="w-6 h-6 object-contain" />
              <span>영역별 정오표</span>
            </h4>
            <div className="space-y-4">
              {subjects.map((subject) => (
                subject.answers.length > 0 && (
                  <AnswerTable 
                    key={subject.key} 
                    answers={subject.answers} 
                    subjectName={subject.name} 
                  />
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-secondary/50 px-6 py-3 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.
      </div>
    </div>
  );
});

ReportCard.displayName = 'ReportCard';

export default ReportCard;
