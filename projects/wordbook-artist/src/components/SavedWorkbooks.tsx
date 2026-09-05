import { useState, useEffect } from 'react';
import { Book, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { listWorkbooks, loadWorkbook, deleteWorkbook, SavedWorkbook } from '@/utils/workbookStorage';
import { DayGroup } from '@/types/vocabulary';
import { WorkbookConfig } from '@/components/WorkbookSettings';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SavedWorkbooksProps {
  onLoadWorkbook: (dayGroups: DayGroup[], config: WorkbookConfig, workbookId?: string) => void;
}

export function SavedWorkbooks({ onLoadWorkbook }: SavedWorkbooksProps) {
  const [workbooks, setWorkbooks] = useState<SavedWorkbook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchWorkbooks = async () => {
    setIsLoading(true);
    try {
      const data = await listWorkbooks();
      setWorkbooks(data);
    } catch (error) {
      console.error('Failed to fetch workbooks:', error);
      toast.error('단어장 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkbooks();
    }
  }, [isOpen]);

  const handleLoad = async (workbookId: string) => {
    setLoadingId(workbookId);
    try {
      const { dayGroups, config } = await loadWorkbook(workbookId);
      onLoadWorkbook(dayGroups, config, workbookId);
      setIsOpen(false);
      toast.success('단어장을 불러왔습니다!');
    } catch (error) {
      console.error('Failed to load workbook:', error);
      toast.error('단어장을 불러오는데 실패했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (workbookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    setDeletingId(workbookId);
    try {
      await deleteWorkbook(workbookId);
      setWorkbooks(prev => prev.filter(wb => wb.id !== workbookId));
      toast.success('단어장이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete workbook:', error);
      toast.error('단어장 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">저장된 단어장</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            저장된 단어장
          </SheetTitle>
          <SheetDescription>
            이전에 생성한 단어장을 불러오거나 삭제할 수 있습니다.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-150px)] mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : workbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">저장된 단어장이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {workbooks.map((wb) => (
                <div
                  key={wb.id}
                  className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleLoad(wb.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: wb.themeColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{wb.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(wb.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                    {loadingId === wb.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(wb.id, e)}
                        disabled={deletingId === wb.id}
                      >
                        {deletingId === wb.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
