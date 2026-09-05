import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { removeTestFromCache, removeTestResultFromCache, getTestsCache, getTestResultsCache, updateTestResultsCache } from "./cache";

// Safe delete with backup and confirmation
export const safeDeleteTest = async (testId: string): Promise<boolean> => {
  try {
    console.log('Starting safe delete for test:', testId);

    // Delete only the test sheet. Existing submitted results are intentionally preserved.
    const { data: deletedTests, error: testErr } = await supabase
      .from('tests')
      .delete()
      .eq('test_id', testId)
      .select('test_id');

    if (testErr) {
      console.error('Error deleting test row:', testErr);
      toast({
        title: "삭제 실패",
        description: "시험지 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    }

    if (!deletedTests || deletedTests.length === 0) {
      console.warn('No test row was deleted:', testId);
      toast({
        title: "삭제 실패",
        description: "서버에서 해당 시험지를 찾지 못했습니다. 목록을 새로고침해주세요.",
        variant: "destructive"
      });
      return false;
    }

    removeTestFromCache(testId);
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('deleted_tests') || '[]');
      if (Array.isArray(deleted) && deleted.includes(testId)) {
        localStorage.setItem('deleted_tests', JSON.stringify(deleted.filter(id => id !== testId)));
      }
    } catch {}

    console.log('Test safely deleted from server:', testId);
    toast({
      title: "시험 삭제됨",
      description: "시험지가 삭제되었습니다. 기존 제출 결과는 유지됩니다.",
    });
    return true;
  } catch (error) {
    console.error('Error in safeDeleteTest:', error);
    toast({
      title: "삭제 실패", 
      description: "시험 삭제 중 오류가 발생했습니다.",
      variant: "destructive"
    });
    return false;
  }
};

// Legacy delete function (kept for compatibility) 
export const deleteTest = async (testId: string): Promise<boolean> => {
  console.warn('Using legacy deleteTest function. Consider using safeDeleteTest instead.');
  return safeDeleteTest(testId);
};

export const deleteTestResults = async (id: string, isByTestId: boolean = false): Promise<boolean> => {
  try {
    // Use the correct column name based on the flag
    const field = isByTestId ? 'test_id' : 'id';
    
    // Log the deletion attempt with all parameters for debugging
    console.log(`Starting permanent test result deletion process: id=${id}, isByTestId=${isByTestId}, field=${field}`);
    
    // Delete the test result normally
    
    // Verify if the item exists before attempting deletion
    const { data: existingData, error: checkError } = await supabase
      .from('test_results')
      .select('id, student_name')
      .eq(field, id);
      
    if (checkError) {
      console.error('Error checking test result existence:', checkError);
      return false;
    }
    
    if (!existingData || existingData.length === 0) {
      console.log(`No test results found with ${field}=${id}`);
      // If there's nothing to delete, consider it a success but notify
      toast({
        title: "결과가 이미 삭제됨",
        description: "해당 시험 결과는 이미 삭제되었습니다.",
      });
      return true;
    }
    
    // Log details for debugging
    console.log(`Found ${existingData.length} results to delete with ${field}=${id}:`);
    console.log('Results to delete:', existingData.map(r => ({id: r.id, name: r.student_name})));
    
    // Perform the deletion with more explicit options
    const { error, data } = await supabase
      .from('test_results')
      .delete()
      .eq(field, id)
      .select();

    if (error) {
      console.error('Error deleting test result from database:', error);
      toast({
        title: "결과 삭제 실패",
        description: "시험 결과를 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Database deletion successful, deleted items:', data);
    
    // Remove from cache immediately with force update
    if (isByTestId) {
      // For test_id deletions, remove all items with this test_id
      const testResultsCache = getTestResultsCache();
      const idsToRemove = testResultsCache
        .filter(result => result.test_id === id)
        .map(result => result.id);
        
      console.log(`Removing ${idsToRemove.length} items from cache by test_id ${id}`);
      
      // Use the removeTestResultFromCache function for each item
      idsToRemove.forEach(resultId => {
        console.log(`Removing item ${resultId} from cache`);
        removeTestResultFromCache(resultId, false);
      });
    } else {
      // For single result deletion, use the removal function
      console.log(`Removing single item with id=${id} from cache`);
      removeTestResultFromCache(id, false);
    }
    
    // Force cache sync FIRST with the database after deletion
    await updateTestResultsCache();
    
    // Then FORCE removal from cache again as additional safeguard
    if (isByTestId) {
      // Double-check removal by test_id
      const testResultsCache = getTestResultsCache();
      const stillExistsByTestId = testResultsCache.filter(result => result.test_id === id);
      if (stillExistsByTestId.length > 0) {
        console.log(`FORCE REMOVAL: Found ${stillExistsByTestId.length} items still with test_id=${id}, force removing them`);
        stillExistsByTestId.forEach(item => {
          removeTestResultFromCache(item.id, false);
        });
      }
    } else {
      // Double-check single item removal
      const stillExists = getTestResultsCache().some(result => result.id === id);
      if (stillExists) {
        console.log(`FORCE REMOVAL: Item with ID ${id} still exists, force removing it`);
        removeTestResultFromCache(id, false);
      }
    }
    
    console.log('Cache state after deletion and sync:', getTestResultsCache().map(item => ({id: item.id, name: item.student_name})));
    console.log('Permanent deletion completed successfully');
    
    toast({
      title: "결과 영구 삭제 완료",
      description: "시험 결과가 영구적으로 삭제되었습니다.",
    });

    return true;
  } catch (error) {
    console.error('Error in deleteTestResults:', error);
    toast({
      title: "결과 삭제 실패",
      description: "시험 결과를 삭제하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteAllTests = async (): Promise<boolean> => {
  try {
    // Delete all tests
    const { data: deletedTests, error: testsError } = await supabase
      .from('tests')
      .delete()
      .neq('test_id', 'placeholder')
      .select('test_id'); // Delete all records and verify affected rows

    if (testsError) {
      console.error('Error deleting all tests:', testsError);
      toast({
        title: "시험 삭제 실패",
        description: "모든 시험을 삭제하는데 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }

    const cachedTests = getTestsCache();
    cachedTests.length = 0;
    try {
      localStorage.removeItem('deleted_tests');
    } catch {}

    // Note: We no longer delete all test results by default
    // Test results will remain in database even when tests are deleted

    toast({
      title: "삭제 완료",
      description: `${deletedTests?.length || 0}개 시험지가 삭제되었습니다. 시험 결과는 유지됩니다.`,
    });

    return true;
  } catch (error) {
    console.error('Error in deleteAllTests:', error);
    toast({
      title: "삭제 실패",
      description: "모든 시험을 삭제하는데 실패했습니다.",
      variant: "destructive",
    });
    return false;
  }
};
