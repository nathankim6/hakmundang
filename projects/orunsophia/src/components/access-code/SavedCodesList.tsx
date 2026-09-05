
import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface SavedCode {
  id: string;
  code: string;
  user_name: string;
  expiry_date: string;
}

interface SavedCodesListProps {
  savedCodes: SavedCode[];
  onCodesUpdated: () => void;
}

export const SavedCodesList = ({ savedCodes, onCodesUpdated }: SavedCodesListProps) => {
  const { toast } = useToast();

  // Filter out codes without user_name (from other programs)
  const filteredCodes = savedCodes.filter(code => code.user_name);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      description: "코드가 클립보드에 복사되었습니다"
    });
  };

  const formatExpiryDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return '날짜 오류';
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      onCodesUpdated();
      toast({
        description: "코드가 삭제되었습니다"
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "코드 삭제 중 문제가 발생했습니다",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6 p-6">
      <h3 className="text-lg font-semibold mb-4">저장된 엑세스 코드</h3>
      
      <div className="space-y-3">
        {filteredCodes.length === 0 ? (
          <p className="text-toss-textSecondary text-sm text-center py-4">저장된 코드가 없습니다</p>
        ) : (
          filteredCodes.map((item) => (
            <div key={item.id} className="p-3 bg-toss-secondary/50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{item.code}</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.code)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-col text-xs text-toss-textSecondary gap-1">
                    <div className="flex items-center gap-1">
                      <span>사용자:</span>
                      <span className="font-medium">{item.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>만료일:</span>
                      <span className="font-medium">{formatExpiryDate(item.expiry_date)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => deleteCode(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
