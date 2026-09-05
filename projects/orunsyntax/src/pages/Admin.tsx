import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Shield, Key, Copy, Check, Loader2, Download, FileSpreadsheet, Settings, BookOpen, Search, Tag, Sparkles, BookText, FileText } from 'lucide-react';
import { useAuth, ALL_WORKBOOK_IDS, WORKBOOK_LABELS, WorkbookId } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import orunAcademyBadge from '@/assets/orun-academy-badge.jpg';
import { parseQuestions } from '@/lib/parseQuestions';
import { distributeWeekly, type WeekData } from '@/lib/weeklyDistribution';
import sentencesG12Raw from '@/data/sentences-g12.txt?raw';
import type { VocabItem } from '@/components/WeeklyVocabTable';

// Parse answer from analysis text
const parseAnswerFromAnalysis = (analysis: string): string => {
  const lines = analysis.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('✅') || trimmed.startsWith('정답:') || trimmed.includes('✅ 정답')) {
      const match = trimmed.match(/(?:✅\s*정답\s*[:：]?\s*|정답\s*[:：]?\s*)(.+)/);
      if (match) return match[1].trim();
      return trimmed.replace(/^✅\s*/, '').replace(/^정답\s*[:：]?\s*/, '').trim();
    }
  }
  return '';
};

// Parse error (wrong answer) from analysis text
const parseErrorFromAnalysis = (analysis: string): string => {
  const lines = analysis.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('❌') || trimmed.startsWith('오답:') || trimmed.includes('❌ 오답')) {
      const match = trimmed.match(/(?:❌\s*오답\s*[:：]?\s*|오답\s*[:：]?\s*)(.+)/);
      if (match) return match[1].trim();
      return trimmed.replace(/^❌\s*/, '').replace(/^오답\s*[:：]?\s*/, '').trim();
    }
  }
  return '';
};

// Parse error analysis explanation from analysis text
const parseExplanationFromAnalysis = (analysis: string): string => {
  const lines = analysis.split('\n');
  let inAnalysisSection = false;
  const explanationLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('【오답 분석】') || trimmed.includes('오답 분석')) {
      inAnalysisSection = true;
      continue;
    }
    
    if (inAnalysisSection && (
      trimmed.includes('【구문 분석】') || 
      trimmed.includes('구문 분석') ||
      trimmed === '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )) {
      break;
    }
    
    if (inAnalysisSection && trimmed) {
      explanationLines.push(trimmed);
    }
  }
  
  return explanationLines.join(' ').replace(/"/g, '""');
};

interface AccessCodeItem {
  code: string;
  created_at: string;
  last_used_at: string | null;
  use_count: number;
  allowed_workbooks: string[];
}

const Admin = () => {
  const { isAdmin, isLoading: authLoading, getIssuedCodes, addCode, updateCodeWorkbooks, removeCode, refreshCodes } = useAuth();
  const [newCode, setNewCode] = useState('');
  const [newCodeWorkbooks, setNewCodeWorkbooks] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWorkbook, setSelectedWorkbook] = useState<string>('syntax10000');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingWorkbooks, setEditingWorkbooks] = useState<string[]>([]);
  const [isSavingWorkbooks, setIsSavingWorkbooks] = useState(false);

  // Vocab extraction state
  const [vocabWeek, setVocabWeek] = useState<number>(1);
  const [isExtractingVocab, setIsExtractingVocab] = useState(false);
  const [extractingAll, setExtractingAll] = useState(false);
  const [extractProgress, setExtractProgress] = useState<{ current: number; total: number } | null>(null);
  const [extractedVocab, setExtractedVocab] = useState<Record<number, VocabItem[]>>({});
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);

  // Exam question extraction state
  const [examPdfText, setExamPdfText] = useState('');
  const [examWorkbookId, setExamWorkbookId] = useState('weekly-g10');
  const [isExtractingExam, setIsExtractingExam] = useState(false);
  const [examExtractResult, setExamExtractResult] = useState<any[] | null>(null);
  const [examSaveStatus, setExamSaveStatus] = useState<string>('');
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [examDbCount, setExamDbCount] = useState<number>(0);

  // Load exam question count from DB
  useEffect(() => {
    const loadExamCount = async () => {
      const { count } = await supabase
        .from('exam_questions')
        .select('*', { count: 'exact', head: true });
      setExamDbCount(count || 0);
    };
    if (isAdmin) loadExamCount();
  }, [isAdmin]);

  // Split large PDF text into chunks by detecting question boundaries
  const splitPdfTextIntoChunks = (text: string, questionsPerChunk: number = 10): string[] => {
    // Try to split by common question markers like [2015년, [2016년, etc.
    const questionPattern = /(?=\[\d{4}년)/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match;
    const indices: number[] = [];
    
    while ((match = questionPattern.exec(text)) !== null) {
      indices.push(match.index);
    }
    
    if (indices.length <= 1) {
      // Can't split by year markers, split by character length (~4000 chars per chunk)
      const chunkSize = 4000;
      for (let i = 0; i < text.length; i += chunkSize) {
        parts.push(text.slice(i, i + chunkSize));
      }
      return parts;
    }
    
    // Group questions into chunks
    for (let i = 0; i < indices.length; i += questionsPerChunk) {
      const start = indices[i];
      const end = i + questionsPerChunk < indices.length ? indices[i + questionsPerChunk] : text.length;
      parts.push(text.slice(start, end));
    }
    
    // Include any text before the first marker
    if (indices[0] > 0) {
      parts[0] = text.slice(0, indices[0]) + parts[0];
    }
    
    return parts;
  };

  const handleExtractExamQuestions = async () => {
    if (!examPdfText.trim()) {
      alert('PDF 텍스트를 붙여넣어 주세요.');
      return;
    }

    const getErrorText = (err: unknown): string => {
      if (typeof err === 'string') return err;
      if (err instanceof Error) return err.message;

      try {
        return JSON.stringify(err);
      } catch {
        return String(err);
      }
    };

    const isCreditsExhaustedError = (err: unknown) => {
      const text = getErrorText(err);
      return /\b402\b|credits? exhausted|payment_required|not enough credits|CREDITS_EXHAUSTED/i.test(text);
    };

    setIsExtractingExam(true);
    setExamExtractResult(null);
    setExamSaveStatus('');

    try {
      const chunks = splitPdfTextIntoChunks(examPdfText, 10);
      const allQuestions: any[] = [];
      let creditsExhausted = false;

      for (let i = 0; i < chunks.length; i++) {
        setExamSaveStatus(`배치 ${i + 1}/${chunks.length} 처리 중...`);

        let data: any = null;
        let batchError: unknown = null;

        try {
          const result = await supabase.functions.invoke('extract-exam-questions', {
            body: { pdfText: chunks[i], batchIndex: i }
          });
          data = result.data;
          batchError = result.error;
        } catch (invokeErr) {
          batchError = invokeErr;
        }

        if (batchError) {
          const errorText = getErrorText(batchError);
          console.error(`Batch ${i} error:`, batchError);

          if (isCreditsExhaustedError(batchError)) {
            creditsExhausted = true;
            setExamSaveStatus('❌ AI 크레딧이 부족합니다. 충전 후 다시 시도해 주세요.');
            break;
          }

          setExamSaveStatus(`❌ 배치 ${i + 1} 오류로 중단됨: ${errorText.slice(0, 120)}`);
          break;
        }

        if (data?.questions) {
          allQuestions.push(...data.questions);
        }

        // Delay between batches to reduce backend pressure
        if (i < chunks.length - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      }

      if (creditsExhausted) {
        setExamExtractResult(allQuestions.length > 0 ? allQuestions : null);
        if (allQuestions.length > 0) {
          setExamSaveStatus(`⚠️ 크레딧 부족으로 중단됨 (부분 추출 ${allQuestions.length}개)`);
        }
        return;
      }

      setExamExtractResult(allQuestions);
      setExamSaveStatus(`✅ 총 ${allQuestions.length}개 문제 추출 완료 (${chunks.length}개 배치)`);
    } catch (err: any) {
      console.error('Exam extraction error:', err);
      setExamSaveStatus(`오류: ${err.message}`);
    } finally {
      setIsExtractingExam(false);
    }
  };

  const handleSaveExamQuestions = async () => {
    if (!examExtractResult || examExtractResult.length === 0) return;
    setIsSavingExam(true);
    setExamSaveStatus('DB에 저장 중...');
    try {
      // Get current max question_id for this workbook
      const { data: existing } = await supabase
        .from('exam_questions')
        .select('question_id')
        .eq('workbook_id', examWorkbookId)
        .order('question_id', { ascending: false })
        .limit(1);
      const startId = existing && existing.length > 0 ? existing[0].question_id + 1 : 1;

      const rows = examExtractResult.map((q: any, idx: number) => ({
        question_id: startId + idx,
        workbook_id: examWorkbookId,
        year: q.year || '',
        month: q.month || '',
        question_number: q.questionNumber || '',
        error_rate: q.errorRate || '',
        question_type: q.questionType || '',
        question_prompt: q.questionPrompt || '',
        passage: q.passage || '',
        choices: q.choices || [],
        answer: q.answer || '',
        explanation: q.explanation || '',
        translation: q.translation || '',
        vocabulary: q.vocabulary || [],
      }));

      // Insert via edge function (since RLS doesn't allow direct insert)
      const { data, error } = await supabase.functions.invoke('manage-exam-questions', {
        body: { action: 'upsert', questions: rows }
      });
      if (error) throw error;
      
      setExamSaveStatus(`✅ ${rows.length}개 문제 DB 저장 완료 (ID: ${startId}~${startId + rows.length - 1})`);
      // Refresh count
      const { count } = await supabase
        .from('exam_questions')
        .select('*', { count: 'exact', head: true });
      setExamDbCount(count || 0);
    } catch (err: any) {
      console.error('Save error:', err);
      setExamSaveStatus(`❌ 저장 실패: ${err.message}`);
    } finally {
      setIsSavingExam(false);
    }
  };

  // Load weekly distribution data
  useEffect(() => {
    const loadWeeklyData = async () => {
      const allQuestions = parseQuestions(sentencesG12Raw);
      // Load grammar categories
      const { data: catData } = await supabase
        .from('question_grammar_categories')
        .select('question_id, category')
        .eq('workbook_id', 'syntax2320');
      
      const grammarCategories: Record<number, string> = {};
      if (catData) {
        catData.forEach(item => {
          grammarCategories[item.question_id] = item.category;
        });
      }
      
      const weeks = distributeWeekly(allQuestions, grammarCategories);
      setWeeklyData(weeks);
    };
    if (isAdmin) loadWeeklyData();
  }, [isAdmin]);

  const extractVocabForWeek = useCallback(async (weekNum: number): Promise<VocabItem[]> => {
    const week = weeklyData.find(w => w.weekNumber === weekNum);
    if (!week) return [];

    const sentences = week.questions.map(q => ({ id: q.id, sentence: q.sentence }));
    
    const { data, error } = await supabase.functions.invoke('extract-vocabulary', {
      body: { sentences, weekNumber: weekNum }
    });

    if (error) {
      console.error('Vocab extraction error:', error);
      throw error;
    }

    return data?.vocabulary || [];
  }, [weeklyData]);

  const handleExtractVocab = async () => {
    setIsExtractingVocab(true);
    try {
      const vocab = await extractVocabForWeek(vocabWeek);
      setExtractedVocab(prev => ({ ...prev, [vocabWeek]: vocab }));
    } catch (err) {
      alert('어휘 추출에 실패했습니다.');
    } finally {
      setIsExtractingVocab(false);
    }
  };

  const handleExtractAll = async () => {
    if (!confirm('전체 20주차의 어휘를 추출합니다. 시간이 다소 소요됩니다. 진행하시겠습니까?')) return;
    setExtractingAll(true);
    setExtractProgress({ current: 0, total: 20 });
    
    const results: Record<number, VocabItem[]> = {};
    for (let w = 1; w <= 20; w++) {
      setExtractProgress({ current: w, total: 20 });
      try {
        const vocab = await extractVocabForWeek(w);
        results[w] = vocab;
      } catch {
        results[w] = [];
      }
      // Small delay to avoid rate limiting
      if (w < 20) await new Promise(r => setTimeout(r, 2000));
    }
    
    setExtractedVocab(prev => ({ ...prev, ...results }));
    setExtractingAll(false);
    setExtractProgress(null);
  };

  const handleExportVocabCSV = (weekNum: number) => {
    const vocab = extractedVocab[weekNum];
    if (!vocab || vocab.length === 0) return;
    
    const csvRows = ['번호,단어,품사,뜻'];
    vocab.forEach((item, idx) => {
      csvRows.push(`${idx + 1},"${item.word}","${item.pos}","${item.meaning.replace(/"/g, '""')}"`);
    });
    
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WEEKLY_ORUN_Week${weekNum}_vocab.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const exportWorkbooks = [
    { id: 'syntax10000', name: 'Syntax 10000' },
    { id: 'syntax2320', name: 'ORUN WEEKLY' },
  ];

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('syntax_analyses')
        .select('question_id, analysis')
        .eq('workbook_id', selectedWorkbook)
        .order('question_id', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert('해당 워크북에 구문분석 데이터가 없습니다.');
        return;
      }
      
      const csvRows = ['문장번호,오류표현,정답,해설'];
      
      for (const item of data) {
        const error = parseErrorFromAnalysis(item.analysis).replace(/"/g, '""');
        const answer = parseAnswerFromAnalysis(item.analysis).replace(/"/g, '""');
        const explanation = parseExplanationFromAnalysis(item.analysis);
        csvRows.push(`${item.question_id},"${error}","${answer}","${explanation}"`);
      }
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedWorkbook}_어법해설_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('CSV 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      refreshCodes();
    }
  }, [isAdmin, refreshCodes]);

  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const issuedCodes = getIssuedCodes() as AccessCodeItem[];

  const handleAddCode = async () => {
    const code = newCode.trim();
    
    if (!code) {
      setError('코드를 입력해주세요');
      return;
    }
    
    if (code.length < 4) {
      setError('코드는 최소 4자 이상이어야 합니다');
      return;
    }
    
    if (issuedCodes.some(c => c.code === code)) {
      setError('이미 존재하는 코드입니다');
      return;
    }

    if (newCodeWorkbooks.length === 0) {
      setError('최소 1개의 워크북을 선택해주세요');
      return;
    }
    
    setIsAdding(true);
    const success = await addCode(code, newCodeWorkbooks);
    setIsAdding(false);
    
    if (success) {
      setNewCode('');
      setNewCodeWorkbooks([]);
      setError('');
    } else {
      setError('코드 추가에 실패했습니다');
    }
  };

  const handleRemoveCode = async (code: string) => {
    if (confirm(`"${code}" 코드를 삭제하시겠습니까?`)) {
      setIsRemoving(code);
      await removeCode(code);
      setIsRemoving(null);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewCode(code);
    setError('');
  };

  const toggleNewCodeWorkbook = (workbookId: string) => {
    setNewCodeWorkbooks(prev => 
      prev.includes(workbookId) 
        ? prev.filter(id => id !== workbookId)
        : [...prev, workbookId]
    );
  };

  const handleEditWorkbooks = (codeItem: AccessCodeItem) => {
    setEditingCode(codeItem.code);
    setEditingWorkbooks(codeItem.allowed_workbooks || []);
  };

  const toggleEditingWorkbook = (workbookId: string) => {
    setEditingWorkbooks(prev => 
      prev.includes(workbookId) 
        ? prev.filter(id => id !== workbookId)
        : [...prev, workbookId]
    );
  };

  const handleSaveWorkbooks = async () => {
    if (!editingCode) return;
    
    setIsSavingWorkbooks(true);
    const success = await updateCodeWorkbooks(editingCode, editingWorkbooks);
    setIsSavingWorkbooks(false);
    
    if (success) {
      setEditingCode(null);
      setEditingWorkbooks([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setEditingWorkbooks([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23C9A961' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <div className="flex items-center gap-2">
            <img src={orunAcademyBadge} alt="ORUN" className="h-8 w-auto" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 mb-4">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">관리자 전용</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">액세스 코드 관리</h1>
          <p className="text-zinc-400">학생들에게 배포할 액세스 코드를 발급하고 접근 권한을 관리합니다</p>
        </div>

        {/* Add New Code */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            새 코드 발급
          </h2>
          
          <div className="space-y-4">
            {/* Code Input */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newCode}
                  onChange={(e) => {
                    setNewCode(e.target.value);
                    setError('');
                  }}
                  placeholder="새 액세스 코드 입력"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCode();
                  }}
                  disabled={isAdding}
                />
              </div>
              <Button
                variant="outline"
                onClick={generateRandomCode}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                disabled={isAdding}
              >
                랜덤 생성
              </Button>
            </div>

            {/* Workbook Selection */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                접근 가능한 워크북 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_WORKBOOK_IDS.map((workbookId) => (
                  <label
                    key={workbookId}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      newCodeWorkbooks.includes(workbookId)
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <Checkbox
                      checked={newCodeWorkbooks.includes(workbookId)}
                      onCheckedChange={() => toggleNewCodeWorkbook(workbookId)}
                      className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <span className="text-sm text-zinc-200">{WORKBOOK_LABELS[workbookId]}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              onClick={handleAddCode}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black"
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  코드 추가
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Code List */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              발급된 코드 목록
            </span>
            <span className="text-sm font-normal text-zinc-500">
              {issuedCodes.length}개
            </span>
          </h2>
          
          {issuedCodes.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              발급된 코드가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {issuedCodes.map((codeItem) => (
                <div 
                  key={codeItem.code}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                >
                  {editingCode === codeItem.code ? (
                    /* Editing Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <code className="text-lg font-mono text-amber-400 tracking-wider">
                          {codeItem.code}
                        </code>
                        <span className="text-xs text-zinc-500">워크북 권한 수정 중</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_WORKBOOK_IDS.map((workbookId) => (
                          <label
                            key={workbookId}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                              editingWorkbooks.includes(workbookId)
                                ? 'bg-amber-500/20 border-amber-500/50'
                                : 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <Checkbox
                              checked={editingWorkbooks.includes(workbookId)}
                              onCheckedChange={() => toggleEditingWorkbook(workbookId)}
                              className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <span className="text-xs text-zinc-200">{WORKBOOK_LABELS[workbookId]}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveWorkbooks}
                          className="bg-amber-500 hover:bg-amber-400 text-black"
                          disabled={isSavingWorkbooks}
                        >
                          {isSavingWorkbooks ? <Loader2 className="w-3 h-3 animate-spin" /> : '저장'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col gap-1">
                          <code className="text-lg font-mono text-amber-400 tracking-wider">
                            {codeItem.code}
                          </code>
                          {codeItem.last_used_at && (
                            <span className="text-xs text-zinc-500">
                              마지막 사용: {new Date(codeItem.last_used_at).toLocaleDateString('ko-KR')} · 
                              {codeItem.use_count}회 사용
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditWorkbooks(codeItem)}
                            className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                            title="권한 수정"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyCode(codeItem.code)}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                            title="코드 복사"
                          >
                            {copiedCode === codeItem.code ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveCode(codeItem.code)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="코드 삭제"
                            disabled={isRemoving === codeItem.code}
                          >
                            {isRemoving === codeItem.code ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Workbook Access Tags */}
                      <div className="flex flex-wrap gap-1">
                        {codeItem.allowed_workbooks && codeItem.allowed_workbooks.length > 0 ? (
                          codeItem.allowed_workbooks.map((wb) => (
                            <span
                              key={wb}
                              className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300"
                            >
                              {WORKBOOK_LABELS[wb as WorkbookId] || wb}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500 italic">접근 권한 없음</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CSV Export */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            어법해설 CSV 내보내기
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            탑재된 구문분석에서 어법해설 부분만 CSV 파일로 다운로드합니다.
          </p>
          <div className="flex gap-3 items-center">
            <Select value={selectedWorkbook} onValueChange={setSelectedWorkbook}>
              <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="워크북 선택" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {exportWorkbooks.map((wb) => (
                  <SelectItem key={wb.id} value={wb.id} className="text-white hover:bg-zinc-700">
                    {wb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportCSV}
              className="bg-amber-500 hover:bg-amber-400 text-black"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              CSV 다운로드
            </Button>
          </div>
        </div>

        {/* Duplicate Analysis */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-500" />
            중복 문장 분석
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Syntax 10000 교재의 중복 문장을 분석하고 확인합니다.
          </p>
          <Link to="/duplicate-analysis">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black">
              <Search className="w-4 h-4 mr-2" />
              중복 분석 페이지로 이동
            </Button>
          </Link>
        </div>

        {/* Grammar Classification */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-sky-500" />
            문법 카테고리 분류
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            각 문장의 문법 오류를 카테고리별로 AI 자동 분류합니다.
          </p>
          <Link to="/grammar-classification">
            <Button className="bg-sky-500 hover:bg-sky-400 text-white">
              <Tag className="w-4 h-4 mr-2" />
              카테고리 분류 페이지로 이동
            </Button>
          </Link>
        </div>

        {/* AI Vocabulary Extraction */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI 어휘 추출 (CEFR B2+)
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            각 주차 문장에서 B2 이상 어휘를 AI로 자동 추출합니다.
          </p>
          
          {/* Single week extraction */}
          <div className="flex gap-3 items-center mb-4">
            <Select value={String(vocabWeek)} onValueChange={(v) => setVocabWeek(Number(v))}>
              <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="주차 선택" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
                  <SelectItem key={w} value={String(w)} className="text-white hover:bg-zinc-700">
                    Week {w} {extractedVocab[w] ? `✅ (${extractedVocab[w].length}개)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExtractVocab}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={isExtractingVocab || extractingAll || weeklyData.length === 0}
            >
              {isExtractingVocab ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              추출
            </Button>
            <Button
              onClick={handleExtractAll}
              className="bg-amber-500 hover:bg-amber-400 text-black"
              disabled={isExtractingVocab || extractingAll || weeklyData.length === 0}
            >
              {extractingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {extractProgress ? `${extractProgress.current}/${extractProgress.total}` : '...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  ⚡ 전체 추출
                </>
              )}
            </Button>
          </div>

          {/* Results preview */}
          {extractedVocab[vocabWeek] && extractedVocab[vocabWeek].length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-300 font-medium">
                  📚 Week {vocabWeek} — {extractedVocab[vocabWeek].length}개 어휘
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportVocabCSV(vocabWeek)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-zinc-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr className="text-xs text-zinc-400">
                      <th className="text-left p-2 w-8">#</th>
                      <th className="text-left p-2">Word</th>
                      <th className="text-left p-2 w-16">품사</th>
                      <th className="text-left p-2">뜻</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedVocab[vocabWeek].map((item, idx) => (
                      <tr key={idx} className="border-t border-zinc-700/50 text-zinc-200">
                        <td className="p-2 text-zinc-500 text-xs">{idx + 1}</td>
                        <td className="p-2 font-medium">{item.word}</td>
                        <td className="p-2 text-zinc-400 text-xs italic">{item.pos}</td>
                        <td className="p-2 text-zinc-300">{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overall progress summary */}
          {Object.keys(extractedVocab).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
                <span
                  key={w}
                  className={`text-xs px-2 py-1 rounded ${
                    extractedVocab[w]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  W{w}{extractedVocab[w] ? ` (${extractedVocab[w].length})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Exam Question Extraction */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-500" />
            오답률 TOP5 문제 추출
            <span className="ml-auto text-sm font-normal text-zinc-500">
              DB: {examDbCount}개
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            PDF에서 추출한 텍스트를 붙여넣으면 AI가 문제를 구조화합니다.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <Select value={examWorkbookId} onValueChange={setExamWorkbookId}>
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="weekly-g10" className="text-white hover:bg-zinc-700">고1 (G10)</SelectItem>
                  <SelectItem value="weekly-g11" className="text-white hover:bg-zinc-700">고2 (G11)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <textarea
              value={examPdfText}
              onChange={(e) => setExamPdfText(e.target.value)}
              placeholder="PDF에서 추출한 텍스트를 여기에 붙여넣으세요...&#10;&#10;예: 다음 글의 밑줄 친 부분 중, 어법상 틀린 것은? [2015년3월28번53.1%]&#10;One cool thing about my Uncle Arthur..."
              className="w-full h-48 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-500 resize-y"
            />

            <div className="flex gap-3">
              <Button
                onClick={handleExtractExamQuestions}
                className="bg-violet-600 hover:bg-violet-500 text-white"
                disabled={isExtractingExam || !examPdfText.trim()}
              >
                {isExtractingExam ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI 추출
              </Button>

              {examExtractResult && examExtractResult.length > 0 && (
                <Button
                  onClick={handleSaveExamQuestions}
                  className="bg-amber-500 hover:bg-amber-400 text-black"
                  disabled={isSavingExam}
                >
                  {isSavingExam ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  DB에 저장
                </Button>
              )}
            </div>

            {examSaveStatus && (
              <p className={`text-sm ${examSaveStatus.startsWith('❌') ? 'text-red-400' : examSaveStatus.startsWith('✅') ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {examSaveStatus}
              </p>
            )}

            {/* Preview extracted questions */}
            {examExtractResult && examExtractResult.length > 0 && (
              <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr className="text-xs text-zinc-400">
                      <th className="text-left p-2 w-8">#</th>
                      <th className="text-left p-2 w-16">연도</th>
                      <th className="text-left p-2 w-16">유형</th>
                      <th className="text-left p-2">문제</th>
                      <th className="text-left p-2 w-12">정답</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examExtractResult.map((q: any, idx: number) => (
                      <tr key={idx} className="border-t border-zinc-700/50 text-zinc-200">
                        <td className="p-2 text-zinc-500 text-xs">{q.id || idx + 1}</td>
                        <td className="p-2 text-xs">{q.year} {q.month}</td>
                        <td className="p-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                            {q.questionType}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-zinc-300 max-w-[300px] truncate">
                          {q.passage?.substring(0, 80)}...
                        </td>
                        <td className="p-2 text-amber-400 text-xs">{q.answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-400/80">
            💡 <strong>팁:</strong> 각 코드마다 접근 가능한 워크북을 설정할 수 있습니다. Syntax 10000의 Vol.1, Vol.2, Vol.3은 별도의 워크북으로 관리됩니다. 브라우저를 닫으면 자동으로 로그아웃됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
