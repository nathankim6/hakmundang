
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const updateTestTitle = async (testId: string, newTitle: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tests')
      .update({ title: newTitle })
      .eq('test_id', testId);

    if (error) {
      console.error('Error updating test title:', error);
      toast({
        title: "제목 변경 실패",
        description: "시험 제목을 변경하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "제목 변경 완료",
      description: "시험 제목이 성공적으로 변경되었습니다.",
    });

    return true;
  } catch (error) {
    console.error('Error in updateTestTitle:', error);
    toast({
      title: "제목 변경 실패",
      description: "시험 제목을 변경하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const updateTestStatus = async (testId: string, isEnded: boolean): Promise<boolean> => {
  try {
    // Add is_ended as a custom field with type assertion
    const { error } = await supabase
      .from('tests')
      .update({ 
        is_ended: isEnded 
      } as any)
      .eq('test_id', testId);

    if (error) {
      console.error('Error updating test status:', error);
      toast({
        title: "상태 변경 실패",
        description: "시험 상태를 변경하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: isEnded ? "시험 종료 완료" : "시험 재개 완료",
      description: isEnded 
        ? "시험이 종료되었습니다. 더 이상 신규 제출이 불가능합니다." 
        : "시험이 재개되었습니다. 신규 제출이 가능합니다.",
    });

    return true;
  } catch (error) {
    console.error('Error in updateTestStatus:', error);
    toast({
      title: "상태 변경 실패",
      description: "시험 상태를 변경하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const updateTestAnswers = async (testId: string, answers: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tests')
      .update({ answers: answers as any })
      .eq('test_id', testId);

    if (error) {
      console.error('Error updating test answers:', error);
      toast({
        title: "정답 수정 실패",
        description: "시험 정답을 수정하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "정답 수정 완료",
      description: "시험 정답이 성공적으로 수정되었습니다.",
    });

    return true;
  } catch (error) {
    console.error('Error in updateTestAnswers:', error);
    toast({
      title: "정답 수정 실패",
      description: "시험 정답을 수정하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const updateWritingQuestions = async (testId: string, writingQuestions: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tests')
      .update({ 
        writing_questions: writingQuestions as any,
        question_count: writingQuestions.length 
      } as any)
      .eq('test_id', testId);

    if (error) {
      console.error('Error updating writing questions:', error);
      toast({
        title: "영작 문항 수정 실패",
        description: "영작 문항을 수정하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "영작 문항 수정 완료",
      description: "영작 문항이 성공적으로 수정되었습니다.",
    });

    return true;
  } catch (error) {
    console.error('Error in updateWritingQuestions:', error);
    toast({
      title: "영작 문항 수정 실패",
      description: "영작 문항을 수정하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};
