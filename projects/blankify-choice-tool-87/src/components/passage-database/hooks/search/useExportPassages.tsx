
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Passage } from '../types';

export const useExportPassages = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleClientSideExport = (passages: Passage[]) => {
    if (passages.length === 0) {
      toast({
        variant: "destructive",
        description: "내보낼 지문이 없습니다."
      });
      return;
    }
    
    const exportData = passages.map(passage => ({
      식별번호: passage.item_id || '',
      내용: passage.content || '',
      해석: passage.translation || '',
      카테고리: passage.category || '',
      난이도: passage.difficulty || '',
      태그: Array.isArray(passage.tags) ? passage.tags.join(', ') : '',
      출처: passage.source || '',
      생성일: passage.created_at ? new Date(passage.created_at).toLocaleString() : ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '지문 목록');
    
    XLSX.writeFile(workbook, '지문_목록.xlsx');
  };
  
  const handleExportExcel = async (passagesToExport: Passage[]) => {
    if (passagesToExport.length === 0) {
      toast({
        variant: "destructive",
        description: "내보낼 지문이 없습니다."
      });
      return;
    }
    
    setExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-passages', {
        body: {
          passages: passagesToExport.map(p => p.id)
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
        toast({
          description: "엑셀 파일이 생성되었습니다."
        });
      } else {
        handleClientSideExport(passagesToExport);
      }
    } catch (error) {
      console.error('Export error:', error);
      handleClientSideExport(passagesToExport);
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    handleExportExcel
  };
};
