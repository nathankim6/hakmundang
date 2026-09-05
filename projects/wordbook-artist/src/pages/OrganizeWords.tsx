import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileText, Download, Loader2, X, Sparkles, Save, FolderOpen, Plus, BookOpen, Trash2, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface OrganizedWord {
  word: string;
  meaning: string;
}

interface DayGroupResult {
  day: string;
  words: OrganizedWord[];
}

interface SavedProject {
  id: string;
  name: string;
  total_words: number;
  total_days: number;
  created_at: string;
  updated_at: string;
}

const OrganizeWords = () => {
  const navigate = useNavigate();
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressStats, setProgressStats] = useState<{
    extractedWords: number;
    organizedWords: number;
    duplicatesRemoved: number;
    daysFormed: number;
    currentStep: 'extract' | 'organize' | 'arrange' | 'convert' | 'idle';
  }>({ extractedWords: 0, organizedWords: 0, duplicatesRemoved: 0, daysFormed: 0, currentStep: 'idle' });
  const [organizedDays, setOrganizedDays] = useState<DayGroupResult[] | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState('ORUN VOCA Ultimate');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Resume state refs - survive re-renders and allow resuming
  const extractedWordsRef = useRef<{ word: string; meaning: string }[]>([]);
  const extractChunkIndexRef = useRef<number>(0);
  const organizedWordsRef = useRef<any[]>([]);
  const organizeChunkIndexRef = useRef<number>(0);
  const [canResume, setCanResume] = useState(false);
  const [resumeStage, setResumeStage] = useState<'extract' | 'organize' | 'arrange' | null>(null);

  // Load saved projects on mount
  useEffect(() => {
    loadSavedProjects();
  }, []);

  const loadSavedProjects = async () => {
    const { data, error } = await supabase
      .from('organized_vocab_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setSavedProjects(data);
  };

  const loadProject = async (project: SavedProject) => {
    const { data, error } = await supabase
      .from('organized_vocab_words')
      .select('*')
      .eq('project_id', project.id)
      .order('sort_order');

    if (error) {
      toast.error('프로젝트를 불러오는데 실패했습니다.');
      return;
    }

    // Group by day_name
    const dayMap = new Map<string, OrganizedWord[]>();
    (data || []).forEach(w => {
      if (!dayMap.has(w.day_name)) dayMap.set(w.day_name, []);
      dayMap.get(w.day_name)!.push({ word: w.word, meaning: w.meaning });
    });

    const days: DayGroupResult[] = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, words]) => ({ day, words }));

    setOrganizedDays(days);
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    toast.success(`"${project.name}" 프로젝트를 불러왔습니다.`);
  };

  const saveToDatabase = async () => {
    if (!organizedDays) return;
    setIsSaving(true);
    try {
      await autoSaveAndConvert(organizedDays);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('organized_vocab_projects').delete().eq('id', projectId);
    if (error) {
      toast.error('삭제 실패');
      return;
    }
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      setOrganizedDays(null);
    }
    await loadSavedProjects();
    toast.success('프로젝트가 삭제되었습니다.');
  };

  const autoSaveAndConvert = async (days: DayGroupResult[]) => {
    const totalWords = days.reduce((sum, d) => sum + d.words.length, 0);

    // 1. Save to organized_vocab tables
    let projectId = currentProjectId;
    if (projectId) {
      await supabase.from('organized_vocab_words').delete().eq('project_id', projectId);
      await supabase.from('organized_vocab_projects').update({
        name: currentProjectName,
        total_words: totalWords,
        total_days: days.length,
      }).eq('id', projectId);
    } else {
      const { data: proj, error } = await supabase.from('organized_vocab_projects').insert({
        name: currentProjectName,
        total_words: totalWords,
        total_days: days.length,
      }).select().single();
      if (error) throw error;
      projectId = proj.id;
      setCurrentProjectId(projectId);
    }

    let sortOrder = 0;
    const rows = days.flatMap(d =>
      d.words.map(w => ({
        project_id: projectId!,
        day_name: d.day,
        word: w.word,
        meaning: w.meaning,
        sort_order: sortOrder++,
      }))
    );
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase.from('organized_vocab_words').insert(batch);
      if (error) throw error;
    }

    await loadSavedProjects();
    toast.success(`${totalWords}개 단어가 자동 저장되었습니다!`);

    // 2. Auto-create or update linked workbook
    setProgressMessage('워크북 자동 생성 중...');

    // Check if workbook with same title already exists
    const { data: existingWb } = await supabase.from('workbooks')
      .select('id')
      .eq('title', currentProjectName)
      .eq('cover_subtitle', 'Ultimate')
      .limit(1)
      .single();

    let workbookId: string;

    if (existingWb) {
      // Delete existing day_groups (cascade deletes words & examples)
      await supabase.from('day_groups').delete().eq('workbook_id', existingWb.id);
      workbookId = existingWb.id;
      // Update metadata
      await supabase.from('workbooks').update({
        theme_color: '#1A1A1A',
        secondary_color: '#D4AF37',
      }).eq('id', workbookId);
    } else {
      const { data: wb, error: wbErr } = await supabase.from('workbooks').insert({
        title: currentProjectName,
        cover_subtitle: 'Ultimate',
        theme_color: '#1A1A1A',
        secondary_color: '#D4AF37',
        difficulty_level: 'middle',
        include_examples: false,
      }).select().single();
      if (wbErr) throw wbErr;
      workbookId = wb.id;
    }

    // Create day_groups and words
    for (let i = 0; i < days.length; i++) {
      const dayGroup = days[i];
      const { data: dg, error: dgErr } = await supabase.from('day_groups').insert({
        workbook_id: workbookId,
        day_name: dayGroup.day,
        sort_order: i,
      }).select().single();
      if (dgErr) throw dgErr;

      const wordRows = dayGroup.words.map((w, j) => ({
        day_group_id: dg.id,
        word: w.word,
        meaning: w.meaning,
        sort_order: j,
      }));
      for (let k = 0; k < wordRows.length; k += 100) {
        const batch = wordRows.slice(k, k + 100);
        const { error: wErr } = await supabase.from('words').insert(batch);
        if (wErr) throw wErr;
      }

      if ((i + 1) % 10 === 0) {
        setProgressMessage(`워크북 생성 중... (${i + 1}/${days.length} DAY)`);
      }
    }

    toast.success(`✅ 워크북 "${currentProjectName}"이 자동 생성되었습니다!`);
    setProgressMessage('완료!');
  };

  const handleConvertToWorkbook = async () => {
    if (!organizedDays) return;
    setIsConverting(true);
    setProgress(0);
    setProgressMessage('워크북 생성 중...');

    try {
      await autoSaveAndConvert(organizedDays);
      setProgress(100);
      setProgressMessage('완료! 메인 페이지로 이동합니다...');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Convert error:', error);
      toast.error('워크북 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  };

  // --- PDF extraction & AI organize (existing logic) ---
  const handleOrganizeWithExisting = async () => {
    // Load existing ORUN VOCA Ultimate workbook words if available
    const { data: existingWb } = await supabase.from('workbooks')
      .select('id')
      .eq('title', 'ORUN VOCA Ultimate')
      .eq('cover_subtitle', 'Ultimate')
      .limit(1)
      .single();

    if (existingWb) {
      // Load existing words from the workbook
      const { data: dayGroupsData } = await supabase.from('day_groups')
        .select('*, words(*)')
        .eq('workbook_id', existingWb.id)
        .order('sort_order');

      if (dayGroupsData && dayGroupsData.length > 0) {
        const existingDays: DayGroupResult[] = dayGroupsData
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((dg: any) => ({
            day: dg.day_name,
            words: (dg.words || [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((w: any) => ({ word: w.word, meaning: w.meaning })),
          }));
        setOrganizedDays(existingDays);
        setCurrentProjectName('ORUN VOCA Ultimate');
        toast.info(`기존 ${existingDays.length}개 DAY 단어를 불러왔습니다. 새 단어와 병합합니다.`);
      }
    }

    // Run organize in append mode
    handleOrganize(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
    if (allowed.length !== files.length) toast.error('PDF 또는 Excel 파일만 업로드 가능합니다.');
    setPdfFiles(prev => [...prev, ...allowed]);
  };

  const removeFile = (index: number) => setPdfFiles(prev => prev.filter((_, i) => i !== index));

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const extractTextFromExcel = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const lines: string[] = [];
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      rows.forEach(row => {
        if (row && row.length > 0) {
          lines.push(row.filter(Boolean).join(' '));
        }
      });
    });
    return lines.join('\n');
  };

  const isExcelFile = (file: File) => file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  const handleExtractAll = async () => {
    if (pdfFiles.length === 0) { toast.error('파일을 먼저 업로드해주세요.'); return; }
    setIsExtracting(true);
    setProgress(0);
    const texts: string[] = [];
    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        setProgressMessage(`텍스트 추출 중: ${file.name} (${i + 1}/${pdfFiles.length})`);
        setProgress(((i + 1) / pdfFiles.length) * 100);
        if (isExcelFile(file)) {
          texts.push(await extractTextFromExcel(file));
        } else {
          texts.push(await extractTextFromPDF(file));
        }
      }
      setExtractedTexts(texts);
      toast.success(`${texts.length}개 파일에서 텍스트를 추출했습니다.`);
    } catch (error) {
      console.error('File extraction error:', error);
      toast.error('텍스트 추출 중 오류가 발생했습니다.');
    } finally { setIsExtracting(false); }
  };

  const handleOrganize = async (appendMode = false, resume = false) => {
    if (extractedTexts.length === 0 && !resume) { toast.error('먼저 PDF에서 텍스트를 추출해주세요.'); return; }
    setIsOrganizing(true);
    setCanResume(false);
    setResumeStage(null);

    // Helper: invoke with retry (up to 3 attempts)
    const invokeWithRetry = async (body: any, retries = 3): Promise<any> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const { data, error } = await supabase.functions.invoke('organize-vocabulary', { body });
          if (error) throw error;
          return data;
        } catch (err) {
          console.warn(`Attempt ${attempt}/${retries} failed:`, err);
          if (attempt === retries) throw err;
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    };

    try {
      // === STEP 1: Extract words from text chunks ===
      const combinedText = extractedTexts.join('\n---NEW PDF---\n');
      const maxChunkSize = 5000;
      const chunks: string[] = [];
      if (combinedText.length <= maxChunkSize) { chunks.push(combinedText); }
      else { for (let i = 0; i < combinedText.length; i += maxChunkSize) chunks.push(combinedText.slice(i, i + maxChunkSize)); }

      // Determine starting point for extraction
      let startExtractIdx = 0;
      if (resume && resumeStage === 'extract') {
        startExtractIdx = extractChunkIndexRef.current;
        toast.info(`추출 ${startExtractIdx}/${chunks.length} 청크부터 이어서 진행합니다.`);
      } else if (!resume || resumeStage === 'extract') {
        // Fresh start for extraction
        extractedWordsRef.current = [];
        extractChunkIndexRef.current = 0;
      }

      // Only run extraction if we haven't completed it yet
      if (!resume || resumeStage === 'extract') {
        setProgress(0);
        setProgressMessage('AI가 단어를 분석하고 정리하는 중...');
        setProgressStats({ extractedWords: extractedWordsRef.current.length, organizedWords: 0, duplicatesRemoved: 0, daysFormed: 0, currentStep: 'extract' });

        for (let i = startExtractIdx; i < chunks.length; i++) {
          setProgressMessage(`단어 추출 중... (${i + 1}/${chunks.length} 청크)`);
          setProgress((i / chunks.length) * 30);
          try {
            const data = await invokeWithRetry({ action: 'extract', text: chunks[i] });
            if (data?.words) {
              extractedWordsRef.current = [...extractedWordsRef.current, ...data.words];
              setProgressStats(prev => ({ ...prev, extractedWords: extractedWordsRef.current.length }));
            }
            extractChunkIndexRef.current = i + 1; // Mark this chunk as done
          } catch (err) {
            console.error(`Extract chunk ${i} failed after retries:`, err);
            // Save progress and allow resume
            setCanResume(true);
            setResumeStage('extract');
            toast.error(`청크 ${i + 1}/${chunks.length}에서 오류 발생. 지금까지 ${extractedWordsRef.current.length}개 단어 추출됨. "이어서 계속" 버튼을 눌러주세요.`);
            setIsOrganizing(false);
            return;
          }
        }
        toast.info(`총 ${extractedWordsRef.current.length}개 단어 추출 완료. 정리 중...`);
      }

      let allExtractedWords = [...extractedWordsRef.current];

      // If appending, include existing words for deduplication
      if (appendMode && organizedDays) {
        const existingWords = organizedDays.flatMap(d => d.words);
        allExtractedWords = [...existingWords, ...allExtractedWords];
      }

      // === STEP 2: Organize words (CEFR, derivatives, dedup) ===
      let startOrgIdx = 0;
      if (resume && resumeStage === 'organize') {
        startOrgIdx = organizeChunkIndexRef.current;
        toast.info(`정리 ${startOrgIdx * 150}/${allExtractedWords.length} 단어부터 이어서 진행합니다.`);
      } else if (!resume || resumeStage === 'extract') {
        // Fresh start for organizing
        organizedWordsRef.current = [];
        organizeChunkIndexRef.current = 0;
      }

      if (!resume || resumeStage === 'extract' || resumeStage === 'organize') {
        setProgressStats(prev => ({ ...prev, currentStep: 'organize', organizedWords: organizedWordsRef.current.length }));
        setProgressMessage('중복 제거, 파생어 그룹핑, 난이도 정렬 중...');
        setProgress(50);
        const orgBatchSize = 20;
        const totalBatches = Math.ceil(allExtractedWords.length / orgBatchSize);

        for (let batchIdx = startOrgIdx; batchIdx < totalBatches; batchIdx++) {
          const i = batchIdx * orgBatchSize;
          const batch = allExtractedWords.slice(i, i + orgBatchSize);
          setProgressMessage(`단어 정리 중... (${Math.min(i + orgBatchSize, allExtractedWords.length)}/${allExtractedWords.length})`);
          setProgress(50 + (i / allExtractedWords.length) * 40);
          try {
            const data = await invokeWithRetry({ action: 'organize', words: batch });
            if (data?.organizedWords) {
              organizedWordsRef.current = [...organizedWordsRef.current, ...data.organizedWords];
              setProgressStats(prev => ({
                ...prev,
                organizedWords: organizedWordsRef.current.length,
                duplicatesRemoved: prev.extractedWords - organizedWordsRef.current.length,
              }));
            }
            organizeChunkIndexRef.current = batchIdx + 1;
          } catch (err) {
            console.error(`Organize batch ${batchIdx} failed after retries:`, err);
            setCanResume(true);
            setResumeStage('organize');
            toast.error(`정리 중 오류 발생. ${organizedWordsRef.current.length}개 단어 정리 완료됨. "이어서 계속" 버튼을 눌러주세요.`);
            setIsOrganizing(false);
            return;
          }
        }
      }

      // === STEP 3: Arrange into DAY groups ===
      setProgressStats(prev => ({ ...prev, currentStep: 'arrange' }));
      setProgressMessage('DAY 그룹 배치 중...');
      setProgress(90);
      
      let finalData;
      try {
        finalData = await invokeWithRetry({ action: 'arrange', organizedWords: organizedWordsRef.current });
      } catch (err) {
        console.error('Arrange failed:', err);
        setCanResume(true);
        setResumeStage('arrange');
        toast.error(`DAY 배치 중 오류 발생. "이어서 계속" 버튼을 눌러주세요.`);
        setIsOrganizing(false);
        return;
      }

      const days = finalData?.days || [];
      setOrganizedDays(days);
      setProgress(100);
      setProgressMessage('완료!');

      const totalWords = days.reduce((sum: number, d: DayGroupResult) => sum + d.words.length, 0);
      setProgressStats(prev => ({ ...prev, daysFormed: days.length, currentStep: 'idle' }));
      toast.success(`${days.length}개 DAY, 총 ${totalWords}개 단어 정리 완료!`);

      // Reset resume state
      setCanResume(false);
      setResumeStage(null);
      extractedWordsRef.current = [];
      organizedWordsRef.current = [];

      // Auto-save to DB and auto-convert to workbook
      try {
        setProgressMessage('자동 저장 중...');
        await autoSaveAndConvert(days);
      } catch (saveErr) {
        console.error('Auto-save error:', saveErr);
        toast.error('자동 저장 중 오류가 발생했습니다. 수동으로 저장해주세요.');
      }
    } catch (error) {
      console.error('Organize error:', error);
      // Even on error, try to save whatever we have
      if (organizedWordsRef.current.length > 0) {
        try {
          const partialData = await invokeWithRetry({ action: 'arrange', organizedWords: organizedWordsRef.current });
          const partialDays = partialData?.days || [];
          if (partialDays.length > 0) {
            setOrganizedDays(partialDays);
            await autoSaveAndConvert(partialDays);
            toast.info(`오류 발생했지만 ${partialDays.length}개 DAY를 중간 저장했습니다.`);
          }
        } catch (_) { /* ignore partial save errors */ }
      }
      toast.error('단어 정리 중 오류가 발생했습니다.');
    } finally { setIsOrganizing(false); }
  };

  const handleDownloadExcel = () => {
    if (!organizedDays) return;
    const rows = organizedDays.flatMap(d => d.words.map(w => ({ day: d.day, 단어: w.word, 뜻: w.meaning })));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vocabulary');
    XLSX.writeFile(wb, 'ORUN_VOCA_Ultimate_Organized.xlsx');
    toast.success('엑셀 파일이 다운로드되었습니다!');
  };

  // === Ultimate Rebuild: Merge VOCA 3-8 + Idioms ===
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildProgress, setRebuildProgress] = useState('');
  const [rebuildStep, setRebuildStep] = useState(0);

  const handleRebuildUltimate = async () => {
    const confirmed = window.confirm(
      '기존 ORUN VOCA Ultimate 데이터를 모두 삭제하고\nVOCA 3~8 + 고난도숙어로 재구성합니다.\n\n계속하시겠습니까?'
    );
    if (!confirmed) return;

    setIsRebuilding(true);
    setRebuildStep(0);
    try {
      // Step 0: Initialize Ultimate workbook (create/reset)
      setRebuildProgress('Ultimate 워크북 초기화 중...');
      setRebuildStep(1);
      const { data: initResult, error: initError } = await supabase.functions.invoke('build-ultimate-workbook', {
        body: { action: 'init-ultimate' }
      });
      if (initError) throw initError;
      if (!initResult?.success) throw new Error(initResult?.error || 'Init failed');

      // Step 1: Copy VOCA 3-8 one part at a time
      let nextSortOrder = 0;
      let totalWordsCopied = 0;
      const partNames = ['중등 필수', '중등 고난도', '고등 기본', '고등 필수', '고등 고난도', '어휘 완성'];
      
      for (let partNum = 1; partNum <= 6; partNum++) {
        setRebuildProgress(`Part ${partNum}/6 구성 중 (${partNames[partNum - 1]})...`);
        const { data: partResult, error: partError } = await supabase.functions.invoke('build-ultimate-workbook', {
          body: { action: 'copy-one-part', partNumber: partNum, startSortOrder: nextSortOrder }
        });
        if (partError) throw partError;
        if (!partResult?.success) throw new Error(partResult?.error || `Part ${partNum} failed`);
        nextSortOrder = partResult.nextSortOrder;
        totalWordsCopied += partResult.words || 0;
        toast.info(`Part ${partNum} 완료: ${partResult.words}단어, ${partResult.days}일`);
      }
      toast.success(`Part 1~6 구성 완료! (총 ${totalWordsCopied}단어)`);

      // Step 2: Fetch idioms from TXT file
      setRebuildProgress('Part 7 숙어 파일 로딩 중...');
      setRebuildStep(2);
      const txtResponse = await fetch('/data/idioms.txt');
      const txtContent = await txtResponse.text();
      const idiomLines = txtContent.split('\n')
        .map(line => line.replace(/^\uFEFF/, '').trim())
        .filter(line => line.length > 0 && !line.startsWith('//'));
      
      toast.info(`${idiomLines.length}개 숙어 로딩 완료. 한국어 뜻 생성 중...`);

      // Step 3: Generate Korean meanings in batches
      setRebuildProgress(`Part 7 한국어 뜻 생성 중 (0/${idiomLines.length})...`);
      setRebuildStep(3);
      const batchSize = 50;
      const allIdioms: { word: string; meaning: string }[] = [];

      for (let i = 0; i < idiomLines.length; i += batchSize) {
        const batch = idiomLines.slice(i, i + batchSize);
        setRebuildProgress(`Part 7 한국어 뜻 생성 중 (${Math.min(i + batchSize, idiomLines.length)}/${idiomLines.length})...`);

        try {
          const { data, error } = await supabase.functions.invoke('build-ultimate-workbook', {
            body: { action: 'generate-idiom-meanings', idioms: batch }
          });
          if (error) throw error;
          if (data?.results) {
            allIdioms.push(...data.results.map((r: any) => ({
              word: r.word,
              meaning: r.meaning
            })));
          }
        } catch (err) {
          console.error(`Batch ${i} error:`, err);
          // Fallback: add without Korean meaning
          batch.forEach(idiom => allIdioms.push({ word: idiom, meaning: '(뜻 미생성)' }));
        }
      }

      // Step 4: Add Part 7 to database
      setRebuildProgress(`Part 7 데이터 저장 중 (${allIdioms.length}개 숙어)...`);
      setRebuildStep(4);
      const { data: idiomResult, error: idiomError } = await supabase.functions.invoke('build-ultimate-workbook', {
        body: { action: 'add-idioms', idioms: allIdioms }
      });
      if (idiomError) throw idiomError;

      // Step 5: Generate example sentences for Part 7 idioms (day-by-day)
      setRebuildProgress('Part 7 예문 생성 준비 중...');
      setRebuildStep(5);
      try {
        // First, get list of day groups needing examples
        const { data: dgList, error: dgListError } = await supabase.functions.invoke('build-ultimate-workbook', {
          body: { action: 'generate-idiom-examples-batch' }
        });
        if (dgListError) throw dgListError;

        const dayGroups = dgList?.dayGroups || [];
        let totalExamplesGenerated = 0;

        for (let i = 0; i < dayGroups.length; i++) {
          const dg = dayGroups[i];
          let remaining = dg.missing;
          
          while (remaining > 0) {
            setRebuildProgress(`Part 7 예문 생성 중... (${i + 1}/${dayGroups.length} - ${dg.dayName}, 남은: ${remaining})`);
            
            try {
              const { data: batchResult, error: batchError } = await supabase.functions.invoke('build-ultimate-workbook', {
                body: { action: 'generate-idiom-examples-batch', dayGroupId: dg.id }
              });
              if (batchError) {
                console.error(`Day ${dg.dayName} error:`, batchError);
                break;
              }
              totalExamplesGenerated += batchResult?.generated || 0;
              remaining = batchResult?.remaining ?? 0;
            } catch (err) {
              console.error(`Day ${dg.dayName} error:`, err);
              break;
            }
          }
        }
        toast.info(`Part 7 예문 ${totalExamplesGenerated}개 생성 완료`);
      } catch (err) {
        console.error('Idiom examples error:', err);
        toast.warning('숙어 예문 생성 중 일부 오류가 발생했습니다.');
      }

      setRebuildStep(6);
      setRebuildProgress('✅ Ultimate 재구성 완료!');
      toast.success(`ORUN VOCA Ultimate 재구성 완료! Part 1~7, ${allIdioms.length + totalWordsCopied}개 단어`);
      
      // Navigate to preview
      const { data: wb } = await supabase.from('workbooks').select('id').eq('title', 'ORUN VOCA Ultimate').single();
      if (wb) {
        navigate(`/?workbook=${wb.id}`);
      }
    } catch (error) {
      console.error('Rebuild error:', error);
      toast.error('Ultimate 재구성 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">📚 ORUN VOCA Ultimate 단어 정리</h1>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← 돌아가기</a>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Saved Projects */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            저장된 프로젝트
          </h2>
          {savedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10">
              <FolderOpen className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">저장된 프로젝트가 없습니다.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">아래에서 파일을 업로드하여 새 프로젝트를 만들어보세요.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedProjects.map(p => (
                <div key={p.id} className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-colors cursor-pointer hover:border-primary/50 ${currentProjectId === p.id ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                  <div className="flex-1" onClick={() => loadProject(p)}>
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {p.total_days}개 DAY · {p.total_words}개 단어 · {new Date(p.updated_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => loadProject(p)}>
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProject(p.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ultimate Rebuild Section */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            VOCA 3~8 합본 Ultimate 재구성
          </h2>
          <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              ORUN VOCA 3~8의 모든 단어를 Part 1~6으로, 고난도숙어 TXT 파일을 Part 7로 합쳐 Ultimate 단어장을 완전히 새로 구성합니다.
            </p>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {[
                { part: 1, title: '중등 필수', color: '#7BAFD4' },
                { part: 2, title: '중등 고난도', color: '#7BC4A0' },
                { part: 3, title: '고등 기본', color: '#9B8EC4' },
                { part: 4, title: '고등 필수', color: '#E8967A' },
                { part: 5, title: '고등 고난도', color: '#5BA8A4' },
                { part: 6, title: '어휘 완성', color: '#B8A08A' },
                { part: 7, title: '고난도숙어', color: '#C4697A' },
              ].map(p => (
                <div key={p.part} className="text-center rounded-lg p-2 border" style={{ borderColor: p.color + '60', backgroundColor: p.color + '15' }}>
                  <div className="font-bold" style={{ color: p.color }}>Part {p.part}</div>
                  <div className="text-muted-foreground">{p.title}</div>
                </div>
              ))}
            </div>
            {isRebuilding && (
              <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">{rebuildProgress}</span>
                </div>
                <Progress value={(rebuildStep / 5) * 100} className="h-2 mt-2" />
              </div>
            )}
            <Button onClick={handleRebuildUltimate} disabled={isRebuilding} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              {isRebuilding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
              {isRebuilding ? '재구성 중...' : '🔄 Ultimate 전체 재구성 (기존 데이터 삭제 후 재구성)'}
            </Button>
          </div>
        </section>

        {/* Step 1: Upload PDFs */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
            PDF / Excel 파일 업로드
          </h2>
          
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">클릭하여 PDF 또는 Excel 파일을 선택하세요 (여러 개 가능)</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              {pdfFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button onClick={handleExtractAll} disabled={isExtracting} className="w-full">
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                {isExtracting ? '추출 중...' : `${pdfFiles.length}개 파일에서 텍스트 추출`}
              </Button>
            </div>
          )}
        </section>

        {/* Step 2: Organize with AI */}
        {extractedTexts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
              AI 단어 정리
            </h2>
            <p className="text-sm text-muted-foreground">
              {extractedTexts.length}개 PDF에서 텍스트 추출 완료. AI가 단어를 추출하고, 중복 제거, 파생어 그룹핑, CEFR 난이도순 정렬 후 40단어/DAY로 배치합니다.
            </p>
            <div className="flex gap-2">
              {canResume && (
                <Button onClick={() => handleOrganize(!!organizedDays, true)} disabled={isOrganizing} className="flex-1" variant="destructive">
                  {isOrganizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isOrganizing ? '처리 중...' : `이어서 계속 (${resumeStage === 'extract' ? '추출' : resumeStage === 'organize' ? '정리' : 'DAY 배치'})`}
                </Button>
              )}
              <Button onClick={() => handleOrganizeWithExisting()} disabled={isOrganizing || canResume} className="flex-1" variant="default">
                {isOrganizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isOrganizing ? '정리 중...' : 'ORUN VOCA Ultimate에 추가 정리'}
              </Button>
            </div>
          </section>
        )}

        {/* Progress */}
        {(isExtracting || isOrganizing || isConverting) && (
          <div className="space-y-3 bg-muted/30 rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">{progressMessage}</p>
              <span className="text-sm font-mono text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            
            {/* Detailed Stats */}
            {(isOrganizing || progressStats.currentStep !== 'idle') && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className={`rounded-lg p-3 border transition-colors ${progressStats.currentStep === 'extract' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <p className="text-xs text-muted-foreground">📝 추출된 단어</p>
                  <p className="text-lg font-bold text-foreground">{progressStats.extractedWords.toLocaleString()}<span className="text-xs font-normal text-muted-foreground ml-1">개</span></p>
                </div>
                <div className={`rounded-lg p-3 border transition-colors ${progressStats.currentStep === 'organize' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <p className="text-xs text-muted-foreground">✅ 정리된 단어</p>
                  <p className="text-lg font-bold text-foreground">{progressStats.organizedWords.toLocaleString()}<span className="text-xs font-normal text-muted-foreground ml-1">개</span></p>
                  {progressStats.duplicatesRemoved > 0 && (
                    <p className="text-xs text-destructive">중복 {progressStats.duplicatesRemoved}개 제거</p>
                  )}
                </div>
                <div className={`rounded-lg p-3 border transition-colors ${progressStats.currentStep === 'arrange' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <p className="text-xs text-muted-foreground">📅 DAY 구성</p>
                  <p className="text-lg font-bold text-foreground">{progressStats.daysFormed}<span className="text-xs font-normal text-muted-foreground ml-1">개 DAY</span></p>
                  {progressStats.daysFormed > 0 && progressStats.organizedWords > 0 && (
                    <p className="text-xs text-muted-foreground">약 {Math.round(progressStats.organizedWords / progressStats.daysFormed)}단어/DAY</p>
                  )}
                </div>
                <div className="rounded-lg p-3 border border-border bg-background">
                  <p className="text-xs text-muted-foreground">🔄 현재 단계</p>
                  <p className="text-sm font-medium text-foreground">
                    {progressStats.currentStep === 'extract' && '단어 추출'}
                    {progressStats.currentStep === 'organize' && '중복제거 & 정렬'}
                    {progressStats.currentStep === 'arrange' && 'DAY 배치'}
                    {progressStats.currentStep === 'convert' && '워크북 변환'}
                    {progressStats.currentStep === 'idle' && '대기 중'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Results & Actions */}
        {organizedDays && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                결과 ({organizedDays.length}개 DAY, {organizedDays.reduce((s, d) => s + d.words.length, 0)}단어)
              </h2>
              <Button variant="ghost" size="sm" onClick={saveToDatabase} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-1">저장</span>
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 max-h-96 overflow-y-auto space-y-4">
              {(() => {
                const sectionColors: Record<string, string> = {
                  '중등실력': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
                  '고등기본': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
                  '고등필수': 'bg-amber-500/10 text-amber-700 border-amber-500/30',
                  '고난도': 'bg-red-500/10 text-red-700 border-red-500/30',
                };
                let lastSection = '';
                return organizedDays.map((dayGroup, i) => {
                  const sectionMatch = dayGroup.day.match(/^\[(.+?)\]/);
                  const section = sectionMatch ? sectionMatch[1] : '';
                  const showHeader = section !== lastSection;
                  lastSection = section;
                  return (
                    <div key={i}>
                      {showHeader && section && (
                        <div className={`rounded-lg px-3 py-2 mb-3 border font-bold text-sm ${sectionColors[section] || 'bg-muted'}`}>
                          📌 {section}
                        </div>
                      )}
                      <h3 className="font-bold text-primary mb-1">{dayGroup.day} ({dayGroup.words.length}단어)</h3>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {dayGroup.words.map((w, j) => (
                          <div key={j} className="flex gap-2">
                            <span className="font-medium">{w.word}</span>
                            <span className="text-muted-foreground truncate">{w.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="space-y-2">
              <Button onClick={handleDownloadExcel} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button onClick={handleConvertToWorkbook} className="w-full" variant="default" disabled={isConverting}>
                {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
                {isConverting ? '워크북 생성 중...' : 'ORUN VOCA Ultimate 단어장으로 변환'}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default OrganizeWords;
