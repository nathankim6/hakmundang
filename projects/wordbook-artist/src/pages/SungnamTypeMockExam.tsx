import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadWorkbook } from '@/utils/workbookStorage';
import { generateSungnamTypeExam, SUNGNAM_QUESTION_TYPES, MockExam, ExamQuestion } from '@/utils/mockExamGenerator';
import { DayGroup } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, RefreshCw, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const SUNGNAM_WORKBOOK_ID = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a';
const LABELS_TEXT = ['①', '②', '③', '④', '⑤'];

const SungnamTypeMockExamPage = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState<MockExam | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(5);
  const [version, setVersion] = useState(1);
  const [selectedType, setSelectedType] = useState(SUNGNAM_QUESTION_TYPES[0].id);
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = () => {
    if (!dayGroups) return;
    setIsGenerating(true);
    try {
      const generated = generateSungnamTypeExam(dayGroups, startDay, endDay, selectedType, questionCount, version);
      setExam(generated);
      setShowAnswers(false);
      toast.success(`${generated.questions.length}문제 생성 완료!`);
    } catch (err: any) {
      toast.error(err.message || '시험지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const newVersion = version + 1;
    setVersion(newVersion);
    if (!dayGroups) return;
    setIsGenerating(true);
    try {
      const generated = generateSungnamTypeExam(dayGroups, startDay, endDay, selectedType, questionCount, newVersion);
      setExam(generated);
      setShowAnswers(false);
      toast.success(`${generated.questions.length}문제 재생성 완료!`);
    } catch (err: any) {
      toast.error(err.message || '시험지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const maxDay = dayGroups ? dayGroups.length : 30;
  const selectedTypeLabel = SUNGNAM_QUESTION_TYPES.find(t => t.id === selectedType)?.label || '';

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
      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 뒤로
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">유형:</span>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background">
              {SUNGNAM_QUESTION_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">범위:</span>
            <span className="text-muted-foreground">DAY</span>
            <select value={startDay} onChange={e => setStartDay(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-muted-foreground">~</span>
            <span className="text-muted-foreground">DAY</span>
            <select value={endDay} onChange={e => setEndDay(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">문제 수:</span>
            <input type="number" min={1} max={50} value={questionCount}
              onChange={e => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="border rounded px-2 py-1 text-sm bg-background w-16" />
          </div>

          <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
            생성
          </Button>

          {exam && (
            <>
              <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={isGenerating}>
                <RefreshCw className="w-4 h-4 mr-1" /> 재생성
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? '답안 숨기기' : '답안 보기'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> 인쇄
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!exam ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">워드마스터 수능2000 유형별 모의고사</h2>
          <p className="text-muted-foreground mb-6">문제 유형과 DAY 범위, 문제 수를 설정한 후 '생성'을 눌러주세요.</p>
        </div>
      ) : (
        <div ref={printRef}>
          {/* Paginate questions */}
          {(() => {
            // 의미 연결 부적절은 선지가 짧으므로 16문제/페이지, 나머지는 8문제/페이지
            const perPage = selectedType === 'meaning-match' ? 16 : 8;
            const totalPages = Math.ceil(exam.questions.length / perPage);
            return Array.from({ length: totalPages }, (_, pageIdx) => {
              const pageQs = exam.questions.slice(pageIdx * perPage, (pageIdx + 1) * perPage);
              const leftCol = pageQs.slice(0, Math.ceil(pageQs.length / 2));
              const rightCol = pageQs.slice(Math.ceil(pageQs.length / 2));
              return (
                <div key={pageIdx} className={`page-b5 mx-auto bg-white text-black print:shadow-none shadow-lg my-6 print:my-0 ${pageIdx > 0 ? 'print:break-before-page' : ''}`} style={{ padding: '7mm' }}>
                  <div className="border-2 border-black h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-black bg-gray-50">
                      <div className="flex items-center gap-2">
                        <img src="/assets/orun-academy-logo-print.jpg" alt="옳은영어" className="w-8 h-8 object-contain rounded" />
                        <span className="text-[10px] font-bold tracking-wide">옳은영어</span>
                      </div>
                      <div className="text-center flex-1">
                        <h1 className="text-xs font-bold tracking-wider">워드마스터 수능2000 유형별 모의고사</h1>
                        <p className="text-[8px] text-gray-600 mt-0.5">
                          {selectedTypeLabel} · {exam.dayRange} · v{exam.version}
                          {totalPages > 1 ? ` (${pageIdx + 1}/${totalPages})` : ''}
                        </p>
                      </div>
                      <div className="w-8" />
                    </div>

                    <div className="grid grid-cols-2 gap-0 flex-1">
                      <div className="border-r border-black px-2 py-2.5 flex flex-col justify-between text-[11.5px] leading-normal">
                        {leftCol.map(q => (
                          <QuestionBlock key={q.number} question={q} showAnswer={showAnswers} />
                        ))}
                      </div>
                      <div className="px-2 py-2.5 flex flex-col justify-between text-[11.5px] leading-normal">
                        {rightCol.map(q => (
                          <QuestionBlock key={q.number} question={q} showAnswer={showAnswers} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          {/* Answer Key with Explanations */}
          <div className="page-b5 mx-auto bg-white text-black print:shadow-none shadow-lg my-6 print:my-0 print:break-before-page" style={{ padding: '7mm' }}>
            <div className="border-2 border-black h-full flex flex-col">
              <div className="text-center py-2 border-b-2 border-black bg-gray-100">
                <h1 className="text-sm font-bold tracking-wider">정답 및 해설</h1>
                <p className="text-[9px] text-gray-600 mt-0.5">
                  {selectedTypeLabel} · {exam.dayRange} · v{exam.version}
                </p>
              </div>
              <div className="px-3 py-2 flex-1 content-start">
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-3 pb-2 border-b border-gray-300">
                  {exam.questions.map(q => (
                    <div key={q.number} className="flex items-center gap-1 text-sm">
                      <span className="font-bold">{q.number}.</span>
                      <span className="text-red-600 font-bold">{LABELS_TEXT[q.answer - 1]}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {exam.questions.filter(q => q.explanation).map(q => (
                    <div key={q.number} className="text-[10px] leading-relaxed">
                      <span className="font-bold">{q.number}.</span>{' '}
                      <span className="text-red-600 font-semibold">[{LABELS_TEXT[q.answer - 1]}]</span>{' '}
                      <span>{q.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== Question Rendering (reused from MockExam) ==========

const QuestionBlock = ({ question, showAnswer }: { question: ExamQuestion; showAnswer: boolean }) => {
  const q = question;
  return (
    <div className="relative">
      <div className="mb-1">
        {q.type === 'common-blank' ? (
          <>
            <p className="text-[8px] text-gray-500 mb-0.5">다음 빈칸에 공통으로 들어갈 단어로 가장 적절한 것을 고르시오.</p>
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
            <p key={i}><span className="mr-0.5">{c.label}</span> {c.text}</p>
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

export default SungnamTypeMockExamPage;
