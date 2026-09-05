import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileUp, ScanLine, Check, X, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getPrepSet, PREP_VERSION_META, type PrepVersion } from '@/data/prepVersions';
import { calculatePrepScores, isPrepAnswerCorrect, type PrepAnswerValue } from '@/utils/prepScoring';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface StudentSheet {
  id: string;
  fileName: string;
  name: string;
  school: string;
  grade: string;
  className: string;
  answers: Record<number, PrepAnswerValue>;
  status: 'pending' | 'scanning' | 'done' | 'error' | 'submitted';
  message?: string;
}

/** PDF 페이지를 JPEG data URL 로 렌더링 */
const renderPdfToImages = async (file: File, onProgress?: (p: number, total: number) => void) => {
  const pdfjs: any = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const images: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.85));
    onProgress?.(i, pdf.numPages);
  }
  return images;
};

const answerToText = (v: PrepAnswerValue) => {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return (v as any[]).join(', ');
  if (typeof v === 'object') return '';
  return String(v);
};

const PrepPdfScanDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [version, setVersion] = useState<PrepVersion>('v2');
  const [files, setFiles] = useState<File[]>([]);
  const [sheets, setSheets] = useState<StudentSheet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prepSet = getPrepSet(version);
  const questions = prepSet.questions;

  const reset = () => {
    setFiles([]);
    setSheets([]);
    setActiveId(null);
    setProgress('');
  };

  const updateSheet = (id: string, patch: Partial<StudentSheet>) =>
    setSheets(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

  const handleScan = async () => {
    if (!files.length) {
      toast({ title: 'PDF 파일을 선택해주세요.', variant: 'destructive' });
      return;
    }
    setIsScanning(true);
    const created: StudentSheet[] = files.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      fileName: f.name,
      name: '',
      school: '',
      grade: '',
      className: '',
      answers: {},
      status: 'pending',
    }));
    setSheets(created);
    setActiveId(created[0]?.id ?? null);

    const questionMeta = questions
      .map(q => `${q.id}:${q.inputType === 'choice' ? '객관식' : '주관식'}`)
      .join(', ');

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const sheet = created[idx];
      updateSheet(sheet.id, { status: 'scanning' });
      try {
        setProgress(`(${idx + 1}/${files.length}) ${file.name} · PDF 변환 중...`);
        const images = await renderPdfToImages(file, (p, total) =>
          setProgress(`(${idx + 1}/${files.length}) ${file.name} · PDF 변환 중 (${p}/${total})`)
        );
        setProgress(`(${idx + 1}/${files.length}) ${file.name} · AI 답안 인식 중...`);
        const { data, error } = await supabase.functions.invoke('extract-prep-answers-from-pdf', {
          body: {
            pageImages: images,
            questionCount: questions.length,
            questionMeta,
            accessCode: sessionStorage.getItem('verifiedAccessCode') || '',
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const raw = (data?.answers || {}) as Record<string, any>;
        const normalized: Record<number, PrepAnswerValue> = {};
        Object.entries(raw).forEach(([k, v]) => {
          const num = Number(k);
          const question = questions.find(q => q.id === num);
          if (!question) return;
          if (question.inputType === 'choice') {
            if (Array.isArray(v)) normalized[num] = v.length === 1 ? Number(v[0]) : v.map(Number);
            else normalized[num] = Number(v);
          } else {
            normalized[num] = Array.isArray(v) ? v.join(', ') : String(v);
          }
        });
        const info = data?.studentInfo || {};
        updateSheet(sheet.id, {
          answers: normalized,
          name: info.name || '',
          school: info.school || '',
          grade: info.grade ? String(info.grade) : '',
          className: info.className || info.class || '',
          status: 'done',
          message: `${Object.keys(normalized).length}문항 인식`,
        });
      } catch (e: any) {
        console.error(e);
        updateSheet(sheet.id, { status: 'error', message: e?.message || '인식 실패' });
      }
    }
    setIsScanning(false);
    setProgress('');
    toast({ title: '답안 인식 완료', description: '문항별 인식 결과를 확인하고 수정하세요.' });
  };

  const handleSubmitAll = async () => {
    const targets = sheets.filter(s => s.status === 'done');
    if (!targets.length) {
      toast({ title: '제출할 학생이 없습니다.', variant: 'destructive' });
      return;
    }
    if (targets.some(s => !s.name.trim())) {
      toast({ title: '모든 학생의 이름을 입력해주세요.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const academy = localStorage.getItem('accessAcademy') || 'orun';
    let ok = 0;
    for (const s of targets) {
      try {
        const { sectionScores, subCategoryScores, totalScore, level } = calculatePrepScores(version, s.answers);
        const { error } = await supabase.from('level_test_results').insert({
          student_name: s.name.trim(),
          student_school: s.school.trim(),
          student_grade: s.grade.trim(),
          student_class: s.className.trim() || null,
          answers: { ...s.answers, __prepVersion: version } as any,
          total_score: totalScore,
          level: `prep-${level}`,
          section_scores: sectionScores as any,
          sub_category_scores: subCategoryScores as any,
          elapsed_time: 0,
          academy,
        });
        if (error) throw error;
        ok++;
        updateSheet(s.id, { status: 'submitted', message: `${totalScore}점` });
      } catch (e: any) {
        console.error(e);
        updateSheet(s.id, { status: 'error', message: e?.message || '저장 실패' });
      }
    }
    setIsSubmitting(false);
    toast({ title: '리포트 생성 완료', description: `${ok}명의 리포트를 생성했습니다.` });
    if (ok) onCreated?.();
  };

  const active = sheets.find(s => s.id === activeId) || null;
  const correctCount = active
    ? questions.filter(q => isPrepAnswerCorrect(q, active.answers[q.id])).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-violet-600" /> 레벨테스트 AI자동채점
          </DialogTitle>
          <DialogDescription>
            여러 학생의 시험지 PDF를 한 번에 올리면 문항별 답안을 인식해 보여줍니다. 잘못 인식된 답안과 학생 정보를 수정한 뒤 제출하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>시험지 버전</Label>
            <div className="flex gap-2">
              {(['v1', 'v2'] as PrepVersion[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVersion(v); setSheets([]); setActiveId(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    version === v
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {PREP_VERSION_META[v].label} · {PREP_VERSION_META[v].subtitle}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>시험지 PDF (여러 명 동시 선택 가능)</Label>
            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={e => { setFiles(Array.from(e.target.files || [])); setSheets([]); setActiveId(null); }}
            />
            {files.length > 0 && (
              <p className="text-xs text-slate-500">{files.length}개 파일 선택됨</p>
            )}
          </div>

          <Button onClick={handleScan} disabled={isScanning || !files.length} className="w-full">
            {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            {isScanning ? (progress || '인식 중...') : `PDF 답안 인식하기${files.length > 1 ? ` (${files.length}명)` : ''}`}
          </Button>

          {sheets.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {sheets.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveId(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      activeId === s.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.name || s.fileName}
                    {s.status === 'scanning' && ' · 인식중'}
                    {s.status === 'error' && ' · 오류'}
                    {s.status === 'submitted' && ' · 완료'}
                  </button>
                ))}
              </div>

              {active && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 truncate">{active.fileName} {active.message ? `· ${active.message}` : ''}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSheets(prev => prev.filter(s => s.id !== active.id));
                        setActiveId(prev => {
                          const rest = sheets.filter(s => s.id !== active.id);
                          return rest[0]?.id ?? null;
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 제외
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label>이름</Label>
                      <Input value={active.name} onChange={e => updateSheet(active.id, { name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>학교</Label>
                      <Input value={active.school} onChange={e => updateSheet(active.id, { school: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>학년</Label>
                      <Input value={active.grade} onChange={e => updateSheet(active.id, { grade: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>반 / 소속</Label>
                      <Input value={active.className} onChange={e => updateSheet(active.id, { className: e.target.value })} />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    인식된 답안 {Object.keys(active.answers).length} / {questions.length}문항 · 정답 {correctCount}문항 · 잘못 인식된 답안은 아래에서 수정하세요.
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto p-1">
                    {questions.map(q => {
                      const value = active.answers[q.id];
                      const filled = value !== undefined && value !== '';
                      const correct = isPrepAnswerCorrect(q, value);
                      return (
                        <div
                          key={q.id}
                          className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 border ${
                            !filled
                              ? 'border-slate-200 bg-slate-50'
                              : correct
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-rose-200 bg-rose-50'
                          }`}
                        >
                          <span className="w-7 shrink-0 text-[11px] font-bold text-slate-500 text-right">{q.id}.</span>
                          <Input
                            className="h-7 text-xs bg-white"
                            value={answerToText(value)}
                            onChange={e => {
                              const val = e.target.value;
                              const next = { ...active.answers };
                              if (!val.trim()) {
                                delete next[q.id];
                              } else if (q.inputType === 'choice') {
                                const parts = val.split(/[,，\s]+/).map(s => Number(s.trim())).filter(n => Number.isFinite(n));
                                next[q.id] = parts.length > 1 ? parts : parts[0];
                              } else {
                                next[q.id] = val;
                              }
                              updateSheet(active.id, { answers: next });
                            }}
                          />
                          {filled && (correct
                            ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            : <X className="h-3.5 w-3.5 shrink-0 text-rose-500" />)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitAll} disabled={isSubmitting || isScanning} className="w-full bg-slate-900 hover:bg-slate-800">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                제출하고 리포트 생성 ({sheets.filter(s => s.status === 'done').length}명)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrepPdfScanDialog;
