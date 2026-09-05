import { useState, useRef, useMemo, useCallback } from 'react';
import { parseExcelFile } from '@/utils/excelParser';
import ReportCard from '@/components/ReportCard';
import { StudentScore, SubjectAverages } from '@/types/report';
import { Upload, FileSpreadsheet, Users, Loader2, Download, X, FileDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

const Index = () => {
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, startTime: 0 });

  // Get unique class codes for filtering
  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    students.forEach(s => {
      if (s.classCode) classes.add(s.classCode);
    });
    return Array.from(classes).sort();
  }, [students]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return students;
    return students.filter(s => s.classCode === selectedClass);
  }, [students, selectedClass]);

  // Calculate overall averages for filtered students
  const overallAverages = useMemo<SubjectAverages>(() => {
    if (filteredStudents.length === 0) {
      return { vocabulary: 0, grammar: 0, reading: 0, writing: 0, overall: 0 };
    }
    
    const sums = filteredStudents.reduce(
      (acc, s) => ({
        vocabulary: acc.vocabulary + s.vocabulary,
        grammar: acc.grammar + s.grammar,
        reading: acc.reading + s.reading,
        writing: acc.writing + s.writing,
      }),
      { vocabulary: 0, grammar: 0, reading: 0, writing: 0 }
    );
    
    const count = filteredStudents.length;
    const vocabAvg = sums.vocabulary / count;
    const grammarAvg = sums.grammar / count;
    const readingAvg = sums.reading / count;
    const writingAvg = sums.writing / count;
    
    return {
      vocabulary: Math.round(vocabAvg * 10) / 10,
      grammar: Math.round(grammarAvg * 10) / 10,
      reading: Math.round(readingAvg * 10) / 10,
      writing: Math.round(writingAvg * 10) / 10,
      overall: Math.round(((vocabAvg + grammarAvg + readingAvg + writingAvg) / 4) * 10) / 10,
    };
  }, [filteredStudents]);

  const captureCard = useCallback(async (el: HTMLDivElement, student: StudentScore) => {
    // Temporarily force full opacity and remove animations for clean capture
    const originalStyle = el.style.cssText;
    el.style.opacity = '1';
    el.style.animation = 'none';
    el.style.transform = 'none';
    
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc, clonedEl) => {
        // Ensure cloned element has full opacity
        clonedEl.style.opacity = '1';
        clonedEl.style.animation = 'none';
        clonedEl.style.transform = 'none';
        clonedEl.style.overflow = 'visible';
        // Remove all fade-in animations and overflow clipping from children
        clonedEl.querySelectorAll('*').forEach((child) => {
          (child as HTMLElement).style.animation = 'none';
          (child as HTMLElement).style.opacity = '';
          (child as HTMLElement).style.overflow = 'visible';
        });
      },
    });
    
    el.style.cssText = originalStyle;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
    });
    const className = student.classCode || 'unknown';
    const fileName = `4대천왕_${className}_${student.name}.jpg`;
    return { blob, fileName };
  }, []);

  const exportAsZip = useCallback(async (studentsToExport: StudentScore[]) => {
    if (studentsToExport.length === 0) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: studentsToExport.length, startTime: Date.now() });
    try {
      const zip = new JSZip();
      for (let i = 0; i < studentsToExport.length; i++) {
        setExportProgress(prev => ({ ...prev, current: i + 1 }));
        const idx = filteredStudents.indexOf(studentsToExport[i]);
        const el = reportCardRefs.current[idx >= 0 ? idx : i];
        if (!el) continue;
        const { blob, fileName } = await captureCard(el, studentsToExport[i]);
        zip.file(fileName, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = `4대천왕_성적표.zip`;
      link.href = URL.createObjectURL(content);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, startTime: 0 });
    }
  }, [filteredStudents, captureCard]);

  const handleExportAllAsJpg = useCallback(async () => {
    await exportAsZip(filteredStudents);
  }, [filteredStudents, exportAsZip]);

  const handleExportClassAsJpg = useCallback(async () => {
    if (selectedClass === 'all') return;
    await exportAsZip(filteredStudents);
  }, [filteredStudents, selectedClass, exportAsZip]);

  const handleExportSingleAsJpg = useCallback(async (index: number) => {
    const el = reportCardRefs.current[index];
    if (!el) return;
    setIsExporting(true);
    try {
      const { blob, fileName } = await captureCard(el, filteredStudents[index]);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  }, [filteredStudents, captureCard]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    setSelectedClass('all'); // Reset filter when new file is uploaded

    try {
      console.log('[Index] Starting file parse:', file.name, file.size, 'bytes');
      const parsedStudents = await parseExcelFile(file);
      console.log('[Index] Parsed students:', parsedStudents.length, parsedStudents);
      setStudents(parsedStudents);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      // Reset input value so same file can be re-uploaded
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-7 h-7 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground">4대천왕 성적표</h1>
                <p className="text-xs text-muted-foreground">엑셀 파일을 업로드하세요</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {students.length > 0 && (
                <>
                  {/* Class Filter - Horizontal Buttons */}
                  {classOptions.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => setSelectedClass('all')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                          selectedClass === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        전체 ({students.length})
                      </button>
                      {classOptions.map((cls) => {
                        const count = students.filter(s => s.classCode === cls).length;
                        return (
                          <button
                            key={cls}
                            onClick={() => setSelectedClass(cls)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                              selectedClass === cls
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {cls} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Users className="w-3.5 h-3.5" />
                    <span>{filteredStudents.length}명</span>
                  </div>
                </>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <a href="/sample-4대천왕.xlsx" download="4대천왕_샘플.xlsx">
                  <FileDown className="w-4 h-4 mr-2" />
                  샘플 파일
                </a>
              </Button>
              <Button onClick={handleButtonClick} disabled={isLoading} size="sm">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    파일 업로드
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {students.length === 0 ? (
          /* Empty State */
          <div 
            className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-card transition-all"
            onClick={handleButtonClick}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">엑셀 파일 업로드</h2>
            <p className="text-muted-foreground text-center text-sm max-w-md mb-4">
              성적 데이터가 포함된 엑셀 파일(.xlsx, .xls)을 선택하거나<br />
              이 영역에 드래그하여 업로드하세요
            </p>
            <Button variant="outline" size="default">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              파일 선택하기
            </Button>
            {fileName && (
              <p className="mt-3 text-xs text-muted-foreground">
                마지막 파일: {fileName}
              </p>
            )}
          </div>
        ) : (
          /* Report Cards Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                성적표 
                {selectedClass !== 'all' && (
                  <span className="ml-2 text-primary">({selectedClass}반)</span>
                )}
                <span className="ml-2 text-muted-foreground font-normal text-sm">
                  {filteredStudents.length}명
                </span>
              </h2>
               <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportAllAsJpg}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      전체 저장
                    </>
                  )}
                </Button>
                {selectedClass !== 'all' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportClassAsJpg}
                    disabled={isExporting}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {selectedClass}반 저장
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleButtonClick}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  다른 파일
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStudents.map((student, index) => (
                <div key={`${student.name}-${student.classCode || ''}-${index}`} className="relative group/card">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExportSingleAsJpg(index); }}
                    disabled={isExporting}
                    className="absolute top-2 right-2 z-[60] opacity-0 group-hover/card:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm border border-border rounded-md p-1.5 hover:bg-accent print:hidden shadow-sm"
                    title={`${student.name} JPG 저장`}
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <ReportCard 
                    ref={(el) => { reportCardRefs.current[index] = el; }}
                    student={student} 
                    index={index}
                    allStudents={filteredStudents}
                    overallAverages={overallAverages}
                    totalStudents={filteredStudents.length}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Export Progress Overlay */}
      {isExporting && exportProgress.total > 0 && (() => {
        const elapsed = (Date.now() - exportProgress.startTime) / 1000;
        const perItem = exportProgress.current > 0 ? elapsed / exportProgress.current : 0;
        const remaining = Math.max(0, Math.ceil(perItem * (exportProgress.total - exportProgress.current)));
        const percent = Math.round((exportProgress.current / exportProgress.total) * 100);
        return (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card rounded-xl shadow-2xl p-6 w-80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">이미지 저장 중</h3>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <Progress value={percent} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{exportProgress.current} / {exportProgress.total}명</span>
                <span>{percent}%</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {exportProgress.current < exportProgress.total 
                  ? `예상 남은 시간: ${remaining < 60 ? `${remaining}초` : `${Math.floor(remaining / 60)}분 ${remaining % 60}초`}`
                  : 'ZIP 파일 생성 중...'}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Index;
