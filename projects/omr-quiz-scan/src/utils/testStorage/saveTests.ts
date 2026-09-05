
import { QRDataType } from "@/types/test";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isSubjectiveAnswerCorrect } from '../testUtils/answerValidation';

export const saveTest = async (testData: QRDataType): Promise<boolean> => {
  try {
    // Check if the test already exists to prevent duplicates
    const { data: existingTest, error: checkError } = await supabase
      .from('tests')
      .select('test_id')
      .eq('test_id', testData.testId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing test:', checkError);
      return false;
    }

    if (existingTest) {
      console.log('Test with this ID already exists:', testData.testId);
      toast({
        title: "시험 저장 실패",
        description: "이미 존재하는 시험 ID입니다. 다른 ID를 사용해주세요.",
        variant: "destructive",
      });
      return false;
    }

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
  studentName?: string
): Promise<boolean> => {
  try {
    // Validate inputs
    if (!testId || !studentAnswers) {
      console.error('Invalid test result data: missing testId or studentAnswers');
      return false;
    }
    
    if (typeof score !== 'number' || typeof correctCount !== 'number' || typeof totalCount !== 'number') {
      console.error('Invalid test result data: score, correctCount, or totalCount is not a number');
      return false;
    }

    console.log('Saving test result with data:', {
      testId, 
      score, 
      correctCount, 
      totalCount, 
      studentName
    });

    const finalStudentName = studentName && studentName.trim() !== '' ? studentName : '익명';

    // Check for duplicates: same test_id, student_name, and score
    const { data: existingResults, error: checkError } = await supabase
      .from('test_results')
      .select('id, created_at')
      .eq('test_id', testId)
      .eq('student_name', finalStudentName)
      .eq('score', score);

    if (checkError) {
      console.error('Error checking for duplicates:', checkError);
    } else if (existingResults && existingResults.length > 0) {
      console.log('중복된 제출을 감지했습니다. (동일한 시험, 학생, 점수) 기존 결과를 유지합니다.');
      toast({
        title: "이미 제출된 결과입니다",
        description: "동일한 학생의 동일한 점수가 이미 제출되었습니다.",
      });
      return true; // Consider it a success since the data already exists
    }

    // Format the data for Supabase
    const resultData = {
      test_id: testId,
      student_answers: studentAnswers,
      score: score,
      correct_count: correctCount,
      total_count: totalCount,
      student_name: finalStudentName
    };

    // Log the final data being sent to the database
    console.log('Final student_name being saved to database:', resultData.student_name);

    // Store test result in Supabase
    const { error, data } = await supabase
      .from('test_results')
      .insert(resultData)
      .select('id');

    if (error) {
      console.error('Error saving test result to database:', error);
      toast({
        title: "결과 저장 실패",
        description: "시험 결과를 저장하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Test result saved successfully with ID:', data?.[0]?.id);
    return true;
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    toast({
      title: "결과 저장 실패",
      description: "시험 결과를 저장하는데 실패했습니다. 다시 시도해주세요.",
    });
    return false;
  }
};
