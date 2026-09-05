import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, XCircle, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import TestReport from '@/components/TestReport';
import { extractClassName, extractStudentName, downloadAsJPG } from '@/utils/resultsUtils';
interface TestResult {
  id: string;
  test_id: string;
  student_name: string;
  score: number;
  correct_count: number;
  total_count: number;
  student_answers: Record<string, any>;
  created_at: string;
}
interface TestData {
  test_id: string;
  title: string;
  answers: Record<string, any>;
  question_count: number;
  subtitle?: string | null;
}
const TestResultReport = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('결과 ID가 없습니다.');
        setIsLoading(false);
        return;
      }
      try {
        // Fetch test result
        const {
          data: resultData,
          error: resultError
        } = await supabase.from('test_results').select('*').eq('id', id).maybeSingle();
        if (resultError) throw resultError;
        if (!resultData) {
          setError('결과를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }
        setResult(resultData as TestResult);

        // Fetch test data
        const {
          data: testInfo,
          error: testError
        } = await supabase.from('tests').select('*').eq('test_id', resultData.test_id).maybeSingle();
        if (testError) throw testError;
        if (!testInfo) {
          setError('시험 정보를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }
        setTestData(testInfo as TestData);

        // Fetch all results for this test (for comparison stats)
        const {
          data: allTestResults,
          error: allResultsError
        } = await supabase.from('test_results').select('*').eq('test_id', resultData.test_id);
        if (!allResultsError && allTestResults) {
          setAllResults(allTestResults as TestResult[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, refreshKey]);
  const handleDownloadImage = () => {
    if (!reportRef.current || !result || !testData) return;
    const className = extractClassName(result.student_name);
    const name = extractStudentName(result.student_name);
    const fileName = `${testData.title}_${className}_${name}`;
    downloadAsJPG(reportRef.current, fileName);
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-slate-600">결과를 불러오는 중...</p>
        </div>
      </div>;
  }
  if (error || !result || !testData) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="font-semibold text-slate-700 mb-2">오류</h3>
            <p className="text-sm text-slate-500 mb-6">{error || '결과를 찾을 수 없습니다.'}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/report')} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={brainiacLogo.url} alt="Brainiac English" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold text-slate-800 leading-tight">{testData.title}</h1>
                  <p className="text-xs text-slate-500">시험 결과 리포트</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content - Always use TestReport */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div ref={reportRef} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <TestReport studentName={extractStudentName(result.student_name)} studentClass={extractClassName(result.student_name)} testTitle={testData.title} studentAnswers={result.student_answers} correctAnswers={testData.answers} testDate={result.created_at} allResults={allResults.map(r => ({
          score: r.score,
          student_answers: r.student_answers
        }))} testId={testData.test_id} resultId={result.id} onDataUpdated={() => setRefreshKey(k => k + 1)} reportTitle={testData.title} reportSubtitle={testData.subtitle ?? null} />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-slate-400">
        © BRAINIAC ENGLISH. All rights reserved.
      </div>
    </div>;
};
export default TestResultReport;