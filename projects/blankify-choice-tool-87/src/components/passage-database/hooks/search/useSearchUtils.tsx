
import { Passage } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export const useSearchUtils = () => {
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('passages')
        .select('category')
        .not('category', 'is', null);
        
      if (error) throw error;
      
      if (data) {
        const uniqueCategories = [...new Set(data
          .map(item => item.category)
          .filter(Boolean) as string[]
        )].sort();
        
        return uniqueCategories;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          description: "텍스트가 클립보드에 복사되었습니다."
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          variant: "destructive",
          description: "텍스트 복사에 실패했습니다."
        });
      });
  };

  return {
    fetchCategories,
    handleCopy
  };
};
