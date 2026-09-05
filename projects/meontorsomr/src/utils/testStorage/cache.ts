
import { QRDataType } from "@/types/test";

// Shared cache for tests and results
export let testsCache: QRDataType[] = [];
export let testResultsCache: any[] = [];

// Function to update the test cache
export const updateTestCache = (testId: string, updatedTest: Partial<QRDataType>) => {
  const testIndex = testsCache.findIndex(test => test.testId === testId);
  if (testIndex !== -1) {
    testsCache[testIndex] = {
      ...testsCache[testIndex],
      ...updatedTest
    };
  }
};

// Function to remove a test from cache
export const removeTestFromCache = (testId: string) => {
  console.log('Removing test from cache:', testId);
  testsCache = testsCache.filter(test => test.testId !== testId);
  testResultsCache = testResultsCache.filter(result => result.test_id !== testId);
};

// Function to remove a test result from cache
export const removeTestResultFromCache = (resultId: string) => {
  console.log('Removing result from cache:', resultId);
  console.log('Before removal, cache size:', testResultsCache.length);
  testResultsCache = testResultsCache.filter(result => result.id !== resultId);
  console.log('After removal, cache size:', testResultsCache.length);
};

// Update test results cache
export const updateTestResultsCache = (results: any[]) => {
  console.log('Updating test results cache with', results.length, 'results');
  // Replace the entire cache instead of merging to avoid "zombie" results
  testResultsCache = [...results];
};
