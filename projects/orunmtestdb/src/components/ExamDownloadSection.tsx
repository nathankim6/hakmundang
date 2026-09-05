import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Save, School, Calendar, GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useExamFiles, ExamFile } from "@/hooks/useExamFiles";
import { useSchools } from "@/hooks/useSchools";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
const ExamDownloadSection = () => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const {
    toast
  } = useToast();
  const {
    data: examFiles = [],
    isLoading
  } = useExamFiles();
  const {
    data: schoolsData = []
  } = useSchools();
  const allSchools = useMemo(() => {
    return schoolsData.map(school => school.school_name).sort();
  }, [schoolsData]);
  const schoolLogoMap = useMemo(() => {
    const map: Record<string, string> = {};
    schoolsData.forEach(school => {
      if (school.logo_path) {
        if (/^\d+-.+\..+$/.test(school.logo_path) || school.logo_path.includes("/")) {
          map[school.school_name] = supabase.storage.from("school-logos").getPublicUrl(school.logo_path).data.publicUrl;
        } else {
          map[school.school_name] = `/src/assets/school-logos/${school.logo_path}`;
        }
      }
    });
    return map;
  }, [schoolsData]);

  // 학교별 파일 수 계산
  const fileCountBySchool = useMemo(() => {
    const counts: Record<string, number> = {};
    examFiles.forEach(file => {
      counts[file.school] = (counts[file.school] || 0) + 1;
    });
    return counts;
  }, [examFiles]);

  // 학교별 학년별 파일 수 계산
  const gradeCountBySchool = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    examFiles.forEach(file => {
      if (!counts[file.school]) {
        counts[file.school] = {};
      }
      counts[file.school][file.grade] = (counts[file.school][file.grade] || 0) + 1;
    });
    return counts;
  }, [examFiles]);

  // 선택된 학교의 파일들
  const schoolFiles = useMemo(() => {
    if (!selectedSchool) return [];
    return examFiles.filter(file => file.school === selectedSchool);
  }, [examFiles, selectedSchool]);

  // 필터링된 파일들
  const filteredFiles = useMemo(() => {
    return schoolFiles.filter(file => {
      const matchesGrade = selectedGrade === "all" || file.grade === selectedGrade;
      const matchesYear = selectedYear === "all" || file.exam_year === selectedYear;
      return matchesGrade && matchesYear;
    });
  }, [schoolFiles, selectedGrade, selectedYear]);

  // 학기별로 그룹화
  const filesBySemester = useMemo(() => {
    const groups: Record<string, ExamFile[]> = {
      "1학기 중간": [],
      "1학기 기말": [],
      "2학기 중간": [],
      "2학기 기말": []
    };
    filteredFiles.forEach(file => {
      if (groups[file.semester]) {
        groups[file.semester].push(file);
      }
    });
    return groups;
  }, [filteredFiles]);

  // 연도 목록
  const years = useMemo(() => {
    const yearSet = new Set(schoolFiles.map(f => f.exam_year));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [schoolFiles]);
  const handleDownload = async (filePath: string, fileName: string) => {
    const {
      data
    } = await supabase.storage.from("past_exams").download(filePath);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };
  const selectAllInSemester = (semester: string) => {
    const semesterFiles = filesBySemester[semester] || [];
    const allSelected = semesterFiles.every(f => selectedFileIds.has(f.id));
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        semesterFiles.forEach(f => newSet.delete(f.id));
      } else {
        semesterFiles.forEach(f => newSet.add(f.id));
      }
      return newSet;
    });
  };
  const handleDownloadSelected = async () => {
    if (selectedFileIds.size === 0) return;
    toast({
      title: "다운로드 시작",
      description: `${selectedFileIds.size}개의 파일을 다운로드합니다...`
    });
    const selectedFiles = filteredFiles.filter(file => selectedFileIds.has(file.id));
    for (const file of selectedFiles) {
      await handleDownload(file.file_path, file.file_name);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    toast({
      title: "다운로드 완료",
      description: `${selectedFileIds.size}개의 파일이 다운로드되었습니다.`
    });
    setSelectedFileIds(new Set());
  };
  const getSemesterColor = (semester: string) => {
    const colorMap: Record<string, string> = {
      "1학기 중간": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      "1학기 기말": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      "2학기 중간": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      "2학기 기말": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    };
    return colorMap[semester] || "bg-secondary text-secondary-foreground";
  };
  const getSemesterIcon = (semester: string) => {
    const icons: Record<string, string> = {
      "1학기 중간": "🌸",
      "1학기 기말": "☀️",
      "2학기 중간": "🍂",
      "2학기 기말": "❄️"
    };
    return icons[semester] || "📄";
  };
  const getGradeColor = (grade: string) => {
    const colorMap: Record<string, string> = {
      "1학년": "bg-blue-500 text-white",
      "2학년": "bg-emerald-500 text-white",
      "3학년": "bg-violet-500 text-white"
    };
    return colorMap[grade] || "bg-primary text-primary-foreground";
  };
  return <div className="space-y-6">
      {/* 학교 선택 그리드 */}
      {!selectedSchool ? <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <School className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">학교 선택</h3>
              <p className="text-sm text-muted-foreground">기출문제를 다운로드할 학교를 선택하세요</p>
            </div>
          </div>

          {isLoading ? <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allSchools.map(schoolName => {
          const fileCount = fileCountBySchool[schoolName] || 0;
          const gradeCounts = gradeCountBySchool[schoolName] || {};
          const logo = schoolLogoMap[schoolName];
          return <button key={schoolName} onClick={() => setSelectedSchool(schoolName)} className="group relative p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex items-center gap-4 text-left">
                    {/* 로고 with 파일 수 배지 */}
                    <div className="relative flex-shrink-0">
                      {logo ? <img src={logo} alt={`${schoolName} 로고`} className="w-14 h-14 object-contain rounded-xl" /> : <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <School className="h-7 w-7 text-primary" />
                        </div>}
                      {fileCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-6 min-w-6 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          {fileCount}
                        </span>}
                    </div>

                    {/* 학교 정보 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {schoolName}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <FileText className="h-3.5 w-3.5" />
                        {fileCount > 0 ? `${fileCount}개의 기출문제` : '기출문제 없음'}
                      </p>
                      
                      {/* 학년별 배지 */}
                      {fileCount > 0 && <div className="flex flex-wrap gap-1.5 mt-2">
                          {['1학년', '2학년', '3학년'].map(grade => {
                  const count = gradeCounts[grade];
                  if (!count) return null;
                  const colorClass = grade === '1학년' ? 'bg-blue-500 text-white' : grade === '2학년' ? 'bg-emerald-500 text-white' : 'bg-violet-500 text-white';
                  return;
                })}
                        </div>}
                    </div>

                    {/* 화살표 */}
                    <ChevronRight className="flex-shrink-0 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>;
        })}
            </div>}
        </div> : (/* 선택된 학교의 파일 목록 */
    <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
            setSelectedSchool(null);
            setSelectedFileIds(new Set());
            setSelectedGrade("all");
            setSelectedYear("all");
          }} className="gap-2">
                <ChevronRight className="h-4 w-4 rotate-180" />
                목록으로
              </Button>
              
              <div className="flex items-center gap-3">
                {schoolLogoMap[selectedSchool] ? <img src={schoolLogoMap[selectedSchool]} alt={`${selectedSchool} 로고`} className="w-12 h-12 object-contain rounded-xl" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <School className="h-6 w-6 text-primary" />
                  </div>}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedSchool}</h3>
                  <p className="text-sm text-muted-foreground">
                    총 {schoolFiles.length}개의 기출문제
                  </p>
                </div>
              </div>
            </div>

            {selectedFileIds.size > 0 && <Button onClick={handleDownloadSelected} className="gap-2 bg-primary hover:bg-primary/90" size="lg">
                <Save className="h-5 w-5" />
                선택 다운로드 ({selectedFileIds.size})
              </Button>}
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="학년" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학년</SelectItem>
                  <SelectItem value="1학년">1학년</SelectItem>
                  <SelectItem value="2학년">2학년</SelectItem>
                  <SelectItem value="3학년">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="연도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 연도</SelectItem>
                  {years.map(year => <SelectItem key={year} value={year}>
                      {year}년
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredFiles.length}개 결과
            </div>
          </div>

          {/* 학기별 섹션 */}
          {filteredFiles.length === 0 ? <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">기출문제가 없습니다</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                다른 조건으로 검색해보세요
              </p>
            </div> : <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(filesBySemester).map(([semester, files]) => {
          if (files.length === 0) return null;
          const allSelected = files.every(f => selectedFileIds.has(f.id));
          const someSelected = files.some(f => selectedFileIds.has(f.id));
          return <Card key={semester} className={`border-2 transition-all ${getSemesterColor(semester)}`}>
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSemesterIcon(semester)}</span>
                          <div>
                            <h4 className="font-bold">{semester}</h4>
                            <p className="text-xs text-muted-foreground">{files.length}개 파일</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => selectAllInSemester(semester)} className={`gap-1.5 ${allSelected ? 'text-primary' : ''}`}>
                          <CheckCircle2 className={`h-4 w-4 ${allSelected ? 'fill-primary' : ''}`} />
                          {allSelected ? '선택해제' : '전체선택'}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <ScrollArea className="max-h-[300px]">
                        <div className="space-y-2">
                          {files.map(file => <div key={file.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${selectedFileIds.has(file.id) ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-background/50 hover:bg-background'}`} onClick={() => toggleFileSelection(file.id)}>
                              <Checkbox checked={selectedFileIds.has(file.id)} onCheckedChange={() => toggleFileSelection(file.id)} className="flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className={`text-xs ${getGradeColor(file.grade)}`}>
                                    {file.grade}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {file.exam_year}년
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {file.file_name}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={e => {
                      e.stopPropagation();
                      handleDownload(file.file_path, file.file_name);
                    }} className="flex-shrink-0 h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>)}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>;
        })}
            </div>}
        </div>)}
    </div>;
};
export default ExamDownloadSection;