
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Passage } from '../types';
import { Json } from '@/integrations/supabase/types';

export const useWorkbookManagement = (accumulatedSelections: Passage[], clearAccumulatedSelections: () => void) => {
  const { toast } = useToast();
  const [workbookDialogOpen, setWorkbookDialogOpen] = useState(false);
  const [workbookName, setWorkbookName] = useState('');
  const [isCreatingWorkbook, setIsCreatingWorkbook] = useState(false);

  const handleCreateWorkbook = useCallback(() => {
    if (accumulatedSelections.length === 0) {
      toast({
        variant: "destructive",
        description: "워크북에 추가할 지문을 먼저 선택해주세요."
      });
      return;
    }
    
    setWorkbookName('');
    setWorkbookDialogOpen(true);
  }, [accumulatedSelections, toast]);
  
  const handleSaveWorkbook = useCallback(async () => {
    if (!workbookName.trim()) {
      toast({
        variant: "destructive",
        description: "워크북 이름을 입력해주세요."
      });
      return;
    }
    
    setIsCreatingWorkbook(true);
    
    try {
      const passagesJson = accumulatedSelections as unknown as Json;
      
      const { data, error } = await supabase
        .from('workbooks')
        .insert({
          name: workbookName,
          passages: passagesJson
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        description: "워크북이 성공적으로 생성되었습니다."
      });
      
      setWorkbookDialogOpen(false);
      clearAccumulatedSelections();
      
    } catch (error) {
      console.error('Error creating workbook:', error);
      toast({
        variant: "destructive",
        description: "워크북 생성 중 오류가 발생했습니다."
      });
    } finally {
      setIsCreatingWorkbook(false);
    }
  }, [workbookName, accumulatedSelections, toast, clearAccumulatedSelections]);

  return {
    workbookDialogOpen,
    setWorkbookDialogOpen,
    workbookName,
    setWorkbookName,
    isCreatingWorkbook,
    handleCreateWorkbook,
    handleSaveWorkbook
  };
};
