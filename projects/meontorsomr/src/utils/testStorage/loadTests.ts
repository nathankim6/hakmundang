
import { QRDataType, QuestionAnswer } from "@/types/test";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { testsCache, updateTestResultsCache } from "./cache";

interface TestRow {
  id: string;
  test_id: string;
  title: string;
  answers: Record<string, any>;
  question_count: number;
  created_at: string;
  is_ended?: boolean;
}

export const loadTests = async (): Promise<QRDataType[]> => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tests:', error);
      toast({
        title: "시험 목록을 불러오는데 실패했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      return testsCache;
    }

    const mappedTests = (tests as TestRow[]).map(test => ({
      title: test.title,
      testId: test.test_id,
      answers: typeof test.answers === 'object' ? 
        Object.entries(test.answers as Record<string, any>).reduce((acc, [key, value]) => {
          acc[Number(key)] = typeof value === 'object' ? value : {
            type: 'multiple',
            answer: value
          };
          return acc;
        }, {} as Record<number, QuestionAnswer>) : {},
      questionCount: test.question_count,
      timestamp: new Date(test.created_at).getTime(),
      isEnded: test.is_ended || false
    }));

    // Update the global cache with the new data
    testsCache.length = 0; // Clear the array without reassigning
    testsCache.push(...mappedTests);

    return testsCache;
  } catch (error) {
    console.error('Error loading tests:', error);
    toast({
      title: "시험 목록을 불러오는데 실패했습니다",
      description: "다시 시도해주세요.",
      variant: "destructive",
    });
    return testsCache;
  }
};

export const loadTestResults = async (testId?: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (testId) {
      query = query.eq('test_id', testId);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error('Error loading test results:', error);
      toast({
        title: "시험 결과를 불러오는데 실패했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      return [];
    }

    console.log(`Loaded ${results?.length || 0} test results from database`);
    
    // 결과 캐시 업데이트 - 완전히 새로운 데이터로 교체
    if (results) {
      updateTestResultsCache(results);
    }
    
    return results || [];
  } catch (error) {
    console.error('Error in loadTestResults:', error);
    return [];
  }
};
