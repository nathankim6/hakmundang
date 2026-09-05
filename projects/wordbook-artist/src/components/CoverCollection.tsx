import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { HardCoverPage, BackCoverPage } from '@/components/WorkbookPreview';
import { WorkbookConfig } from '@/components/WorkbookSettings';
import { toast } from 'sonner';

interface WorkbookCoverData {
  id: string;
  title: string;
  config: WorkbookConfig;
  totalDays: number;
  totalWords: number;
}

export function CoverCollection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverData, setCoverData] = useState<WorkbookCoverData[]>([]);

  const fetchAllCovers = async () => {
    setIsLoading(true);
    try {
      // Fetch workbooks with day/word counts
      const { data: workbooks, error: wbError } = await supabase
        .from('workbooks')
        .select('*')
        .order('created_at', { ascending: true });

      if (wbError) throw wbError;
      if (!workbooks || workbooks.length === 0) {
        setCoverData([]);
        return;
      }

      // Fetch day counts per workbook
      const wbIds = workbooks.map(wb => wb.id);
      const { data: dayGroups, error: dgError } = await supabase
        .from('day_groups')
        .select('id, workbook_id')
        .in('workbook_id', wbIds);

      if (dgError) throw dgError;

      // Count days per workbook
      const dayCountMap = new Map<string, number>();
      const dayGroupIds: string[] = [];
      (dayGroups || []).forEach(dg => {
        dayCountMap.set(dg.workbook_id, (dayCountMap.get(dg.workbook_id) || 0) + 1);
        dayGroupIds.push(dg.id);
      });

      // Fetch word counts per day_group in batches
      const wordCountMap = new Map<string, number>();
      const BATCH = 200;
      for (let i = 0; i < dayGroupIds.length; i += BATCH) {
        const batch = dayGroupIds.slice(i, i + BATCH);
        const { data: words, error: wErr } = await supabase
          .from('words')
          .select('day_group_id')
          .in('day_group_id', batch);
        if (wErr) throw wErr;
        (words || []).forEach(w => {
          // Map day_group_id to workbook_id
          const dg = (dayGroups || []).find(d => d.id === w.day_group_id);
          if (dg) {
            wordCountMap.set(dg.workbook_id, (wordCountMap.get(dg.workbook_id) || 0) + 1);
          }
        });
      }

      const volumeOrder = (title: string) => {
        if (/ultimate/i.test(title)) return 999;
        const m = title.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 998;
      };

      const covers: WorkbookCoverData[] = workbooks
        .filter(wb => !/성남고|워드마스터/.test(`${wb.title} ${wb.cover_subtitle || ''}`)) // 성남고 단어장 제외
        .sort((a, b) => volumeOrder(a.title) - volumeOrder(b.title))
        .map(wb => ({
          id: wb.id,
          title: wb.title,
          config: {
            title: wb.title,
            themeColor: wb.theme_color,
            secondaryColor: wb.secondary_color,
            difficultyLevel: wb.difficulty_level as 'elementary' | 'middle' | 'high',
            includeExamples: wb.include_examples,
            coverStyle: 'premium' as const,
            coverSubtitle: wb.cover_subtitle || '',
          },
          totalDays: dayCountMap.get(wb.id) || 0,
          totalWords: wordCountMap.get(wb.id) || 0,
        }));

      setCoverData(covers);
    } catch (error) {
      console.error('Failed to fetch cover data:', error);
      toast.error('표지 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllCovers();
    }
  }, [isOpen]);

  const handlePrint = () => {
    // 인쇄 시 다이얼로그 오버레이가 같이 출력되는 문제 방지
    setIsOpen(false);

    document.body.classList.add('cover-printing');
    toast.info('📋 PDF 저장 설정', {
      duration: 6000,
      description: '대상: PDF로 저장 | 용지: A4 | 여백: 없음 | 배경 그래픽: ✓ 체크'
    });

    const cleanup = () => {
      document.body.classList.remove('cover-printing');
    };

    window.addEventListener('afterprint', cleanup, { once: true });

    setTimeout(() => {
      window.print();
      // 일부 브라우저 fallback: print() 종료 후 클래스 정리
      cleanup();
    }, 350);
  };

  return (
    <>
      {/* 인쇄 전용 컨테이너 - body에 Portal로 렌더, 화면에서는 숨김 */}
      {coverData.length > 0 && createPortal(
        <div id="cover-print-container" className="cover-print-only">
          {coverData.map(cover => (
            <React.Fragment key={cover.id}>
              <div className="page-b5" data-page-type="hard-cover">
                <HardCoverPage config={cover.config} totalDays={cover.totalDays} />
              </div>
              <div className="page-b5" data-page-type="back-cover">
                <BackCoverPage config={cover.config} />
              </div>
            </React.Fragment>
          ))}
        </div>,
        document.body
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">표지 모음</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 no-print">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                표지 모음
              </DialogTitle>
              <Button onClick={handlePrint} size="sm" className="gap-2" disabled={coverData.length === 0}>
                <Printer className="w-4 h-4" />
                PDF로 저장
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(95vh-100px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : coverData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">저장된 단어장이 없습니다.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center gap-8">
                  {coverData.map((cover) => (
                    <div key={cover.id} className="flex flex-col items-center gap-4">
                      <h3 className="text-lg font-semibold">{cover.title}</h3>
                      <div className="flex gap-6 flex-wrap justify-center">
                        {/* Front Cover */}
                        <div className="transform scale-[0.5] origin-top-left" style={{ width: '420px', height: '594px' }}>
                          <HardCoverPage config={cover.config} totalDays={cover.totalDays} />
                        </div>
                        {/* Back Cover */}
                        <div className="transform scale-[0.5] origin-top-left" style={{ width: '420px', height: '594px' }}>
                          <BackCoverPage config={cover.config} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
