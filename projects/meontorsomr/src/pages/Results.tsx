import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Image, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { loadTestResults, loadTests, deleteTestResults } from '@/utils/testStorage';
import { toast } from "@/hooks/use-toast";
import TestReport from '@/components/TestReport';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import DeleteTestDialog from '@/components/test/DeleteTestDialog';
import AccessCodeForm from '@/components/AccessCodeForm';

interface TestResult {
  id: string;
  test_id: string;
  student_name: string;
  score: number;
  student_answers: Record<number, number>;
  correct_count: number;
  total_count: number;
  created_at: string;
}

interface Test {
  testId: string;
  title: string;
  answers: Record<number, any>;
}

const Results = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const reportRefs = React.useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  const loadAllData = useCallback(async () => {
    try {
      const loadedResults = await loadTestResults();
      const loadedTests = await loadTests();
      console.log('Loaded Results:', loadedResults);
      console.log('Loaded Tests:', loadedTests);
      
      setResults(loadedResults);
      setTests(loadedTests);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "시험 결과를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    return localStorage.getItem('resultsAccessGranted') === 'true';
  });

  if (!hasAccess) {
    return <AccessCodeForm onSuccess={() => setHasAccess(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-emerald-600">로딩 중...</p>
      </div>
    );
  }

  const handleDelete = async (resultId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      console.log('Attempting to delete result with ID:', resultId);
      
      setResults(prevResults => prevResults.filter(result => result.id !== resultId));
      
      const success = await deleteTestResults(resultId, false, true);
      
      if (success) {
        toast({
          title: "삭제 완료",
          description: "선택한 결과가 삭제되었습니다."
        });
      } else {
        loadAllData();
        throw new Error('Failed to delete test result');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "삭제 실패",
        description: "결과를 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteByTestId = async (testId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteTestResults(testId, true);
      if (success) {
        setResults(prevResults => prevResults.filter(result => result.test_id !== testId));
        setTests(prevTests => prevTests.filter(test => test.testId !== testId));
        toast({
          title: "삭제 완료",
          description: "시험과 관련된 모든 결과가 삭제되었습니다."
        });
      }
    } catch (error) {
      console.error('Error in handleDeleteByTestId:', error);
      toast({
        title: "삭제 실패",
        description: "시험을 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const toggleTestResults = (testId: string) => {
    const newExpandedTests = new Set(expandedTests);
    if (expandedTests.has(testId)) {
      newExpandedTests.delete(testId);
    } else {
      newExpandedTests.add(testId);
    }
    setExpandedTests(newExpandedTests);
  };

  const toggleAllRowsForTest = (testId: string) => {
    const testResults = results.filter(r => r.test_id === testId);
    const allResultIds = testResults.map(r => r.id);
    const isAllExpanded = allResultIds.every(id => expandedRows.has(id));
    
    const newExpandedRows = new Set(expandedRows);
    
    if (isAllExpanded) {
      allResultIds.forEach(id => newExpandedRows.delete(id));
    } else {
      allResultIds.forEach(id => newExpandedRows.add(id));
    }
    
    setExpandedRows(newExpandedRows);
  };

  const getTestAnswers = (testId: string): Record<number, any> | null => {
    const test = tests.find(t => t.testId === testId);
    return test ? test.answers : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadExcel = (testId?: string) => {
    const filteredResults = testId ? results.filter(result => result.test_id === testId) : results;
    const test = testId ? tests.find(t => t.testId === testId) : null;
    const worksheet = XLSX.utils.json_to_sheet(filteredResults.map(result => {
      const [className, name] = result.student_name.split(" ");
      return {
        '시험 제목': tests.find(t => t.testId === result.test_id)?.title || result.test_id,
        '반': className || '미지정',
        '이름': name || result.student_name,
        '점수': formatScore(result.score),
        '맞은 개수': result.correct_count,
        '총 문항': result.total_count,
        '제출 시간': formatDate(result.created_at)
      };
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '시험 결과');
    const filename = testId ? `시험결과_${test?.title || testId}.xlsx` : '전체_시험결과.xlsx';
    XLSX.writeFile(workbook, filename);
  };

  const getAnswerDisplay = (answer: any): string => {
    if (typeof answer === 'object' && answer.answer !== undefined) {
      return String(answer.answer);
    }
    return String(answer);
  };

  const downloadAsJPG = async (elementRef: HTMLDivElement | null, fileName: string, zip?: JSZip) => {
    if (!elementRef) {
      console.error('Element ref is null for:', fileName);
      throw new Error('리포트를 찾을 수 없습니다.');
    }
    try {
      console.log('Generating image for:', fileName);
      const canvas = await html2canvas(elementRef, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 1.0);
      });
      if (zip) {
        console.log('Adding to ZIP:', fileName);
        zip.file(`${fileName}.jpg`, blob);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({
          title: "다운로드 완료",
          description: "리포트가 성공적으로 저장되었습니다."
        });
      }
    } catch (error) {
      console.error('Error in downloadAsJPG:', error);
      throw error;
    }
  };

  const downloadAllReportsAsJPG = async (testId: string) => {
    const testResults = results.filter(r => r.test_id === testId);
    const test = tests.find(t => t.testId === testId);
    if (!test || testResults.length === 0) {
      toast({
        title: "다운로드 실패",
        description: "시험 결과를 찾을 수 없습니다.",
        variant: "destructive"
      });
      return;
    }
    try {
      toast({
        title: "다운로드 시작",
        description: "모든 리포트를 저장하고 있습니다. 잠시만 기다려주세요."
      });
      const zip = new JSZip();
      console.log('Starting ZIP creation with', testResults.length, 'reports');
      const backupExpandedRows = new Set(expandedRows);
      setExpandedRows(new Set(testResults.map(r => r.id)));
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        for (const result of testResults) {
          const ref = reportRefs.current[result.id];
          if (!ref) {
            console.error('Missing ref for result:', result.id);
            continue;
          }
          const [className, name] = (result.student_name || "").split(" ");
          const fileName = `${test.title}_${className || '미지정'}_${name || result.student_name}`;
          try {
            await downloadAsJPG(ref, fileName, zip);
            console.log('Successfully added to ZIP:', fileName);
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('Failed to process report:', fileName, error);
          }
        }
        console.log('Generating final ZIP file');
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: {
            level: 6
          }
        });
        console.log('ZIP file size:', zipBlob.size);
        if (zipBlob.size === 0) {
          throw new Error('ZIP file is empty');
        }
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${test.title}_전체리포트.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
        toast({
          title: "일괄 저장 완료",
          description: "모든 리포트가 성공적으로 저장되었습니다."
        });
      } finally {
        setExpandedRows(backupExpandedRows);
      }
    } catch (error) {
      console.error('Error in downloadAllReportsAsJPG:', error);
      toast({
        title: "일괄 저장 실패",
        description: "일부 리포트 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  const renderAnswers = (studentAnswers: Record<number, any>, correctAnswers: Record<number, any>) => {
    return (
      <div className="mt-4 grid grid-cols-10 gap-1.5">
        {Object.keys(studentAnswers).map((questionNumber) => {
          const num = parseInt(questionNumber);
          const studentAnswer = studentAnswers[num]?.answer;
          const correctAnswer = correctAnswers[num]?.answer;
          const isCorrect = studentAnswer === correctAnswer;
          
          return (
            <div 
              key={num} 
              className={`p-1.5 rounded-md border ${
                isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">{num}</span>
              </div>
              <div className="text-center mt-0.5 space-y-0.5">
                <span className={`text-base font-bold ${isCorrect ? 'text-blue-600' : 'text-red-600'}`}>
                  {isCorrect ? '○' : '×'}
                </span>
                <div className="text-[10px] space-x-0.5">
                  <span className={`inline-block px-1 py-0.5 rounded ${isCorrect ? 'bg-blue-100' : 'bg-red-100'}`}>
                    선택: {studentAnswer || '-'}
                  </span>
                  <span className="inline-block px-1 py-0.5 rounded bg-slate-100">
                    정답: {correctAnswer || '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 bg-emerald-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <Button 
            variant="outline" 
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" 
            onClick={() => downloadExcel()}
          >
            <Download className="mr-2 h-4 w-4" />
            전체 엑셀 다운로드
          </Button>
        </div>

        <div className="space-y-4">
          {tests.map(test => {
            const testResults = results.filter(r => r.test_id === test.testId);
            if (testResults.length === 0) return null;

            const isTestExpanded = expandedTests.has(test.testId);
            const allResultIds = testResults.map(r => r.id);
            const isAllResultsExpanded = allResultIds.every(id => expandedRows.has(id));

            return (
              <Card key={test.testId} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50"
                      onClick={() => toggleTestResults(test.testId)}
                    >
                      {isTestExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <h2 className="text-lg font-semibold text-slate-500">
                      {test.title || test.testId}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({testResults.length}명)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTestExpanded && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => toggleAllRowsForTest(test.testId)}
                      >
                        {isAllResultsExpanded ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            결과지 모두 접기
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            결과지 모두 펼치기
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => downloadExcel(test.testId)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      엑셀 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => downloadAllReportsAsJPG(test.testId)}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      전체 이미지 다운로드
                    </Button>
                    <DeleteTestDialog 
                      onDelete={() => handleDeleteByTestId(test.testId)} 
                      title="시험 결과 삭제"
                      description="이 시험의 모든 결과가 삭제됩니다. 계속하시겠습니까?"
                    />
                  </div>
                </div>

                {isTestExpanded && (
                  <div className="space-y-2">
                    {testResults.map(result => (
                      <div key={result.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <span className="font-medium text-emerald-600">
                                {result.student_name.split(" ")[0] || '미지정'}
                              </span>
                              <span className="font-medium">
                                {result.student_name.split(" ")[1] || result.student_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(result.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-semibold text-emerald-600">
                                {formatScore(result.score)}점
                              </span>
                              <span className="text-sm text-gray-500">
                                ({result.correct_count}/{result.total_count})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50"
                              onClick={() => toggleRow(result.id)}
                            >
                              {expandedRows.has(result.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>

                            {expandedRows.has(result.id) && result.total_count === 45 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50"
                                onClick={() => {
                                  const ref = reportRefs.current[result.id];
                                  const [className, name] = result.student_name.split(" ");
                                  const fileName = `${test.title}_${className || '미지정'}_${
                                    name || result.student_name
                                  }`;
                                  downloadAsJPG(ref, fileName);
                                }}
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                            )}

                            <DeleteTestDialog 
                              onDelete={() => handleDelete(result.id)} 
                              title="결과 삭제"
                              description="이 결과를 삭제하시겠습니까?"
                            />
                          </div>
                        </div>

                        {expandedRows.has(result.id) && (
                          result.total_count === 45 ? (
                            <div
                              className="mt-4"
                              ref={el => (reportRefs.current[result.id] = el)}
                            >
                              <TestReport
                                studentName={result.student_name.split(" ")[1] || result.student_name}
                                studentClass={result.student_name.split(" ")[0]}
                                testTitle={test.title}
                                studentAnswers={result.student_answers}
                                correctAnswers={test.answers}
                                testDate={result.created_at}
                                allResults={testResults}
                              />
                            </div>
                          ) : (
                            renderAnswers(result.student_answers, test.answers)
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
