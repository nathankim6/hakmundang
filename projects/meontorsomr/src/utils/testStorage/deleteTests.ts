
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { removeTestResultFromCache } from "./cache";

export const deleteTest = async (testId: string): Promise<boolean> => {
  try {
    // Delete the test from the database
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('test_id', testId);

    if (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "시험 삭제 실패",
        description: "시험을 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    // Also delete associated test results
    const { error: resultError } = await supabase
      .from('test_results')
      .delete()
      .eq('test_id', testId);

    if (resultError) {
      console.error('Error deleting test results:', resultError);
      // We still return true since the test was deleted
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTest:', error);
    toast({
      title: "시험 삭제 실패",
      description: "시험을 삭제하는데 실패했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteTestResults = async (id: string, isByTestId: boolean = false, isPermanent: boolean = false): Promise<boolean> => {
  try {
    const field = isByTestId ? 'test_id' : 'id';
    
    // Log the deletion attempt with all parameters for debugging
    console.log(`Deleting test result: id=${id}, isByTestId=${isByTestId}, isPermanent=${isPermanent}, field=${field}`);
    
    // Delete the test result from the database
    const { error, data } = await supabase
      .from('test_results')
      .delete()
      .eq(field, id)
      .select();

    if (error) {
      console.error('Error deleting test result:', error);
      toast({
        title: "결과 삭제 실패",
        description: "시험 결과를 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Deleted test results:', data);
    
    // Update cache to remove the deleted result immediately
    if (!isByTestId && data && data.length > 0) {
      data.forEach(result => {
        removeTestResultFromCache(result.id);
      });
    }

    if (!isPermanent) {
      toast({
        title: "결과 삭제 완료",
        description: "시험 결과가 성공적으로 삭제되었습니다.",
      });
    } else {
      // If it's a permanent delete, show a different toast or no toast based on where it's called from
      console.log('Permanent deletion successful');
    }

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
    const { error: testsError } = await supabase
      .from('tests')
      .delete()
      .neq('test_id', 'placeholder'); // Delete all records

    if (testsError) {
      console.error('Error deleting all tests:', testsError);
      toast({
        title: "시험 삭제 실패",
        description: "모든 시험을 삭제하는데 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }

    // Delete all test results
    const { error: resultsError } = await supabase
      .from('test_results')
      .delete()
      .neq('test_id', 'placeholder'); // Delete all records

    if (resultsError) {
      console.error('Error deleting all test results:', resultsError);
      // We still return true since the tests were deleted
    }

    toast({
      title: "삭제 완료",
      description: "모든 시험과 결과가 삭제되었습니다.",
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
