
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase, createDirectApiRequest, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";
import { Passage, PassageData, PassageFormState, PassageEntry } from './types';

interface UsePassageOperationsProps {
  form: PassageFormState;
  resetForm: () => void;
  passages: Passage[];
  refreshPassages: () => void;
  selectedPassages: string[];
  clearSelectedPassages: () => void;
}

export const usePassageOperations = ({
  form,
  resetForm,
  passages,
  refreshPassages,
  selectedPassages,
  clearSelectedPassages
}: UsePassageOperationsProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPassages = async () => {
    try {
      const timestamp = new Date().getTime();
      
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<Passage[]>();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching passages:', error);
      toast({
        title: "오류",
        description: "지문을 불러오는데 실패했습니다",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleCreatePassage = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!form.content || form.content.trim() === '') {
        throw new Error('지문 내용은 필수 입력 항목입니다');
      }
      
      const passageData = {
        content: form.content.trim(),
        translation: form.translation?.trim() || null,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
        category: form.category?.trim() || null,
        difficulty: form.difficulty?.trim() || null,
        source: form.source?.trim() || null,
        item_id: form.item_id?.trim() || null
      };
      
      const timestamp = new Date().getTime();
      
      const { error } = await supabase
        .from('passages')
        .insert(passageData);
      
      if (error) throw error;
      
      toast({
        title: "성공",
        description: "지문이 추가되었습니다",
      });
      
      resetForm();
      await refreshPassages();
    } catch (error: any) {
      console.error('Error adding passage:', error);
      toast({
        title: "오류",
        description: error.message || "지문 추가에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMultiplePassages = async (entries: PassageEntry[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const validEntries = entries.filter(entry => entry.content.trim() !== '');
      
      if (validEntries.length === 0) {
        throw new Error('추가할 유효한 지문이 없습니다');
      }
      
      const passagesData = validEntries.map(entry => ({
        content: entry.content.trim(),
        translation: entry.translation?.trim() || null,
        item_id: entry.item_id?.trim() || null,
        tags: [],
        category: null,
        difficulty: null,
        source: null
      }));
      
      const response = await supabase.functions.invoke('upload-passages', {
        body: { passages: passagesData }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || '지문 추가에 실패했습니다');
      }
      
      toast({
        title: "성공",
        description: `${validEntries.length}개의 지문이 추가되었습니다`,
      });
      
      await refreshPassages();
      return true;
    } catch (error: any) {
      console.error('Error adding multiple passages:', error);
      toast({
        title: "오류",
        description: error.message || "지문 추가에 실패했습니다",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassage = async () => {
    if (!form.selectedPassageId || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!form.content || form.content.trim() === '') {
        throw new Error('지문 내용은 필수 입력 항목입니다');
      }
      
      // Properly prepare all the fields for update
      const passageData = {
        content: form.content.trim(),
        translation: form.translation?.trim() || null,
        item_id: form.item_id?.trim() || null,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
        category: form.category?.trim() || null,
        difficulty: form.difficulty?.trim() || null,
        source: form.source?.trim() || null
      };
      
      console.log('Updating passage with data:', passageData);
      console.log('Passage ID:', form.selectedPassageId);
      
      const { error } = await supabase
        .from('passages')
        .update(passageData)
        .eq('id', form.selectedPassageId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      toast({
        title: "성공",
        description: "지문이 업데이트되었습니다",
      });
      
      resetForm();
      await refreshPassages();
    } catch (error: any) {
      console.error('Error updating passage:', error);
      toast({
        title: "오류",
        description: error.message || "지문 업데이트에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePassage = async (id: string) => {
    try {
      if (!id) {
        throw new Error('유효하지 않은 지문 ID입니다');
      }
      
      console.log('Deleting passage with ID:', id);
      setIsSubmitting(true);
      
      const { error: edgeFnError } = await supabase.functions.invoke('enable-realtime', {
        body: {
          tableName: 'passages',
          action: 'delete',
          id: id
        }
      });
      
      if (edgeFnError) {
        console.error('Edge function error:', edgeFnError);
        throw new Error(`삭제 실패: ${edgeFnError.message || '알 수 없는 오류'}`);
      }
      
      console.log('Deletion successful for ID:', id);
      
      toast({
        title: "성공",
        description: "지문이 삭제되었습니다",
      });
      
      setTimeout(() => refreshPassages(), 500);
    } catch (error: any) {
      console.error('Error deleting passage:', error);
      toast({
        title: "오류",
        description: error.message || "지문 삭제에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSelectedPassages = async () => {
    if (selectedPassages.length === 0) {
      toast({
        title: "경고",
        description: "삭제할 지문이 선택되지 않았습니다",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Deleting selected passages:', selectedPassages);
      
      const batchSize = 10;
      let failedCount = 0;
      let successCount = 0;
      
      for (let i = 0; i < selectedPassages.length; i += batchSize) {
        const batch = selectedPassages.slice(i, i + batchSize);
        
        try {
          console.log('Processing batch:', batch);
          
          const { error } = await supabase
            .from('passages')
            .delete()
            .in('id', batch);
          
          if (error) {
            console.error('Error in batch delete:', error);
            failedCount += batch.length;
          } else {
            successCount += batch.length;
            console.log(`Successfully deleted ${batch.length} passages`);
          }
        } catch (err) {
          console.error('Error processing batch:', err);
          failedCount += batch.length;
        }
      }
      
      if (failedCount > 0) {
        toast({
          title: "일부 삭제 실패",
          description: `${successCount}개 삭제됨, ${failedCount}개 실패`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "성공",
          description: `${successCount}개의 지문이 삭제되었습니다`,
        });
      }
      
      clearSelectedPassages();
      setTimeout(() => refreshPassages(), 500);
    } catch (error: any) {
      console.error('Error bulk deleting passages:', error);
      toast({
        title: "오류",
        description: error.message || "지문 일괄 삭제에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllPassages = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      console.log('Attempting to delete all passages');
      
      const { error: edgeFnError } = await supabase.functions.invoke('enable-realtime', {
        body: {
          tableName: 'passages',
          action: 'deleteAll'
        }
      });
      
      if (edgeFnError) {
        console.error('Edge function error:', edgeFnError);
        throw new Error(`삭제 실패: ${edgeFnError.message || '알 수 없는 오류'}`);
      }
      
      toast({
        title: "성공",
        description: "모든 지문이 성공적으로 삭제되었습니다.",
      });
      
      setTimeout(() => refreshPassages(), 500);
    } catch (error: any) {
      console.error('Error deleting all passages:', error);
      toast({
        title: "오류",
        description: error.message || "모든 지문을 삭제하는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) {
      toast({
        title: "오류",
        description: "복사할 텍스트가 없습니다",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "복사됨!",
          description: "지문이 클립보드에 복사되었습니다.",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "오류",
          description: "텍스트를 클립보드에 복사하지 못했습니다",
          variant: "destructive",
        });
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.isUpdateMode) {
      await handleUpdatePassage();
    } else {
      await handleCreatePassage();
    }
  };

  const forceDeleteAllPassages = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('Force deleting all passages');
      
      const { error: edgeFnError } = await supabase.functions.invoke('enable-realtime', {
        body: {
          tableName: 'passages',
          action: 'deleteAll'
        }
      });
      
      if (edgeFnError) {
        console.error('Edge function error:', edgeFnError);
        throw new Error(`삭제 실패: ${edgeFnError.message || '알 수 없는 오류'}`);
      }
      
      toast({
        title: "성공",
        description: "모든 지문이 완전히 삭제되었습니다.",
      });
      
      setTimeout(() => refreshPassages(), 500);
    } catch (error: any) {
      console.error('Error force deleting all passages:', error);
      toast({
        title: "오류",
        description: error.message || "모든 지문을 삭제하는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    fetchPassages,
    handleCreatePassage,
    handleCreateMultiplePassages,
    handleUpdatePassage,
    handleDeletePassage,
    handleDeleteSelectedPassages,
    handleDeleteAllPassages,
    forceDeleteAllPassages,
    handleCopy,
    handleSubmit
  };
};
