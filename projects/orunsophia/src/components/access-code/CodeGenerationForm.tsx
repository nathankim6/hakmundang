
import React, { useState } from 'react';
import { Key, Copy, CalendarPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface CodeGenerationFormProps {
  onCodeGenerated: () => void;
}

export const CodeGenerationForm = ({ onCodeGenerated }: CodeGenerationFormProps) => {
  const [userName, setUserName] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const generateCode = async () => {
    try {
      setIsLoading(true);
      let finalCode: string;
      
      if (manualCode) {
        // Allow lowercase input but convert to uppercase when saving
        finalCode = manualCode.toUpperCase();
        
        // Check if code already exists
        const { data: existingCode } = await supabase
          .from('access_codes')
          .select('code')
          .eq('code', finalCode)
          .single();
          
        if (existingCode) {
          toast({
            title: "중복된 코드",
            description: "이미 존재하는 코드입니다. 다른 코드를 입력해주세요.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Generate a random code
        const { data, error } = await supabase.rpc('generate_random_access_code', {
          length: 8
        });
        
        if (error) {
          console.error("Random code generation error:", error);
          throw error;
        }
        
        finalCode = data;
      }
      
      // Insert the new code
      const { error: insertError } = await supabase.from('access_codes').insert({
        code: finalCode,
        user_name: userName || '사용자',
        expiry_date: expiryDate.toISOString()
      });
      
      if (insertError) {
        console.error("Code insertion error:", insertError);
        throw insertError;
      }
      
      setGeneratedCode(finalCode);
      setManualCode('');
      onCodeGenerated();
      
      toast({
        title: "코드가 생성되었습니다",
        description: `새로운 엑세스 코드: ${finalCode}`
      });
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "오류 발생",
        description: "코드 생성 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      description: "코드가 클립보드에 복사되었습니다"
    });
  };

  return (
    <Card className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-toss-blue/10 flex items-center justify-center">
          <Key className="h-6 w-6 text-toss-blue" />
        </div>
        <div>
          <h2 className="text-xl font-bold">엑세스 코드 생성</h2>
          <p className="text-toss-textSecondary">새로운 사용자를 위한 코드를 생성합니다</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">사용자 이름</label>
          <Input placeholder="사용자 이름 입력" value={userName} onChange={e => setUserName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">엑세스 코드 (선택사항)</label>
          <Input 
            placeholder="직접 코드 입력 또는 자동 생성" 
            value={manualCode} 
            onChange={e => setManualCode(e.target.value)}
            maxLength={8}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">만료일</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarPlus className="mr-2 h-4 w-4" />
                {format(expiryDate, "yyyy년 MM월 dd일")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={(date) => date && setExpiryDate(date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          className="w-full" 
          onClick={generateCode} 
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : manualCode ? '코드 저장하기' : '코드 생성하기'}
        </Button>

        {generatedCode && (
          <div className="mt-4 p-4 bg-toss-secondary rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg text-slate-950">{generatedCode}</span>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>사용자: {userName || '사용자'}</p>
              <p>만료일: {format(expiryDate, "yyyy년 MM월 dd일")}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CodeGenerationForm;
