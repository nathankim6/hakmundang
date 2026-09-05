import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadWorkbook } from '@/utils/workbookStorage';
import { generateMockExam, MockExam, ExamQuestion } from '@/utils/mockExamGenerator';
import { DayGroup } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, RefreshCw, Loader2, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SUNGNAM_WORKBOOK_ID = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a';

interface ExamExplanation {
  number: number;
  explanation: string;
}

const MockExamPage = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState<MockExam | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(5);
  const [version, setVersion] = useState(1);
  const [examTitle, setExamTitle] = useState('[ 선택형 ]');
  const [explanations, setExplanations] = useState<ExamExplanation[]>([]);
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await loadWorkbook(SUNGNAM_WORKBOOK_ID);
      setDayGroups(result.dayGroups);
    } catch (error) {
      console.error(error);
      toast.error('단어장 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  const handleGenerate = async () => {
    if (!dayGroups) return;
    setIsGeneratingExam(true);
    try {
      const newExam = await generateMockExam(dayGroups, startDay, endDay, version);
      setExam(newExam);
      setShowAnswers(false);
      setExplanations([]);
      toast.success(`동형모의고사 v${version} 생성 완료!`);
    } catch (err: any) {
      toast.error(err.message || '시험지 생성에 실패했습니다.');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleRegenerate = async () => {
    setVersion(v => v + 1);
    if (!dayGroups) return;
    setIsGeneratingExam(true);
    try {
      const newExam = await generateMockExam(dayGroups, startDay, endDay, version + 1);
      setExam(newExam);
      setShowAnswers(false);
      setExplanations([]);
      toast.success(`동형모의고사 v${version + 1} 생성 완료!`);
    } catch (err: any) {
      toast.error(err.message || '시험지 생성에 실패했습니다.');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleGenerateExplanations = async () => {
    if (!exam) return;
    setIsGeneratingExplanations(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-exam-explanations', {
        body: { questions: exam.questions },
      });

      if (error) {
        console.error('Explanation error:', error);
        toast.error('해설 생성에 실패했습니다.');
        return;
      }

      if (data?.explanations) {
        setExplanations(data.explanations);
        toast.success('해설이 생성되었습니다!');
      }
    } catch (err: any) {
      console.error(err);
      if (err?.status === 429) {
        toast.error('요청 한도 초과, 잠시 후 다시 시도해주세요.');
      } else if (err?.status === 402) {
        toast.error('크레딧이 부족합니다.');
      } else {
        toast.error('해설 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const maxDay = dayGroups ? dayGroups.length : 30;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">워드마스터 수능2000 단어장을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar - hidden on print */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 뒤로
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">범위:</span>
            <span className="text-muted-foreground">DAY</span>
            <select
              value={startDay}
              onChange={e => setStartDay(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-muted-foreground">~</span>
            <span className="text-muted-foreground">DAY</span>
            <select
              value={endDay}
              onChange={e => setEndDay(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">타이틀:</span>
            <input
              value={examTitle}
              onChange={e => setExamTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background w-40"
              placeholder="시험지 타이틀"
            />
          </div>

          <Button size="sm" onClick={handleGenerate} disabled={isGeneratingExam}>
            {isGeneratingExam ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
            {isGeneratingExam ? 'AI 예문 생성 중...' : '생성'}
          </Button>

          {exam && (
            <>
              <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={isGeneratingExam}>
                {isGeneratingExam ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                재생성
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? '답안 숨기기' : '답안 보기'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateExplanations}
                disabled={isGeneratingExplanations}
              >
                {isGeneratingExplanations ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4 mr-1" />
                )}
                {isGeneratingExplanations ? 'AI 해설 생성 중...' : explanations.length > 0 ? '해설 재생성' : '해설지 생성'}
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> 인쇄
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Exam Content */}
      {!exam ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">워드마스터 수능2000 동형모의고사</h2>
          <p className="text-muted-foreground mb-6">DAY 범위를 설정한 후 '생성' 버튼을 눌러주세요.</p>
          <p className="text-xs text-muted-foreground">
            • 단어 의미, 문맥 어색, 유의어/반의어, 빈칸 채우기 등 10문제<br />
            • 매번 랜덤으로 새로운 문제가 생성됩니다
          </p>
        </div>
      ) : (
        <div ref={printRef}>
          {/* Page 1: Exam (A4) */}
          <div className="page-b5 mx-auto bg-white text-black print:shadow-none shadow-lg my-6 print:my-0" style={{ padding: '7mm' }}>
            <div className="border-2 border-black h-full flex flex-col">
              {/* Header with logo */}
              <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black bg-gray-50">
                <div className="flex items-center gap-2">
                  <img src="/assets/orun-academy-logo-print.jpg" alt="옳은영어" className="w-10 h-10 object-contain rounded" />
                  <span className="text-[12px] font-bold tracking-wide">옳은영어</span>
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-base font-bold tracking-wider">워드마스터 수능2000 동형모의고사</h1>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    • 단어 문제 [1-10번]은 각 1.5점씩, 선택형 문제와 서답형 문제는 배점이 별도로 표기되어 있습니다.
                  </p>
                </div>
                <div className="w-10" />
              </div>

              <div className="text-center py-1 border-b border-black bg-gray-100">
                <p className="text-[12px] font-semibold">
                  {examTitle} · {exam.dayRange} · v{exam.version}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
                <div className="border-r border-black px-3 py-2 flex flex-col justify-between text-[10.5px] leading-[1.45]">
                  {exam.questions.slice(0, 5).map(q => (
                    <QuestionBlock key={q.number} question={q} showAnswer={showAnswers} />
                  ))}
                </div>
                <div className="px-3 py-2 flex flex-col justify-between text-[10px] leading-[1.4]">
                  {exam.questions.slice(5).map(q => (
                    <QuestionBlock key={q.number} question={q} showAnswer={showAnswers} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pages 2+: Answer Key + Explanations (auto-paginated) */}
          {explanations.length > 0 && (() => {
            // Split explanations into pages that fit within A4
            // Each page holds ~5 explanations in 2-column layout
            const expPerPage = 10;
            const totalPages = Math.ceil(explanations.length / expPerPage);
            
            return Array.from({ length: totalPages }, (_, pageIdx) => {
              const pageExps = explanations.slice(pageIdx * expPerPage, (pageIdx + 1) * expPerPage);
              const leftCol = pageExps.slice(0, Math.ceil(pageExps.length / 2));
              const rightCol = pageExps.slice(Math.ceil(pageExps.length / 2));
              
              return (
                <div key={`exp-page-${pageIdx}`} className="page-b5 mx-auto bg-white text-black print:shadow-none shadow-lg my-6 print:my-0 print:break-before-page" style={{ padding: '7mm' }}>
                  <div className="border-2 border-black h-full flex flex-col">
                    {/* Header */}
                    <div className="text-center py-2 border-b-2 border-black bg-gray-100">
                      <h1 className="text-sm font-bold tracking-wider">
                        정답 및 해설{totalPages > 1 ? ` (${pageIdx + 1}/${totalPages})` : ''}
                      </h1>
                      <p className="text-[9px] text-gray-600 mt-0.5">
                        워드마스터 수능2000 · {exam.dayRange} · v{exam.version}
                      </p>
                    </div>

                    {/* Answer Key Row - only on first page */}
                    {pageIdx === 0 && (
                      <div className="flex items-center justify-center gap-4 py-2 border-b border-black bg-gray-50 text-xs">
                        {exam.questions.map(q => (
                          <div key={q.number} className="flex items-center gap-0.5">
                            <span className="font-bold">{q.number}.</span>
                            <span className="text-red-600 font-bold">{LABELS_TEXT[q.answer - 1]}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanations - 2 column layout */}
                    <div className="grid grid-cols-2 gap-0 flex-1">
                      <div className="border-r border-black px-3 py-2 space-y-3 text-[9px] leading-relaxed">
                        {leftCol.map(exp => (
                          <div key={exp.number}>
                            <p className="font-bold text-[10px] mb-0.5 border-b border-gray-300 pb-0.5">
                              {exp.number}번 해설
                              <span className="ml-2 text-red-600 font-bold">정답: {LABELS_TEXT[(exam.questions.find(q => q.number === exp.number)?.answer || 1) - 1]}</span>
                            </p>
                            <p className="text-gray-800">{exp.explanation}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 space-y-3 text-[9px] leading-relaxed">
                        {rightCol.map(exp => (
                          <div key={exp.number}>
                            <p className="font-bold text-[10px] mb-0.5 border-b border-gray-300 pb-0.5">
                              {exp.number}번 해설
                              <span className="ml-2 text-red-600 font-bold">정답: {LABELS_TEXT[(exam.questions.find(q => q.number === exp.number)?.answer || 1) - 1]}</span>
                            </p>
                            <p className="text-gray-800">{exp.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

const LABELS_TEXT = ['①', '②', '③', '④', '⑤'];

const QuestionBlock = ({ question, showAnswer }: { question: ExamQuestion; showAnswer: boolean }) => {
  const q = question;

  return (
    <div className="relative">
      <div className="mb-1">
        {q.type === 'context-awkward' || q.type === 'expression-awkward' ? (
          <p>
            <span className="font-bold">{q.number}.</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: q.instruction }} />
          </p>
        ) : q.type === 'common-blank' ? (
          <>
            {q.number === 8 && (
              <p className="text-[10.5px] text-black mb-0.5 font-medium">[8-10] 다음 빈칸에 공통으로 들어갈 단어로 가장 적절한 것을 고르시오.</p>
            )}
            <p className="font-bold">{q.number}.</p>
          </>
        ) : (
          <p>
            <span className="font-bold">{q.number}.</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: q.instruction }} />
          </p>
        )}
      </div>

      {q.sentencePairs && (
        <div className="border border-gray-400 rounded p-1.5 mb-1 bg-gray-50">
          {q.sentencePairs.map((sp, i) => (
            <div key={i} className="space-y-0.5">
              <p dangerouslySetInnerHTML={{ __html: sp.sentence1 }} />
              <p dangerouslySetInnerHTML={{ __html: sp.sentence2 }} />
            </div>
          ))}
        </div>
      )}

      {q.type === 'fill-blank' && q.sentences && (
        <div className="border border-gray-400 rounded p-1.5 mb-1 bg-gray-50">
          {q.sentences.map((s, i) => (
            <p key={i}>{s.text}</p>
          ))}
        </div>
      )}

      {q.sentences && q.type !== 'fill-blank' && (
        <div className="space-y-0.5">
          {q.sentences.map((s, i) => (
            <p key={i}>
              <span className="mr-0.5">{s.label}</span>
              <span dangerouslySetInnerHTML={{ __html: s.text }} />
            </p>
          ))}
        </div>
      )}

      {q.choices && q.type !== 'fill-blank' && (
        <div className={`mt-0.5 ${q.type === 'meaning-match' ? 'grid grid-cols-2 gap-x-3 gap-y-0' : 'space-y-0'}`}>
          {q.choices.map((c, i) => (
            <p key={i}>
              <span className="mr-0.5">{c.label}</span> {c.text}
            </p>
          ))}
        </div>
      )}

      {q.choices && q.type === 'fill-blank' && (
        <div className="flex flex-wrap gap-x-3 mt-0.5">
          {q.choices.map((c, i) => (
            <span key={i}>{c.label} {c.text}</span>
          ))}
        </div>
      )}

      {showAnswer && (
        <div className="absolute -right-0.5 -top-0.5 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded-bl font-bold">
          {LABELS_TEXT[q.answer - 1]}
        </div>
      )}
    </div>
  );
};

export default MockExamPage;
