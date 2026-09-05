import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MoveResultDialogProps {
  resultId: string;
  currentTestId: string;
  studentName: string;
  onMoveComplete: () => void;
}

interface TestOption {
  test_id: string;
  title: string;
}

const MoveResultDialog = ({ resultId, currentTestId, studentName, onMoveComplete }: MoveResultDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tests, setTests] = useState<TestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTests();
    }
  }, [open]);

  const fetchTests = async () => {
    const { data, error } = await supabase
      .from('tests')
      .select('test_id, title')
      .neq('test_id', currentTestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch tests:', error);
      return;
    }

    setTests(data || []);
  };

  const handleMove = async () => {
    if (!selectedTestId) {
      toast({
        title: "시험을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('test_results')
        .update({ test_id: selectedTestId })
        .eq('id', resultId);

      if (error) throw error;

      toast({
        title: "이동 완료",
        description: `${studentName}의 결과가 이동되었습니다.`,
      });

      setOpen(false);
      setSelectedTestId('');
      
      // Call onMoveComplete to refresh data
      await Promise.resolve(onMoveComplete());
    } catch (error) {
      console.error('Failed to move result:', error);
      toast({
        title: "이동 실패",
        description: "결과 이동에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
          title="다른 시험으로 이동"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>시험 결과 이동</DialogTitle>
          <DialogDescription>
            {studentName}의 결과를 다른 시험으로 이동합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger>
              <SelectValue placeholder="이동할 시험을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {tests.map((test) => (
                <SelectItem key={test.test_id} value={test.test_id}>
                  {test.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleMove} disabled={isLoading || !selectedTestId}>
            {isLoading ? '이동 중...' : '이동'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveResultDialog;
