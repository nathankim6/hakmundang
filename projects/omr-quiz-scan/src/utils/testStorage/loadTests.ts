
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
    // Smaller pages keep each request well below timeout limits (student_answers is a large JSONB payload)
    const pageSize = 500;
    let hasMore = true;
    let failedPages = 0;

    // Paginate through all results since Supabase has a 1000 row limit per query
    while (hasMore) {
      const fetchPage = async () => {
        let query = supabase
          .from('test_results')
          .select('*')
          // Secondary sort key guarantees a stable, gap-free pagination order
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (testId) {
          query = query.eq('test_id', testId);
        }

        return await query;
      };

      // Retry transient failures instead of silently dropping the remaining pages
      let results: any[] | null = null;
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await fetchPage();
        if (!error) {
          results = data as any[];
          lastError = null;
          break;
        }
        lastError = error;
        console.warn(`test_results page ${page} failed (attempt ${attempt + 1}):`, error);
        await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
      }

      if (lastError) {
        failedPages++;
        console.error('Error loading test results:', lastError);
        toast({
          title: "일부 시험 결과를 불러오지 못했습니다",
          description: "네트워크 상태를 확인 후 새로고침 해주세요.",
          variant: "destructive",
        });
        break;
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

    if (failedPages > 0) {
      console.error(`Loaded partial test results: ${allResults.length} rows (${failedPages} page(s) failed)`);
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
