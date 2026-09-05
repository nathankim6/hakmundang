
import { QRDataType } from "@/types/test";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const saveTest = async (testData: QRDataType): Promise<boolean> => {
  try {
    // Convert the answers structure to a format suitable for JSON storage
    const testRecord = {
      test_id: testData.testId,
      title: testData.title,
      answers: testData.answers as any, // Cast to any to handle Json type
      question_count: testData.questionCount,
      is_ended: testData.isEnded || false
    };

    // Store test in Supabase
    const { error } = await supabase
      .from('tests')
      .insert(testRecord);

    if (error) {
      console.error('Error saving test:', error);
      toast({
        title: "시험 저장 실패",
        description: "시험을 저장하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveTest:', error);
    toast({
      title: "시험 저장 실패",
      description: "시험을 저장하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const saveTestResult = async (
  testId: string, 
  studentAnswers: Record<number, any>,
  score: number,
  correctCount: number,
  totalCount: number,
  studentName?: string,
  studentClass?: string
): Promise<boolean> => {
  try {
    // Store test result in Supabase
    const resultData = {
      test_id: testId,
      student_answers: studentAnswers as any, // Cast to any to handle Json type
      score: score,
      correct_count: correctCount,
      total_count: totalCount,
      student_name: studentName || '익명',
      student_class: studentClass || '정보 없음'
    };

    const { error } = await supabase
      .from('test_results')
      .insert(resultData);

    if (error) {
      console.error('Error saving test result:', error);
      toast({
        title: "결과 저장 실패",
        description: "시험 결과를 저장하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    toast({
      title: "결과 저장 실패",
      description: "시험 결과를 저장하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};
