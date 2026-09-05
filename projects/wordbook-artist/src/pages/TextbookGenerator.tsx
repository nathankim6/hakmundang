import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkbookPreview } from '@/components/WorkbookPreview';
import { WorkbookConfig } from '@/components/WorkbookSettings';
import { ProcessingModal } from '@/components/ProcessingModal';
import { loadWorkbook } from '@/utils/workbookStorage';
import { SavedWorkbooks } from '@/components/SavedWorkbooks';
import { DayGroup } from '@/types/vocabulary';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Workbook configurations for each school
const TEXTBOOK_CONFIG: Record<string, { workbookId: string; title: string; defaultConfig: Partial<WorkbookConfig> }> = {
  sungnam: {
    workbookId: '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a',
    title: '워드마스터 수능2000',
    defaultConfig: {
      title: '워드마스터 수능2000',
      coverSubtitle: '',
      themeColor: '#1A1A1A',
      secondaryColor: '#D4AF37',
      difficultyLevel: 'middle',
      includeExamples: true,
      coverStyle: 'premium',
    },
  },
};

const TextbookGenerator = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workbookConfig, setWorkbookConfig] = useState<WorkbookConfig>({
    title: '',
    themeColor: '#1A1A1A',
    secondaryColor: '#D4AF37',
    difficultyLevel: 'middle',
    includeExamples: true,
    coverStyle: 'premium',
    coverSubtitle: '',
  });
  const [currentWorkbookId, setCurrentWorkbookId] = useState<string | undefined>();

  const textbookInfo = schoolId ? TEXTBOOK_CONFIG[schoolId] : undefined;

  useEffect(() => {
    if (!textbookInfo) {
      toast.error('알 수 없는 학교입니다.');
      navigate('/');
      return;
    }

    loadTextbook();
  }, [schoolId]);

  const loadTextbook = async () => {
    if (!textbookInfo) return;

    setIsLoading(true);
    try {
      const result = await loadWorkbook(textbookInfo.workbookId);
      setDayGroups(result.dayGroups);
      setWorkbookConfig({
        ...workbookConfig,
        ...textbookInfo.defaultConfig,
        ...result.config,
      } as WorkbookConfig);
      setCurrentWorkbookId(textbookInfo.workbookId);
    } catch (error) {
      console.error('Failed to load textbook:', error);
      toast.error('단어장을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigate('/');
  };

  const handleLoadWorkbook = (loadedDayGroups: DayGroup[], config: WorkbookConfig, wbId?: string) => {
    setDayGroups(loadedDayGroups);
    setWorkbookConfig(config);
    setCurrentWorkbookId(wbId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{textbookInfo?.title || ''} 단어장을 불러오는 중...</p>
      </div>
    );
  }

  if (dayGroups) {
    return (
      <WorkbookPreview
        dayGroups={dayGroups}
        onReset={handleReset}
        config={workbookConfig}
        onConfigChange={setWorkbookConfig}
        workbookId={currentWorkbookId}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">단어장 데이터를 찾을 수 없습니다.</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        대시보드로 돌아가기
      </Button>
    </div>
  );
};

export default TextbookGenerator;
