import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentData {
  id: string;
  student_name: string;
  student_class: string;
  test_count: number;
  average_score: number;
}

export const useStudentMerge = () => {
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const mergeStudents = async (
    targetStudent: StudentData,
    sourceStudents: StudentData[],
    onSuccess?: () => void
  ) => {
    if (isMerging) return;
    
    setIsMerging(true);

    try {
      console.log('=== STUDENT MERGE START ===');
      console.log('Target student:', targetStudent);
      console.log('Source students to merge:', sourceStudents);

      if (sourceStudents.length === 0) {
        toast({
          title: "병합할 학생이 없습니다",
          description: "대상 학생 외에 다른 학생을 선택해주세요.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "학생 기록 병합 중",
        description: "잠시만 기다려주세요...",
      });

      let totalMergedTestResults = 0;
      let accumulatedTestCount = 0;
      let accumulatedTotalScore = 0;

      // Step 1: Process each source student
      for (const sourceStudent of sourceStudents) {
        console.log(`Processing merge: ${sourceStudent.student_name} -> ${targetStudent.student_name}`);
        
        // Skip if trying to merge student with itself
        if (sourceStudent.student_name === targetStudent.student_name) {
          console.log('Skipping self-merge for:', sourceStudent.student_name);
          continue;
        }

        // Get all test results for this source student
        const { data: sourceTestResults, error: testResultsError } = await supabase
          .from('test_results')
          .select('id, score, test_id, created_at')
          .eq('student_name', sourceStudent.student_name);

        if (testResultsError) {
          console.error('Error fetching test results:', testResultsError);
          continue;
        }

        if (sourceTestResults && sourceTestResults.length > 0) {
          // Update all test results to target student name
          console.log(`Merging ${sourceTestResults.length} test results from ${sourceStudent.student_name}`);
          
          const { error: updateResultsError, count } = await supabase
            .from('test_results')
            .update({ student_name: targetStudent.student_name })
            .eq('student_name', sourceStudent.student_name);

          if (updateResultsError) {
            console.error('Error updating test results:', updateResultsError);
            throw new Error(`시험 결과 병합 실패: ${sourceStudent.student_name}`);
          }

          totalMergedTestResults += count || sourceTestResults.length;
          console.log(`Successfully merged ${count || sourceTestResults.length} test results`);
        } else {
          // No test results found, use historical data
          console.log(`No test results found for ${sourceStudent.student_name}, using history data`);
          accumulatedTestCount += sourceStudent.test_count;
          accumulatedTotalScore += sourceStudent.average_score * sourceStudent.test_count;
        }

        // Delete source student's history record (but not test results)
        if (!sourceStudent.id.startsWith('test-')) {
          console.log(`Deleting history record for: ${sourceStudent.student_name}`);
          const { error: deleteError } = await supabase
            .from('student_test_history')
            .delete()
            .eq('student_name', sourceStudent.student_name);

          if (deleteError) {
            console.error('Error deleting student history:', deleteError);
            // Continue even if delete fails
          } else {
            console.log(`Successfully deleted history record for: ${sourceStudent.student_name}`);
          }
        }
      }

      // Step 2: Recalculate target student's statistics
      console.log(`Recalculating statistics for merged student: ${targetStudent.student_name}`);
      
      // Get all test results for the target student (now includes merged results)
      const { data: allTestResults, error: finalResultsError } = await supabase
        .from('test_results')
        .select('score, test_id, created_at')
        .eq('student_name', targetStudent.student_name)
        .order('created_at', { ascending: true });

      let finalTestCount = accumulatedTestCount;
      let finalTotalScore = accumulatedTotalScore;

      if (!finalResultsError && allTestResults && allTestResults.length > 0) {
        console.log(`Found ${allTestResults.length} total test results after merge`);
        
        // Count unique tests and get latest score for each
        const uniqueTestIds = new Set(allTestResults.map(result => result.test_id));
        const uniqueTestCount = uniqueTestIds.size;
        
        const uniqueTestScores = Array.from(uniqueTestIds).map(testId => {
          const testsForId = allTestResults.filter(r => r.test_id === testId);
          return testsForId[testsForId.length - 1]; // Get latest score for each test
        });

        const testResultsTotalScore = uniqueTestScores.reduce((sum, result) => sum + Number(result.score), 0);
        
        finalTestCount += uniqueTestCount;
        finalTotalScore += testResultsTotalScore;
      }

      const finalAverageScore = finalTestCount > 0 ? Number((finalTotalScore / finalTestCount).toFixed(2)) : 0;

      console.log(`Final statistics - Tests: ${finalTestCount}, Total: ${finalTotalScore}, Average: ${finalAverageScore}`);

      // Step 3: Update target student's history record
      const { data: existingRecord } = await supabase
        .from('student_test_history')
        .select('id')
        .eq('student_name', targetStudent.student_name)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('student_test_history')
          .update({
            test_count: finalTestCount,
            total_score: finalTotalScore,
            average_score: finalAverageScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (updateError) {
          console.error('Error updating target student statistics:', updateError);
          throw new Error('통계 업데이트 실패');
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('student_test_history')
          .insert({
            student_name: targetStudent.student_name,
            student_class: targetStudent.student_class,
            test_count: finalTestCount,
            total_score: finalTotalScore,
            average_score: finalAverageScore
          });

        if (insertError) {
          console.error('Error creating target student statistics:', insertError);
          throw new Error('통계 생성 실패');
        }
      }

      toast({
        title: "학생 기록 병합 완료",
        description: `${sourceStudents.length}명의 학생이 '${targetStudent.student_name}'으로 성공적으로 병합되었습니다. 총 ${finalTestCount}개의 시험 결과가 통합되어 평균 ${finalAverageScore}점입니다.`,
        variant: "default"
      });

      console.log('=== STUDENT MERGE COMPLETED SUCCESSFULLY ===');
      
      // Execute success callback and wait for it to complete
      if (onSuccess) {
        console.log('Executing onSuccess callback...');
        await onSuccess();
        console.log('onSuccess callback completed');
      }

    } catch (err) {
      console.error('Error during student merge:', err);
      toast({
        title: "병합 중 오류 발생",
        description: err instanceof Error ? err.message : "학생 기록 병합 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsMerging(false);
    }
  };

  return {
    mergeStudents,
    isMerging
  };
};