
import { QRDataType } from "@/types/test";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getTestsCache, updateTestResultsCache } from "./cache";
import { processTestResults, mapTestsToQRData } from '../testUtils/testDataProcessing';

interface TestRow {
  id: string;
  test_id: string;
  title: string;
  answers: Record<string, any>;
  question_count: number;
  created_at: string;
  is_ended?: boolean;
  writing_questions?: any[];
}

export const loadTests = async (): Promise<QRDataType[]> => {
  try {
    let allTests: TestRow[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    // Paginate through all tests since Supabase has a 1000 row limit per query
    while (hasMore) {
      const { data: tests, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error loading tests:', error);
        toast({
          title: "시험 목록을 불러오는데 실패했습니다",
          description: "다시 시도해주세요.",
          variant: "destructive",
        });
        return getTestsCache();
      }

      if (!tests || tests.length === 0) {
        hasMore = false;
      } else {
        // Type assertion for JSON fields
        const normalizedTests = tests.map(t => ({
          ...t,
          answers: typeof t.answers === 'string' ? JSON.parse(t.answers) : (t.answers || {}),
          writing_questions: typeof t.writing_questions === 'string' ? JSON.parse(t.writing_questions) : (t.writing_questions || undefined)
        })) as unknown as TestRow[];
        allTests.push(...normalizedTests);
        // If we got less than pageSize results, we've reached the end
        if (tests.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    // Map the database results to QRDataType format
    const mappedTests = mapTestsToQRData(allTests);

    // NOTE: We no longer filter tests based on localStorage 'deleted_tests'
    // This caused data to disappear unexpectedly when local storage was out of sync with the database
    // Now we rely solely on the database as the source of truth

    // Get a reference to the cached tests array
    const cachedTests = getTestsCache();
    
    // Clear the array and add new items
    cachedTests.length = 0;
    cachedTests.push(...mappedTests);

    console.log(`Loaded ${allTests.length} tests from database`);
    return getTestsCache();
  } catch (error) {
    console.error('Error loading tests:', error);
    toast({
      title: "시험 목록을 불러오는데 실패했습니다",
      description: "다시 시도해주세요.",
      variant: "destructive",
    });
    return getTestsCache();
  }
};

export const loadTestResults = async (testId?: string): Promise<any[]> => {
  try {
    let allResults: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    // Paginate through all results since Supabase has a 1000 row limit per query
    while (hasMore) {
      let query = supabase
        .from('test_results')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
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
        return allResults.length > 0 ? allResults : [];
      }

      if (!results || results.length === 0) {
        hasMore = false;
      } else {
        allResults.push(...results);
        // If we got less than pageSize results, we've reached the end
        if (results.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    console.log(`Loaded ${allResults.length} test results from database`);
    
    if (allResults.length > 0) {
      // NOTE: We no longer filter results based on localStorage 'deleted_tests'
      // This caused data to disappear unexpectedly when local storage was out of sync with the database
      // Now we rely solely on the database as the source of truth
      await updateTestResultsCache(allResults);
      return processTestResults(allResults);
    }
    
    return allResults;
  } catch (error) {
    console.error('Error in loadTestResults:', error);
    return [];
  }
};
