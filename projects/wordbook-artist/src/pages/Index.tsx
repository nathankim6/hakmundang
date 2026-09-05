import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { FileUpload } from '@/components/FileUpload';
import { WorkbookPreview } from '@/components/WorkbookPreview';
import { WorkbookSettings, WorkbookConfig } from '@/components/WorkbookSettings';
import { ProcessingModal } from '@/components/ProcessingModal';
import { SavedWorkbooks } from '@/components/SavedWorkbooks';
import { CoverCollection } from '@/components/CoverCollection';
import { NewVeritasCover } from '@/components/NewVeritasCover';
import { parseExcelFile, hasWordTypes, needsDerivativeMatching } from '@/utils/excelParser';
import { generateVocabularyWithAI } from '@/utils/aiGenerator';
import { saveWorkbook, loadWorkbook } from '@/utils/workbookStorage';
import { DayGroup } from '@/types/vocabulary';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedGroups, setParsedGroups] = useState<DayGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [currentWorkbookId, setCurrentWorkbookId] = useState<string | undefined>(undefined);
  const [workbookConfig, setWorkbookConfig] = useState<WorkbookConfig>({
    title: 'ORUN VOCA 2',
    themeColor: '#E87CA0',
    secondaryColor: '#D4608A',
    difficultyLevel: 'middle',
    includeExamples: true,
    coverStyle: 'premium',
    coverSubtitle: '',
  });

  // Handle file selection (just parse, don't generate)
  const handleFileSelect = async (file: File) => {
    try {
      const groups = await parseExcelFile(file);
      if (groups.length === 0) {
        toast.error('단어를 찾을 수 없습니다. 파일 형식을 확인해주세요.');
        setSelectedFile(null);
        return;
      }
      const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
      toast.success(`${totalWords}개의 단어를 불러왔습니다. 생성 버튼을 눌러주세요.`);
      setParsedGroups(groups);
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error('파일을 읽는 중 오류가 발생했습니다.');
      setSelectedFile(null);
    }
  };

  // Handle generate button click
  const handleGenerate = async () => {
    if (!parsedGroups) {
      toast.error('먼저 엑셀 파일을 업로드해주세요.');
      return;
    }
    setIsLoading(true);
    setIsProcessingAI(true);
    setAiProgress(0);
    try {
      const isWordTypeWorkbook = hasWordTypes(parsedGroups);
      let finalGroups: DayGroup[];
      if (isWordTypeWorkbook) {
        finalGroups = parsedGroups;
        setAiProgress(10);
      } else {
        finalGroups = await generateVocabularyWithAI(
          parsedGroups, workbookConfig.difficultyLevel, workbookConfig.includeExamples,
          (p) => setAiProgress(Math.round(p * 0.7))
        );
      }
      try {
        const saveProgressBase = isWordTypeWorkbook ? 10 : 70;
        const savedId = await saveWorkbook(finalGroups, workbookConfig, (p) => {
          setAiProgress(saveProgressBase + Math.round(p * ((100 - saveProgressBase) / 100)));
        });
        setCurrentWorkbookId(savedId);
        toast.success('단어장이 저장되었습니다!');
        const needsMatching = needsDerivativeMatching(finalGroups);
        if (needsMatching) {
          setAiProgress(85);
          toast.info('파생어를 표제어에 매칭 중...');
          const { data: matchResult, error: matchError } = await supabase.functions.invoke('match-derivatives', {
            body: { workbookId: savedId }
          });
          if (matchError) {
            console.error('Derivative matching error:', matchError);
            toast.error('파생어 매칭 중 오류가 발생했습니다.');
          } else {
            toast.success(`파생어 매칭 완료! ${matchResult?.daysProcessed || 0}일 처리됨`);
            setAiProgress(95);
            const reloaded = await loadWorkbook(savedId);
            finalGroups = reloaded.dayGroups;
          }
        }
      } catch (saveError) {
        console.error('Failed to save workbook:', saveError);
        toast.error('저장 중 오류가 발생했습니다.');
      }
      setDayGroups(finalGroups);
      toast.success(hasWordTypes(finalGroups) ? '단어장이 생성되었습니다!' : 'AI가 발음기호와 예문을 성공적으로 생성했습니다!');
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      setDayGroups(parsedGroups);
      toast.error('AI 처리 중 오류가 발생했습니다. 기본 데이터로 표시합니다.');
    } finally {
      setIsLoading(false);
      setIsProcessingAI(false);
    }
  };

  const handleReset = () => {
    setDayGroups(null);
    setSelectedFile(null);
    setParsedGroups(null);
    setAiProgress(0);
    setCurrentWorkbookId(undefined);
  };

  const handleLoadWorkbook = (loadedDayGroups: DayGroup[], config: WorkbookConfig, wbId?: string) => {
    setDayGroups(loadedDayGroups);
    setWorkbookConfig(config);
    setCurrentWorkbookId(wbId);
  };

  if (dayGroups) {
    return <WorkbookPreview dayGroups={dayGroups} onReset={handleReset} config={workbookConfig} onConfigChange={setWorkbookConfig} workbookId={currentWorkbookId} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.25) 100%)',
    }}>
      {/* Subtle paper grain + radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 no-print"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.06), transparent 55%), radial-gradient(circle at 100% 100%, hsl(32 75% 45% / 0.05), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 no-print opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, hsl(var(--foreground)) 0 1px, transparent 1px 6px)',
        }}
      />

      <ProcessingModal isOpen={isProcessingAI} progress={aiProgress} />

      {/* Header */}
      <header className="relative py-4 px-6 no-print border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-wide">대시보드</span>
          </Button>
          <div
            className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-muted-foreground/70"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            <div className="w-1 h-1 rotate-45 bg-primary/50" />
            Orun&nbsp;·&nbsp;English
            <div className="w-1 h-1 rotate-45 bg-primary/50" />
          </div>
          <div className="flex items-center gap-1.5">
            <SavedWorkbooks onLoadWorkbook={handleLoadWorkbook} />
            <NewVeritasCover />
            <CoverCollection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pb-16 pt-10">
        <Hero />

        {/* Settings & Upload in a cohesive card */}
        <div className="w-full max-w-xl mx-auto space-y-6">
          <WorkbookSettings config={workbookConfig} onChange={setWorkbookConfig} />
          <FileUpload
            onFileSelect={handleFileSelect}
            onGenerate={handleGenerate}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isLoading={isLoading}
          />

          {/* Format hint */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-6 bg-border" />
              <p
                className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground/70"
                style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                Supported Format
              </p>
              <div className="h-px w-6 bg-border" />
            </div>
            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-lg bg-card/60 border border-border/60 text-[10px] font-mono text-muted-foreground shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
              <span className="text-primary font-semibold">day</span>
              <span className="text-primary font-semibold">단어</span>
              <span className="text-primary font-semibold">뜻</span>
              <span className="text-border">|</span>
              <span>day1</span>
              <span>remember</span>
              <span>기억하다</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-5 text-center no-print border-t border-border/40">
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-border" />
          <div className="w-1 h-1 rotate-45 bg-primary/50" />
          <span style={{ fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '0.32em' }} className="uppercase">
            Orun English
          </span>
          <div className="w-1 h-1 rotate-45 bg-primary/50" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-border" />
        </div>
        <p className="mt-2 text-[9px] tracking-[0.3em] uppercase text-muted-foreground/40">
          진리 안에서 인재를 만듭니다
        </p>
      </footer>
    </div>
  );
};

export default Index;
