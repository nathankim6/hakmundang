import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Get count of associated test results before deletion
export const getTestResultCount = async (testId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('test_results')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId);
    
    if (error) {
      console.error('Error counting test results:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getTestResultCount:', error);
    return 0;
  }
};

// Create comprehensive backup before deletion
export const createPreDeletionBackup = async (testId: string): Promise<boolean> => {
  try {
    // Get test data
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('test_id', testId)
      .single();
    
    if (testError) {
      console.error('Error fetching test for backup:', testError);
      return false;
    }

    // Get test results
    const { data: resultsData, error: resultsError } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId);
    
    if (resultsError) {
      console.error('Error fetching test results for backup:', resultsError);
      return false;
    }

    // Create backup object
    const backupData = {
      timestamp: new Date().toISOString(),
      type: 'pre_deletion_backup',
      test: testData,
      testResults: resultsData || [],
      metadata: {
        testId,
        totalResults: resultsData?.length || 0,
        backupReason: 'Pre-deletion safety backup'
      }
    };

    // Save to localStorage with timestamp
    const backupKey = `deletion_backup_${testId}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));

    // Also save to a general backup array
    const existingBackups = JSON.parse(localStorage.getItem('all_deletion_backups') || '[]');
    existingBackups.push({
      key: backupKey,
      testId,
      timestamp: backupData.timestamp,
      resultCount: backupData.metadata.totalResults
    });
    localStorage.setItem('all_deletion_backups', JSON.stringify(existingBackups));

    console.log('Pre-deletion backup created:', backupKey);
    return true;
  } catch (error) {
    console.error('Error creating pre-deletion backup:', error);
    return false;
  }
};

// Restore from backup
export const restoreFromBackup = async (backupKey: string): Promise<boolean> => {
  try {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      toast({
        title: "백업 없음",
        description: "해당 백업을 찾을 수 없습니다.",
        variant: "destructive"
      });
      return false;
    }

    const backup = JSON.parse(backupData);
    
    // Restore test
    if (backup.test) {
      const { error: testError } = await supabase
        .from('tests')
        .insert(backup.test);
      
      if (testError) {
        console.error('Error restoring test:', testError);
        return false;
      }
    }

    // Restore test results
    if (backup.testResults && backup.testResults.length > 0) {
      const { error: resultsError } = await supabase
        .from('test_results')
        .insert(backup.testResults);
      
      if (resultsError) {
        console.error('Error restoring test results:', resultsError);
        return false;
      }
    }

    toast({
      title: "복원 완료",
      description: `시험과 ${backup.testResults?.length || 0}개의 결과가 복원되었습니다.`,
    });

    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    toast({
      title: "복원 실패",
      description: "백업 복원 중 오류가 발생했습니다.",
      variant: "destructive"
    });
    return false;
  }
};

// Get all available backups
export const getAvailableBackups = (): Array<{
  key: string;
  testId: string;
  timestamp: string;
  resultCount: number;
}> => {
  try {
    const backups = localStorage.getItem('all_deletion_backups');
    return backups ? JSON.parse(backups) : [];
  } catch (error) {
    console.error('Error getting available backups:', error);
    return [];
  }
};