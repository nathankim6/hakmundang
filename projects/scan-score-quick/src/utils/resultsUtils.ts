import JSZip from 'jszip';
import { acquireWakeLock, releaseWakeLock, emitDownloadProgress, showBrowserNotification, ensureNotificationPermission, enablePiPKeepAlive, disablePiPKeepAlive, enableSilentAudioKeepAlive, disableSilentAudioKeepAlive } from './backgroundTask';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { Test, TestResult } from '@/types/results';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';

export const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatScore = (score: number) => {
  return Math.round(score);
};

export const downloadExcel = (results: TestResult[], tests: Test[], testId?: string) => {
  const filteredResults = testId ? results.filter(result => result.test_id === testId) : results;
  const test = testId ? tests.find(t => t.testId === testId) : null;
  
  // Check if this is a "사대천왕" test
  const isSadaecheonwang = test?.title?.includes('사대천왕') || false;
  
  // Calculate correct scores and counts for each result
  const processedResults = filteredResults.map(result => {
    const currentTest = tests.find(t => t.testId === result.test_id);
    if (!currentTest) {
      return {
        ...result,
        calculatedScore: result.score,
        calculatedCorrectCount: result.correct_count,
        questionResults: {} as Record<number, boolean>,
        writingResults: [] as { korean: string; studentAnswer: string; correctAnswer: string; isCorrect: boolean }[]
      };
    }

    const studentAnswersAny = result.student_answers as any;
    const isWritingTest = studentAnswersAny?.testFormat === 'writing';
    
    // For writing tests
    if (isWritingTest) {
      const writingResultsData = studentAnswersAny?.results || [];
      const correctCount = writingResultsData.filter((r: any) => r.isCorrect).length;
      const totalCount = writingResultsData.length;
      const calculatedScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      
      return {
        ...result,
        calculatedScore,
        calculatedCorrectCount: correctCount,
        questionResults: {} as Record<number, boolean>,
        writingResults: writingResultsData.map((r: any) => ({
          korean: r.korean || '',
          studentAnswer: r.studentAnswer || '',
          correctAnswer: r.correctAnswer || '',
          isCorrect: r.isCorrect || false
        }))
      };
    }

    // Recalculate score using consistent calculation
    const calculatedScore = calculateConsistentScore(result.student_answers, currentTest.answers);
    
    // Calculate correct count and track each question result
    let correctCount = 0;
    const questionResults: Record<number, boolean> = {};
    
    Object.entries(result.student_answers).forEach(([questionNumStr, answerData]) => {
      const questionNum = parseInt(questionNumStr);
      const studentAnswer = answerData?.answer;
      const correctAnswer = currentTest.answers[questionNum]?.answer;
      const questionType = currentTest.answers[questionNum]?.type;
      
      let isCorrect = false;
      
      if (questionType === 'subjective') {
        isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
      } else {
        // For multiple choice, check if arrays are equal (all correct answers selected)
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
        
        // Sort both arrays for comparison
        const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
        const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
        
        // Check if arrays are equal (same length and same elements)
        isCorrect = sortedCorrect.length === sortedStudent.length &&
                    sortedCorrect.every((value, index) => value === sortedStudent[index]);
      }
      
      questionResults[questionNum] = isCorrect;
      if (isCorrect) {
        correctCount++;
      }
    });

    return {
      ...result,
      calculatedScore,
      calculatedCorrectCount: correctCount,
      questionResults,
      writingResults: [] as { korean: string; studentAnswer: string; correctAnswer: string; isCorrect: boolean }[]
    };
  });

  // For 사대천왕 tests, create detailed sheets
  if (isSadaecheonwang && test) {
    const workbook = XLSX.utils.book_new();
    
    // Check if it's a writing test
    const firstResult = processedResults[0];
    const isWritingTest = (firstResult?.student_answers as any)?.testFormat === 'writing';
    
    if (isWritingTest) {
      // Writing test format: O/X only
      const writingData = processedResults.map(result => {
        const [className, name] = splitStudentIdentifier(result.student_name);
        const baseData: Record<string, any> = {
          '소속': (result.student_answers as any)?.__branch || '미지정',
          '반': className || '미지정',
          '이름': name || result.student_name,
          '점수': formatScore(result.calculatedScore),
          '맞은 개수': result.calculatedCorrectCount,
          '총 문항': result.writingResults.length,
        };
        
        // Add O/X only for each question
        result.writingResults.forEach((wr, idx) => {
          const qNum = idx + 1;
          baseData[`Q${qNum}`] = wr.isCorrect ? 'O' : 'X';
        });
        
        return baseData;
      });
      
      const worksheet = XLSX.utils.json_to_sheet(writingData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '문항별 정오표');
    } else {
      // Regular test format: O/X for each question
      const totalQuestions = Object.keys(test.answers).length;
      
      const detailedData = processedResults.map(result => {
        const [className, name] = splitStudentIdentifier(result.student_name);
        const baseData: Record<string, any> = {
          '소속': (result.student_answers as any)?.__branch || '미지정',
          '반': className || '미지정',
          '이름': name || result.student_name,
          '점수': formatScore(result.calculatedScore),
          '맞은 개수': result.calculatedCorrectCount,
          '총 문항': totalQuestions,
        };
        
        // Add O/X for each question
        for (let q = 1; q <= totalQuestions; q++) {
          baseData[`Q${q}`] = result.questionResults[q] ? 'O' : 'X';
        }
        
        return baseData;
      });
      
      const worksheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '문항별 정오표');
    }
    
    const filename = `시험결과_${test.title}.xlsx`;
    XLSX.writeFile(workbook, filename);
    return;
  }

  // Standard Excel format for non-사대천왕 tests
  // Determine max question count across results (per testId) for O/X columns
  const worksheet = XLSX.utils.json_to_sheet(processedResults.map(result => {
    const [className, name] = splitStudentIdentifier(result.student_name);
    const currentTest = tests.find(t => t.testId === result.test_id);
    const totalCount = currentTest ? Object.keys(currentTest.answers).length : result.total_count;
    const isWritingTest = (result.student_answers as any)?.testFormat === 'writing';

    const row: Record<string, any> = {
      '시험 제목': currentTest?.title || result.test_id,
      '소속': (result.student_answers as any)?.__branch || '미지정',
      '반': className || '미지정',
      '이름': name || result.student_name,
      '점수': formatScore(result.calculatedScore),
      '맞은 개수': result.calculatedCorrectCount,
      '총 문항': totalCount,
      '제출 시간': formatDate(result.created_at),
    };

    if (isWritingTest) {
      result.writingResults.forEach((wr, idx) => {
        row[`Q${idx + 1}`] = wr.isCorrect ? 'O' : 'X';
      });
    } else {
      for (let q = 1; q <= totalCount; q++) {
        row[`Q${q}`] = result.questionResults[q] ? 'O' : 'X';
      }
    }

    return row;
  }));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '시험 결과');
  const filename = testId ? `시험결과_${test?.title || testId}.xlsx` : '전체_시험결과.xlsx';
  XLSX.writeFile(workbook, filename);
};

export const downloadStudentHistoryExcel = (studentName: string, testResults: TestResult[], testNames: Record<string, string>) => {
  try {
    const data = testResults.map(result => {
      return {
        '학생 이름': studentName,
        '시험 제목': testNames[result.test_id] || result.test_id,
        '점수': formatScore(result.score),
        '맞은 개수': result.correct_count,
        '총 문항': result.total_count,
        '백분율': `${formatScore((result.score / 100) * 100)}%`,
        '시험 날짜': formatDate(result.created_at)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const columnWidths = [
      { wch: 15 }, // 학생 이름
      { wch: 30 }, // 시험 제목
      { wch: 8 },  // 점수
      { wch: 10 }, // 맞은 개수
      { wch: 10 }, // 총 문항
      { wch: 10 }, // 백분율
      { wch: 20 }  // 시험 날짜
    ];
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '학생별 시험기록');
    
    XLSX.writeFile(workbook, `${studentName}_시험기록.xlsx`);
    
    toast({
      title: "엑셀 다운로드 완료",
      description: `${studentName}의 시험기록이 성공적으로 저장되었습니다.`
    });
  } catch (error) {
    console.error('Error downloading student history Excel:', error);
    toast({
      title: "다운로드 실패",
      description: "엑셀 파일 생성 중 오류가 발생했습니다.",
      variant: "destructive"
    });
  }
};

export const downloadClassHistoryExcel = async (className: string, students: any[]) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    const { data: allResults, error } = await supabase
      .from('test_results')
      .select('*')
      .in('student_name', students.map(student => student.student_name))
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching test results for class:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "반 학생들의 시험 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
      return;
    }
    
    // Fix: Correctly handle columns in the tests table
    const { data: testsData, error: testsError } = await supabase
      .from('tests')
      .select('id, title, test_id');
      
    if (testsError) {
      console.error('Error fetching test names:', testsError);
    }
    
    const testNames: Record<string, string> = {};
    if (testsData) {
      testsData.forEach(test => {
        // Fix: Use test_id as the key and title as the value
        if (test.test_id) {
          testNames[test.test_id] = test.title;
        }
      });
    }
    
    const studentResults: Record<string, any[]> = {};
    if (allResults) {
      allResults.forEach(result => {
        if (!studentResults[result.student_name]) {
          studentResults[result.student_name] = [];
        }
        studentResults[result.student_name].push(result);
      });
    }
    
    const summaryData = students.map(student => {
      const results = studentResults[student.student_name] || [];
      const uniqueTestIds = new Set(results.map(r => r.test_id));
      const testCount = uniqueTestIds.size;
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const avgScore = testCount > 0 ? totalScore / testCount : 0;
      
      return {
        '반': className,
        '학생 이름': student.student_name,
        '시험 횟수': testCount,
        '평균 점수': Math.round(avgScore),
        '최고 점수': results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
        '최저 점수': results.length > 0 ? Math.min(...results.map(r => r.score)) : 0
      };
    });
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, '반별 요약');
    
    for (const student of students) {
      const results = studentResults[student.student_name] || [];
      if (results.length === 0) continue;
      
      const data = results.map(result => {
        // Fix: Handle student_answers type conversion
        const typedResult: TestResult = {
          ...result,
          student_answers: typeof result.student_answers === 'object' 
            ? result.student_answers as Record<number, any>
            : {}
        };
        
        return {
          '학생 이름': student.student_name,
          '시험 제목': testNames[typedResult.test_id] || typedResult.test_id,
          '점수': formatScore(typedResult.score),
          '맞은 개수': typedResult.correct_count,
          '총 문항': typedResult.total_count,
          '백분율': `${formatScore((typedResult.score / 100) * 100)}%`,
          '시험 날짜': formatDate(typedResult.created_at)
        };
      });
      
      let sheetName = student.student_name;
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 31);
      }
      
      const studentSheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, studentSheet, sheetName);
    }
    
    XLSX.writeFile(workbook, `${className}_반_전체학생_시험기록.xlsx`);
    
    toast({
      title: "엑셀 다운로드 완료",
      description: `${className} 반 학생들의 시험기록이 성공적으로 저장되었습니다.`
    });
  } catch (error) {
    console.error('Error downloading class history Excel:', error);
    toast({
      title: "다운로드 실패",
      description: "엑셀 파일 생성 중 오류가 발생했습니다.",
      variant: "destructive"
    });
  }
};

export const downloadAsJPG = async (elementRef: HTMLDivElement | null, fileName: string, zip?: JSZip) => {
  if (!elementRef) {
    console.error('Element ref is null for:', fileName);
    toast({
      title: "다운로드 실패",
      description: "리포트를 찾을 수 없습니다. 먼저 결과지를 펼쳐주세요.",
      variant: "destructive"
    });
    throw new Error('리포트를 찾을 수 없습니다.');
  }

  // Find the target element within the ref (max-w-6xl container)
  const targetElement = elementRef.querySelector('.max-w-6xl') as HTMLElement || elementRef;
  
  // Check if element has dimensions
  const rect = targetElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    console.error('Element has zero dimensions:', { width: rect.width, height: rect.height });
    toast({
      title: "다운로드 실패",
      description: "리포트가 화면에 표시되지 않았습니다. 먼저 결과지를 펼쳐주세요.",
      variant: "destructive"
    });
    throw new Error('Element has zero dimensions');
  }

  try {
    console.log('Generating image for:', fileName);
    console.log('Target element dimensions:', { width: rect.width, height: rect.height });
    
    // Wait for fonts to load
    await document.fonts.ready;
    
    // Wait for images to load
    const images = targetElement.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    
    // Scroll to element and wait
    targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const canvas = await html2canvas(targetElement, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: targetElement.scrollWidth,
      height: targetElement.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (el: Element) => el instanceof HTMLElement && el.hasAttribute('data-export-ignore'),
      onclone: (clonedDoc, element) => {
        console.log('Processing cloned element for image generation');
        
        // Add basic CSS reset
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            background-attachment: scroll !important;
            filter: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          *::before, *::after {
            display: none !important;
          }
        `;
        clonedDoc.head.appendChild(style);
        
        // Force re-computation of styles to match current DOM
        const observer = new MutationObserver(() => {});
        observer.disconnect();
        
        // Wait for style computation
        setTimeout(() => {
          console.log('Styles applied to cloned document');
        }, 100);
      }
    });
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas has zero dimensions');
    }
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 1.0); // Maximum quality for ultra HD
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
        description: "고화질 리포트가 성공적으로 저장되었습니다."
      });
    }
  } catch (error) {
    console.error('Error in downloadAsJPG:', error);
    toast({
      title: "다운로드 실패",
      description: "이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      variant: "destructive"
    });
    throw error;
  }
};

export const downloadAllReportsAsJPG = async (
  testId: string, 
  results: TestResult[], 
  tests: Test[],
  expandedRows: Set<string>,
  setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>,
  reportRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>,
  branchFilter?: string,
  setExpandedTests?: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  let testResults = results.filter(r => r.test_id === testId);
  if (branchFilter && branchFilter !== '전체') {
    testResults = testResults.filter(r => {
      const branch = (r.student_answers as any)?.__branch;
      if (branchFilter === '__UNASSIGNED__') {
        return !branch || !['초등관', '뉴베리타스관', '흑석관'].includes(branch);
      }
      return branch === branchFilter;
    });
  }
  const test = tests.find(t => t.testId === testId);
  if (!test || testResults.length === 0) {
    toast({
      title: "다운로드 실패",
      description: branchFilter && branchFilter !== '전체'
        ? `"${branchFilter === '__UNASSIGNED__' ? '미지정' : branchFilter}" 소속의 결과가 없습니다.`
        : "시험 결과를 찾을 수 없습니다.",
      variant: "destructive"
    });
    return;
  }
  let aborted = false;
  const onAbort = () => { aborted = true; };
  try {
    // ⚠️ user gesture 만료 방지: 가장 먼저 동기 호출
    enableSilentAudioKeepAlive();
    ensureNotificationPermission();
    // PiP도 gesture 필요 — 두번째로 호출
    await enablePiPKeepAlive('리포트 다운로드 중');
    await acquireWakeLock();
    toast({
      title: "다운로드 시작",
      description: "작은 PiP 창이 열립니다. 닫지 마세요 — 다른 창에서도 계속 진행됩니다."
    });
    emitDownloadProgress({
      visible: true, current: 0, total: testResults.length,
      title: '리포트 일괄 다운로드', subtitle: '리포트 렌더링 중...', onAbort,
    });
    const backupExpandedRows = new Set(expandedRows);
    // 토글 자동 열기 (시험 그룹 펼치기)
    if (setExpandedTests) {
      setExpandedTests(prev => {
        const next = new Set(prev);
        next.add(testId);
        return next;
      });
    }
    setExpandedRows(new Set(testResults.map(r => r.id)));
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      // 10명 단위 ZIP 청크 처리
      const CHUNK_SIZE = 10;
      const totalChunks = Math.ceil(testResults.length / CHUNK_SIZE);
      const branchLabel = branchFilter === '__UNASSIGNED__' ? '미지정' : branchFilter;
      let processed = 0;

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        if (aborted) break;
        const chunkResults = testResults.slice(chunkIdx * CHUNK_SIZE, (chunkIdx + 1) * CHUNK_SIZE);
        const zip = new JSZip();

        for (const result of chunkResults) {
          if (aborted) break;
          const ref = reportRefs.current[result.id];
          if (!ref) {
            console.error('Missing ref for result:', result.id);
            processed++;
            continue;
          }
          const [className, name] = splitStudentIdentifier(result.student_name || "");
          const fileName = `${test.title}_${className || '미지정'}_${name || result.student_name}`;
          try {
            await downloadAsJPG(ref, fileName, zip);
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('Failed to process report:', fileName, error);
          }
          processed++;
          emitDownloadProgress({
            visible: true, current: processed, total: testResults.length,
            title: `리포트 일괄 다운로드 (${chunkIdx + 1}/${totalChunks})`,
            subtitle: `${fileName} 처리 완료`,
            onAbort,
          });
        }

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: { level: 6 }
        });
        if (zipBlob.size === 0) continue;

        const startNum = chunkIdx * CHUNK_SIZE + 1;
        const endNum = Math.min((chunkIdx + 1) * CHUNK_SIZE, testResults.length);
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${test.title}${branchLabel && branchLabel !== '전체' ? `_${branchLabel}` : ''}_${startNum}-${endNum}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);

        // 브라우저가 연속 다운로드를 처리할 수 있도록 약간 대기
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      toast({
        title: "일괄 저장 완료",
        description: `${totalChunks}개의 ZIP 파일이 저장되었습니다.`
      });
      emitDownloadProgress({
        visible: true, current: testResults.length, total: testResults.length,
        title: '리포트 일괄 다운로드', done: true,
      });
      showBrowserNotification(
        '리포트 다운로드 완료',
        `${test.title} - ${testResults.length}개 리포트 (${totalChunks}개 ZIP) 저장됨`
      );
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
    emitDownloadProgress({ visible: false, current: 0, total: 0 });
  } finally {
    await releaseWakeLock();
    await disablePiPKeepAlive();
    await disableSilentAudioKeepAlive();
  }
};

// 학생명은 "반 이름" 형식으로 저장됨. 반 이름에 공백이 있을 수 있으므로 마지막 공백을 기준으로 분리한다.
export const splitStudentIdentifier = (studentName: string): [string, string] => {
  const trimmed = (studentName || "").trim();
  const idx = trimmed.lastIndexOf(" ");
  if (idx === -1) return ["", trimmed];
  return [trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim()];
};

export const extractClassName = (studentName: string): string => {
  const [className] = splitStudentIdentifier(studentName);
  return className || "미지정";
};

export const extractStudentName = (studentName: string): string => {
  const [className, name] = splitStudentIdentifier(studentName);
  return className ? name : studentName;
};

export const getSortedResults = (testResults: TestResult[], sortOrder: 'none' | 'desc') => {
  if (sortOrder === 'desc') {
    return [...testResults].sort((a, b) => b.score - a.score);
  }
  return testResults;
};
