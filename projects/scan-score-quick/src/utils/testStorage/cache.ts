import { supabase } from "@/integrations/supabase/client";

// Helper functions for class name and student name extraction (keeping these unchanged)
export const extractClassName = (studentName: string): string => {
  const parts = studentName.split(" ");
  return parts.length > 1 ? parts[0] : "미지정";
};

export const extractStudentName = (studentName: string): string => {
  const parts = studentName.split(" ");
  return parts.length > 1 ? parts[1] : studentName;
};

// Caches to hold the data
// Change from 'export let' to private variables with getter functions
let _testsCache: any[] = [];
let _testResultsCache: any[] = [];

// Export getters for the caches instead of the cache variables themselves
export const getTestsCache = (): any[] => _testsCache;
export const getTestResultsCache = (): any[] => _testResultsCache;

// Function to remove a test from the cache
export const removeTestFromCache = (testId: string): boolean => {
  try {
    const countBefore = _testsCache.length;
    _testsCache = _testsCache.filter(test => test.test_id !== testId && test.testId !== testId);
    console.log(`removeTestFromCache: ${countBefore} -> ${_testsCache.length} tests`);
    return !_testsCache.some(test => test.test_id === testId || test.testId === testId);
  } catch (error) {
    console.error('Error removing test from cache:', error);
    return false;
  }
};

// Function to filter the cache by a predicate
export const filterTestResultsCache = (predicate: (item: any) => boolean): void => {
  const beforeCount = _testResultsCache.length;
  _testResultsCache = _testResultsCache.filter(predicate);
  const afterCount = _testResultsCache.length;
  console.log(`filterTestResultsCache: ${beforeCount} -> ${afterCount} items (removed ${beforeCount - afterCount})`);
};

// Function to update the test results cache
export const updateTestResultsCache = async (data?: any[]): Promise<boolean> => {
  try {
    // If data is provided, use it directly
    if (data) {
      console.log(`Updating cache with ${data.length} provided items`);
      // Create a deep copy to avoid reference issues
      _testResultsCache = JSON.parse(JSON.stringify(data));
      console.log(`Cache updated with ${_testResultsCache.length} items`);
      return true;
    }
    
    // Otherwise fetch from the database
    const { data: fetchedData, error } = await supabase
      .from('test_results')
      .select('*');
    
    if (error) {
      console.error('Error fetching test results:', error);
      return false;
    }
    
    if (!fetchedData) {
      console.warn('No test results found in database');
      _testResultsCache = [];
      return true;
    }
    
    // Create a deep copy to avoid reference issues
    console.log(`Fetched ${fetchedData.length} test results from database`);
    _testResultsCache = JSON.parse(JSON.stringify(fetchedData));
    console.log(`Cache updated with ${_testResultsCache.length} items`);
    
    // Log the IDs for verification
    console.log('Current cache item IDs:', _testResultsCache.map(item => item.id));
    return true;
  } catch (error) {
    console.error('Error updating test results cache:', error);
    return false;
  }
};

// Function to remove a test result from the cache
export const removeTestResultFromCache = (resultId: string, isTestId: boolean = false): boolean => {
  try {
    console.log(`removeTestResultFromCache: Removing ${isTestId ? 'all results with test_id' : 'result with id'}: ${resultId} from cache`);
    console.log(`removeTestResultFromCache: Cache before removal: ${_testResultsCache.length} items`);
    
    const countBefore = _testResultsCache.length;
    
    if (isTestId) {
      // Remove all items with this test_id
      _testResultsCache = _testResultsCache.filter(result => result.test_id !== resultId);
    } else {
      // Remove item with this id - use direct assignment for more reliable removal
      _testResultsCache = _testResultsCache.filter(result => result.id !== resultId);
    }
    
    const countAfter = _testResultsCache.length;
    console.log(`removeTestResultFromCache: Cache after removal: ${countAfter} items (removed ${countBefore - countAfter} items)`);
    
    // Verify the removal was successful
    if (isTestId) {
      const stillExists = _testResultsCache.some(result => result.test_id === resultId);
      if (stillExists) {
        console.error(`removeTestResultFromCache: ERROR - Items with test_id ${resultId} still exist after removal!`);
        return false;
      }
    } else {
      const stillExists = _testResultsCache.some(result => result.id === resultId);
      if (stillExists) {
        console.error(`removeTestResultFromCache: ERROR - Item with id ${resultId} still exists after removal!`);
        return false;
      }
    }
    
    console.log(`removeTestResultFromCache: Verification passed - item(s) successfully removed`);
    return true;
  } catch (error) {
    console.error('Error removing test result from cache:', error);
    return false;
  }
};

// Function to check for cached data recovery
export const recoverDataFromLocalStorage = (): { tests: any[], testResults: any[] } => {
  try {
    // Check if there's any data in localStorage
    const storedTests = localStorage.getItem('cached_tests_backup');
    const storedResults = localStorage.getItem('cached_test_results_backup');
    
    const tests = storedTests ? JSON.parse(storedTests) : [];
    const testResults = storedResults ? JSON.parse(storedResults) : [];
    
    console.log(`Found ${tests.length} tests and ${testResults.length} test results in localStorage`);
    return { tests, testResults };
  } catch (error) {
    console.error('Error recovering data from localStorage:', error);
    return { tests: [], testResults: [] };
  }
};

// Function to backup current cache to localStorage
export const backupCacheToLocalStorage = () => {
  try {
    localStorage.setItem('cached_tests_backup', JSON.stringify(_testsCache));
    localStorage.setItem('cached_test_results_backup', JSON.stringify(_testResultsCache));
    console.log('Cache backed up to localStorage');
  } catch (error) {
    console.error('Error backing up cache to localStorage:', error);
  }
};

// Function to set up real-time subscriptions
export const setupRealtimeSubscriptions = (handleUpdate?: () => void) => {
  // Initialize the caches with initial data
  const loadInitialData = async () => {
    try {
      console.log('Loading initial data for cache...');
      const { data: initialTests, error: testsError } = await supabase
        .from('tests')
        .select('*');

      if (testsError) {
        console.error('Error fetching initial tests:', testsError);
      } else {
        _testsCache = initialTests ? JSON.parse(JSON.stringify(initialTests)) : [];
        console.log(`Initial tests cache loaded with ${_testsCache.length} items`);
      }

      const { data: initialTestResults, error: testResultsError } = await supabase
        .from('test_results')
        .select('*');

      if (testResultsError) {
        console.error('Error fetching initial test results:', testResultsError);
      } else {
        // Deep copy to avoid reference issues. Database is the only source of truth.
        _testResultsCache = initialTestResults ? JSON.parse(JSON.stringify(initialTestResults)) : [];
        console.log(`Initial test results cache loaded with ${_testResultsCache.length} items`);
        console.log('Initial cache item IDs:', _testResultsCache.map(item => item.id).slice(0, 20), '...');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Load initial data
  loadInitialData();

  // Set up real-time subscription for tests
  const testsSubscription = supabase
    .channel('tests-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tests' },
      async (payload) => {
        console.log('Test table change received:', payload);
        await loadInitialData();
        if (handleUpdate) handleUpdate();
      }
    )
    .subscribe();

  // Set up real-time subscription for test_results with enhanced DELETE handling
  const testResultsSubscription = supabase
    .channel('test_results-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'test_results' },
      async (payload) => {
        console.log('Test results table change detected:', payload);
        
        try {
          // For DELETE events, handle them carefully to ensure removal from cache
          if (payload.eventType === 'DELETE' && payload.old) {
            console.log('DELETE event detected, processing local cache update:', payload.old);
            
            // Remove the deleted item from cache directly
            const deletedId = payload.old.id;
            const deletedStudentName = payload.old.student_name;
            
            if (deletedId) {
              console.log(`Manually removing deleted item with ID ${deletedId}, student: ${deletedStudentName} from cache`);
              
              // First try removing by id
              removeTestResultFromCache(deletedId, false);
              
              // Remove the specific item from cache
              removeTestResultFromCache(deletedId, false);
              
              // If it's a test_id deletion, make sure we removed all related items
              if ('test_id' in payload.old) {
                const testId = payload.old.test_id;
                console.log(`Checking if we need to remove items by test_id ${testId}`);
                
                // Check if there are still items with this test_id
                const remainingItems = _testResultsCache.filter(item => item.test_id === testId);
                if (remainingItems.length > 0) {
                  console.log(`Found ${remainingItems.length} items still with test_id=${testId}, removing them all`);
                  removeTestResultFromCache(testId, true);
                }
              }
              
              // Verify deletion from cache
              const stillExists = _testResultsCache.some(item => item.id === deletedId);
              if (stillExists) {
                console.error(`ERROR: Item with ID ${deletedId} still exists in cache after deletion!`);
                // Force direct filtering as last resort
                filterTestResultsCache(item => item.id !== deletedId);
                console.log('Forced direct cache filtering as fallback');
              } else {
                console.log(`Verified: item with ID ${deletedId} no longer in cache`);
              }
            }
          } else {
            // For other events, DO NOT refresh the entire cache to prevent data re-adding
            console.log(`Detected ${payload.eventType} event, skipping full cache refresh to prevent data re-adding`);
            // Only handle specific INSERT and UPDATE events without full refresh
            if (payload.eventType === 'INSERT' && payload.new) {
              console.log('Adding new item to cache:', payload.new.id);
              _testResultsCache.unshift(payload.new as any);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              console.log('Updating item in cache:', payload.new.id);
              const index = _testResultsCache.findIndex(item => item.id === payload.new.id);
              if (index !== -1) {
                _testResultsCache[index] = payload.new as any;
              }
            }
          }
          
          // Trigger UI update
          if (handleUpdate) {
            console.log('Triggering UI update after database change');
            handleUpdate();
          }
        } catch (err) {
          console.error('Error handling test_results subscription update:', err);
          // Only trigger UI update, don't reload data
          if (handleUpdate) handleUpdate();
        }
      }
    )
    .subscribe();

  // Return a cleanup function to unsubscribe from the channels
  return () => {
    console.log('Cleaning up real-time subscriptions');
    supabase.removeChannel(testsSubscription);
    supabase.removeChannel(testResultsSubscription);
  };
};
