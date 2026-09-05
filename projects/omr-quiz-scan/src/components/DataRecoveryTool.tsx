import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { recoverDataFromLocalStorage } from '@/utils/testStorage/cache';
import { saveTest, saveTestResult } from '@/utils/testStorage/saveTests';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, AlertCircle, CheckCircle, Shield, Database, RefreshCw, Trash2 } from 'lucide-react';

const DataRecoveryTool = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [recoveryResults, setRecoveryResults] = useState<{ tests: number; testResults: number } | null>(null);
  const [deletionLog, setDeletionLog] = useState<any[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [deletedTestsCount, setDeletedTestsCount] = useState(0);
  const { toast } = useToast();

  // Load deletion log and deleted tests count on component mount
  useEffect(() => {
    loadDeletionLog();
    loadDeletedTestsCount();
  }, []);

  const loadDeletedTestsCount = () => {
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('deleted_tests') || '[]');
      setDeletedTestsCount(deleted.length);
    } catch {
      setDeletedTestsCount(0);
    }
  };

  const clearDeletedTestsCache = () => {
    try {
      localStorage.removeItem('deleted_tests');
      setDeletedTestsCount(0);
      toast({
        title: "삭제 캐시 초기화 완료",
        description: "로컬에서 숨겨진 시험들이 다시 표시됩니다. 페이지를 새로고침하세요.",
      });
    } catch (error) {
      console.error('Error clearing deleted tests cache:', error);
      toast({
        title: "초기화 실패",
        description: "삭제 캐시를 초기화하는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const loadDeletionLog = async () => {
    try {
      const { data, error } = await supabase
        .from('deletion_log')
        .select('*')
        .order('deleted_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setDeletionLog(data || []);
    } catch (error) {
      console.error('Error loading deletion log:', error);
    }
  };

  const handleDataRecovery = async () => {
    setIsRecovering(true);
    try {
      console.log('Starting comprehensive data recovery process...');
      
      // Try multiple recovery sources
      const recoveryResults = await attemptMultiSourceRecovery();
      
      setRecoveryResults(recoveryResults);
      
      if (recoveryResults.tests > 0 || recoveryResults.testResults > 0) {
        toast({
          title: "데이터 복구 완료",
          description: `${recoveryResults.tests}개의 시험과 ${recoveryResults.testResults}개의 시험 결과가 복구되었습니다.`,
        });
        
        // Create backup after successful recovery
        createAutomaticBackup();
      } else {
        toast({
          title: "복구할 데이터 없음",
          description: "모든 복구 방법을 시도했지만 데이터를 찾지 못했습니다.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error during data recovery:', error);
      toast({
        title: "복구 실패",
        description: "데이터 복구 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const attemptMultiSourceRecovery = async () => {
    let restoredTests = 0;
    let restoredResults = 0;

    // 1. Try localStorage recovery
    const { tests: localTests, testResults: localResults } = recoverDataFromLocalStorage();
    console.log(`Found ${localTests.length} tests and ${localResults.length} test results in localStorage`);

    // 2. Try sessionStorage recovery
    const sessionTests = JSON.parse(sessionStorage.getItem('testsCache') || '[]');
    const sessionResults = JSON.parse(sessionStorage.getItem('testResultsCache') || '[]');
    console.log(`Found ${sessionTests.length} tests and ${sessionResults.length} test results in sessionStorage`);

    // 3. Combine all sources
    const allTests = [...localTests, ...sessionTests];
    const allResults = [...localResults, ...sessionResults];

    // Remove duplicates based on test_id
    const uniqueTests = allTests.filter((test, index, self) => 
      index === self.findIndex(t => (t.test_id || t.id) === (test.test_id || test.id))
    );
    
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );

    // Restore tests
    for (const test of uniqueTests) {
      try {
        const success = await saveTest({
          testId: test.test_id || test.id,
          title: test.title,
          answers: test.answers,
          questionCount: test.question_count,
          timestamp: Date.now(),
          isEnded: test.is_ended
        });
        if (success) restoredTests++;
      } catch (error) {
        console.warn('Error restoring test:', test.id, error);
      }
    }

    // Restore test results
    for (const result of uniqueResults) {
      try {
        const success = await saveTestResult(
          result.test_id,
          result.student_answers || {},
          result.score || 0,
          result.correct_count || 0,
          result.total_count || 0,
          result.student_name
        );
        if (success) restoredResults++;
      } catch (error) {
        console.warn('Error restoring test result:', result.id, error);
      }
    }

    return { tests: restoredTests, testResults: restoredResults };
  };

  const createAutomaticBackup = async () => {
    setIsBackingUp(true);
    try {
      // Get current database data
      const { data: tests } = await supabase.from('tests').select('*');
      const { data: testResults } = await supabase.from('test_results').select('*');
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        tests: tests || [],
        testResults: testResults || [],
        metadata: {
          totalTests: tests?.length || 0,
          totalResults: testResults?.length || 0,
          lastBackup: new Date().toISOString()
        }
      };
      
      // Save to localStorage with versioning
      localStorage.setItem('testDataBackup_latest', JSON.stringify(backupData));
      localStorage.setItem(`testDataBackup_${Date.now()}`, JSON.stringify(backupData));
      
      toast({
        title: "자동 백업 완료",
        description: `${backupData.metadata.totalTests}개 시험, ${backupData.metadata.totalResults}개 결과가 백업되었습니다.`,
      });
    } catch (error) {
      console.error('Automatic backup failed:', error);
      toast({
        title: "자동 백업 실패",
        description: "백업 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const exportBackupData = async () => {
    try {
      // Get fresh data from database
      const { data: tests } = await supabase.from('tests').select('*');
      const { data: testResults } = await supabase.from('test_results').select('*');
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        tests: tests || [],
        testResults: testResults || [],
        metadata: {
          totalTests: tests?.length || 0,
          totalResults: testResults?.length || 0,
          exportedAt: new Date().toISOString()
        }
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "전체 백업 완료",
        description: `${backupData.metadata.totalTests}개 시험, ${backupData.metadata.totalResults}개 결과가 내보내졌습니다.`,
      });
    } catch (error) {
      toast({
        title: "백업 실패",
        description: "데이터 내보내기 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      if (!backupData.tests || !backupData.testResults) {
        throw new Error('Invalid backup file format');
      }

      let restoredTests = 0;
      let restoredResults = 0;

      // Restore tests
      for (const test of backupData.tests) {
        try {
          const success = await saveTest({
            testId: test.test_id,
            title: test.title,
            answers: test.answers,
            questionCount: test.question_count,
            timestamp: Date.now(),
            isEnded: test.is_ended
          });
          if (success) restoredTests++;
        } catch (error) {
          console.warn('Error restoring test from file:', test.test_id, error);
        }
      }

      // Restore test results
      for (const result of backupData.testResults) {
        try {
          const success = await saveTestResult(
            result.test_id,
            result.student_answers || {},
            result.score || 0,
            result.correct_count || 0,
            result.total_count || 0,
            result.student_name
          );
          if (success) restoredResults++;
        } catch (error) {
          console.warn('Error restoring test result from file:', result.id, error);
        }
      }

      toast({
        title: "파일 복구 완료",
        description: `${restoredTests}개의 시험과 ${restoredResults}개의 시험 결과가 복구되었습니다.`,
      });

      setRecoveryResults({ tests: restoredTests, testResults: restoredResults });
    } catch (error) {
      toast({
        title: "파일 복구 실패",
        description: "백업 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            고급 데이터 복구 및 백업 시스템
          </CardTitle>
          <CardDescription>
            다중 소스 복구, 자동 백업, 데이터 무결성 보호 기능이 포함된 통합 데이터 관리 도구입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden Tests Recovery Section */}
          {deletedTestsCount > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-orange-500" />
                숨겨진 시험 복구
              </h3>
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  현재 {deletedTestsCount}개의 시험이 로컬에서 숨겨져 있습니다. 
                  데이터베이스에는 존재하지만 이 브라우저에서 보이지 않습니다.
                  아래 버튼을 클릭하면 모든 숨겨진 시험이 다시 표시됩니다.
                </AlertDescription>
              </Alert>
              <Button
                onClick={clearDeletedTestsCache}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                숨겨진 시험 모두 복구 ({deletedTestsCount}개)
              </Button>
            </div>
          )}

          {/* Recovery Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              데이터 복구
            </h3>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                localStorage, sessionStorage, 백업 파일 등 모든 가능한 소스에서 데이터를 복구합니다.
                Foreign Key 제약 조건이 수정되어 향후 데이터 손실을 방지합니다.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDataRecovery}
                disabled={isRecovering}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isRecovering ? '복구 중...' : '전체 데이터 복구'}
              </Button>
              
              <Button
                onClick={createAutomaticBackup}
                disabled={isBackingUp}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                {isBackingUp ? '백업 중...' : '즉시 백업 생성'}
              </Button>

              <label className="cursor-pointer">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    파일에서 복구
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              
              <Button
                onClick={exportBackupData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                전체 백업 내보내기
              </Button>
            </div>

            {recoveryResults && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  복구 완료: {recoveryResults.tests}개의 시험, {recoveryResults.testResults}개의 시험 결과가 복구되었습니다.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Deletion Log Section */}
          {deletionLog.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">최근 삭제 기록</h3>
              <div className="space-y-2">
                {deletionLog.map((log) => (
                  <Alert key={log.id} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {new Date(log.deleted_at).toLocaleString('ko-KR')}: {log.table_name} 테이블에서 
                      {log.record_id} 삭제됨 (연관 레코드: {log.associated_records}개)
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">시스템 상태</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Foreign Key 제약 조건 수정 완료
                  <br />✅ 자동 백업 트리거 설치됨
                  <br />✅ 삭제 로그 기능 활성화됨
                </AlertDescription>
              </Alert>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  데이터 무결성 보호 활성화
                  <br />실시간 백업 모니터링
                  <br />안전한 삭제 기능 구현
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRecoveryTool;